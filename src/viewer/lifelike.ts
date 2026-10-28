/**
 * Photorealistic 3D life reconstruction (`buildLifelikeBody`): loads matched Front + Back
 * full-body studio reconstructions (`public/figures/<id>-front.jpg` & `<id>-back.jpg`),
 * builds a watertight 3D volumetric mesh (`photoMesh.ts`), and supports Walk/Chomp animations.
 */
import * as THREE from 'three';
import type { SpeciesId } from '../data/types';
import type { MorphParams } from '../morph/params';
import type { GroupId, Layout } from '../sdf/layout';
import { buildPhotoMeshFromImages, type PhotoMeshData } from './photoMesh';

const CACHE = new Map<SpeciesId, PhotoMeshData>();
const IN_FLIGHT = new Map<SpeciesId, Promise<PhotoMeshData | null>>();

function loadImg(url: string): Promise<HTMLImageElement | null> {
  if (typeof Image === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function fetchPhotoMesh(speciesId: SpeciesId, stature: number, params: MorphParams): Promise<PhotoMeshData | null> {
  const cached = CACHE.get(speciesId);
  if (cached) return Promise.resolve(cached);
  const inflight = IN_FLIGHT.get(speciesId);
  if (inflight) return inflight;
  const p = (async () => {
    const [front, back] = await Promise.all([
      loadImg(`/figures/${speciesId}-front.jpg`).then((img) => img ?? loadImg(`/reconstructions/${speciesId}.jpg`)),
      loadImg(`/figures/${speciesId}-back.jpg`),
    ]);
    if (!front) return null;
    const data = buildPhotoMeshFromImages(front, back, stature, params);
    if (data) CACHE.set(speciesId, data);
    IN_FLIGHT.delete(speciesId);
    return data;
  })();
  IN_FLIGHT.set(speciesId, p);
  return p;
}

export function buildLifelikeBody(
  speciesId: SpeciesId,
  layout: Layout,
  params: MorphParams,
  _groups: Map<GroupId, THREE.Group>,
  clip: THREE.Plane[],
): THREE.Group {
  const holder = new THREE.Group();
  const geoms: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  let disposed = false;

  const mountPhoto = (data: PhotoMeshData) => {
    if (disposed) return;
    for (const ch of [...holder.children]) holder.remove(ch);
    const geom = data.geometry.clone();
    geoms.push(geom);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x888888),
      map: data.atlasTexture,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: data.atlasTexture,
      emissiveIntensity: 0.56,
      bumpMap: data.bumpTexture,
      bumpScale: 0.003,
      roughness: 0.76,
      metalness: 0.02,
      side: THREE.DoubleSide,
      clippingPlanes: clip,
    });
    mats.push(mat);
    const mesh = new THREE.Mesh(geom, mat);
    mesh.renderOrder = 2;
    mesh.userData = { basePositions: data.basePositions, stature: data.stature, isPhotoMesh: true };
    holder.add(mesh);
    holder.userData.photoReady = true;
    holder.userData.applyAppearance?.();
  };

  const cached = CACHE.get(speciesId);
  if (cached) {
    mountPhoto(cached);
  } else {
    // Immediate placeholder until the high-res Front+Back photo mesh finishes decoding (~15ms)
    const phGeom = new THREE.CapsuleGeometry(layout.stature * 0.11, layout.stature * 0.68, 8, 16);
    const phMat = new THREE.MeshStandardMaterial({
      color: 0x6e5540, roughness: 0.8, transparent: true, opacity: 0.01, clippingPlanes: clip,
    });
    geoms.push(phGeom);
    mats.push(phMat);
    const ph = new THREE.Mesh(phGeom, phMat);
    ph.position.set(0, layout.stature * 0.5, 0);
    holder.add(ph);
    void fetchPhotoMesh(speciesId, layout.stature, params).then((data) => {
      if (data) mountPhoto(data);
    });
  }

  holder.userData = {
    geoms,
    mats,
    photoReady: Boolean(cached),
    markDisposed: () => { disposed = true; },
  };
  return holder;
}

export function animateLifelikeBody(holder: THREE.Group, kind: 'chomp' | 'walk' | 'none', timeSec: number): void {
  const mesh = holder.children[0] as THREE.Mesh | undefined;
  if (!mesh || !mesh.userData?.isPhotoMesh) return;
  const base = mesh.userData.basePositions as Float32Array;
  const stature = (mesh.userData.stature as number) || 1.65;
  const posAttr = mesh.geometry.getAttribute('position') as THREE.BufferAttribute;
  const arr = posAttr.array as Float32Array;
  if (kind === 'none') {
    arr.set(base);
    posAttr.needsUpdate = true;
    return;
  }
  const w = timeSec * 4.2, sw = Math.sin(w), cw = Math.cos(w);
  const open = (0.5 - 0.5 * Math.cos(timeSec * 6.5)) * 0.024 * stature;
  for (let i = 0; i < base.length; i += 3) {
    const x0 = base[i], y0 = base[i + 1], z0 = base[i + 2];
    const s = 1 - y0 / stature; // 0 = crown of head, 1 = ground
    let x = x0, y = y0, z = z0;
    if (kind === 'walk') {
      if (s > 0.5) {
        const legT = (s - 0.5) / 0.5;
        const sideSign = x0 >= 0 ? 1 : -1;
        const swing = sideSign * sw * 0.14 * stature * legT;
        const lift = Math.max(0, sideSign * cw) * 0.035 * stature * legT;
        z += swing;
        y += lift;
      } else {
        const upperT = (0.5 - s) / 0.5;
        z -= (x0 / (0.25 * stature)) * sw * 0.022 * stature * upperT;
        x += sw * 0.012 * stature * upperT;
      }
    } else if (kind === 'chomp') {
      if (s > 0.105 && s < 0.175 && z0 > 0 && Math.abs(x0) < 0.09 * stature) {
        const jawW = 1 - Math.abs(s - 0.14) / 0.035;
        y -= open * jawW;
        z += open * 0.35 * jawW;
      } else if (s <= 0.14) {
        y += open * 0.25;
      }
    }
    arr[i] = x;
    arr[i + 1] = y;
    arr[i + 2] = z;
  }
  posAttr.needsUpdate = true;
}

export function disposeLifelikeBody(holder: THREE.Group): void {
  const ud = holder.userData as { geoms?: THREE.BufferGeometry[]; mats?: THREE.Material[]; markDisposed?: () => void };
  ud.markDisposed?.();
  for (const g of ud.geoms ?? []) g.dispose();
  for (const m of ud.mats ?? []) m.dispose();
}
