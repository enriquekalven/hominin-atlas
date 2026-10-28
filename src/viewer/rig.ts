/**
 * Skeleton scene-graph rig (`SkeletonActor`): hierarchical Three.js groups from `Layout`,
 * bone mesh mounting, anatomical flesh outline, completeness styling and chomp/walk animations.
 */
import * as THREE from 'three';
import { expandBoneRefs, type BoneId } from '../anatomy/bones';
import type { AppState } from '../app/store';
import type { Lesion, SpeciesId, Specimen } from '../data/types';
import type { MorphParams } from '../morph/params';
import type { M3 } from '../sdf/core';
import type { GroupId, Layout } from '../sdf/layout';
import { animateLifelikeBody, buildLifelikeBody, disposeLifelikeBody } from './lifelike';
import { computeVertexColors, type MaterialBank } from './materials';
import type { MeshedBone } from './pool';

export interface BoneEntry {
  boneId: string; mesh: THREE.Mesh; raw: MeshedBone; status: 'found' | 'partial' | 'reconstructed'; colorKey: string;
}
export interface LesionAnchorEntry {
  lesionId: string; boneId: BoneId; slot: number; mesh: THREE.Mesh; localPos: THREE.Vector3; localNormal: THREE.Vector3;
}
export interface SkeletonActor {
  speciesId: SpeciesId; specimen: Specimen | undefined; params: MorphParams; layout: Layout;
  root: THREE.Group; groups: Map<GroupId, THREE.Group>; restMatrices: Map<GroupId, THREE.Matrix4>;
  bones: Map<string, BoneEntry>; lesionAnchors: Map<string, LesionAnchorEntry>; fleshGroup: THREE.Group;
  dispose(): void;
}
export function m4FromPosRot(pos: readonly number[], rot: M3): THREE.Matrix4 {
  return new THREE.Matrix4().set(rot[0], rot[1], rot[2], pos[0], rot[3], rot[4], rot[5], pos[1], rot[6], rot[7], rot[8], pos[2], 0, 0, 0, 1);
}

export function prioritizeBones(layout: Layout, lesions: readonly Lesion[]): string[] {
  const injured = new Set<string>(lesions.map((l) => l.bone));
  const all = [...layout.boneIds, 'costal_cartilage', 'costal_cartilage_R'];
  const rank = (id: string): number => {
    if (id === 'cranium' || id === 'mandible' || id.startsWith('teeth')) return 0;
    if (injured.has(id)) return 1;
    if (id.startsWith('pelvis') || id === 'sacrum' || id === 'femur_L' || id === 'femur_R' || id.startsWith('tibia') || id.startsWith('humerus')) return 2;
    if (id.startsWith('radius') || id.startsWith('ulna') || id.startsWith('fibula') || id.startsWith('clavicle') || id.startsWith('scapula') || id === 'sternum') return 3;
    if (id.startsWith('vert_') || id.startsWith('rib_') || id.startsWith('costal_') || id === 'patella_L' || id === 'patella_R') return 4;
    return 5;
  };
  return all.sort((a, b) => rank(a) - rank(b));
}

export function createSkeletonActor(
  speciesId: SpeciesId, specimen: Specimen | undefined, params: MorphParams, layout: Layout, bank: MaterialBank, onInvalidate?: () => void,
): SkeletonActor {
  const root = new THREE.Group();
  const groups = new Map<GroupId, THREE.Group>();
  const restMatrices = new Map<GroupId, THREE.Matrix4>();
  for (const g of layout.groups) {
    const o = new THREE.Group();
    o.matrixAutoUpdate = false;
    const mat = m4FromPosRot(g.pos, g.rot);
    o.matrix.copy(mat);
    restMatrices.set(g.id, mat.clone());
    groups.set(g.id, o);
    (g.parent ? groups.get(g.parent)! : root).add(o);
  }
  const fleshGroup = buildLifelikeBody(speciesId, layout, params, groups, bank.clip, onInvalidate);
  fleshGroup.visible = false;
  root.add(fleshGroup);
  const bones = new Map<string, BoneEntry>();
  const lesionAnchors = new Map<string, LesionAnchorEntry>();
  return {
    speciesId, specimen, params, layout, root, groups, restMatrices, bones, lesionAnchors, fleshGroup,
    dispose() {
      for (const b of bones.values()) b.mesh.geometry.dispose();
      disposeLifelikeBody(fleshGroup);
      bones.clear();
      lesionAnchors.clear();
      root.removeFromParent();
    },
  };
}

