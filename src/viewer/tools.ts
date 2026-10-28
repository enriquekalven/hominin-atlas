/**
 * Interactive 3D viewport tools:
 * - Raycast bone picking (sets `store.selectedBoneId` and emits `viewer:bone-picked`)
 * - Line-up species picking
 * - Clinician two-point osteometric caliper (`tool === 'measure'`, emits `viewer:measure`)
 * - Horizontal anatomical cross-section plane (`tool === 'section'`, `sectionLevel`)
 */
import * as THREE from 'three';
import { isBoneId, type BoneId } from '../anatomy/bones';
import type { EventBus } from '../app/events';
import type { Store, Tool } from '../app/store';
import type { SpeciesId } from '../data/types';
import type { MaterialBank } from './materials';

export interface ViewerTools {
  handleTap(clientX: number, clientY: number, canvas: HTMLCanvasElement, camera: THREE.Camera, pickTargets: THREE.Object3D[]): void;
  updateSection(tool: Tool, sectionLevel: number, stature: number, bank: MaterialBank): void;
  clearMeasure(): void;
  dispose(): void;
}

export function createViewerTools(scene: THREE.Scene, store: Store, events: EventBus): ViewerTools {
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.85);

  // Caliper markers + line for the clinician measure tool.
  const measureGroup = new THREE.Group();
  measureGroup.visible = false;
  const dotGeo = new THREE.SphereGeometry(0.007, 14, 10);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xf2a93b, depthTest: false });
  const dotA = new THREE.Mesh(dotGeo, dotMat);
  const dotB = new THREE.Mesh(dotGeo, dotMat);
  dotA.renderOrder = 10;
  dotB.renderOrder = 10;
  const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const lineMat = new THREE.LineBasicMaterial({ color: 0xf2a93b, depthTest: false });
  const line = new THREE.Line(lineGeo, lineMat);
  line.renderOrder = 10;
  measureGroup.add(dotA, dotB, line);
  scene.add(measureGroup);

  let pointA: THREE.Vector3 | null = null;

  // Cross-section plane ring indicator.
  const ringGeo = new THREE.RingGeometry(0.28, 0.295, 48);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x5ec4b6,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
  });
  const sectionRing = new THREE.Mesh(ringGeo, ringMat);
  sectionRing.visible = false;
  scene.add(sectionRing);

  function clearMeasure(): void {
    pointA = null;
    measureGroup.visible = false;
    dotA.visible = false;
    dotB.visible = false;
    line.visible = false;
  }

  return {
    handleTap(clientX, clientY, canvas, camera, pickTargets) {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);

      const hits = raycaster.intersectObjects(pickTargets, true).filter((h) => h.object.visible && (h.object as THREE.Mesh).userData?.boneId);
      const s = store.get();

      if (s.tool === 'measure' && s.audience === 'clinician') {
        if (hits.length === 0) return;
        const p = hits[0].point.clone();
        if (!pointA) {
          pointA = p;
          measureGroup.visible = true;
          dotA.position.copy(p);
          dotA.visible = true;
          dotB.visible = false;
          line.visible = false;
        } else {
          dotB.position.copy(p);
          dotB.visible = true;
          const posAttr = lineGeo.getAttribute('position') as THREE.BufferAttribute;
          posAttr.setXYZ(0, pointA.x, pointA.y, pointA.z);
          posAttr.setXYZ(1, p.x, p.y, p.z);
          posAttr.needsUpdate = true;
          line.visible = true;
          const mm = pointA.distanceTo(p) * 1000;
          pointA = null;
          events.emit('viewer:measure', { mm });
        }
        return;
      }

      if (hits.length === 0) {
        if (s.selectedBoneId) store.set({ selectedBoneId: null });
        return;
      }

      const top = hits[0].object;
      const hitSpecies = top.userData?.speciesId as SpeciesId | undefined;
      const rawBone = String(top.userData?.boneId ?? '');

      if (s.lineup && hitSpecies && hitSpecies !== s.speciesId) {
        store.set({
          speciesId: hitSpecies,
          specimenId: null,
          selectedLesionId: null,
          selectedBoneId: null,
          healingT: 1,
        });
        return;
      }

      const normalizedBone = rawBone === 'costal_cartilage' || rawBone === 'costal_cartilage_R' ? 'sternum' : rawBone;
      if (isBoneId(normalizedBone)) {
        const next: BoneId | null = s.selectedBoneId === normalizedBone ? null : normalizedBone;
        store.set({ selectedBoneId: next });
        if (next) events.emit('viewer:bone-picked', { boneId: next });
      }
    },
    updateSection(tool, sectionLevel, stature, bank) {
      if (tool === 'section') {
        const y = Math.max(0.02, Math.min(stature * 1.02, sectionLevel * stature));
        clipPlane.constant = y;
        bank.setSectionPlane(clipPlane);
        sectionRing.position.set(0, y, 0);
        sectionRing.visible = true;
      } else {
        bank.setSectionPlane(null);
        sectionRing.visible = false;
      }
    },
    clearMeasure,
    dispose() {
      dotGeo.dispose();
      dotMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      measureGroup.removeFromParent();
      sectionRing.removeFromParent();
    },
  };
}
