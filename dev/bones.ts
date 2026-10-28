/**
 * Dev-only harness: meshes one part of a species on the main thread and renders it with plain
 * PBR lighting so geometry can be judged in screenshots. Not shipped in the production build.
 * URL params: species, part (skull|<boneId>), view (front|side|34|top|back|below), voxel (mm)
 */
import * as THREE from 'three';
import { meshSDF, type MeshData } from '../src/mesher/surfaceNets';
import { buildSkull } from '../src/sdf/skull';
import { PRESETS } from '../src/morph/params';
import type { SpeciesId } from '../src/data/types';
import type { AABB, SDF } from '../src/sdf/core';

const q = new URLSearchParams(location.search);
const species = (q.get('species') ?? 'homo-sapiens') as SpeciesId;
const part = q.get('part') ?? 'skull';
const view = q.get('view') ?? '34';
const voxel = Number(q.get('voxel') ?? '1.2') / 1000;

const canvas = document.getElementById('c') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1220);
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.01, 50);
scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x302418, 0.9));
const key = new THREE.DirectionalLight(0xfff1dc, 2.4);
key.position.set(0.6, 1.0, 1.2);
scene.add(key);
const rim = new THREE.DirectionalLight(0x9fb8ff, 1.0);
rim.position.set(-1, 0.4, -1);
scene.add(rim);

function toGeometry(m: MeshData): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(m.positions, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(m.normals, 3));
  const colors = new Float32Array(m.ao.length * 3);
  for (let i = 0; i < m.ao.length; i++) {
    const ao = m.ao[i] / 255;
    const c = m.curvature[i] / 127;
    const v = Math.max(0, Math.min(1, 0.25 + 0.75 * ao + 0.12 * c));
    colors[i * 3] = 0.86 * v; colors[i * 3 + 1] = 0.8 * v; colors[i * 3 + 2] = 0.68 * v;
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  g.setIndex(new THREE.BufferAttribute(m.indices, 1));
  return g;
}

function add(sdf: SDF, bounds: AABB, color: number, vox = voxel): THREE.Mesh {
  const t0 = performance.now();
  const m = meshSDF(sdf, bounds, { voxel: vox });
  const ms = performance.now() - t0;
  console.log(`meshed ${(m.indices.length / 3) | 0} tris in ${ms.toFixed(0)} ms, evals ${m.evals}`);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0, vertexColors: true });
  const mesh = new THREE.Mesh(toGeometry(m), mat);
  scene.add(mesh);
  return mesh;
}

const params = PRESETS[species];
const group: THREE.Mesh[] = [];
if (part === 'skull' || part === 'cranium' || part === 'mandible' || part === 'teeth') {
  const sk = buildSkull(params.skull);
  if (part === 'skull' || part === 'cranium') group.push(add(sk.cranium, sk.bounds.cranium, 0xffffff));
  if (part === 'skull' || part === 'mandible') group.push(add(sk.mandible, sk.bounds.mandible, 0xffffff));
  if (part === 'skull' || part === 'teeth') {
    group.push(add(sk.teethUpper, sk.bounds.teethUpper, 0xfff8ea, voxel * 0.6));
    group.push(add(sk.teethLower, sk.bounds.teethLower, 0xfff8ea, voxel * 0.6));
  }
} else {
  const mod = await import('../src/sdf/build');
  const built = mod.buildBoneForHarness(species, part);
  group.push(add(built.sdf, built.bounds, 0xffffff, built.voxel));
}

const box = new THREE.Box3();
for (const m of group) box.expandByObject(m);
const center = box.getCenter(new THREE.Vector3());
const size = box.getSize(new THREE.Vector3()).length();
const dist = size * 1.9;
const dirs: Record<string, [number, number, number]> = {
  front: [0, 0, 1], side: [1, 0, 0], '34': [0.75, 0.12, 0.8], top: [0, 1, 0.001], back: [0, 0.1, -1],
  below: [0, -1, 0.001], rside: [-1, 0, 0],
};
const d = new THREE.Vector3(...(dirs[view] ?? dirs['34'])).normalize();
camera.position.copy(center).addScaledVector(d, dist);
camera.lookAt(center);
renderer.render(scene, camera);
(window as unknown as { __ready: boolean }).__ready = true;