export function mountBoneMesh(actor: SkeletonActor, boneId: string, raw: MeshedBone, bank: MaterialBank): BoneEntry | null {
  const pl = actor.layout.placements.get(boneId);
  if (!pl) return null;
  const prev = actor.bones.get(boneId);
  if (prev) { prev.mesh.geometry.dispose(); prev.mesh.removeFromParent(); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(raw.positions, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(raw.normals, 3));
  g.setIndex(new THREE.BufferAttribute(raw.indices, 1));

  const formula = actor.params.body.vertebrae;
  const comp = actor.specimen?.completeness;
  const hasComp = !!comp && (comp.found.length > 0 || comp.partial.length > 0);
  const status: BoneEntry['status'] = !hasComp || boneId.startsWith('costal_')
    ? 'found'
    : expandBoneRefs(comp!.found, formula).has(boneId as BoneId) ? 'found'
    : expandBoneRefs(comp!.partial, formula).has(boneId as BoneId) ? 'partial' : 'reconstructed';

  const mesh = new THREE.Mesh(g, bank.boneSolid);
  mesh.matrixAutoUpdate = false;
  const mm = m4FromPosRot(pl.pos, pl.rot);
  if (pl.mirror) mm.multiply(new THREE.Matrix4().makeScale(-1, 1, 1));
  mesh.matrix.copy(mm);
  mesh.userData = { boneId, speciesId: actor.speciesId };
  actor.groups.get(pl.group)?.add(mesh);

  const entry: BoneEntry = { boneId, mesh, raw, status, colorKey: '' };
  actor.bones.set(boneId, entry);
  for (const m of raw.markers) {
    actor.lesionAnchors.set(m.id, {
      lesionId: m.id, boneId: boneId as BoneId, slot: m.slot, mesh,
      localPos: new THREE.Vector3(m.center[0], m.center[1], m.center[2]),
      localNormal: new THREE.Vector3(m.normal[0], m.normal[1], m.normal[2]),
    });
  }
  return entry;
}

export function applyActorAppearance(actor: SkeletonActor, bank: MaterialBank, state: AppState, mode: 'primary' | 'side' | 'overlay' | 'lineup'): void {
  const taph = actor.specimen?.taphonomy.colors ?? ['#d6c5a5', '#b39b74', '#4e3e28'];
  const selLesion = mode === 'primary' && state.selectedLesionId ? actor.lesionAnchors.get(state.selectedLesionId) : undefined;
  const selSlot = selLesion?.slot ?? 0;
  const colorKey = `${state.renderMode}|${taph.join(',')}|${selSlot}`;
  const showFlesh = mode !== 'overlay' && state.showFlesh;
  const solidFlesh = showFlesh && Boolean(actor.fleshGroup.userData.photoReady) && state.renderMode !== 'xray' && state.tool !== 'section';
  actor.fleshGroup.userData.applyAppearance = () => applyActorAppearance(actor, bank, state, mode);
  actor.fleshGroup.visible = showFlesh;

  for (const entry of actor.bones.values()) {
    const { boneId, mesh, raw, status } = entry;
    if (mode === 'overlay') { mesh.visible = !boneId.startsWith('costal_'); mesh.material = bank.compareOverlay; continue; }
    if (entry.colorKey !== colorKey) {
      const colors = computeVertexColors(raw, { renderMode: state.renderMode, taphonomy: taph, selectedSlot: selLesion?.boneId === boneId ? selSlot : 0 });
      mesh.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      entry.colorKey = colorKey;
    }
    const isGhost = status === 'reconstructed' && mode === 'primary';
    mesh.visible = solidFlesh ? (mode === 'primary' && state.selectedBoneId === boneId) : (isGhost ? state.showReconstructed : true);
    mesh.material = state.renderMode === 'xray' ? (isGhost ? bank.xrayGhost : bank.xray)
      : isGhost ? bank.ghost
      : mode === 'primary' && state.selectedBoneId === boneId ? bank.boneSelected
      : raw.material === 'enamel' ? bank.enamel
      : raw.material === 'cartilage' ? bank.cartilage
      : status === 'partial' ? bank.bonePartial : bank.boneSolid;
  }
  const mats = (actor.fleshGroup.userData.mats ?? []) as THREE.Material[];
  for (const m of mats) {
    if (m instanceof THREE.MeshStandardMaterial) {
      const isXray = state.renderMode === 'xray';
      m.opacity = isXray ? 0.38 : 1;
      if (m.transparent !== isXray) {
        m.transparent = isXray;
        m.depthWrite = !isXray;
        m.needsUpdate = true;
      }
    }
  }
}

export function applyPoseAnimation(actor: SkeletonActor, kind: 'chomp' | 'walk' | 'none', timeSec: number): void {
  animateLifelikeBody(actor.fleshGroup, kind, timeSec);
  for (const [id, rest] of actor.restMatrices) actor.groups.get(id)?.matrix.copy(rest);
  if (kind === 'none') return;
  const rot = (id: GroupId, rx: number, ry = 0, rz = 0) =>
    actor.groups.get(id)?.matrix.multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz)));
  if (kind === 'chomp') {
    const open = (0.5 - 0.5 * Math.cos(timeSec * 6.5)) * 0.42;
    rot('jaw', open);
    rot('head', -open * 0.18, Math.sin(timeSec * 2.2) * 0.08, 0);
  } else if (kind === 'walk') {
    const w = timeSec * 4.2, s = Math.sin(w), c = Math.cos(w);
    rot('hip_L', -s * 0.34); rot('hip_R', s * 0.34);
    rot('knee_L', Math.max(0, c) * 0.48 + 0.08); rot('knee_R', Math.max(0, -c) * 0.48 + 0.08);
    rot('ankle_L', -s * 0.16); rot('ankle_R', s * 0.16);
    rot('shoulder_L', s * 0.24); rot('shoulder_R', -s * 0.24);
    rot('elbow_L', -0.22 - Math.max(0, -s) * 0.2); rot('elbow_R', -0.22 - Math.max(0, s) * 0.2);
    rot('trunk', 0.03, s * 0.06, c * 0.03); rot('head', 0, -s * 0.05, 0);
  }
}
