/**
 * Parametric hominin skull built from signed distance fields (v2).
 *
 * Frame: origin at the midpoint between the two porions (ear canals), Frankfurt plane horizontal,
 * +Y up, +Z forward (face), +X = subject's left. Units: metres.
 *
 * Construction strategy (like a sculptor): smooth vault from a warped ellipsoid -> add facial
 * masses and plates -> carve orbits, nasal cavity, temporal fossae, ear canals and foramen magnum,
 * with carves fenced off from the brain cavity so they never punch through the vault.
 */
import {
  aabbFromPoints, basis, bounded, box, capsule, ellipsoid, extrudedPolygon, halfSpace, lerp, mirrorX,
  place, resample, rotX, rotY, roundCone, roundRect2, smoothIntersect, smoothstep, smoothSubtract, smoothUnion,
  sphere, sweepXZ, tube, union, vadd, vcross, vnorm, vsub, type AABB, type SDF, type V3,
} from './core';
import type { SkullParams } from '../morph/params';

export interface ToothInfo {
  fdi: number;
  upper: boolean;
  kind: 'incisor' | 'canine' | 'premolar' | 'molar';
  /** Occlusal centre of the crown. */
  position: V3;
  tangent: V3;
  buccal: V3;
  md: number;
  bl: number;
  crown: number;
}

export interface SkullOptions {
  missingTeeth?: ReadonlySet<number>;
  cariesTeeth?: ReadonlySet<number>;
}

export interface SkullGeometry {
  cranium: SDF;
  mandible: SDF;
  teethUpper: SDF;
  teethLower: SDF;
  bounds: { cranium: AABB; mandible: AABB; teethUpper: AABB; teethLower: AABB };
  anchors: Record<string, V3>;
  teeth: ToothInfo[];
  /** Bottom-centre of the occipital condyles: where the skull rests on the atlas. */
  condyleBase: V3;
  /** Mid-point of the mandibular condyles (jaw hinge axis along X). */
  jawHinge: V3;
  scale: number;
}

type Curve = { pts: V3[]; cum: number[] };

function curveFromPoints(pts: V3[]): Curve {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    const d = vsub(pts[i], pts[i - 1]);
    cum.push(cum[i - 1] + Math.hypot(d[0], d[1], d[2]));
  }
  return { pts, cum };
}

function sampleCurve(c: Curve, dist: number): { p: V3; t: V3 } {
  const total = c.cum[c.cum.length - 1];
  const d = Math.max(0, Math.min(total, dist));
  let i = 1;
  while (i < c.cum.length - 1 && c.cum[i] < d) i++;
  const a = c.pts[i - 1], b = c.pts[i];
  const seg = c.cum[i] - c.cum[i - 1] || 1e-9;
  const f = (d - c.cum[i - 1]) / seg;
  return { p: [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)], t: vnorm(vsub(b, a)) };
}

/** Half dental arcade (midline -> distal molar) for the +X side, through tooth centres. */
function halfArcade(y: number, zFront: number, halfFront: number, halfBack: number, squareness: number, depth: number): Curve {
  const pts: V3[] = [];
  const depthC = halfFront * lerp(0.8, 0.28, squareness);
  const nA = 8;
  for (let i = 0; i <= nA; i++) {
    const a = (i / nA) * (Math.PI / 2);
    pts.push([halfFront * Math.sin(a), y, zFront - depthC * (1 - Math.cos(a))]);
  }
  const c0: V3 = pts[pts.length - 1];
  const rear = Math.max(0.004, depth - depthC);
  const end: V3 = [halfBack, y, zFront - depthC - rear];
  const ctrl: V3 = [c0[0], y, c0[2] - rear * 0.55];
  const nB = 10;
  for (let i = 1; i <= nB; i++) {
    const t = i / nB;
    const u = 1 - t;
    pts.push([u * u * c0[0] + 2 * u * t * ctrl[0] + t * t * end[0], y, u * u * c0[2] + 2 * u * t * ctrl[2] + t * t * end[2]]);
  }
  return curveFromPoints(pts);
}

/** Mirror a +X half curve into a full right->left curve (optionally with extra tail points). */
function fullCurve(half: readonly V3[], tail: readonly V3[] = []): V3[] {
  const left = [...half.slice(1), ...tail];
  const right = left.map((p) => [-p[0], p[1], p[2]] as V3).reverse();
  return [...right, [0, half[0][1], half[0][2]], ...left];
}

/** Cumulative XZ arc length at each polyline vertex — the same measure `sweepXZ` uses for its `s` parameter. */
function xzArcLengths(points: readonly V3[]): number[] {
  const cum = [0];
  for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + Math.max(1e-9, Math.hypot(points[i][0] - points[i - 1][0], points[i][2] - points[i - 1][2])));
  return cum;
}

/** `count + 1` points evenly spaced by XZ arc length — the same `s` parameter that `sweepXZ` hands its profile. */
function xzSamples(points: readonly V3[], count: number): V3[] {
  const cum = xzArcLengths(points);
  const out: V3[] = [];
  for (let k = 0, i = 1; k <= count; k++) {
    const d = (k / count) * cum[cum.length - 1];
    while (i < cum.length - 1 && cum[i] < d) i++;
    const f = Math.max(0, Math.min(1, (d - cum[i - 1]) / (cum[i] - cum[i - 1])));
    out.push([lerp(points[i - 1][0], points[i][0], f), lerp(points[i - 1][1], points[i][1], f), lerp(points[i - 1][2], points[i][2], f)]);
  }
  return out;
}

const TOOTH_KINDS: ToothInfo['kind'][] = ['incisor', 'incisor', 'canine', 'premolar', 'premolar', 'molar', 'molar', 'molar'];
const UPPER_REL = [1, 0.8, 1, 1, 0.95, 1, 0.98, 0.9];
const LOWER_REL = [0.62, 0.7, 0.9, 1, 1, 1.08, 1.05, 1.02];

function toothSize(p: SkullParams, idx: number, upper: boolean): number {
  const base = [p.incisorSize, p.incisorSize, p.canineSize, p.premolarSize, p.premolarSize, p.molarSize, p.molarSize, p.molarSize][idx];
  return base * (upper ? UPPER_REL[idx] : LOWER_REL[idx]);
}

