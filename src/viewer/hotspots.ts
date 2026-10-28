/**
 * Viewer-owned 3D lesion hotspot buttons (`<button class="hotspot">` inside `#viewport`).
 * Projects bone-local lesion anchors into screen space every frame and handles selection/fly-to.
 */
import * as THREE from 'three';
import type { EventBus } from '../app/events';
import type { Store } from '../app/store';
import type { Audience, Lesion } from '../data/types';
import { groupWorld } from '../sdf/layout';
import type { SkeletonActor } from './rig';

interface HotspotItem {
  lesion: Lesion;
  btn: HTMLButtonElement;
}

export interface HotspotManager {
  syncSpecimen(actor: SkeletonActor | null, lesions: readonly Lesion[], audience: Audience, selectedId: string | null): void;
  updateSelection(selectedId: string | null): void;
  updateAudience(audience: Audience): void;
  project(camera: THREE.PerspectiveCamera, width: number, height: number, visible: boolean): void;
  resolveWorldAnchor(lesionId: string): { point: THREE.Vector3; normal: THREE.Vector3 } | null;
  dispose(): void;
}

export function createHotspotManager(container: HTMLElement, store: Store, events: EventBus): HotspotManager {
  const items = new Map<string, HotspotItem>();
  let currentActor: SkeletonActor | null = null;
  const tmpPos = new THREE.Vector3();
  const tmpNorm = new THREE.Vector3();
  const tmpCamDir = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3();

  function clearButtons(): void {
    for (const item of items.values()) item.btn.remove();
    items.clear();
  }

  function fallbackBoneWorld(actor: SkeletonActor, boneId: string): { point: THREE.Vector3; normal: THREE.Vector3 } {
    const pl = actor.layout.placements.get(boneId);
    if (!pl) {
      return {
        point: new THREE.Vector3(0, actor.layout.stature * 0.65, 0.06),
        normal: new THREE.Vector3(0, 0.1, 1).normalize(),
      };
    }
    const gw = groupWorld(actor.layout, pl.group);
    const groupObj = actor.groups.get(pl.group);
    const point = new THREE.Vector3(pl.pos[0], pl.pos[1], pl.pos[2]);
    if (groupObj) {
      groupObj.updateWorldMatrix(true, false);
      point.applyMatrix4(groupObj.matrixWorld);
    } else {
      point.set(gw.pos[0] + pl.pos[0], gw.pos[1] + pl.pos[1], gw.pos[2] + pl.pos[2]);
    }
    if (boneId === 'cranium' || boneId === 'mandible' || boneId.startsWith('teeth')) {
      point.z += 0.065 * actor.layout.k;
      point.y += (boneId === 'cranium' ? 0.08 : 0.02) * actor.layout.k;
    } else if (boneId.startsWith('femur') || boneId.startsWith('tibia') || boneId.startsWith('humerus')) {
      point.y -= 0.14 * actor.layout.k;
      point.z += 0.025 * actor.layout.k;
    }
    const normal = new THREE.Vector3(point.x * 0.4, 0.15, 0.9).normalize();
    return { point, normal };
  }

  function resolveWorldAnchor(lesionId: string): { point: THREE.Vector3; normal: THREE.Vector3 } | null {
    if (!currentActor) return null;
    const anchor = currentActor.lesionAnchors.get(lesionId);
    if (anchor) {
      anchor.mesh.updateWorldMatrix(true, false);
      const point = anchor.localPos.clone().applyMatrix4(anchor.mesh.matrixWorld);
      normalMatrix.getNormalMatrix(anchor.mesh.matrixWorld);
      const normal = anchor.localNormal.clone().applyMatrix3(normalMatrix).normalize();
      return { point, normal };
    }
    const item = items.get(lesionId);
    if (!item) return null;
    return fallbackBoneWorld(currentActor, item.lesion.bone);
  }

  return {
    syncSpecimen(actor, lesions, audience, selectedId) {
      clearButtons();
      currentActor = actor;
      if (!actor) return;
      for (const lesion of lesions) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'hotspot';
        btn.dataset.lesionId = lesion.id;
        btn.setAttribute('aria-label', audience === 'kids' ? lesion.title.kids : lesion.title.clinician);
        const isSel = lesion.id === selectedId;
        btn.classList.toggle('is-selected', isSel);
        btn.setAttribute('aria-pressed', String(isSel));
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const next = store.get().selectedLesionId === lesion.id ? null : lesion.id;
          store.set({ selectedLesionId: next, selectedBoneId: next ? lesion.bone : null, panel: 'injuries', healingT: 1 });
          if (next) events.emit('ui:focus-lesion', { lesionId: next });
        });
        container.appendChild(btn);
        items.set(lesion.id, { lesion, btn });
      }
    },
    updateSelection(selectedId) {
      for (const [id, { btn }] of items) {
        const isSel = id === selectedId;
        btn.classList.toggle('is-selected', isSel);
        btn.setAttribute('aria-pressed', String(isSel));
      }
    },
    updateAudience(audience) {
      for (const { lesion, btn } of items.values()) {
        btn.setAttribute('aria-label', audience === 'kids' ? lesion.title.kids : lesion.title.clinician);
      }
    },
    project(camera, width, height, visible) {
      if (!currentActor || !visible) {
        for (const { btn } of items.values()) btn.hidden = true;
        return;
      }
      currentActor.root.updateMatrixWorld(true);
      for (const [id, { btn }] of items) {
        const world = resolveWorldAnchor(id);
        if (!world) {
          btn.hidden = true;
          continue;
        }
        tmpPos.copy(world.point).project(camera);
        if (tmpPos.z < -1 || tmpPos.z > 1) {
          btn.hidden = true;
          continue;
        }
        btn.hidden = false;
        const x = (tmpPos.x * 0.5 + 0.5) * width;
        const y = (-tmpPos.y * 0.5 + 0.5) * height;
        btn.style.left = `${x.toFixed(1)}px`;
        btn.style.top = `${y.toFixed(1)}px`;

        tmpCamDir.copy(camera.position).sub(world.point).normalize();
        tmpNorm.copy(world.normal);
        const facing = tmpNorm.dot(tmpCamDir);
        const occluded = facing < -0.25;
        btn.classList.toggle('is-hidden', occluded);
        if (occluded) btn.setAttribute('data-occluded', 'true');
        else btn.removeAttribute('data-occluded');
      }
    },
    resolveWorldAnchor,
    dispose() {
      clearButtons();
      currentActor = null;
    },
  };
}
