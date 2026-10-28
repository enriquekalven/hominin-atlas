/**
 * Local, zero-network 3D scan parser for validated STL, OBJ, PLY and binary glTF (.glb) buffers.
 * Normalises bounding boxes so scans of any unit (mm, cm, m) display cleanly on the stage.
 */
import * as THREE from 'three';
import type { ScanFormat } from '../app/events';

const MAX_TRIS = 1_500_000;

function parseStl(buffer: ArrayBuffer): THREE.BufferGeometry {
  const view = new DataView(buffer);
  if (buffer.byteLength >= 84) {
    const triCount = view.getUint32(80, true);
    if (84 + triCount * 50 === buffer.byteLength && triCount <= MAX_TRIS) {
      const pos = new Float32Array(triCount * 9);
      let off = 84;
      for (let i = 0; i < triCount; i++) {
        off += 12; // skip facet normal
        for (let k = 0; k < 9; k++) {
          pos[i * 9 + k] = view.getFloat32(off, true);
          off += 4;
        }
        off += 2;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.computeVertexNormals();
      return g;
    }
  }
  const text = new TextDecoder().decode(buffer);
  const verts: number[] = [];
  const re = /vertex\s+([+-]?\d*\.?\d+(?:e[+-]?\d+)?)\s+([+-]?\d*\.?\d+(?:e[+-]?\d+)?)\s+([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null && verts.length < MAX_TRIS * 9) {
    verts.push(Number(m[1]), Number(m[2]), Number(m[3]));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.computeVertexNormals();
  return g;
}

function parseObj(buffer: ArrayBuffer): THREE.BufferGeometry {
  const text = new TextDecoder().decode(buffer);
  const v: number[] = [];
  const out: number[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith('v ')) {
      const p = line.split(/\s+/);
      v.push(Number(p[1]), Number(p[2]), Number(p[3]));
    } else if (line.startsWith('f ') && out.length < MAX_TRIS * 9) {
      const tok = line.split(/\s+/).slice(1);
      const idx = tok.map((t) => {
        const n = parseInt(t.split('/')[0], 10);
        return n > 0 ? n - 1 : v.length / 3 + n;
      });
      for (let i = 1; i + 1 < idx.length; i++) {
        for (const k of [idx[0], idx[i], idx[i + 1]]) {
          out.push(v[k * 3] ?? 0, v[k * 3 + 1] ?? 0, v[k * 3 + 2] ?? 0);
        }
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  g.computeVertexNormals();
  return g;
}

function parsePly(buffer: ArrayBuffer): THREE.BufferGeometry {
  const text = new TextDecoder().decode(buffer);
  const endIdx = text.indexOf('end_header');
  if (endIdx < 0) throw new Error('Invalid PLY header');
  const header = text.slice(0, endIdx);
  const vCount = Number(/element\s+vertex\s+(\d+)/.exec(header)?.[1] ?? 0);
  const fCount = Number(/element\s+face\s+(\d+)/.exec(header)?.[1] ?? 0);
  const lines = text.slice(endIdx + 10).trim().split(/\r?\n/);
  const verts = new Float32Array(vCount * 3);
  for (let i = 0; i < vCount && i < lines.length; i++) {
    const p = lines[i].trim().split(/\s+/);
    verts[i * 3] = Number(p[0]);
    verts[i * 3 + 1] = Number(p[1]);
    verts[i * 3 + 2] = Number(p[2]);
  }
  const indices: number[] = [];
  for (let i = 0; i < fCount && vCount + i < lines.length; i++) {
    const p = lines[vCount + i].trim().split(/\s+/).map(Number);
    const n = p[0] ?? 0;
    for (let k = 1; k + 1 < n; k++) {
      indices.push(p[1], p[1 + k], p[2 + k]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  if (indices.length > 0) g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

function parseGlb(buffer: ArrayBuffer): THREE.BufferGeometry {
  const view = new DataView(buffer);
  const jsonLen = view.getUint32(12, true);
  const jsonText = new TextDecoder().decode(new Uint8Array(buffer, 20, jsonLen));
  const gltf = JSON.parse(jsonText) as {
    meshes?: Array<{ primitives?: Array<{ attributes?: { POSITION?: number }; indices?: number }> }>;
    accessors?: Array<{ bufferView?: number; byteOffset?: number; count: number; componentType: number }>;
    bufferViews?: Array<{ byteOffset?: number; byteLength: number }>;
  };
  const binStart = 20 + jsonLen + 8;
  const prim = gltf.meshes?.[0]?.primitives?.[0];
  const posAccIdx = prim?.attributes?.POSITION;
  if (posAccIdx === undefined || !gltf.accessors || !gltf.bufferViews) throw new Error('GLB contains no mesh positions');
  const posAcc = gltf.accessors[posAccIdx];
  const posBv = gltf.bufferViews[posAcc.bufferView ?? 0];
  const posOff = binStart + (posBv.byteOffset ?? 0) + (posAcc.byteOffset ?? 0);
  const pos = new Float32Array(buffer.slice(posOff, posOff + posAcc.count * 12));
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  if (prim?.indices !== undefined) {
    const idxAcc = gltf.accessors[prim.indices];
    const idxBv = gltf.bufferViews[idxAcc.bufferView ?? 0];
    const idxOff = binStart + (idxBv.byteOffset ?? 0) + (idxAcc.byteOffset ?? 0);
    const slice = buffer.slice(idxOff, idxOff + idxBv.byteLength);
    const idx = idxAcc.componentType === 5125 ? new Uint32Array(slice, 0, idxAcc.count) : new Uint16Array(slice, 0, idxAcc.count);
    g.setIndex(new THREE.BufferAttribute(idx, 1));
  }
  g.computeVertexNormals();
  return g;
}

export function buildScanObject(format: ScanFormat, buffer: ArrayBuffer): THREE.Mesh {
  const geom = format === 'stl' ? parseStl(buffer) : format === 'obj' ? parseObj(buffer) : format === 'ply' ? parsePly(buffer) : parseGlb(buffer);
  geom.computeBoundingBox();
  const box = geom.boundingBox ?? new THREE.Box3();
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(0.001, size.x, size.y, size.z);
  const scale = 0.85 / maxDim;
  geom.translate(-center.x, -box.min.y, -center.z);
  geom.scale(scale, scale, scale);

  const mat = new THREE.MeshStandardMaterial({
    color: 0xd9cbb0,
    roughness: 0.55,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(0.55, 0.35, 0);
  return mesh;
}
