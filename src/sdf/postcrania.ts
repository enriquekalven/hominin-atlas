/**
 * Procedural postcranial bones (signed distance fields), each in its own local frame.
 * Frames match src/sdf/layout.ts: origin at the proximal joint (long bones), shaft along -Y,
 * +X lateral (left-side bone), +Z anterior. Lengths in metres.
 */
import {
  basis, capsule, catmullRom, cylinder, ellipsoid, extrudedPolygon, flatTube, lerp, mirrorX, offset, place,
  roundCone, roundRect2, rotX, rotY, rotZ, smoothstep, smoothSubtract, smoothUnion, sphere, subtract, sweepXZ, tube,
  union, vadd, vnorm, vscale, vsub, type AABB, type SDF, type V3,
} from './core';
import type { BodyParams } from '../morph/params';
import type { Layout, RibSpec, SmallBoneSpec, VertebraSpec } from './layout';

export interface BoneBuild {
  sdf: SDF;
  bounds: AABB;
  /** Suggested voxel size at "high" quality (m). */
  voxel: number;
  /** Axis samples for lesion placement on shaft-like bones: t in [0,1] -> centre + radius. */
  axis?: (t: number) => { p: V3; r: number };
  /** Named landmarks in the bone's local frame (pelvis, vertebra, scapula anchors). */
  anchors?: Record<string, V3>;
}

export interface BuildCtx {
  body: BodyParams;
  layout: Layout;
  /** Hollow medullary cavities and fine details (false for previews / line-ups). */
  detail: boolean;
  /** Multiplier applied to shaft radii (disuse atrophy etc.). */
  shaftScale?: number;
}

function boundsOf(points: V3[], pad: number): AABB {
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  for (const p of points) for (let i = 0; i < 3; i++) { min[i] = Math.min(min[i], p[i]); max[i] = Math.max(max[i], p[i]); }
  return { min: [min[0] - pad, min[1] - pad, min[2] - pad], max: [max[0] + pad, max[1] + pad, max[2] + pad] };
}

/** Shaft through `pts` with (AP, ML) radii, optionally hollowed over [h0, h1] of its length. */
function shaft(pts: V3[], ap: number[], ml: number[], cortical: number, hollowRange: [number, number] | null): SDF {
  const outer = flatTube(pts, ap, ml, [0, 0, 1]);
  if (!hollowRange) return outer;
  const n = pts.length;
  const i0 = Math.max(0, Math.floor(hollowRange[0] * (n - 1)));
  const i1 = Math.min(n - 1, Math.ceil(hollowRange[1] * (n - 1)));
  if (i1 - i0 < 1) return outer;
  const ip = pts.slice(i0, i1 + 1);
  const f = 1 - cortical;
  const iap = ap.slice(i0, i1 + 1).map((r, j, a) => r * f * (j === 0 || j === a.length - 1 ? 0.55 : 1));
  const iml = ml.slice(i0, i1 + 1).map((r, j, a) => r * f * (j === 0 || j === a.length - 1 ? 0.55 : 1));
  const inner = flatTube(ip, iap, iml, [0, 0, 1]);
  return (x, y, z) => Math.max(outer(x, y, z), -inner(x, y, z));
}

function axisFrom(pts: V3[], radii: number[]): (t: number) => { p: V3; r: number } {
  return (t) => {
    const x = Math.max(0, Math.min(1, t)) * (pts.length - 1);
    const i = Math.min(pts.length - 2, Math.floor(x));
    const f = x - i;
    return { p: [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f), lerp(pts[i][2], pts[i + 1][2], f)], r: lerp(radii[i], radii[i + 1], f) };
  };
}

// ============================================================================ upper limb

export function humerus(ctx: BuildCtx): BoneBuild {
  const { body: b, layout: L } = ctx;
  const k = L.k, r = b.robusticity * (ctx.shaftScale ?? 1);
  const len = L.lengths.humerus;
  const rh = 0.021 * k * Math.pow(b.robusticity, 0.25);
  const E: V3 = [0.003 * k, -(len - rh - 0.006 * k), 0.003 * k];
  const pts: V3[] = [[rh * 0.45, -rh * 1.0, 0], [0.004 * k, -len * 0.33, 0], [0.003 * k, -len * 0.62, -0.001 * k], [E[0], E[1] + 0.03 * k, E[2] - 0.002 * k]];
  const ap = [0.0125, 0.0105, 0.0095, 0.0085].map((v) => v * k * r);
  const ml = [0.0135, 0.0112, 0.0118, 0.017].map((v) => v * k * r);
  const parts: SDF[] = [
    sphere([0, 0, 0], rh),
    ellipsoid([rh * 0.95, -rh * 0.25, 0.002 * k], [0.009 * k, 0.013 * k, 0.012 * k]),
    ellipsoid([rh * 0.25, -rh * 0.6, rh * 0.72], [0.006 * k, 0.008 * k, 0.006 * k]),
    shaft(pts, ap, ml, b.cortical, ctx.detail ? [0.12, 0.8] : null),
    ellipsoid([0.0105 * k * r, -len * 0.38, 0.002 * k], [0.0035 * k, 0.016 * k, 0.005 * k]),
    ellipsoid(vadd(E, [-0.007 * k, 0, 0.002 * k]), [0.011 * k, 0.0105 * k, 0.012 * k]),
    sphere(vadd(E, [0.012 * k, 0.001 * k, 0.006 * k]), 0.0092 * k),
    ellipsoid(vadd(E, [-0.024 * k, 0.008 * k, -0.002 * k]), [0.0085 * k, 0.0075 * k, 0.0068 * k]),
    ellipsoid(vadd(E, [0.021 * k, 0.008 * k, 0]), [0.006 * k, 0.0075 * k, 0.006 * k]),
  ];
  let sdf: SDF = smoothUnion(0.005 * k, ...parts);
  sdf = smoothSubtract(0.002 * k, sdf,
    ellipsoid(vadd(E, [-0.003 * k, 0.019 * k, -0.012 * k]), [0.0095 * k, 0.012 * k, 0.0065 * k]),
    ellipsoid(vadd(E, [-0.004 * k, 0.016 * k, 0.011 * k]), [0.0065 * k, 0.0075 * k, 0.0038 * k]),
    torusGroove(vadd(E, [-0.007 * k, 0, 0.002 * k]), 0.0108 * k, 0.0022 * k));
  return {
    sdf,
    bounds: boundsOf([[0, 0, 0], E, [rh * 1.4, -rh, 0], vadd(E, [-0.034 * k, 0, 0]), vadd(E, [0.03 * k, 0, 0])], rh + 0.004 * k),
    voxel: 0.0014 * k,
    axis: axisFrom(pts, ap),
  };
}

