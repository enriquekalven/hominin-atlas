/**
 * Photorealistic 3D life reconstruction (`buildLifelikeBody`): loads matched Front + Back
 * full-body studio reconstructions (`public/figures/<id>-front.jpg` & `<id>-back.jpg`),
 * builds a watertight 3D volumetric mesh (`photoMesh.ts`), and animates Walk/Chomp on the GPU.
 */
import * as THREE from 'three';
import type { SpeciesId } from '../data/types';
import type { MorphParams } from '../morph/params';
import type { GroupId, Layout } from '../sdf/layout';
import { buildPhotoMeshFromImages, type PhotoMeshData } from './photoMesh';

const MAX_PHOTO_CACHE = 12;
const CACHE = new Map<SpeciesId, PhotoMeshData>();
const IN_FLIGHT = new Map<SpeciesId, Promise<PhotoMeshData | null>>();

interface AnimUniforms {
  uAnimMode: { value: number };
  uTime: { value: number };
  uStature: { value: number };
}

function rememberPhoto(id: SpeciesId, data: PhotoMeshData): void {
  if (CACHE.has(id)) CACHE.delete(id);
  else if (CACHE.size >= MAX_PHOTO_CACHE) {
    const oldest = CACHE.keys().next().value;
    if (oldest !== undefined) {
      const prev = CACHE.get(oldest);
      CACHE.delete(oldest);
      prev?.geometry.dispose();
      prev?.atlasTexture.dispose();
    }
  }
  CACHE.set(id, data);
}

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
  if (cached) {
    rememberPhoto(speciesId, cached);
    return Promise.resolve(cached);
  }
  const inflight = IN_FLIGHT.get(speciesId);
  if (inflight) return inflight;
  const p = (async () => {
    try {
      const [front, back] = await Promise.all([
        loadImg(`/figures/${speciesId}-front.jpg`).then((img) => img ?? loadImg(`/reconstructions/${speciesId}.jpg`)),
        loadImg(`/figures/${speciesId}-back.jpg`),
      ]);
      if (!front) return null;
      const data = buildPhotoMeshFromImages(front, back, stature, params);
      if (data) rememberPhoto(speciesId, data);
      return data;
    } finally {
      IN_FLIGHT.delete(speciesId);
    }
  })();
  IN_FLIGHT.set(speciesId, p);
  return p;
}

function attachGpuPoseShader(mat: THREE.MeshStandardMaterial, uniforms: AnimUniforms): void {
  mat.customProgramCacheKey = () => 'hominin-photo-pose-v1';
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uAnimMode = uniforms.uAnimMode;
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uStature = uniforms.uStature;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uAnimMode, uTime, uStature;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
if (uAnimMode > 0.5) {
  float sNorm = 1.0 - position.y / max(0.2, uStature);
  if (uAnimMode < 1.5) {
    float w = uTime * 4.2, sw = sin(w), cw = cos(w);
    if (sNorm > 0.5) {
      float legT = (sNorm - 0.5) * 2.0, sideSign = position.x >= 0.0 ? 1.0 : -1.0;
      transformed.z += sideSign * sw * 0.14 * uStature * legT;
      transformed.y += max(0.0, sideSign * cw) * 0.035 * uStature * legT;
    } else {
      float upperT = (0.5 - sNorm) * 2.0;
      transformed.z -= (position.x / (0.25 * uStature)) * sw * 0.022 * uStature * upperT;
      transformed.x += sw * 0.012 * uStature * upperT;
    }
  } else {
    float openAmt = (0.5 - 0.5 * cos(uTime * 6.5)) * 0.024 * uStature;
    if (sNorm > 0.105 && sNorm < 0.175 && position.z > 0.0 && abs(position.x) < 0.09 * uStature) {
      float jawW = 1.0 - abs(sNorm - 0.14) / 0.035;
      transformed.y -= openAmt * jawW;
      transformed.z += openAmt * 0.35 * jawW;
    } else if (sNorm <= 0.14) transformed.y += openAmt * 0.25;
  }
}`,
      );
  };
}

export function buildLifelikeBody(
  speciesId: SpeciesId, layout: Layout, params: MorphParams, _groups: Map<GroupId, THREE.Group>, clip: THREE.Plane[], onInvalidate?: () => void,
): THREE.Group {
  const holder = new THREE.Group();
  const geoms: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  let disposed = false;

  const mountPhoto = (data: PhotoMeshData) => {
    if (disposed) return;
    for (const ch of [...holder.children]) holder.remove(ch);
    const animUniforms: AnimUniforms = { uAnimMode: { value: 0 }, uTime: { value: 0 }, uStature: { value: data.stature } };
    const mat = new THREE.MeshStandardMaterial({
      color: 0x888888, map: data.atlasTexture, emissive: 0xffffff, emissiveMap: data.atlasTexture, emissiveIntensity: 0.56,
      bumpMap: data.atlasTexture, bumpScale: 0.003, roughness: 0.76, metalness: 0.02, side: THREE.DoubleSide, clippingPlanes: clip,
    });
    attachGpuPoseShader(mat, animUniforms);
    mats.push(mat);
    const mesh = new THREE.Mesh(data.geometry, mat);
    mesh.renderOrder = 2;
    mesh.userData = { stature: data.stature, isPhotoMesh: true, speciesId, animUniforms };
    holder.add(mesh);
    holder.userData.photoReady = true;
    holder.userData.applyAppearance?.();
    onInvalidate?.();
  };

  const cached = CACHE.get(speciesId);
  if (cached) {
    rememberPhoto(speciesId, cached);
    mountPhoto(cached);
  } else {
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
  const u = mesh?.userData?.animUniforms as AnimUniforms | undefined;
  if (!u) return;
  u.uAnimMode.value = kind === 'walk' ? 1 : kind === 'chomp' ? 2 : 0;
  u.uTime.value = timeSec;
}

export function disposeLifelikeBody(holder: THREE.Group): void {
  const ud = holder.userData as { geoms?: THREE.BufferGeometry[]; mats?: THREE.Material[]; markDisposed?: () => void };
  ud.markDisposed?.();
  for (const g of ud.geoms ?? []) g.dispose();
  for (const m of ud.mats ?? []) m.dispose();
}
