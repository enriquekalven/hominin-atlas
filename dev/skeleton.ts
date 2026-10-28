/**
 * Dev-only: full skeleton on the main thread (preview quality) to check the rig and proportions.
 * URL params: species, view (front|side|34|back), quality (preview|lineup|high)
 */
import * as THREE from 'three';
import { meshSDF } from '../src/mesher/surfaceNets';
import { buildBone, getModel, type Quality } from '../src/sdf/build';
import type { SpeciesId } from '../src/data/types';
import type { M3 } from '../src/sdf/core';

const q = new URLSearchParams(location.search);
const species = (q.get('species') ?? 'homo-sapiens') as SpeciesId;
const view = q.get('view') ?? 'front';
const quality = (q.get('quality') ?? 'preview') as Quality;
const only = q.get('only');

const canvas = document.getElementById('c') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1220);
scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x302418, 1.0));
const key = new THREE.DirectionalLight(0xfff1dc, 2.2);
key.position.set(0.8, 1.5, 1.4);
scene.add(key);

function m4(pos: readonly number[], rot: M3): THREE.Matrix4 {
  const m = new THREE.Matrix4();
  m.set(rot[0], rot[1], rot[2], pos[0], rot[3], rot[4], rot[5], pos[1], rot[6], rot[7], rot[8], pos[2], 0, 0, 0, 1);
  return m;
}

const { layout } = getModel({ speciesId: species });
const groups = new Map<string, THREE.Object3D>();
for (const g of layout.groups) {
  const o = new THREE.Group();
  o.matrixAutoUpdate = false;
  o.matrix.copy(m4(g.pos, g.rot));
  groups.set(g.id, o);
  (g.parent ? groups.get(g.parent)! : scene).add(o);
}
const mat = new THREE.MeshStandardMaterial({ color: 0xe9dfc9, roughness: 0.6, vertexColors: true });
const cart = new THREE.MeshStandardMaterial({ color: 0x9fb7c9, roughness: 0.4, transparent: true, opacity: 0.6 });
const ids = [...layout.boneIds, 'costal_cartilage', 'costal_cartilage_R'].filter((id) => !only || id.includes(only));
let tris = 0;
const t0 = performance.now();
for (const id of ids) {
  const pl = layout.placements.get(id);
  if (!pl) { console.warn('no placement', id); continue; }
  try {
    const b = buildBone({ speciesId: species, boneId: id, quality, lesions: [], healingT: 1 });
    const m = meshSDF(b.sdf, b.bounds, { voxel: b.voxel, maxSamples: 3_000_000 });
    tris += m.indices.length / 3;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(m.positions, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(m.normals, 3));
    const col = new Float32Array(m.ao.length * 3);
    for (let i = 0; i < m.ao.length; i++) { const v = 0.35 + 0.65 * (m.ao[i] / 255); col[i * 3] = v; col[i * 3 + 1] = v; col[i * 3 + 2] = v; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setIndex(new THREE.BufferAttribute(m.indices, 1));
    const mesh = new THREE.Mesh(g, b.material === 'cartilage' ? cart : mat);
    mesh.matrixAutoUpdate = false;
    const mm = m4(pl.pos, pl.rot);
    if (pl.mirror) mm.multiply(new THREE.Matrix4().makeScale(-1, 1, 1));
    mesh.matrix.copy(mm);
    groups.get(pl.group)!.add(mesh);
  } catch (err) {
    console.error('bone failed', id, err instanceof Error ? err.message : String(err));
  }
}
console.log(`built ${ids.length} bones, ${tris | 0} tris in ${(performance.now() - t0).toFixed(0)} ms`);
scene.updateMatrixWorld(true);
const box = new THREE.Box3().setFromObject(scene);
const center = box.getCenter(new THREE.Vector3());
const size = box.getSize(new THREE.Vector3());
console.log(`bbox height ${size.y.toFixed(3)} m, stature ${layout.stature}`);
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.01, 50);
const dirs: Record<string, [number, number, number]> = { front: [0, 0.05, 1], side: [1, 0.05, 0], '34': [0.7, 0.15, 0.8], back: [0, 0.1, -1] };
const d = new THREE.Vector3(...(dirs[view] ?? dirs.front)).normalize();
const dist = Math.max(size.y, size.x) * 2.4;
camera.position.copy(center).addScaledVector(d, dist);
camera.lookAt(center);
const grid = new THREE.GridHelper(2, 20, 0x334155, 0x1e293b);
scene.add(grid);
renderer.render(scene, camera);
(window as unknown as { __ready: boolean }).__ready = true;