/** Circumferential groove around the X axis (trochlear sulcus). */
function torusGroove(c: V3, R: number, rr: number): SDF {
  return (x, y, z) => {
    const py = y - c[1], pz = z - c[2], px = x - c[0];
    const q = Math.sqrt(py * py + pz * pz) - R;
    return Math.sqrt(q * q + px * px) - rr;
  };
}

export function radius(ctx: BuildCtx): BoneBuild {
  const { body: b, layout: L } = ctx;
  const k = L.k, r = b.robusticity * (ctx.shaftScale ?? 1);
  const len = L.lengths.radius;
  const headR = 0.0105 * k * Math.pow(b.robusticity, 0.3);
  const pts: V3[] = [[0, -0.013 * k, 0], [0.003 * k, -len * 0.3, 0.001 * k], [0.004 * k, -len * 0.6, 0.0015 * k], [0.002 * k, -len + 0.02 * k, 0.002 * k]];
  const ap = [0.0062, 0.007, 0.0076, 0.0092].map((v) => v * k * r);
  const ml = [0.0062, 0.008, 0.0093, 0.0145].map((v) => v * k * r);
  let sdf: SDF = smoothUnion(0.003 * k,
    offset(cylinder([0, -0.0012 * k, 0], [0, -0.0095 * k, 0], headR - 0.0014 * k), 0.0014 * k),
    shaft(pts, ap, ml, b.cortical, ctx.detail ? [0.15, 0.8] : null),
    ellipsoid([-0.004 * k, -0.03 * k, 0.003 * k], [0.004 * k, 0.008 * k, 0.004 * k]),
    ellipsoid([0.001 * k, -len + 0.008 * k, 0.002 * k], [0.0165 * k, 0.0085 * k, 0.011 * k]),
    capsule([0.012 * k, -len + 0.008 * k, 0.002 * k], [0.016 * k, -len - 0.004 * k, 0.003 * k], 0.0034 * k),
  );
  sdf = smoothSubtract(0.0015 * k, sdf, sphere([0, 0.0115 * k, 0], 0.0122 * k));
  return { sdf, bounds: boundsOf([[0, 0, 0], [0.02 * k, -len - 0.008 * k, 0]], 0.02 * k), voxel: 0.0011 * k, axis: axisFrom(pts, ap) };
}

export function ulna(ctx: BuildCtx): BoneBuild {
  const { body: b, layout: L } = ctx;
  const k = L.k, r = b.robusticity * (ctx.shaftScale ?? 1);
  const len = L.lengths.ulna;
  const pts: V3[] = [[0, -0.02 * k, -0.002 * k], [-0.001 * k, -len * 0.35, 0], [0, -len * 0.7, 0.001 * k], [0.001 * k, -len + 0.012 * k, 0.001 * k]];
  const ap = [0.0092, 0.0075, 0.0062, 0.0055].map((v) => v * k * r);
  const ml = [0.0082, 0.0068, 0.006, 0.0055].map((v) => v * k * r);
  let sdf: SDF = smoothUnion(0.004 * k,
    ellipsoid([0, 0.012 * k, -0.012 * k], [0.0095 * k, 0.013 * k, 0.01 * k]),
    ellipsoid([0, -0.008 * k, -0.004 * k], [0.011 * k, 0.02 * k, 0.012 * k]),
    ellipsoid([0, -0.014 * k, 0.01 * k], [0.008 * k, 0.005 * k, 0.008 * k]),
    shaft(pts, ap, ml, b.cortical, ctx.detail ? [0.15, 0.82] : null),
    sphere([0.001 * k, -len + 0.004 * k, 0.001 * k], 0.0068 * k),
    capsule([-0.004 * k, -len + 0.002 * k, -0.002 * k], [-0.005 * k, -len - 0.006 * k, -0.002 * k], 0.0024 * k),
  );
  sdf = smoothSubtract(0.0015 * k, sdf, sphere([0, 0.001 * k, 0.009 * k], 0.0125 * k));
  return { sdf, bounds: boundsOf([[0, 0.028 * k, -0.025 * k], [0, -len - 0.012 * k, 0.02 * k]], 0.016 * k), voxel: 0.0011 * k, axis: axisFrom(pts, ap) };
}

export function clavicle(ctx: BuildCtx): BoneBuild {
  const k = ctx.layout.k;
  const Lc = ctx.layout.lengths.clavicle;
  const r = Math.pow(ctx.body.robusticity, 0.5);
  const pts = catmullRom([[0, 0, 0], [Lc * 0.3, 0.002 * k, 0.011 * k], [Lc * 0.66, 0.004 * k, -0.002 * k], [Lc, 0.004 * k, -0.012 * k]], 4);
  const n = pts.length;
  const ra = pts.map((_, i) => lerp(0.0085, 0.0045, i / (n - 1)) * k * r);
  const rb = pts.map((_, i) => { const u = i / (n - 1); return (u < 0.7 ? lerp(0.0085, 0.006, u / 0.7) : lerp(0.006, 0.01, (u - 0.7) / 0.3)) * k * r; });
  return { sdf: flatTube(pts, ra, rb, [0, 1, 0]), bounds: boundsOf(pts, 0.014 * k), voxel: 0.001 * k, axis: axisFrom(pts, ra) };
}

