/**
 * Narrow-band Surface Nets polygoniser for signed distance fields.
 *
 * 1. Block culling: the grid is split into 4x4x4-voxel blocks; a block whose centre is farther from
 *    the surface than its half-diagonal (times a Lipschitz safety factor) cannot contain the
 *    surface, so its samples get the centre value (only the sign matters there).
 * 2. Surface Nets (after M. Lysenko): one vertex per sign-changing cell at the mean of its edge
 *    crossings; one quad per sign-changing grid edge.
 * 3. Per-vertex refinement from the SDF itself: Newton projection onto the surface, gradient
 *    normals, Laplacian curvature (for edge wear / cavity dirt) and SDF ambient occlusion.
 */
import type { AABB, SDF } from '../sdf/core';

export interface MeshOptions {
  /** Voxel edge length in metres. */
  voxel: number;
  /** Max number of grid samples; voxel grows if exceeded (memory guard). */
  maxSamples?: number;
  /** Lipschitz safety factor for culling (approximate SDFs can be > 1). */
  lipschitz?: number;
  /** Project vertices onto the surface along the gradient. */
  project?: boolean;
  /** AO sampling step in metres (default 2.5 voxels, min 1.5 mm). */
  aoStep?: number;
  /** Optional per-vertex tag (e.g. lesion id << 8 | weight). */
  vertexTag?: (x: number, y: number, z: number) => number;
}

export interface MeshData {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  /** 0..255 ambient occlusion (255 = fully open). */
  ao: Uint8Array;
  /** -127..127 mean curvature proxy (positive = convex ridge). */
  curvature: Int8Array;
  /** Application-defined tag per vertex. */
  tags: Uint16Array;
  evals: number;
  /** SDF evaluations spent on the grid only (excludes per-vertex refinement). */
  gridEvals: number;
  voxel: number;
}

const CUBE_EDGES = new Int32Array(24);
const EDGE_TABLE = new Int32Array(256);
(() => {
  let k = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 1; j <= 4; j <<= 1) {
      const p = i ^ j;
      if (i <= p) {
        CUBE_EDGES[k++] = i;
        CUBE_EDGES[k++] = p;
      }
    }
  }
  for (let i = 0; i < 256; i++) {
    let em = 0;
    for (let j = 0; j < 24; j += 2) {
      const a = !!(i & (1 << CUBE_EDGES[j]));
      const b = !!(i & (1 << CUBE_EDGES[j + 1]));
      em |= a !== b ? 1 << (j >> 1) : 0;
    }
    EDGE_TABLE[i] = em;
  }
})();

class GrowF32 {
  data: Float32Array;
  length = 0;
  constructor(cap: number) {
    this.data = new Float32Array(Math.max(16, cap));
  }
  push3(a: number, b: number, c: number): void {
    if (this.length + 3 > this.data.length) {
      const next = new Float32Array(Math.ceil(this.data.length * 1.6) + 3);
      next.set(this.data);
      this.data = next;
    }
    this.data[this.length++] = a;
    this.data[this.length++] = b;
    this.data[this.length++] = c;
  }
}

class GrowU32 {
  data: Uint32Array;
  length = 0;
  constructor(cap: number) {
    this.data = new Uint32Array(Math.max(16, cap));
  }
  push3(a: number, b: number, c: number): void {
    if (this.length + 3 > this.data.length) {
      const next = new Uint32Array(Math.ceil(this.data.length * 1.6) + 3);
      next.set(this.data);
      this.data = next;
    }
    this.data[this.length++] = a;
    this.data[this.length++] = b;
    this.data[this.length++] = c;
  }
}