/** Single tooth in its own frame: x = mesiodistal, y = toward root, z = buccal; crown tip at y = 0. */
function toothSDF(kind: ToothInfo['kind'], md: number, bl: number, ch: number, caries: boolean): SDF {
  let crown: SDF;
  let root: SDF;
  if (kind === 'incisor') {
    crown = smoothUnion(0.0015,
      ellipsoid([0, ch * 0.58, 0], [md * 0.5, ch * 0.6, bl * 0.42]),
      box([0, ch * 0.2, 0], [md * 0.47, ch * 0.21, bl * 0.2], bl * 0.14));
    root = roundCone([0, ch * 0.85, 0], [0, ch * 2.3, 0], bl * 0.36, 0.0007);
  } else if (kind === 'canine') {
    crown = smoothUnion(0.001,
      roundCone([0, ch * 0.92, 0], [0, 0.0012, 0], md * 0.47, 0.0012),
      ellipsoid([0, ch * 0.62, 0], [md * 0.48, ch * 0.42, bl * 0.46]));
    root = roundCone([0, ch * 0.9, 0], [0, ch * 2.6, 0], md * 0.38, 0.0008);
  } else if (kind === 'premolar') {
    crown = smoothUnion(0.0012,
      ellipsoid([0, ch * 0.55, 0], [md * 0.5, ch * 0.5, bl * 0.48]),
      sphere([0, md * 0.32, bl * 0.2], md * 0.33),
      sphere([0, md * 0.38, -bl * 0.2], md * 0.29));
    root = roundCone([0, ch * 0.9, 0], [0, ch * 2.3, 0], md * 0.34, 0.0008);
  } else {
    const r = Math.min(md, bl) * 0.26;
    crown = smoothUnion(0.0012,
      box([0, ch * 0.55, 0], [md * 0.5, ch * 0.45, bl * 0.5], r),
      sphere([md * 0.22, md * 0.24, bl * 0.22], md * 0.25),
      sphere([-md * 0.22, md * 0.24, bl * 0.22], md * 0.25),
      sphere([md * 0.22, md * 0.25, -bl * 0.22], md * 0.24),
      sphere([-md * 0.2, md * 0.26, -bl * 0.2], md * 0.23));
    root = union(
      roundCone([md * 0.22, ch * 0.9, bl * 0.18], [md * 0.3, ch * 2.1, bl * 0.24], md * 0.17, 0.0008),
      roundCone([-md * 0.22, ch * 0.9, bl * 0.18], [-md * 0.3, ch * 2.1, bl * 0.24], md * 0.17, 0.0008),
      roundCone([0, ch * 0.9, -bl * 0.2], [0, ch * 2.2, -bl * 0.32], md * 0.2, 0.0008),
    );
  }
  let t = smoothUnion(0.001, crown, root);
  if (caries) {
    t = smoothSubtract(0.0006, t, sphere([md * 0.18, 0.0006, bl * 0.12], Math.max(0.0013, md * 0.17)),
      sphere([-md * 0.25, ch * 0.75, bl * 0.48], Math.max(0.0012, md * 0.14)));
  }
  return t;
}

/** Smooth vault: an ellipsoid whose breadth and height are warped along its length and height. */
function vaultField(p: SkullParams, zc: number, yc: number, rx: number, ry: number, rz: number): SDF {
  const fb = Math.min(1, p.frontalBreadth / 0.95);
  const slope = p.frontalSlope;
  const mbh = p.maxBreadthHeight;
  const ape = Math.max(0, 0.6 - fb) * 1.2;
  return (x, y, z) => {
    const u = (z - zc) / rz;
    const front = u > 0 ? Math.min(1, u) : 0;
    const back = u < 0 ? Math.min(1, -u) : 0;
    const yShift = -slope * ry * 0.3 * front * front + back * back * ry * 0.04 * (1 - p.occipitalBun);
    const ty = Math.max(-1, Math.min(1, (y - yc - yShift) / ry));
    const breadth = rx
      * (1 - (1 - fb) * Math.pow(front, 1.4) - ape * 0.15 * back * back)
      * (1 + (mbh - 0.5) * 0.22 * ty - 0.05 * ty * ty);
    const height = ry * (1 - slope * 0.12 * front * front);
    const px = x / breadth, py = (y - yc - yShift) / height, pz = (z - zc) / rz;
    const k0 = Math.sqrt(px * px + py * py + pz * pz);
    const k1 = Math.sqrt(px * px / (breadth * breadth) + py * py / (height * height) + pz * pz / (rz * rz));
    return k1 < 1e-9 ? -Math.min(breadth, height, rz) : (k0 * (k0 - 1)) / k1;
  };
}