export function scapula(ctx: BuildCtx): BoneBuild {
  const k = ctx.layout.k * Math.sqrt(ctx.body.shoulderWidth / 0.4);
  const poly: Array<[number, number]> = [
    [-0.008, 0.014], [-0.028, 0.024], [-0.058, 0.028], [-0.074, 0.014], [-0.072, -0.036], [-0.062, -0.088], [-0.052, -0.118],
    [-0.034, -0.078], [-0.018, -0.034], [-0.009, -0.014],
  ].map(([x, y]) => [x * k, y * k] as [number, number]);
  const blade = extrudedPolygon(poly, 0.0018 * k, 0.0012 * k, [0, 0, 0], [1, 0, 0], [0, 1, 0]);
  const parts: SDF[] = [
    blade,
    capsule([-0.011 * k, -0.016 * k, 0], [-0.051 * k, -0.115 * k, 0], 0.0038 * k),
    capsule([-0.058 * k, 0.028 * k, 0], [-0.074 * k, 0.014 * k, 0], 0.0024 * k),
    flatTube([[-0.072 * k, 0.014 * k, -0.002 * k], [-0.038 * k, 0.019 * k, -0.008 * k], [-0.006 * k, 0.024 * k, -0.011 * k]],
      [0.0032 * k, 0.0058 * k, 0.0068 * k], [0.0024 * k, 0.0028 * k, 0.0032 * k], [0, 0, -1]),
    ellipsoid([0.01 * k, 0.03 * k, -0.006 * k], [0.015 * k, 0.0042 * k, 0.011 * k], rotZ(0.15)),
    tube([[-0.01 * k, 0.014 * k, 0.005 * k], [-0.005 * k, 0.022 * k, 0.017 * k], [0.006 * k, 0.02 * k, 0.025 * k]], [0.0045 * k, 0.0042 * k, 0.0036 * k]),
    ellipsoid([-0.004 * k, 0, 0], [0.0065 * k, 0.017 * k, 0.012 * k]),
  ];
  let sdf: SDF = smoothUnion(0.0038 * k, ...parts);
  sdf = smoothSubtract(0.0015 * k, sdf, sphere([0.025 * k, 0, 0], 0.027 * k));
  return {
    sdf,
    bounds: { min: [-0.088 * k, -0.135 * k, -0.028 * k], max: [0.032 * k, 0.045 * k, 0.04 * k] },
    voxel: 0.001 * k,
    anchors: {
      glenoid: [0.003 * k, 0, 0], acromion: [0.016 * k, 0.032 * k, -0.006 * k], coracoid: [0.006 * k, 0.02 * k, 0.025 * k],
      spine: [-0.038 * k, 0.022 * k, -0.012 * k], blade: [-0.045 * k, -0.045 * k, -0.003 * k],
    },
  };
}

// ============================================================================ lower limb

export function femur(ctx: BuildCtx): BoneBuild {
  const { body: b, layout: L } = ctx;
  const k = L.k, r = b.robusticity * (ctx.shaftScale ?? 1);
  const mech = L.lengths.femurMech;
  const rfh = b.femoralHead;
  const Ln = b.femoralNeck;
  const el = 35 * Math.PI / 180;
  const N: V3 = [Ln * Math.cos(el), -Ln * Math.sin(el), -Ln * 0.18];
  const K: V3 = [L.femurKneeX, -mech, 0];
  const T0: V3 = vadd(N, [0.004 * k, -0.012 * k, 0]);
  const Ks: V3 = vadd(K, [0.004 * k, 0.06 * k, -0.002 * k]);
  const pts: V3[] = [];
  for (let i = 0; i <= 5; i++) {
    const t = i / 5;
    pts.push([lerp(T0[0], Ks[0], t), lerp(T0[1], Ks[1], t), lerp(T0[2], Ks[2], t) + b.femurBow * Math.sin(Math.PI * t)]);
  }
  const ap = [0.0158, 0.0142, 0.0135, 0.0135, 0.0145, 0.016].map((v) => v * k * r);
  const ml = [0.018, 0.0145, 0.0128, 0.0132, 0.0165, 0.023].map((v) => v * k * r);
  const lineaPts = pts.slice(1, 5).map((p, i) => [p[0], p[1], p[2] - ap[i + 1] * 0.86] as V3);
  const cr = Math.pow(b.robusticity, 0.4);
  let sdf: SDF = smoothUnion(0.006 * k,
    sphere([0, 0, 0], rfh),
    roundCone([0, 0, 0], N, rfh * 0.7, rfh * 0.78),
    ellipsoid(vadd(N, [0.012 * k, 0.022 * k, -0.008 * k]), [0.012 * k, 0.02 * k, 0.016 * k]),
    ellipsoid(vadd(N, [-0.008 * k, -0.035 * k, -0.01 * k]), [0.006 * k, 0.01 * k, 0.006 * k]),
    capsule(vadd(N, [0.01 * k, 0.012 * k, -0.014 * k]), vadd(N, [-0.006 * k, -0.03 * k, -0.012 * k]), 0.0045 * k),
    shaft(pts, ap, ml, b.cortical, ctx.detail ? [0.1, 0.85] : null),
    tube(lineaPts, lineaPts.map(() => 0.0028 * k * r)),
    ellipsoid(vadd(K, [-0.021 * k, 0.013 * k, -0.004 * k]), [0.0125 * k * cr, 0.022 * k, 0.026 * k * cr]),
    ellipsoid(vadd(K, [0.021 * k, 0.015 * k, -0.002 * k]), [0.0135 * k * cr, 0.021 * k, 0.025 * k * cr]),
  );
  sdf = smoothSubtract(0.0025 * k, sdf,
    ellipsoid(vadd(K, [0, 0.004 * k, -0.019 * k]), [0.0075 * k, 0.016 * k, 0.014 * k]),
    ellipsoid(vadd(K, [0, 0.032 * k, 0.025 * k]), [0.008 * k, 0.02 * k, 0.0055 * k]),
    sphere([-rfh * 0.98, 0.002 * k, 0], 0.003 * k));
  const axisPts: V3[] = [[0, 0, 0], ...pts, K];
  return {
    sdf,
    bounds: boundsOf([[0, 0, 0], N, vadd(N, [0.026 * k, 0.045 * k, 0]), K, vadd(K, [-0.036 * k, 0, 0]), vadd(K, [0.036 * k, 0, 0])], 0.03 * k),
    voxel: 0.0016 * k,
    axis: axisFrom(axisPts, [rfh, ...ap, 0.025 * k]),
  };
}

