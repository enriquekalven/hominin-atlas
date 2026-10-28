import { describe, expect, it } from 'vitest';
import { meshSDF } from '../src/mesher/surfaceNets';
import { capsule, hollow, roundCone, sphere, subtract, type SDF } from '../src/sdf/core';

function edgeStats(indices: Uint32Array) {
  const edges = new Map<string, number>();
  for (let t = 0; t < indices.length; t += 3) {
    for (let k = 0; k < 3; k++) {
      const a = indices[t + k], b = indices[t + ((k + 1) % 3)];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  }
  let nonManifold = 0;
  for (const c of edges.values()) if (c !== 2) nonManifold++;
  return { edgeCount: edges.size, nonManifold };
}

function outwardFraction(sdf: SDF, pos: Float32Array, idx: Uint32Array): number {
  let ok = 0;
  const tris = idx.length / 3;
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
    const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const cx = (pos[a] + pos[b] + pos[c]) / 3, cy = (pos[a + 1] + pos[b + 1] + pos[c + 1]) / 3;
    const cz = (pos[a + 2] + pos[b + 2] + pos[c + 2]) / 3;
    const e = 1e-4;
    const gx = sdf(cx + e, cy, cz) - sdf(cx - e, cy, cz);
    const gy = sdf(cx, cy + e, cz) - sdf(cx, cy - e, cz);
    const gz = sdf(cx, cy, cz + e) - sdf(cx, cy, cz - e);
    if (nx * gx + ny * gy + nz * gz > 0) ok++;
  }
  return ok / tris;
}

describe('surface nets mesher', () => {
  const R = 0.05;
  const ball = sphere([0, 0, 0], R);
  const mesh = meshSDF(ball, { min: [-0.06, -0.06, -0.06], max: [0.06, 0.06, 0.06] }, { voxel: 0.004 });

  it('places projected vertices on the surface', () => {
    let maxErr = 0;
    for (let i = 0; i < mesh.positions.length; i += 3) {
      const r = Math.hypot(mesh.positions[i], mesh.positions[i + 1], mesh.positions[i + 2]);
      maxErr = Math.max(maxErr, Math.abs(r - R));
    }
    expect(mesh.positions.length).toBeGreaterThan(300);
    expect(maxErr).toBeLessThan(0.0005);
  });

  it('produces a closed 2-manifold with sphere topology (Euler characteristic 2)', () => {
    const V = mesh.positions.length / 3;
    const F = mesh.indices.length / 3;
    const { edgeCount, nonManifold } = edgeStats(mesh.indices);
    expect(nonManifold).toBe(0);
    expect(V - edgeCount + F).toBe(2);
  });

  it('winds triangles counter-clockwise when seen from outside', () => {
    expect(outwardFraction(ball, mesh.positions, mesh.indices)).toBeGreaterThan(0.99);
  });

  it('bakes unit normals, open-sky AO and convex curvature for a sphere', () => {
    for (let i = 0; i < mesh.normals.length; i += 3) {
      expect(Math.hypot(mesh.normals[i], mesh.normals[i + 1], mesh.normals[i + 2])).toBeCloseTo(1, 3);
    }
    const meanAo = mesh.ao.reduce((s, v) => s + v, 0) / mesh.ao.length;
    expect(meanAo).toBeGreaterThan(240);
    const meanCurv = mesh.curvature.reduce((s, v) => s + v, 0) / mesh.curvature.length;
    expect(meanCurv).toBeGreaterThan(0);
  });

  it('creates two surfaces (outer + inner) for a hollow shell, like cortical bone', () => {
    const shell = hollow(ball, 0.006);
    const m = meshSDF(shell, { min: [-0.06, -0.06, -0.06], max: [0.06, 0.06, 0.06] }, { voxel: 0.003 });
    const V = m.positions.length / 3, F = m.indices.length / 3;
    const { edgeCount } = edgeStats(m.indices);
    expect(V - edgeCount + F).toBe(4); // two disjoint spheres
  });

  it('culls blocks: far fewer SDF evaluations than grid samples', () => {
    const big = meshSDF(ball, { min: [-0.06, -0.06, -0.06], max: [0.06, 0.06, 0.06] }, { voxel: 0.0015 });
    const samples = Math.ceil(0.12 / big.voxel + 3) ** 3;
    expect(big.gridEvals).toBeLessThan(samples * 0.5);
  });

  it('handles subtraction, capsules and round cones without degenerate output', () => {
    const shape = subtract(
      roundCone([0, 0, 0], [0, -0.1, 0], 0.012, 0.008),
      capsule([0, -0.05, -0.02], [0, -0.05, 0.02], 0.004),
    );
    const m = meshSDF(shape, { min: [-0.02, -0.115, -0.02], max: [0.02, 0.015, 0.02] }, { voxel: 0.0015 });
    expect(m.indices.length).toBeGreaterThan(1000);
    const st = edgeStats(m.indices);
    expect(st.nonManifold / st.edgeCount).toBeLessThan(0.005);
    for (const v of m.positions) expect(Number.isFinite(v)).toBe(true);
  });
});