export function buildSkull(p: SkullParams, opts: SkullOptions = {}): SkullGeometry {
  const s = (p.vaultLength + p.vaultBreadth + p.vaultHeight) / (0.19 + 0.142 + 0.118);
  const L = p.vaultLength, B = p.vaultBreadth, H = p.vaultHeight;
  const zG = L * p.porionFraction;
  const zO = zG - L + 0.012 * p.occipitalBun;
  const zF = zG - p.browProjection - p.browRidge * 0.7;
  const rz = (zF - zO) / 2;
  const zc = (zF + zO) / 2;
  const ry = H * 0.8;
  const yc = H - ry;
  const rx = (B / 2) * lerp(0.97, 0.93, p.parietalBossing);

  // ------------------------------------------------------------------ braincase
  const vaultParts: SDF[] = [vaultField(p, zc, yc, rx, ry, rz)];
  if (p.parietalBossing > 0.05) {
    vaultParts.push(mirrorX(ellipsoid([B * 0.3, yc + ry * 0.42 * p.maxBreadthHeight, zc - rz * 0.25],
      [B * 0.17, ry * 0.42, rz * 0.45])));
  }
  const bun = p.occipitalBun;
  if (bun > 0.05) {
    vaultParts.push(ellipsoid([0, yc - ry * 0.2, zO + rz * 0.26], [(B / 2) * 0.62, ry * 0.4, rz * 0.34]));
  }
  let vault: SDF = smoothUnion(0.03 * s, ...vaultParts);
  const baseY = -0.026 * s;
  vault = smoothIntersect(0.012 * s, vault, halfSpace([0, baseY, 0], [0, -1, 0]));
  if (p.occipitalAngulation > 0.05) {
    const push = p.occipitalAngulation * 0.016 * s;
    vault = smoothIntersect(0.008 * s, vault, halfSpace([0, yc - ry * 0.36, zO + push + 0.002], [0, -0.72, -0.69]));
  }
  const t = p.vaultThickness;
  const braincase: SDF = (x, y, z) => {
    const d = vault(x, y, z);
    return Math.max(d, -(d + t));
  };
  /** Distance to the brain cavity (positive outside). Used to fence off carves. */
  const cavity = (x: number, y: number, z: number) => vault(x, y, z) + t;

  const zFM = p.foramenMagnumZ;
  const extras: SDF[] = [];
  /** Midline ridge that hugs the vault: height h above the surface, half-width w, between z0..z1. */
  const midlineRidge = (h: number, w: number, z0: number, z1: number, yMin: number): SDF => (x, y, z) => {
    const zMid = (z0 + z1) / 2, zHalf = (z1 - z0) / 2;
    const taper = Math.max(0, 1 - ((z - zMid) / zHalf) ** 2);
    const hh = h * taper + 1e-4;
    return Math.max(Math.abs(x) - w * (0.4 + 0.6 * taper), vault(x, y, z) - hh, yMin - y);
  };
  if (p.sagittalKeel > 0.05) {
    extras.push(midlineRidge(0.0028 * s * p.sagittalKeel, 0.009 * s, zc - rz * 0.6, zc + rz * 0.75, yc));
  }
  if (p.sagittalCrest > 0.0008) {
    extras.push(midlineRidge(p.sagittalCrest, 0.0024 * s, zO + rz * 0.25, zc + rz * 0.45, yc + ry * 0.2));
  }
  if (p.nuchalTorus > 0.0008) {
    const yNu = yc - ry * 0.34;
    extras.push(mirrorX(tube([[B * 0.3, yNu + 0.002 * s, zO + 0.02 * s], [B * 0.12, yNu, zO + 0.006 * s], [0, yNu - 0.001 * s, zO + 0.004 * s]],
      [p.nuchalTorus * 0.7, p.nuchalTorus, p.nuchalTorus])));
  }
  const ms = p.mastoidSize;
  extras.push(
    mirrorX(ellipsoid([B * 0.405, -0.006 * s, -0.004 * s], [0.012 * s, 0.015 * s, 0.02 * s])),
    mirrorX(ellipsoid([B * 0.37, -0.02 * s * (0.7 + 0.3 * ms), -0.013 * s], [0.0085 * s * ms, 0.0145 * s * ms, 0.0105 * s * ms], rotX(0.25))),
    mirrorX(ellipsoid([0.033 * s, -0.02 * s, -0.002 * s], [0.017 * s, 0.011 * s, 0.015 * s], rotY(0.7))),
    ellipsoid([0, -0.023 * s, zFM + 0.028 * s], [0.022 * s, 0.012 * s, 0.036 * s]),
    mirrorX(ellipsoid([0.0125 * s, -0.0345 * s, zFM - 0.012 * s], [0.0058 * s, 0.0055 * s, 0.0115 * s], rotY(0.32))),
  );

  // ------------------------------------------------------------------ facial landmarks
  const br = p.browRidge;
  const yN = 0.026 * s + br * 0.5;
  const zN = zG - 0.005 * s - p.browProjection * 0.25;
  const oW = p.orbitWidth, oH = p.orbitHeight;
  const O: V3 = [0.0115 * s + oW / 2, yN - oH * 0.5 - 0.001 * s, zN - 0.015 * s];
  const Py = yN - p.faceHeight;
  const Pz = zN + p.prognathism + p.midfaceProjection * 0.5;
  const zFace = zN + p.midfaceProjection + 0.004 * s + p.prognathism * 0.4;
  const retreat = p.zygomaticRetreat, flare = p.zygomaticFlare, dish = p.dishedFace;
  const Zc: V3 = [p.faceWidth * 0.385, O[1] - oH * 0.62, O[2] - 0.01 * s - retreat * 0.02 * s + flare * 0.012 * s + dish * 0.01 * s];
  const gF: V3 = [B * 0.355, -0.0115 * s, 0.012 * s];
  const archRoot: V3 = [B * 0.395, -0.005 * s, 0.013 * s];
  const zyg: V3 = [p.faceWidth / 2 - 0.003 * s, Zc[1] + 0.003 * s, lerp(Zc[2], archRoot[2], 0.45)];
  const aperTop = yN - 0.02 * s, aperBot = yN - p.nasalHeight;

  // ------------------------------------------------------------------ dentition layout
  const yOcc = Py - 0.009 * s;
  const upperSizes = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => toothSize(p, i, true));
  const lowerSizes = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => toothSize(p, i, false));
  const sumU = upperSizes.reduce((a, b) => a + b, 0) + p.diastema;
  const sumL = lowerSizes.reduce((a, b) => a + b, 0) + p.diastema * 0.6;
  const zFrontU = Pz - 0.003 * s;
  const halfFront = Math.max(0.006 * s, p.arcadeFront / 2 - p.canineSize * 0.15);
  const halfBack = p.arcadeWidth / 2 - p.molarSize * 0.55;
  const solve = (y: number, zFront: number, hf: number, hb: number, target: number) => {
    let lo = 0.01, hi = 0.16, best = halfArcade(y, zFront, hf, hb, p.arcadeSquareness, 0.05);
    for (let i = 0; i < 26; i++) {
      const mid = (lo + hi) / 2;
      best = halfArcade(y, zFront, hf, hb, p.arcadeSquareness, mid);
      if (best.cum[best.cum.length - 1] < target) lo = mid;
      else hi = mid;
    }
    return best;
  };
  const arcU = solve(yOcc, zFrontU, halfFront, halfBack, sumU);
  const arcL = solve(yOcc - 0.0006, zFrontU - 0.0028 * s, halfFront * 0.93, halfBack * 0.96, sumL);

  const teeth: ToothInfo[] = [];
  const placeTeeth = (arc: Curve, sizes: number[], upper: boolean) => {
    let d = 0;
    for (let i = 0; i < 8; i++) {
      if (upper && i === 2) d += p.diastema;
      if (!upper && i === 3) d += p.diastema * 0.6;
      const md = sizes[i];
      const { p: pos, t: tan } = sampleCurve(arc, d + md / 2);
      d += md;
      const kind = TOOTH_KINDS[i];
      const bl = md * (kind === 'incisor' ? 0.8 : kind === 'canine' ? 1 : kind === 'premolar' ? 1.3 : upper ? 1.12 : 1);
      const crown = kind === 'incisor' ? md * (upper ? 1.15 : 1.45) : kind === 'canine' ? p.canineHeight * (upper ? 1 : 0.9)
        : kind === 'premolar' ? md * 1.1 : md * 0.7;
      for (const side of [1, -1]) {
        const tt: V3 = [tan[0] * side, tan[1], tan[2]];
        const position: V3 = [pos[0] * side, pos[1], pos[2]];
        const buccal = vnorm(vcross(tt, [0, 1, 0]));
        const b2: V3 = side > 0 ? buccal : [-buccal[0], -buccal[1], -buccal[2]];
        const quadrant = upper ? (side > 0 ? 2 : 1) : side > 0 ? 3 : 4;
        teeth.push({ fdi: quadrant * 10 + i + 1, upper, kind, position, tangent: tt, buccal: b2, md, bl, crown });
      }
    }
  };
  placeTeeth(arcU, upperSizes, true);
  placeTeeth(arcL, lowerSizes, false);
  const chI = upperSizes[0] * 1.15, chM = p.molarSize * 0.7;
  const missing = opts.missingTeeth ?? new Set<number>();

  // Upper alveolar process: a swept plate whose lower edge follows the crowns' cervical line.
  const dentScale = 0.8 + 0.25 * (p.molarSize / 0.0102);
  const upperHalf = resample(arcU.pts, 10).map((q) => [q[0], yOcc, q[2]] as V3);
  const lastU = upperHalf[upperHalf.length - 1];
  const tanU = vnorm(vsub(lastU, upperHalf[upperHalf.length - 2]));
  const alvCurveU = fullCurve(upperHalf, [vadd(lastU, [tanU[0] * 0.007 * s, 0, tanU[2] * 0.007 * s])]);
  const alvTopU = yOcc + 0.026 * s + p.prognathism * 0.25;
  const alveolarU = sweepXZ(alvCurveU, (sv, u, v) => {
    const front = smoothstep(0.32, 0.5, sv) * smoothstep(0.68, 0.5, sv);
    const bottom = yOcc + lerp(chM, chI, front) - 0.0004;
    const hu = 0.0068 * s * dentScale * (1 - 0.15 * front) * (1 + p.prognathism * 6);
    return roundRect2(u, v, 0.0006 * s, (bottom + alvTopU) / 2, hu, (alvTopU - bottom) / 2, hu * 0.85);
  });
  const arcDepth = zFrontU - lastU[2];
  const palate = ellipsoid([0, yOcc + chM + 0.012 * s, zFrontU - arcDepth * 0.5], [p.arcadeWidth * 0.34, 0.006 * s, arcDepth * 0.5]);

  // ------------------------------------------------------------------ face: continuous mass, then carve
  const zRh = zN + 0.011 * s + p.midfaceProjection * 0.9;
  const yRh = aperTop + 0.001 * s;
  const zAp = zN + 0.004 * s + p.midfaceProjection + p.prognathism * 0.4;
  const zFrontMax = Math.max(zAp, Pz);
  const infraY = O[1] - oH * 0.5;
  const midRz = 0.03 * s + p.prognathism * 0.08;
  const progTilt = Math.atan2(p.prognathism * 0.35, p.faceHeight);
  const midface = ellipsoid(
    [0, (infraY + Py) / 2 + 0.004 * s, zAp - midRz * 0.9],
    [p.faceWidth * 0.3, (infraY - Py) / 2 + 0.01 * s, midRz],
    rotX(-progTilt),
  );
  // Snout: a cone from the infraorbital face (wide) to the incisor region (narrow), flattened front-to-back.
  const snoutA: V3 = [0, infraY - 0.008 * s, zN - 0.014 * s];
  const snoutB: V3 = [0, yOcc + chI + 0.006 * s, Pz - 0.011 * s];
  const flatZ = 0.78;
  const snoutRaw = roundCone([0, snoutA[1], snoutA[2] / flatZ], [0, snoutB[1], snoutB[2] / flatZ], p.faceWidth * 0.25, halfFront + 0.006 * s);
  const muzzle: SDF = (x, y, z) => snoutRaw(x, y, z / flatZ) * flatZ;
  const upperFace = ellipsoid([0, O[1] + 0.003 * s, zN - 0.02 * s], [O[0] + oW / 2 + 0.001 * s, oH * 0.76 + 0.004 * s, 0.024 * s]);
  // Zygomatic body: a plate facing anterolaterally. A dished face (robust australopiths) turns it to face forward and
  // spreads it medially into the midface (a broad flat cheek in front of the nose region) — without the dish terms,
  // high flare spun it sideways into a round "ear-muff" disc.
  const cheek = ellipsoid([Zc[0] - dish * 0.006 * s, Zc[1], Zc[2]],
    [(0.0075 * s + flare * 0.004 * s) * (1 - 0.35 * dish), p.cheekHeight * (0.72 - 0.17 * dish), 0.02 * s + flare * 0.007 * s],
    rotY(-0.75 + retreat * 0.25 + flare * 0.45 - dish * 1.2));
  const m1 = teeth.find((tt) => tt.fdi === 26);
  const zygRoot = capsule([Zc[0] - 0.003 * s, Zc[1] - p.cheekHeight * 0.3, Zc[2] - 0.004 * s],
    [halfBack + 0.006 * s, yOcc + chM + 0.012 * s, m1 ? m1.position[2] : Zc[2] - 0.01 * s], 0.0065 * s * (1 + flare * 0.6));
  const latRim = capsule([O[0] + oW * 0.5 + 0.002 * s, O[1] + oH * 0.4, O[2] - 0.012 * s],
    [Zc[0] - 0.002 * s, Zc[1] + p.cheekHeight * 0.3, Zc[2] - 0.004 * s], 0.0048 * s);
  const archPts: V3[] = [[Zc[0] + 0.002 * s, Zc[1], Zc[2] - 0.008 * s], zyg, archRoot];
  const arch = sweepXZ(archPts, (sv, u, v) => {
    const yMid = lerp(Zc[1] + 0.001 * s, archRoot[1], sv);
    const hv = lerp(0.0078 * s, 0.0046 * s, sv) * (1 + flare * 0.25);
    return roundRect2(u, v, 0, yMid, 0.0027 * s, hv, 0.0025 * s);
  });
  const nasalBones = capsule([0, yN - 0.001 * s, zN + 0.0005 * s], [0, yRh, zRh], 0.0046 * s);
  const nasalSpine = capsule([0, aperBot + 0.0015 * s, zAp - 0.002 * s], [0, aperBot - 0.0004 * s, zAp + 0.008 * s], 0.0017 * s);
  const browSide = tube(
    [
      [O[0] + oW * 0.52, O[1] + oH * 0.42, O[2] - 0.01 * s],
      [O[0], O[1] + oH * 0.5 + br * 0.6, O[2] + 0.004 * s + p.browProjection * 0.4],
      [0.006 * s, yN + 0.006 * s + br * 0.45, zG - br * 0.85],
    ],
    [br * 0.62, br, br * (0.55 + 0.45 * p.browContinuous)],
  );
  const glabella = capsule([-0.006 * s, yN + 0.006 * s + br * 0.45, zG - br * 0.85], [0.006 * s, yN + 0.006 * s + br * 0.45, zG - br * 0.85],
    br * (0.5 + 0.5 * p.browContinuous));
  const cheekBridge = capsule(Zc, [p.nasalWidth * 0.5 + 0.009 * s, infraY - 0.01 * s, zAp - 0.01 * s - dish * 0.006 * s], 0.0075 * s * (1 + flare * 0.7));
  const faceMass = smoothUnion(0.013 * s, midface, muzzle, upperFace, mirrorX(smoothUnion(0.01 * s, cheek, latRim, zygRoot, cheekBridge)), nasalBones);
  const face = bounded(
    smoothUnion(0.005 * s, faceMass, alveolarU, palate, nasalSpine, mirrorX(browSide), glabella),
    [0, (yN + yOcc) / 2, zN - 0.02 * s], Math.max(p.faceWidth * 0.62, p.faceHeight) + 0.035 * s, 0.03 * s,
  );
  let cranium: SDF = smoothUnion(0.011 * s, braincase, smoothUnion(0.006 * s, ...extras), face);
  cranium = smoothUnion(0.004 * s, cranium, mirrorX(arch));

  // ------------------------------------------------------------------ carving
  const fence = 0.0035 * s;
  const outsideVault = (sdf: SDF, gap: number): SDF => (x, y, z) => Math.max(sdf(x, y, z), gap - vault(x, y, z));
  const orbitRound = Math.min(oW, oH) * 0.5 * lerp(0.98, 0.55, p.orbitShape);
  const orbitOpen = box([O[0], O[1], O[2] - 0.002 * s], [oW / 2, oH / 2, 0.03 * s], orbitRound, rotY(0.26));
  const orbitCone = roundCone([O[0], O[1], O[2]], [O[0] - 0.012 * s, O[1] + 0.002 * s, O[2] - 0.042 * s], Math.min(oW, oH) * 0.47, 0.004 * s);
  const orbitSide: SDF = (x, y, z) => Math.max(Math.min(orbitOpen(x, y, z), orbitCone(x, y, z)), fence - cavity(x, y, z));
  const nasalRaw = union(
    ellipsoid([0, aperTop - (aperTop - aperBot) * 0.3, zAp], [p.nasalWidth * 0.38, (aperTop - aperBot) * 0.37, 0.035 * s]),
    ellipsoid([0, aperBot + (aperTop - aperBot) * 0.24, zAp - 0.002 * s], [p.nasalWidth * 0.53, (aperTop - aperBot) * 0.27, 0.035 * s]),
    box([0, (aperTop + aperBot) / 2 - 0.004 * s, zAp - 0.036 * s], [p.nasalWidth * 0.42, (aperTop - aperBot) * 0.5, 0.032 * s], 0.006 * s),
  );
  const nasalCut: SDF = (x, y, z) => Math.max(nasalRaw(x, y, z), fence - cavity(x, y, z));
  const archInner = zyg[0] - 0.0027 * s;
  const fossaZ = lerp(O[2] - 0.022 * s - retreat * 0.012 * s, archRoot[2], 0.5);
  const fossaRz = Math.max(0.012 * s, (O[2] - 0.022 * s - archRoot[2]) / 2);
  const fossaSide = outsideVault(ellipsoid([archInner - 0.0115 * s, -0.004 * s, fossaZ], [0.011 * s, 0.05 * s, fossaRz]), 0.0006 * s);
  const infraTemporal = outsideVault(
    ellipsoid([halfBack + 0.017 * s, yOcc + 0.012 * s, lastU[2] - 0.022 * s], [0.014 * s, 0.024 * s, 0.022 * s]), 0.0006 * s);
  const canineFossa = ellipsoid([p.nasalWidth * 0.5 + 0.011 * s, aperBot - 0.002 * s, zAp + 0.004 * s - p.prognathism * 0.2],
    [0.0085 * s, 0.009 * s, 0.0055 * s * Math.max(0, 1 - p.prognathism * 30)]);
  const carves: SDF[] = [
    mirrorX(orbitSide),
    nasalCut,
    mirrorX(fossaSide),
    mirrorX(infraTemporal),
    mirrorX(capsule([B * 0.52, 0, 0], [B * 0.34, 0, 0], 0.0045 * s)),
    mirrorX(ellipsoid([gF[0], gF[1] + 0.001 * s, gF[2]], [0.0105 * s, 0.0062 * s, 0.0085 * s])),
    ellipsoid([0, -0.03 * s, zFM - 0.0175 * s], [0.0145 * s, 0.03 * s, 0.0175 * s]),
  ];
  if (p.prognathism < 0.025) carves.push(mirrorX(canineFossa));
  for (const tooth of teeth) {
    if (tooth.upper && missing.has(tooth.fdi)) {
      carves.push(ellipsoid([tooth.position[0], yOcc + chM + 0.001 * s, tooth.position[2]], [tooth.md * 0.75, 0.007 * s, tooth.bl * 0.9]));
    }
  }
  cranium = smoothSubtract(0.0032 * s, cranium, ...carves);

  // ------------------------------------------------------------------ mandible
  const yOccL = yOcc - 0.0006;
  const chML = p.molarSize * 1.08 * 0.7;
  const yCrestL = yOccL - chML + 0.0004;
  const yBaseL = yCrestL - p.mandibleHeight;
  const T = p.mandibleThickness / 2;
  const xGon = gF[0] - 0.003 * s + p.gonialFlare * 0.003 * s;
  const lowerHalf = resample(arcL.pts, 10).map((q) => [q[0], yCrestL, q[2]] as V3);
  const lastL = lowerHalf[lowerHalf.length - 1];
  const tanL = vnorm(vsub(lastL, lowerHalf[lowerHalf.length - 2]));
  const rw = p.ramusWidth;
  const retro = p.retromolarSpace + 0.006 * s;
  const t0: V3 = vadd(lastL, [tanL[0] * retro, 0, tanL[2] * retro]);
  // Ramus frame: u = forward offset from the condyle. Its proportions scale with the jaw itself (body height, ramus
  // height/width) — not with braincase size — so small-brained, tall-faced species get the same jaw shape language.
  // The posterior border leans back ~9° up to the condyle; the jaw angle is a rounded corner of radius R.
  const yTop = gF[1];
  const R = 0.3 * p.mandibleHeight;
  const rearTop: [number, number] = [-0.0052 * s, yTop - 0.009 * s];
  const uRear = (y: number) => rearTop[0] + 0.16 * (rearTop[1] - y);
  // The body's tail ends just in front of the angle, hidden inside the ramus plate's rounded corner.
  const zEnd = Math.min(t0[2] - 0.004 * s, gF[2] + uRear(yBaseL + 0.5 * p.mandibleHeight) + 0.5 * R);
  const t1: V3 = [lerp(t0[0], xGon, 0.55), yCrestL, lerp(t0[2], zEnd, 0.5)];
  const tail: V3[] = [t0, t1, [xGon - 0.001 * s, yCrestL, zEnd]];
  const bodyCurve = fullCurve(lowerHalf, tail);
  const zSym = lowerHalf[0][2];
  // Lower border: lowest under the chin, rising toward the jaw angle (mandibular plane ~12-18° to the bite)
  // instead of a flat box bottom; capped so the back of the body keeps at least ~45% of its height.
  const bodyLen = Math.max(0.02 * s, zSym - zEnd);
  const rise = Math.min(Math.tan(0.31) * bodyLen, 0.55 * p.mandibleHeight);
  const riseAtZ = (z: number) => rise * Math.max(0, Math.min(1, (zSym - z) / bodyLen)) ** 1.15;
  const riseLut = xzSamples(bodyCurve, 64).map((q) => riseAtZ(q[2]));
  const riseAt = (sv: number) => {
    const f = Math.max(0, Math.min(1, sv)) * 64, i = Math.min(63, Math.floor(f));
    return lerp(riseLut[i], riseLut[i + 1], f - i);
  };
  const recede = (1 - p.chin) * 0.011 * s;
  const lean = p.chin > 0.5 ? 0.0025 * s * p.chin : -recede;
  // Arc fraction where the retromolar tail starts (t0); the body thins over the tail so it flows into the thin ramus.
  const cumB = xzArcLengths(bodyCurve);
  const svT0 = cumB[bodyCurve.length - 3] / cumB[bodyCurve.length - 1];
  const body = sweepXZ(bodyCurve, (sv, u, v) => {
    const front = smoothstep(0.3, 0.5, sv) * smoothstep(0.7, 0.5, sv);
    const back = Math.max(smoothstep(0.16, 0.02, sv), smoothstep(0.84, 0.98, sv));
    const tip = Math.max(smoothstep(1 - svT0 + 0.01, 0, sv), smoothstep(svT0 - 0.01, 1, sv));
    const top = yCrestL - 0.0008 * s - back * 0.004 * s;
    const bot = Math.min(top - 0.006 * s, yBaseL - front * 0.002 * s + riseAt(sv));
    const vt = Math.max(0, Math.min(1, (top - v) / (top - bot)));
    const hu = T * (1 + front * 0.22) * (0.78 + 0.22 * vt) * (1 - 0.55 * tip);
    const uc = -0.0006 * s + front * vt * lean;
    return roundRect2(u, v, uc, (top + bot) / 2, hu, (top - bot) / 2, hu * 0.95);
  });
  const parts: SDF[] = [body];
  if (p.chin > 0.1) {
    parts.push(ellipsoid([0, yBaseL + 0.0065 * s, zSym + T * (1 + 0.22) - 0.0012 * s], [0.0125 * s, 0.0072 * s, 0.0032 * s * p.chin + 0.0008 * s]));
  }
  // Ramus outline: rounded quadratic-Bézier jaw angle (lower border -> virtual corner C -> posterior border), U-shaped
  // mandibular notch, pointed coronoid near condyle height, and an anterior border that drops steeply then sweeps
  // forward onto the body.
  const yGon = yBaseL + rise - 0.002 * s;
  const C: [number, number] = [uRear(yGon), yGon];
  const cB: [number, number] = [uRear(yGon + R), yGon + R];
  const cA: [number, number] = [C[0] + 1.2 * R, yBaseL + riseAtZ(gF[2] + C[0] + 1.2 * R) - 0.0012 * s];
  const angleCurve = [0, 0.2, 0.4, 0.6, 0.8, 1].map((t): [number, number] => [
    (1 - t) ** 2 * cA[0] + 2 * t * (1 - t) * C[0] + t * t * cB[0],
    (1 - t) ** 2 * cA[1] + 2 * t * (1 - t) * C[1] + t * t * cB[1],
  ]);
  const hR = yTop - yCrestL;
  const uFront = Math.max(rw * 0.95, t0[2] - gF[2] - 0.002 * s);
  const uAI = Math.max(rw * 0.86, t0[2] - gF[2] - 0.006 * s);
  const yMidRamus = (yTop + yGon) / 2;
  const ramusPoly: Array<[number, number]> = [
    [rearTop[0] + 0.0006 * s, yTop - 0.005 * s],
    [0.004 * s, yTop - 0.007 * s],
    [rw * 0.28, yTop - 0.014 * s],
    [rw * 0.4, yTop - 0.0165 * s],
    [rw * 0.52, yTop - 0.013 * s],
    [rw * 0.7, yTop + 0.001 * s],
    [rw * 0.74, yTop - 0.35 * hR],
    [rw * 0.84, yTop - 0.8 * hR],
    [uFront, yCrestL - 0.002 * s],
    [uAI, yBaseL + riseAtZ(gF[2] + uAI) + 0.002 * s],
    ...angleCurve,
    [uRear(yMidRamus), yMidRamus],
  ].map(([u, y]) => [u, y - yBaseL] as [number, number]);
  const vAxis: V3 = vnorm([-p.gonialFlare * 0.08, 1, 0]);
  const ramusPlate = extrudedPolygon(ramusPoly, 0.0028 * s, 0.002 * s, [gF[0] - 0.003 * s, yBaseL, gF[2]], [0, 0, 1], vAxis);
  const rx0 = gF[0] - 0.003 * s;
  // Thickened posterior border: its rear surface coincides with the outline, so it adds bulk without changing the profile.
  const rPB = 0.0032 * s;
  const postBorder = capsule([rx0, rearTop[1] + 0.002 * s, gF[2] + rearTop[0] + rPB], [rx0 + p.gonialFlare * 0.003 * s, cB[1], gF[2] + cB[0] + rPB], rPB);
  // External oblique ridge: from the anterior border down and forward onto the body's outer surface.
  const leftPts = [...lowerHalf, ...tail];
  const xCurveAt = (z: number): number => {
    for (let i = 1; i < leftPts.length; i++) {
      const a = leftPts[i - 1], b = leftPts[i];
      if ((a[2] - z) * (b[2] - z) <= 0 && a[2] !== b[2]) return lerp(a[0], b[0], (a[2] - z) / (a[2] - b[2]));
    }
    return lastL[0];
  };
  const zOb = gF[2] + uFront + 0.012 * s;
  const obliqueLine = capsule([rx0 + 0.0005 * s, yTop - 0.6 * hR, gF[2] + rw * 0.8], [xCurveAt(zOb) + 0.72 * T, yCrestL - 0.3 * p.mandibleHeight, zOb], 0.0014 * s);
  // Shallow masseteric hollow on the outer face of the ramus so it is not a flat board: a large capsule pressed 0.9 mm
  // into the face (exact SDF, so the mesher's distance-based block culling stays safe on the thin plate).
  const span = rw * 0.8 - C[0], ramH = yTop - yGon, dent = 0.0009 * s;
  const wF = 0.25 * span, rF = (wF * wF) / (2 * dent);
  const xFossaAxis = (y: number) => rx0 - p.gonialFlare * 0.08 * (y - yBaseL) + 0.0028 * s + rF - dent;
  const zFos = gF[2] + C[0] + 0.45 * span, yLo = yGon + 0.15 * ramH, yHi = yGon + 0.6 * ramH;
  const fossa = capsule([xFossaAxis(yLo), yLo, zFos], [xFossaAxis(yHi), yHi, zFos], rF);
  const ramusSide = smoothSubtract(0.003 * s, smoothUnion(0.006 * s, ramusPlate, postBorder, obliqueLine), fossa);
  const condyleSide = ellipsoid([gF[0], gF[1] + 0.0005 * s, gF[2]], [0.0095 * s, 0.0052 * s, 0.0048 * s], rotY(0.25));
  parts.push(mirrorX(smoothUnion(0.0035 * s, ramusSide, condyleSide)));
  let mandible: SDF = smoothUnion(0.007 * s, ...parts);
  const mandCarves: SDF[] = [];
  const p4 = teeth.find((tt) => tt.fdi === 35);
  if (p4) mandCarves.push(mirrorX(sphere([Math.abs(p4.position[0]) + T, yCrestL - 0.013 * s, p4.position[2] + 0.002 * s], 0.0017 * s)));
  for (const tooth of teeth) {
    if (!tooth.upper && missing.has(tooth.fdi)) {
      mandCarves.push(ellipsoid([tooth.position[0], yCrestL + 0.001 * s, tooth.position[2]], [tooth.md * 0.75, 0.007 * s, tooth.bl * 0.9]));
    }
  }
  if (mandCarves.length) mandible = smoothSubtract(0.003 * s, mandible, ...mandCarves);

  // ------------------------------------------------------------------ teeth
  const caries = opts.cariesTeeth ?? new Set<number>();
  const toothParts = (upper: boolean): SDF => {
    const list: SDF[] = [];
    for (const tooth of teeth) {
      if (tooth.upper !== upper || missing.has(tooth.fdi)) continue;
      const rootDir: V3 = upper ? [0, 1, 0] : [0, -1, 0];
      const local = toothSDF(tooth.kind, tooth.md, tooth.bl, tooth.crown, caries.has(tooth.fdi));
      const rot = basis(tooth.tangent, rootDir, tooth.buccal);
      const reach = tooth.crown * 2.8 + tooth.md;
      list.push(bounded(place(local, tooth.position, rot), [tooth.position[0], tooth.position[1] + rootDir[1] * tooth.crown, tooth.position[2]], reach, 0.004));
    }
    if (list.length === 0) return () => 1;
    return union(...list);
  };
  const teethUpper = toothParts(true);
  const teethLower = toothParts(false);

  // ------------------------------------------------------------------ anchors (approximate; refined by caller)
  const yBodyMid = (yCrestL + yBaseL) / 2;
  const zBody = lerp(zSym, lastL[2], 0.6);
  const yBody = (yCrestL + yBaseL + riseAtZ(zBody)) / 2;
  const anchors: Record<string, V3> = {
    glabella: [0, yN + 0.006 * s + br * 0.45, zG + br * 0.2],
    'frontal-mid': [0, yc + ry * 0.62, zF - 0.008 * s],
    'frontal-L': [0.03 * s, yc + ry * 0.55, zF - 0.014 * s],
    'frontal-R': [-0.03 * s, yc + ry * 0.55, zF - 0.014 * s],
    'supraorbital-L': [O[0], O[1] + oH * 0.5 + br * 1.4, O[2] + 0.006 * s + p.browProjection * 0.4],
    'supraorbital-R': [-O[0], O[1] + oH * 0.5 + br * 1.4, O[2] + 0.006 * s + p.browProjection * 0.4],
    'orbit-L': [O[0] + oW * 0.45, O[1] - oH * 0.25, O[2] + 0.004 * s],
    'orbit-R': [-O[0] - oW * 0.45, O[1] - oH * 0.25, O[2] + 0.004 * s],
    'orbit-floor-L': [O[0], O[1] - oH * 0.45, O[2] - 0.006 * s],
    'orbit-floor-R': [-O[0], O[1] - oH * 0.45, O[2] - 0.006 * s],
    nasal: [0, yN - 0.01 * s, zFace + 0.012 * s],
    'zygomatic-L': [Zc[0] + 0.008 * s, Zc[1], Zc[2] + 0.006 * s],
    'zygomatic-R': [-Zc[0] - 0.008 * s, Zc[1], Zc[2] + 0.006 * s],
    'maxilla-L': [p.faceWidth * 0.2, Py + 0.02 * s, Pz - 0.008 * s],
    'maxilla-R': [-p.faceWidth * 0.2, Py + 0.02 * s, Pz - 0.008 * s],
    palate: [0, yOcc + chM + 0.006 * s, zFrontU - arcDepth * 0.5],
    vertex: [0, H + 0.01 * s + p.sagittalCrest, zc - 0.01 * s],
    'parietal-L': [rx * 0.82, yc + ry * 0.5, zc - rz * 0.3],
    'parietal-R': [-rx * 0.82, yc + ry * 0.5, zc - rz * 0.3],
    'temporal-L': [B * 0.5, 0.022 * s, 0.006 * s],
    'temporal-R': [-B * 0.5, 0.022 * s, 0.006 * s],
    'ear-L': [B * 0.45, 0.004 * s, 0],
    'ear-R': [-B * 0.45, 0.004 * s, 0],
    'mastoid-L': [B * 0.38, -0.032 * s, -0.013 * s],
    'mastoid-R': [-B * 0.38, -0.032 * s, -0.013 * s],
    occipital: [0, yc - ry * 0.12, zO - 0.012 * s],
    'occipital-L': [0.03 * s, yc - ry * 0.1, zO + 0.004 * s],
    'occipital-R': [-0.03 * s, yc - ry * 0.1, zO + 0.004 * s],
    'cranial-base': [0, baseY - 0.006 * s, zFM - 0.03 * s],
    'mandible-symphysis': [0, yBodyMid, zSym + T + 0.006 * s],
    'mandible-body-L': [lastL[0] + T + 0.002 * s, yBody, zBody],
    'mandible-body-R': [-lastL[0] - T - 0.002 * s, yBody, zBody],
    'mandible-ramus-L': [gF[0] + 0.004 * s, yMidRamus, gF[2] + rw * 0.4],
    'mandible-ramus-R': [-gF[0] - 0.004 * s, yMidRamus, gF[2] + rw * 0.4],
    'mandible-condyle-L': [gF[0], gF[1] + 0.006 * s, gF[2]],
    'mandible-condyle-R': [-gF[0], gF[1] + 0.006 * s, gF[2]],
  };

  const pad = 0.012 * s;
  const halfW = Math.max(B / 2, p.faceWidth / 2) + pad;
  const craniumBounds: AABB = {
    min: [-halfW, Math.min(yOcc - halfFront - 0.006 * s, -0.045 * s) - pad, zO - 0.018 * s - pad],
    max: [halfW, H + p.sagittalCrest + 0.006 * s + pad, Math.max(zG, zFace + 0.012 * s, Pz) + 0.01 * s + pad],
  };
  const mandibleBounds: AABB = {
    min: [-(gF[0] + 0.014 * s) - pad, yBaseL - 0.006 * s - pad, Math.min(gF[2] - 0.022 * s, zEnd - 0.016 * s) - pad],
    max: [gF[0] + 0.014 * s + pad, gF[1] + 0.008 * s + pad, zSym + T + 0.012 * s + pad],
  };
  const tp = (upper: boolean) => aabbFromPoints(teeth.filter((tt) => tt.upper === upper).map((tt) => tt.position), 0.028 * s);

  return {
    cranium,
    mandible,
    teethUpper,
    teethLower,
    bounds: { cranium: craniumBounds, mandible: mandibleBounds, teethUpper: tp(true), teethLower: tp(false) },
    anchors,
    teeth,
    condyleBase: [0, -0.0345 * s - 0.0055 * s, zFM - 0.012 * s],
    jawHinge: [0, gF[1], gF[2]],
    scale: s,
  };
}

/** Pull an approximate point onto the zero level set of `sdf` (few Newton steps). */
export function projectToSurface(sdf: SDF, p: V3, iters = 6): { p: V3; n: V3 } {
  let [x, y, z] = p;
  const e = 0.0005;
  let n: V3 = [0, 1, 0];
  for (let i = 0; i < iters; i++) {
    const d = sdf(x, y, z);
    const gx = sdf(x + e, y, z) - sdf(x - e, y, z);
    const gy = sdf(x, y + e, z) - sdf(x, y - e, z);
    const gz = sdf(x, y, z + e) - sdf(x, y, z - e);
    const l = Math.hypot(gx, gy, gz) || 1;
    n = [gx / l, gy / l, gz / l];
    x -= n[0] * d; y -= n[1] * d; z -= n[2] * d;
  }
  return { p: [x, y, z], n };
}

export const _internal = { halfArcade, sampleCurve, curveFromPoints };