export function tibia(ctx: BuildCtx): BoneBuild {
  const { body: b, layout: L } = ctx;
  const k = L.k, r = b.robusticity * (ctx.shaftScale ?? 1);
  const len = L.lengths.tibia;
  const pts: V3[] = [[0, -0.04 * k, 0.002 * k], [0.002 * k, -len * 0.3, 0.003 * k], [0.002 * k, -len * 0.65, 0.002 * k], [0.001 * k, -len + 0.04 * k, 0]];
  const ap = [0.02, 0.0145, 0.012, 0.0165].map((v) => v * k * r);
  const ml = [0.022, 0.0125, 0.011, 0.016].map((v) => v * k * r);
  const crest = [pts[0], pts[1], pts[2]].map((p, i) => [p[0], p[1] - (i === 0 ? 0.02 * k : 0), p[2] + ap[i] * 0.86] as V3);
  const cr = Math.pow(b.robusticity, 0.4);
  let sdf: SDF = smoothUnion(0.006 * k,
    ellipsoid([0, -0.016 * k, -0.002 * k], [0.038 * k * cr, 0.016 * k, 0.027 * k * cr]),
    ellipsoid([0.003 * k, -0.052 * k, 0.022 * k], [0.009 * k, 0.016 * k, 0.006 * k]),
    shaft(pts, ap, ml, b.cortical, ctx.detail ? [0.12, 0.85] : null),
    tube(crest, [0.003 * k, 0.003 * k, 0.0025 * k]),
    ellipsoid([0, -len + 0.012 * k, 0], [0.022 * k * cr, 0.014 * k, 0.02 * k * cr]),
    ellipsoid([-0.02 * k, -len - 0.003 * k, 0.003 * k], [0.007 * k, 0.014 * k, 0.01 * k]),
  );
  sdf = smoothSubtract(0.002 * k, sdf,
    sphere([0.018 * k, 0.013 * k, 0], 0.02 * k), sphere([-0.018 * k, 0.013 * k, 0], 0.02 * k));
  sdf = smoothUnion(0.002 * k, sdf, ellipsoid([0, -0.003 * k, 0], [0.004 * k, 0.005 * k, 0.008 * k]));
  return { sdf, bounds: boundsOf([[0, 0, 0], [0, -len - 0.02 * k, 0]], 0.045 * k), voxel: 0.0016 * k, axis: axisFrom(pts, ap) };
}

export function fibula(ctx: BuildCtx): BoneBuild {
  const { body: b, layout: L } = ctx;
  const k = L.k, r = b.robusticity * (ctx.shaftScale ?? 1);
  const len = L.lengths.fibula;
  const pts: V3[] = [[0, -0.02 * k, 0], [-0.001 * k, -len * 0.5, 0.001 * k], [0, -len + 0.04 * k, 0.002 * k]];
  const ap = [0.0065, 0.0068, 0.0072].map((v) => v * k * r);
  const ml = [0.006, 0.0065, 0.0068].map((v) => v * k * r);
  const sdf = smoothUnion(0.004 * k,
    ellipsoid([0.002 * k, -0.006 * k, 0], [0.009 * k, 0.011 * k, 0.009 * k]),
    shaft(pts, ap, ml, b.cortical, ctx.detail ? [0.2, 0.8] : null),
    ellipsoid([0.002 * k, -len + 0.012 * k, 0.002 * k], [0.008 * k, 0.018 * k, 0.011 * k]),
  );
  return { sdf, bounds: boundsOf([[0, 0, 0], [0, -len - 0.01 * k, 0]], 0.016 * k), voxel: 0.0012 * k, axis: axisFrom(pts, ap) };
}

export function patella(ctx: BuildCtx): BoneBuild {
  const k = ctx.layout.k * Math.pow(ctx.body.robusticity, 0.3);
  const sdf = smoothUnion(0.004 * k,
    ellipsoid([0, 0, 0], [0.021 * k, 0.022 * k, 0.0095 * k]),
    ellipsoid([0, -0.012 * k, 0.001 * k], [0.012 * k, 0.012 * k, 0.007 * k]),
  );
  return { sdf, bounds: boundsOf([[0, 0, 0]], 0.03 * k), voxel: 0.0011 * k };
}

// ============================================================================ pelvis

