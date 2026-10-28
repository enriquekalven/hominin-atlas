/**
 * Osteological, taphonomic and simulated-radiograph materials + per-vertex color baking.
 * Uses AO, mean curvature and paleopathology tags from the Surface Nets mesher.
 */
import * as THREE from 'three';
import type { RenderMode } from '../app/store';
import { TAG_FRESH, TAG_POLISH, TAG_POROUS } from '../sdf/lesions';
import type { MeshedBone } from './pool';

export type RGB = [number, number, number];

const DEFAULT_TAPHONOMY: [string, string, string] = ['#d6c5a5', '#b39b74', '#4e3e28'];
const AMBER: RGB = [0.95, 0.66, 0.23];
const FRESH_BREAK: RGB = [0.91, 0.87, 0.78];

export function parseHexRgb(hex: string, fallback: RGB = [0.84, 0.77, 0.65]): RGB {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

export interface VertexColorOpts {
  renderMode: RenderMode;
  taphonomy?: readonly [string, string, string];
  selectedSlot?: number;
}

export function computeVertexColors(bone: MeshedBone, opts: VertexColorOpts): Float32Array {
  const count = bone.ao.length;
  const out = new Float32Array(count * 3);
  const cols = opts.taphonomy ?? DEFAULT_TAPHONOMY;
  const cBase = parseHexRgb(cols[0], [0.84, 0.77, 0.65]);
  const cMottle = parseHexRgb(cols[1], [0.7, 0.6, 0.45]);
  const cStain = parseHexRgb(cols[2], [0.3, 0.24, 0.16]);
  const mode = opts.renderMode;
  const selSlot = opts.selectedSlot ?? 0;

  for (let i = 0; i < count; i++) {
    const ao = bone.ao[i] / 255;
    const curv = bone.curvature[i] / 127;
    const tag = bone.tags[i];
    const weight = (tag & 0xff) / 255;
    const slot = (tag >> 8) & 0x1f;
    let r = 0.88, g = 0.84, b = 0.75;

    if (mode === 'xray') {
      const edge = Math.min(1, (1 - ao) * 1.15 + Math.abs(curv) * 0.55 + 0.18);
      r = 0.38 * edge; g = 0.72 * edge; b = 0.92 * edge;
    } else if (bone.material === 'cartilage') {
      const shade = 0.45 + 0.55 * ao;
      r = 0.58 * shade; g = 0.71 * shade; b = 0.78 * shade;
    } else if (mode === 'bone') {
      const base: RGB = bone.material === 'enamel' ? [0.97, 0.95, 0.9] : [0.91, 0.87, 0.78];
      const cavity = Math.pow(ao, 0.85);
      const ridge = Math.max(0, curv) * 0.08;
      r = Math.min(1, base[0] * (0.38 + 0.62 * cavity) + ridge);
      g = Math.min(1, base[1] * (0.36 + 0.64 * cavity) + ridge);
      b = Math.min(1, base[2] * (0.33 + 0.67 * cavity) + ridge);
    } else {
      const base: RGB = bone.material === 'enamel'
        ? [mix(cBase[0], 0.96, 0.55), mix(cBase[1], 0.93, 0.55), mix(cBase[2], 0.86, 0.55)]
        : cBase;
      const mottleT = Math.max(0, Math.min(1, 0.5 - curv * 0.45)) * 0.55;
      const stainT = Math.pow(1 - ao, 1.35) * 0.78;
      const ridge = Math.max(0, curv) * 0.1;
      r = Math.min(1, mix(mix(base[0], cMottle[0], mottleT), cStain[0], stainT) + ridge);
      g = Math.min(1, mix(mix(base[1], cMottle[1], mottleT), cStain[1], stainT) + ridge);
      b = Math.min(1, mix(mix(base[2], cMottle[2], mottleT), cStain[2], stainT) + ridge * 0.85);
    }

    if (tag & TAG_FRESH) {
      r = mix(r, FRESH_BREAK[0], 0.65); g = mix(g, FRESH_BREAK[1], 0.65); b = mix(b, FRESH_BREAK[2], 0.65);
    }
    if (tag & TAG_POLISH) {
      r = Math.min(1, r + 0.14); g = Math.min(1, g + 0.12); b = Math.min(1, b + 0.09);
    }
    if (tag & TAG_POROUS) {
      r *= 0.84; g *= 0.8; b *= 0.74;
    }
    if (slot > 0 && weight > 0.02) {
      const boost = slot === selSlot ? Math.min(1, weight * 0.85 + 0.25) : weight * 0.42;
      r = mix(r, AMBER[0], boost); g = mix(g, AMBER[1], boost); b = mix(b, AMBER[2], boost);
    }
    out[i * 3] = r; out[i * 3 + 1] = g; out[i * 3 + 2] = b;
  }
  return out;
}

export interface MaterialBank {
  clip: THREE.Plane[];
  boneSolid: THREE.MeshStandardMaterial;
  bonePartial: THREE.MeshStandardMaterial;
  boneSelected: THREE.MeshStandardMaterial;
  enamel: THREE.MeshStandardMaterial;
  cartilage: THREE.MeshStandardMaterial;
  ghost: THREE.MeshStandardMaterial;
  xray: THREE.MeshBasicMaterial;
  xrayGhost: THREE.MeshBasicMaterial;
  compareOverlay: THREE.MeshStandardMaterial;
  flesh: THREE.MeshPhysicalMaterial;
  setSectionPlane(plane: THREE.Plane | null): void;
  dispose(): void;
}

export function createMaterialBank(): MaterialBank {
  const clip: THREE.Plane[] = [];
  const side = THREE.DoubleSide;
  const std = (opts: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial({ side, clippingPlanes: clip, ...opts });
  const boneSolid = std({ color: 0xffffff, roughness: 0.62, metalness: 0.04, vertexColors: true });
  const bonePartial = std({ color: 0xf4ead5, roughness: 0.72, metalness: 0.02, vertexColors: true });
  const boneSelected = std({ color: 0xffffff, emissive: new THREE.Color(0x5ec4b6), emissiveIntensity: 0.32, roughness: 0.5, metalness: 0.05, vertexColors: true });
  const enamel = std({ color: 0xffffff, roughness: 0.26, metalness: 0.06, vertexColors: true });
  const cartilage = std({ color: 0xffffff, roughness: 0.45, metalness: 0.02, transparent: true, opacity: 0.62, vertexColors: true });
  const ghost = std({ color: 0x8ea4be, emissive: new THREE.Color(0x1e293b), emissiveIntensity: 0.25, roughness: 0.55, transparent: true, opacity: 0.22, depthWrite: false });
  const xray = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, transparent: true, opacity: 0.68, depthWrite: false, blending: THREE.AdditiveBlending, side, clippingPlanes: clip });
  const xrayGhost = new THREE.MeshBasicMaterial({ color: 0x4b6a88, transparent: true, opacity: 0.14, depthWrite: false, blending: THREE.AdditiveBlending, side, clippingPlanes: clip });
  const compareOverlay = std({ color: 0x5ec4b6, emissive: new THREE.Color(0x1f6f65), emissiveIntensity: 0.28, roughness: 0.48, transparent: true, opacity: 0.38, depthWrite: false });
  const flesh = new THREE.MeshPhysicalMaterial({ color: 0xd8b898, roughness: 0.65, metalness: 0, transmission: 0.15, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.FrontSide, clippingPlanes: clip });
  const all = [boneSolid, bonePartial, boneSelected, enamel, cartilage, ghost, xray, xrayGhost, compareOverlay, flesh];

  return {
    clip, boneSolid, bonePartial, boneSelected, enamel, cartilage, ghost, xray, xrayGhost, compareOverlay, flesh,
    setSectionPlane(plane) {
      clip.length = 0;
      if (plane) clip.push(plane);
      for (const m of all) m.clippingPlanes = clip;
    },
    dispose() {
      for (const m of all) m.dispose();
    },
  };
}