export function meshSDF(sdf: SDF, bounds: AABB, opts: MeshOptions): MeshData {
  const maxSamples = opts.maxSamples ?? 9_000_000;
  const L = opts.lipschitz ?? 1.6;
  let h = opts.voxel;
  const ext = [bounds.max[0] - bounds.min[0], bounds.max[1] - bounds.min[1], bounds.max[2] - bounds.min[2]];
  const dimsFor = (hh: number) => ext.map((e) => Math.max(2, Math.ceil(e / hh)) + 3);
  let dims = dimsFor(h);
  while (dims[0] * dims[1] * dims[2] > maxSamples) {
    h *= 1.15;
    dims = dimsFor(h);
  }
  const [nx, ny, nz] = dims;
  const ox = bounds.min[0] - h, oy = bounds.min[1] - h, oz = bounds.min[2] - h;
  const total = nx * ny * nz;
  const values = new Float32Array(total);
  const exact = new Uint8Array(total);
  let evals = 0;

  // ---- 1. block-culled sampling ------------------------------------------------------------
  const B = 4;
  const halfDiag = (B / 2) * h * Math.sqrt(3);
  const cullDist = halfDiag * L + h * 0.5;
  const bnx = Math.ceil((nx - 1) / B), bny = Math.ceil((ny - 1) / B), bnz = Math.ceil((nz - 1) / B);
  const sxy = nx * ny;
  for (let bk = 0; bk < bnz; bk++) {
    const k0 = bk * B, k1 = Math.min(nz - 1, k0 + B);
    for (let bj = 0; bj < bny; bj++) {
      const j0 = bj * B, j1 = Math.min(ny - 1, j0 + B);
      for (let bi = 0; bi < bnx; bi++) {
        const i0 = bi * B, i1 = Math.min(nx - 1, i0 + B);
        const cx = ox + ((i0 + i1) / 2) * h, cy = oy + ((j0 + j1) / 2) * h, cz = oz + ((k0 + k1) / 2) * h;
        const dc = sdf(cx, cy, cz);
        evals++;
        if (Math.abs(dc) > cullDist) {
          for (let k = k0; k <= k1; k++) {
            for (let j = j0; j <= j1; j++) {
              let idx = i0 + nx * j + sxy * k;
              for (let i = i0; i <= i1; i++, idx++) if (!exact[idx]) values[idx] = dc;
            }
          }
        } else {
          for (let k = k0; k <= k1; k++) {
            const z = oz + k * h;
            for (let j = j0; j <= j1; j++) {
              const y = oy + j * h;
              let idx = i0 + nx * j + sxy * k;
              for (let i = i0; i <= i1; i++, idx++) {
                if (!exact[idx]) {
                  values[idx] = sdf(ox + i * h, y, z);
                  exact[idx] = 1;
                  evals++;
                }
              }
            }
          }
        }
      }
    }
  }

  const gridEvals = evals;

  // ---- 2. surface nets -----------------------------------------------------------------------
  const verts = new GrowF32(1 << 15);
  const tris = new GrowU32(1 << 16);
  const R = [1, nx + 1, (nx + 1) * (ny + 1)];
  const buffer = new Int32Array(R[2] * 2);
  const grid = new Float32Array(8);
  const x = [0, 0, 0];
  let n = 0;
  let bufNo = 1;
  let vcount = 0;
  for (x[2] = 0; x[2] < nz - 1; ++x[2], n += nx, bufNo ^= 1, R[2] = -R[2]) {
    let m = 1 + (nx + 1) * (1 + bufNo * (ny + 1));
    for (x[1] = 0; x[1] < ny - 1; ++x[1], ++n, m += 2) {
      for (x[0] = 0; x[0] < nx - 1; ++x[0], ++n, ++m) {
        let mask = 0, g = 0, idx = n;
        for (let k = 0; k < 2; ++k, idx += nx * (ny - 2)) {
          for (let j = 0; j < 2; ++j, idx += nx - 2) {
            for (let i = 0; i < 2; ++i, ++g, ++idx) {
              const p = values[idx];
              grid[g] = p;
              mask |= p < 0 ? 1 << g : 0;
            }
          }
        }
        if (mask === 0 || mask === 0xff) continue;
        const edgeMask = EDGE_TABLE[mask];
        let vx = 0, vy = 0, vz = 0, eCount = 0;
        for (let i = 0; i < 12; ++i) {
          if (!(edgeMask & (1 << i))) continue;
          const e0 = CUBE_EDGES[i << 1], e1 = CUBE_EDGES[(i << 1) + 1];
          const g0 = grid[e0], g1 = grid[e1];
          let t = g0 - g1;
          if (Math.abs(t) > 1e-12) t = g0 / t;
          else continue;
          ++eCount;
          // axis 0
          if ((e0 & 1) !== (e1 & 1)) vx += e0 & 1 ? 1 - t : t;
          else vx += e0 & 1 ? 1 : 0;
          if ((e0 & 2) !== (e1 & 2)) vy += e0 & 2 ? 1 - t : t;
          else vy += e0 & 2 ? 1 : 0;
          if ((e0 & 4) !== (e1 & 4)) vz += e0 & 4 ? 1 - t : t;
          else vz += e0 & 4 ? 1 : 0;
        }
        const s = eCount > 0 ? 1 / eCount : 0.5;
        buffer[m] = vcount++;
        verts.push3(ox + (x[0] + s * vx) * h, oy + (x[1] + s * vy) * h, oz + (x[2] + s * vz) * h);
        for (let i = 0; i < 3; ++i) {
          if (!(edgeMask & (1 << i))) continue;
          const iu = (i + 1) % 3, iv = (i + 2) % 3;
          if (x[iu] === 0 || x[iv] === 0) continue;
          const du = R[iu], dv = R[iv];
          const a = buffer[m], b = buffer[m - du], c = buffer[m - du - dv], d = buffer[m - dv];
          if (mask & 1) {
            tris.push3(a, b, c);
            tris.push3(a, c, d);
          } else {
            tris.push3(a, d, c);
            tris.push3(a, c, b);
          }
        }
      }
    }
  }

  // ---- 3. per-vertex refinement ---------------------------------------------------------------
  const positions = verts.data.slice(0, vcount * 3);
  const normals = new Float32Array(vcount * 3);
  const ao = new Uint8Array(vcount);
  const curvature = new Int8Array(vcount);
  const tags = new Uint16Array(vcount);
  const e = h * 0.6;
  const inv2e = 1 / (2 * e);
  const aoStep = opts.aoStep ?? Math.max(0.0015, 2.5 * h);
  const project = opts.project ?? true;
  const AO_W = [0.45, 0.28, 0.17, 0.1];
  for (let v = 0; v < vcount; v++) {
    let px = positions[v * 3], py = positions[v * 3 + 1], pz = positions[v * 3 + 2];
    const d0 = sdf(px, py, pz);
    const dxp = sdf(px + e, py, pz), dxn = sdf(px - e, py, pz);
    const dyp = sdf(px, py + e, pz), dyn = sdf(px, py - e, pz);
    const dzp = sdf(px, py, pz + e), dzn = sdf(px, py, pz - e);
    evals += 7;
    let gx = (dxp - dxn) * inv2e, gy = (dyp - dyn) * inv2e, gz = (dzp - dzn) * inv2e;
    const gl = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1;
    gx /= gl; gy /= gl; gz /= gl;
    if (project) {
      const step = Math.max(-h, Math.min(h, d0));
      px -= gx * step; py -= gy * step; pz -= gz * step;
      positions[v * 3] = px; positions[v * 3 + 1] = py; positions[v * 3 + 2] = pz;
    }
    normals[v * 3] = gx; normals[v * 3 + 1] = gy; normals[v * 3 + 2] = gz;
    const lap = (dxp + dxn + dyp + dyn + dzp + dzn - 6 * d0) / (e * e);
    curvature[v] = Math.round(Math.tanh(lap * 0.004) * 127);
    let occ = 0;
    for (let i = 0; i < 4; i++) {
      const hd = aoStep * (i + 1);
      const d = sdf(px + gx * hd, py + gy * hd, pz + gz * hd);
      const o = (hd - d) / hd;
      occ += AO_W[i] * (o < 0 ? 0 : o > 1 ? 1 : o);
    }
    evals += 4;
    ao[v] = Math.round((1 - occ) * 255);
    if (opts.vertexTag) tags[v] = opts.vertexTag(px, py, pz);
  }

  return {
    positions,
    normals,
    indices: tris.data.slice(0, tris.length),
    ao,
    curvature,
    tags,
    evals,
    gridEvals,
    voxel: h,
  };
}