export function osCoxae(ctx: BuildCtx): BoneBuild {
  const { body: b, layout: L } = ctx;
  const k = L.k;
  const h = b.hipJointWidth / 2;
  const ih = b.iliacHeight;
  const o = b.iliacOrientation;
  const pw = b.pelvisWidth / 2;
  const d = lerp(0.55, 1, o);
  const rzc = lerp(0.026, 0.062, o) * k;
  const zc = lerp(-0.036, -0.01, o) * k;
  const crest: V3[] = [];
  for (let i = 0; i <= 12; i++) {
    const a = lerp(-1.88, lerp(-0.15, 0.44, o), i / 12);
    crest.push([-h + (pw - 0.004 * k) * Math.cos(a) * (i === 0 ? 0.78 : 1), 0, zc + rzc * Math.sin(a) * (a > 0 ? 1.12 : 1)]);
  }
  crest[0] = [Math.max(-h + 0.026 * k, crest[0][0]), 0, crest[0][2]];
  const flareOffset = Math.max(0.004 * k, (pw - h) * 0.8 + b.iliacFlare * 0.012 * k);
  const blade = sweepXZ(crest, (s, u, v) => {
    const top = ih * (0.86 + 0.14 * Math.sin(Math.PI * Math.min(1, s * 1.1)));
    const bot = 0.01 * k + ih * 0.42 * smoothstep(0.38, 0.0, s) + ih * 0.52 * smoothstep(0.82, 1.0, s);
    const vt = Math.max(0, Math.min(1, (top - v) / Math.max(1e-4, top - bot)));
    const off = flareOffset * Math.pow(Math.sin(Math.PI * Math.min(1, s * 1.05 + 0.02)), 0.6);
    const hu = lerp(0.003, 0.0058, Math.pow(vt, 2.6)) * k;
    return roundRect2(u - off * vt, v, 0, (top + bot) / 2, hu, (top - bot) / 2, hu * 0.95);
  });
  const crestRim = sweepXZ(crest, (s, u, v) => {
    const top = ih * (0.86 + 0.14 * Math.sin(Math.PI * Math.min(1, s * 1.1)));
    return roundRect2(u, v, 0, top - 0.003 * k, 0.005 * k, 0.0052 * k, 0.0045 * k);
  });
  const rh = b.femoralHead * 1.04;
  const symZ = 0.038 * k * d;
  const symTop: V3 = [-h + 0.006 * k, -0.016 * k, symZ];
  const symBot: V3 = [-h + 0.008 * k, -0.036 * k, symZ - 0.004 * k];
  const tub: V3 = [-0.016 * k, -0.056 * k * (ih / 0.125) ** 0.4, -0.024 * k];
  const parts: SDF[] = [
    blade,
    crestRim,
    ellipsoid([-0.007 * k, 0.003 * k, 0], [0.017 * k, rh + 0.007 * k, rh + 0.007 * k]),
    ellipsoid([-0.012 * k, 0.026 * k, -0.004 * k], [0.016 * k, 0.024 * k, 0.019 * k]),
    roundCone([-0.008 * k, -0.014 * k, -0.01 * k], tub, 0.009 * k, 0.0115 * k),
    roundCone([-0.008 * k, -0.002 * k, 0.014 * k], symTop, 0.0075 * k, 0.0072 * k),
    capsule(symTop, symBot, 0.0072 * k),
    capsule(symBot, vadd(tub, [0.002 * k, 0.004 * k, 0.005 * k]), 0.0058 * k),
  ];
  let sdf: SDF = smoothUnion(0.0065 * k, ...parts);
  sdf = smoothSubtract(0.002 * k, sdf, sphere([0, 0, 0], rh), sphere([0.03 * k, -0.012 * k, 0.008 * k], 0.02 * k));
  const minX = -h - 0.004 * k;
  return {
    sdf,
    bounds: { min: [minX - 0.01 * k, -0.075 * k, Math.min(zc - rzc, -0.055 * k) - 0.02 * k], max: [-h + pw + 0.025 * k, ih + 0.02 * k, Math.max(zc + rzc * 1.2, symZ) + 0.025 * k] },
    voxel: 0.0013 * k,
    anchors: {
      'iliac-crest': [-h + pw * 0.9, ih * 0.98, zc], 'iliac-blade': [-h + pw * 0.75 + flareOffset * 0.3, ih * 0.6, zc + rzc * 0.2],
      acetabulum: [rh * 0.6, 0.01 * k, 0.004 * k], 'ischial-tuberosity': tub, 'pubic-ramus': [-h * 0.5, -0.012 * k, symZ * 0.75],
      'pubic-symphysis': [-h + 0.007 * k, -0.026 * k, symZ + 0.006 * k], 'auricular-surface': [crest[0][0] + 0.004 * k, ih * 0.45, crest[0][2] + 0.01 * k],
    },
  };
}

export function sacrum(ctx: BuildCtx): BoneBuild {
  const { body: b, layout: L } = ctx;
  const k = L.k;
  const ps = b.iliacHeight / 0.125;
  const Ls = 0.098 * k * Math.sqrt(ps);
  const W = Math.max(0.068 * k, b.hipJointWidth - 0.044 * k);
  const poly: Array<[number, number]> = [[-W / 2, -0.002 * k], [W / 2, -0.002 * k], [W * 0.38, -Ls * 0.52], [0.013 * k, -Ls], [-0.013 * k, -Ls], [-W * 0.38, -Ls * 0.52]];
  const plate = extrudedPolygon(poly, 0.01 * k, 0.004 * k, [0, 0, -0.008 * k], [1, 0, 0], [0, 1, 0]);
  const base = smoothUnion(0.006 * k, plate,
    offset(cylinder([0, 0, 0], [0, -0.014 * k, -0.002 * k], 0.022 * k - 0.002 * k), 0.002 * k),
    capsule([0, -0.01 * k, -0.022 * k], [0, -Ls * 0.7, -0.018 * k], 0.003 * k));
  const curveZ = (y: number) => -0.22 * y - 2.6 * y * y / Math.max(0.6, ps);
  const curved: SDF = (x, y, z) => base(x, y, z - curveZ(y));
  const holes: SDF[] = [];
  for (const f of [0.18, 0.37, 0.55, 0.72]) {
    holes.push(mirrorX(cylinder([0.013 * k + W * 0.12 * (1 - f), -Ls * f, 0.02 * k], [0.013 * k + W * 0.12 * (1 - f), -Ls * f, -0.05 * k], 0.0032 * k)));
  }
  const sdf = smoothSubtract(0.001 * k, curved, ...holes.map((hsdf) => ((x: number, y: number, z: number) => hsdf(x, y, z - curveZ(y))) as SDF));
  return { sdf, bounds: { min: [-W / 2 - 0.01 * k, -Ls - 0.012 * k, -0.045 * k], max: [W / 2 + 0.01 * k, 0.01 * k, 0.035 * k] }, voxel: 0.0012 * k, anchors: { body: [0, -0.006 * k, 0.012 * k] } };
}

export function coccyx(ctx: BuildCtx): BoneBuild {
  const k = ctx.layout.k;
  const sdf = union(sphere([0, 0, 0], 0.0062 * k), ellipsoid([0, -0.011 * k, 0.002 * k], [0.005 * k, 0.0045 * k, 0.004 * k]),
    ellipsoid([0, -0.019 * k, 0.004 * k], [0.0038 * k, 0.0036 * k, 0.0032 * k]), sphere([0, -0.026 * k, 0.006 * k], 0.0027 * k));
  return { sdf, bounds: boundsOf([[0, 0, 0], [0, -0.03 * k, 0.008 * k]], 0.01 * k), voxel: 0.0008 * k };
}

// ============================================================================ axial skeleton

function ellipsePoly(rx: number, rz: number, flatBack: number, n = 18): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    let z = rz * Math.sin(a);
    if (z < -rz * flatBack) z = -rz * flatBack;
    out.push([rx * Math.cos(a), z]);
  }
  return out;
}

export function vertebra(ctx: BuildCtx, spec: VertebraSpec): BoneBuild {
  const k = ctx.layout.k;
  const { region, index, height: h, rx, rz } = spec;
  const parts: SDF[] = [];
  const plH = region === 'L' ? 0.26 : 0.22;
  const pl = rz * (region === 'C' ? 0.5 : 0.58);
  const lam = rz * (region === 'C' ? 0.55 : 0.45);
  const back = -rz - pl;
  const tipZ = back - lam;
  if (region === 'C' && index === 1) {
    const atlasR = rx * 1.05;
    parts.push(
      tube([[-atlasR * 0.8, 0, rz * 0.4], [0, 0, rz * 0.95], [atlasR * 0.8, 0, rz * 0.4]], [0.0032 * k, 0.0042 * k, 0.0032 * k]),
      mirrorX(ellipsoid([atlasR, 0, -0.002 * k], [0.0062 * k, 0.0058 * k, 0.0095 * k])),
      tube([[-atlasR, -0.001 * k, -0.006 * k], [-atlasR * 0.6, -0.001 * k, -rz * 1.6], [0, 0, -rz * 2.0], [atlasR * 0.6, -0.001 * k, -rz * 1.6], [atlasR, -0.001 * k, -0.006 * k]],
        [0.0035 * k, 0.003 * k, 0.0036 * k, 0.003 * k, 0.0035 * k]),
      mirrorX(capsule([atlasR, 0, -0.002 * k], [atlasR * 1.85, -0.001 * k, -0.004 * k], 0.0042 * k)),
    );
    const sdf = smoothSubtract(0.0008 * k, smoothUnion(0.003 * k, ...parts), mirrorX(cylinder([atlasR * 1.55, 0.01 * k, -0.004 * k], [atlasR * 1.55, -0.01 * k, -0.004 * k], 0.0022 * k)));
    return { sdf, bounds: boundsOf([[-atlasR * 2, -0.01 * k, -rz * 2.2], [atlasR * 2, 0.01 * k, rz * 1.3]], 0.008 * k), voxel: 0.0008 * k, anchors: { body: [0, 0, rz * 0.95], 'spinous-process': [0, 0, -rz * 2.05] } };
  }
  const bodyPoly = ellipsePoly(rx, rz, region === 'T' ? 0.6 : 0.72);
  parts.push(extrudedPolygon(bodyPoly, h / 2, Math.min(0.0016 * k, h * 0.2), [0, 0, 0], [1, 0, 0], [0, 0, 1]));
  parts.push(mirrorX(capsule([rx * 0.58, 0.0, -rz * 0.7], [rx * 0.62, 0.0, back], h * plH)));
  parts.push(mirrorX(capsule([rx * 0.62, 0, back], [0, -h * 0.1, tipZ], h * 0.18)));
  if (region === 'C') {
    const sp = index === 7 ? rz * 1.7 : rz * 0.85;
    parts.push(mirrorX(capsule([0, -h * 0.1, tipZ], [0.0025 * k, -h * 0.45, tipZ - sp], 0.0022 * k)));
    parts.push(mirrorX(capsule([rx * 0.65, h * 0.05, -rz * 0.55], [rx * 1.35, -h * 0.05, -rz * 0.6], h * 0.22)));
    if (index === 2) parts.push(capsule([0, h * 0.5, rz * 0.15], [0, h * 0.5 + 0.014 * k, rz * 0.2], 0.0049 * k));
  } else if (region === 'T') {
    parts.push(flatTube([[0, -h * 0.05, tipZ + 0.002 * k], [0, -h * 0.9, tipZ - rz * 0.65], [0, -h * 1.7, tipZ - rz * 1.0]],
      [0.0044 * k, 0.0036 * k, 0.003 * k], [0.0026 * k, 0.0024 * k, 0.0022 * k], [0, 1, 0]));
    parts.push(mirrorX(capsule([rx * 0.62, h * 0.08, back + pl * 0.3], [rx * 1.55, h * 0.12, back - rz * 0.25], h * 0.2)));
  } else {
    parts.push(extrudedPolygon([[tipZ + 0.004 * k, h * 0.25], [tipZ - rz * 1.05, h * 0.18], [tipZ - rz * 1.1, -h * 0.42], [tipZ + 0.002 * k, -h * 0.5]],
      0.003 * k, 0.0018 * k, [0, 0, 0], [0, 0, 1], [0, 1, 0]));
    parts.push(mirrorX(capsule([rx * 0.62, h * 0.05, back + pl * 0.4], [rx * 1.9, h * 0.06, back + pl * 0.2], h * 0.12)));
  }
  parts.push(mirrorX(ellipsoid([rx * 0.6, h * 0.42, back + 0.002 * k], [0.0034 * k, 0.0042 * k, 0.003 * k])));
  parts.push(mirrorX(ellipsoid([rx * 0.5, -h * 0.5, back - 0.002 * k], [0.003 * k, 0.004 * k, 0.003 * k])));
  let sdf: SDF = smoothUnion(0.0022 * k, ...parts);
  if (region === 'C') {
    sdf = smoothSubtract(0.0006 * k, sdf, mirrorX(cylinder([rx * 1.05, h, -rz * 0.55], [rx * 1.05, -h, -rz * 0.55], 0.0021 * k)));
  }
  const reach = region === 'T' ? h * 1.9 : h * 0.8;
  return {
    sdf,
    bounds: boundsOf([[-rx * 2, -reach, tipZ - rz * 1.3], [rx * 2, h, rz * 1.2]], 0.006 * k),
    voxel: Math.min(0.0011 * k, h * 0.2),
    anchors: {
      body: [0, 0, rz], 'endplate-superior': [0, h / 2, rz * 0.2], 'endplate-inferior': [0, -h / 2, rz * 0.2],
      'spinous-process': [0, region === 'T' ? -h * 1.2 : -h * 0.3, tipZ - rz * 0.8], lamina: [rx * 0.35, 0, back - lam * 0.5],
      pedicle: [rx * 0.65, 0, back + pl * 0.5], 'transverse-process-L': [rx * 1.5, h * 0.1, back], 'transverse-process-R': [-rx * 1.5, h * 0.1, back],
      facet: [rx * 0.6, h * 0.42, back],
    },
  };
}

export function rib(ctx: BuildCtx, spec: RibSpec): BoneBuild {
  const k = ctx.layout.k;
  const r = Math.pow(ctx.body.robusticity, 0.5) * (ctx.shaftScale ?? 1);
  const pts = spec.points;
  const sdf = smoothUnion(0.002 * k, flatTube(pts, spec.ra.map((v) => v * r), spec.rb.map((v) => v * r), [0, 1, 0]), sphere(pts[0], spec.ra[0] * 1.1));
  return { sdf, bounds: boundsOf(pts, 0.012 * k), voxel: 0.0011 * k, axis: axisFrom(pts, spec.ra) };
}

export function sternumBone(ctx: BuildCtx): BoneBuild {
  const k = ctx.layout.k;
  const st = ctx.layout.sternum;
  const v = vnorm(vsub(st.top, st.bottom));
  const L = Math.hypot(st.top[1] - st.bottom[1], st.top[2] - st.bottom[2]);
  const mw = st.manubriumW, bw = st.bodyW;
  const manubrium = extrudedPolygon(
    [[-mw, 0], [-mw * 0.35, 0.0005 * k], [0, -0.006 * k], [mw * 0.35, 0.0005 * k], [mw, 0], [mw * 0.9, -0.014 * k], [mw * 0.55, -0.048 * k], [-mw * 0.55, -0.048 * k], [-mw * 0.9, -0.014 * k]],
    st.thick * 1.15, 0.0025 * k, st.top, [1, 0, 0], v);
  const bodyP = extrudedPolygon(
    [[-bw * 0.8, -0.05 * k], [bw * 0.8, -0.05 * k], [bw, -0.09 * k], [bw * 1.05, -L * 0.72], [bw * 0.7, -(L - 0.03 * k)], [-bw * 0.7, -(L - 0.03 * k)], [-bw * 1.05, -L * 0.72], [-bw, -0.09 * k]],
    st.thick, 0.0022 * k, st.top, [1, 0, 0], v);
  const xi = vadd(st.top, vscale(v, -(L - 0.03 * k)));
  const xiTip = vadd(st.top, vscale(v, -L));
  const sdf = smoothUnion(0.003 * k, manubrium, bodyP, capsule(xi, xiTip, 0.0032 * k));
  return { sdf, bounds: boundsOf([st.top, st.bottom, vadd(st.top, [mw, 0, 0]), vadd(st.top, [-mw, 0, 0])], 0.014 * k), voxel: 0.0011 * k, anchors: { body: vadd(st.top, vscale(v, -L * 0.5)) } };
}

export function cartilageBone(ctx: BuildCtx): BoneBuild {
  const k = ctx.layout.k;
  const tubes = ctx.layout.cartilage.map((line) => tube(catmullRom(line, 3), catmullRom(line, 3).map(() => 0.004 * k)));
  const pts = ctx.layout.cartilage.flat();
  return { sdf: tubes.length ? union(...tubes) : () => 1, bounds: boundsOf(pts.length ? pts : [[0, 0, 0]], 0.01 * k), voxel: 0.0015 * k };
}

export function hyoid(ctx: BuildCtx): BoneBuild {
  const k = ctx.layout.k;
  const sdf = smoothUnion(0.002 * k,
    tube([[-0.011 * k, 0, 0], [0, 0, 0.004 * k], [0.011 * k, 0, 0]], [0.0032 * k, 0.0036 * k, 0.0032 * k]),
    mirrorX(flatTube([[0.011 * k, 0, 0], [0.017 * k, 0.002 * k, -0.014 * k], [0.019 * k, 0.003 * k, -0.028 * k]], [0.0024 * k, 0.0019 * k, 0.0016 * k], [0.0018 * k, 0.0015 * k, 0.0013 * k], [0, 1, 0])),
  );
  return { sdf, bounds: boundsOf([[-0.022 * k, 0, -0.032 * k], [0.022 * k, 0.005 * k, 0.008 * k]], 0.006 * k), voxel: 0.0006 * k };
}

// ============================================================================ hands & feet

export function smallLongBone(ctx: BuildCtx, spec: SmallBoneSpec, kind: 'metacarpal' | 'prox' | 'mid' | 'dist' | 'metatarsal'): BoneBuild {
  const { length: L0, baseR, headR, shaftR, curvature } = spec;
  const bow = -curvature * 0.12 * L0;
  const headY = -L0 + headR * 0.7;
  const isDist = kind === 'dist';
  const parts: SDF[] = [
    ellipsoid([0, -baseR * 0.55, 0], [baseR, baseR * 0.75, baseR * 0.92]),
    tube([[0, -baseR * 0.8, 0], [0, -L0 * 0.5, bow], [0, headY, 0]], [shaftR, shaftR * 0.88, shaftR * (isDist ? 0.7 : 0.95)]),
  ];
  if (isDist) parts.push(ellipsoid([0, -L0 + headR * 0.6, 0.0004], [headR * 1.15, headR * 0.7, headR * 0.6]));
  else parts.push(ellipsoid([0, headY, 0.0003], [headR, headR * 0.78, headR * 0.92]));
  const sdf = smoothUnion(Math.min(baseR, headR) * 0.5, ...parts);
  return { sdf, bounds: boundsOf([[0, 0, 0], [0, -L0, bow]], Math.max(baseR, headR) * 1.3 + 0.001), voxel: Math.max(0.00045, Math.min(0.0009, shaftR * 0.45)) };
}

export function carpals(ctx: BuildCtx): BoneBuild {
  const kh = ctx.body.handLength / 0.19;
  const e = (c: V3, r: V3) => ellipsoid(vscale(c, kh), vscale(r, kh));
  const sdf = union(
    e([0.012, 0.004, 0.002], [0.007, 0.0045, 0.0058]), e([0.002, 0.005, 0], [0.0055, 0.005, 0.006]),
    e([-0.008, 0.003, -0.001], [0.005, 0.0045, 0.005]), e([-0.0095, 0.002, 0.0065], [0.0034, 0.0034, 0.0034]),
    e([0.016, -0.007, 0.006], [0.0058, 0.005, 0.006]), e([0.008, -0.008, 0.003], [0.0045, 0.0045, 0.005]),
    e([0, -0.008, 0.001], [0.0055, 0.008, 0.006]), e([-0.009, -0.007, 0.001], [0.0055, 0.0065, 0.0055]),
    e([-0.011, -0.006, 0.007], [0.0022, 0.0028, 0.0034]),
  );
  return { sdf, bounds: boundsOf([vscale([-0.016, -0.018, -0.008], kh), vscale([0.024, 0.012, 0.014], kh)], 0.002), voxel: 0.0007 * kh };
}

export function talus(ctx: BuildCtx): BoneBuild {
  const kf = ctx.body.footLength / 0.265;
  const fh = ctx.layout.footHeight;
  const arch = lerp(0, 0.01, ctx.body.footArch) * kf;
  const sdf = smoothUnion(0.003 * kf,
    ellipsoid([0, -fh * 0.28, 0.002 * kf], [0.0135 * kf, fh * 0.26, 0.018 * kf]),
    ellipsoid([0, -fh * 0.1, 0.002 * kf], [0.0125 * kf, fh * 0.17, 0.016 * kf]),
    roundCone([-0.002 * kf, -fh * 0.38, 0.014 * kf], [-0.007 * kf, -fh * 0.5 + arch, 0.031 * kf], 0.0085 * kf, 0.0095 * kf),
    sphere([-0.008 * kf, -fh * 0.5 + arch, 0.035 * kf], 0.0102 * kf),
  );
  return { sdf, bounds: boundsOf([[-0.02 * kf, -fh * 0.7, -0.022 * kf], [0.016 * kf, 0.004 * kf, 0.05 * kf]], 0.004 * kf), voxel: 0.0009 * kf };
}

export function calcaneus(ctx: BuildCtx): BoneBuild {
  const kf = ctx.body.footLength / 0.265;
  const fh = ctx.layout.footHeight;
  const sdf = smoothUnion(0.004 * kf,
    ellipsoid([0.002 * kf, -fh * 0.62, -0.008 * kf], [0.0135 * kf, fh * 0.34, 0.028 * kf], rotX(0.12)),
    ellipsoid([0.002 * kf, -fh + 0.012 * kf, -0.036 * kf], [0.0125 * kf, 0.012 * kf, 0.012 * kf]),
    ellipsoid([-0.012 * kf, -fh * 0.52, 0.004 * kf], [0.007 * kf, 0.004 * kf, 0.008 * kf]),
    ellipsoid([0.008 * kf, -fh * 0.75, 0.028 * kf], [0.0098 * kf, fh * 0.24, 0.01 * kf]),
  );
  return { sdf, bounds: boundsOf([[-0.022 * kf, -fh - 0.004 * kf, -0.052 * kf], [0.02 * kf, -fh * 0.25, 0.042 * kf]], 0.004 * kf), voxel: 0.001 * kf };
}

export function tarsals(ctx: BuildCtx): BoneBuild {
  const kf = ctx.body.footLength / 0.265;
  const fh = ctx.layout.footHeight;
  const arch = lerp(0, 0.01, ctx.body.footArch) * kf;
  const sdf = union(
    ellipsoid([-0.01 * kf, -fh * 0.5 + arch, 0.047 * kf], [0.012 * kf, 0.009 * kf, 0.0065 * kf]),
    ellipsoid([0.012 * kf, -fh * 0.72 + arch * 0.5, 0.045 * kf], [0.0105 * kf, 0.0095 * kf, 0.013 * kf]),
    ellipsoid([-0.016 * kf, -fh * 0.55 + arch, 0.062 * kf], [0.0065 * kf, 0.0105 * kf, 0.009 * kf]),
    ellipsoid([-0.006 * kf, -fh * 0.45 + arch, 0.061 * kf], [0.005 * kf, 0.009 * kf, 0.0075 * kf]),
    ellipsoid([0.003 * kf, -fh * 0.5 + arch, 0.06 * kf], [0.0055 * kf, 0.009 * kf, 0.008 * kf]),
  );
  return { sdf, bounds: boundsOf([[-0.026 * kf, -fh, 0.035 * kf], [0.026 * kf, -fh * 0.2 + arch, 0.075 * kf]], 0.004 * kf), voxel: 0.0009 * kf };
}

// Keep tree-shaking quiet for helpers retained for lesions.
void basis; void place; void rotY; void subtract;
