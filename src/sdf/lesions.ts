/**
 * Paleopathology sculpting: turns data-layer lesions into geometry changes on a bone SDF, plus
 * per-vertex tags so the material can highlight / texture the affected area.
 *
 * Tag layout (Uint16): bits 0-7 weight (0..255), bits 8-12 lesion slot (1..31),
 * bit 13 fresh (postmortem) break surface, bit 14 polished (eburnation), bit 15 porous (woven bone).
 */
import {
  capsule, clamp, ellipsoid, frameY, m3apply, smax, smin, smoothstep, sphere, torus, vadd, vcross, vdot, vlen,
  vnorm, vscale, vsub, rotXYZ, type M3, type SDF, type V3,
} from './core';
import { makeNoise, seedFrom } from './noise';
import { projectToSurface } from './skull';
import type { Healing, Lesion, LesionKind } from '../data/types';
import type { BoneBuild } from './postcrania';

export interface LesionMarker {
  id: string;
  slot: number;
  kind: LesionKind;
  center: V3;
  normal: V3;
  radius: number;
}

export interface LesionResult {
  sdf: SDF;
  markers: LesionMarker[];
  tag: ((x: number, y: number, z: number) => number) | null;
}

export const TAG_FRESH = 1 << 13;
export const TAG_POLISH = 1 << 14;
export const TAG_POROUS = 1 << 15;

const FINAL_STAGE: Record<Healing, number> = { none: 0, early: 0.4, advanced: 0.7, remodeled: 1 };

/** Healing progress shown on screen: 0 = moment of injury, 1 = as the fossil was found. */
export function healingStage(lesion: Lesion, healingT: number): number {
  const final = lesion.healing ? FINAL_STAGE[lesion.healing] : lesion.timing === 'antemortem' ? 1 : 0;
  return final * clamp(healingT, 0, 1);
}

interface Site {
  center: V3;
  normal: V3;
  /** Shaft info when the lesion sits on a long bone. */
  axisP?: V3;
  tangent?: V3;
  r?: number;
  dir?: V3;
}

function resolveSite(base: SDF, build: BoneBuild, lesion: Lesion): Site {
  const site = lesion.site;
  if (site.anchor && build.anchors && build.anchors[site.anchor]) {
    const pr = projectToSurface(base, build.anchors[site.anchor]);
    return { center: pr.p, normal: pr.n };
  }
  if (build.axis && site.t !== undefined) {
    const t = clamp(site.t, 0, 1);
    const a = build.axis(t);
    const b = build.axis(Math.min(1, t + 0.02));
    const c = build.axis(Math.max(0, t - 0.02));
    let tan = vsub(b.p, c.p);
    if (vlen(tan) < 1e-9) tan = [0, -1, 0];
    tan = vnorm(tan);
    const ref: V3 = Math.abs(tan[2]) > 0.9 ? [0, 1, 0] : [0, 0, 1];
    const n0 = vnorm(vsub(ref, vscale(tan, vdot(ref, tan))));
    const lat = vnorm(vcross(n0, tan));
    const az = ((site.azimuthDeg ?? 0) * Math.PI) / 180;
    const dir = vnorm(vadd(vscale(n0, Math.cos(az)), vscale(lat, Math.sin(az))));
    const pr = projectToSurface(base, vadd(a.p, vscale(dir, a.r)));
    return { center: pr.p, normal: pr.n, axisP: a.p, tangent: tan, r: a.r, dir };
  }
  const bb = build.bounds;
  const mid: V3 = [(bb.min[0] + bb.max[0]) / 2, bb.max[1] - (bb.max[1] - bb.min[1]) * 0.35, bb.max[2]];
  const pr = projectToSurface(base, mid, 10);
  return { center: pr.p, normal: pr.n };
}

/** Rotation by `deg` about unit axis `u` (Rodrigues), world-from-local. */
function axisAngle(u: V3, deg: number): M3 {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), t = 1 - c;
  const [x, y, z] = u;
  return [t * x * x + c, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, t * y * y + c, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, t * z * z + c];
}

function perpendicular(n: V3): V3 {
  const ref: V3 = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  return vnorm(vcross(n, ref));
}

export function applyLesions(base: SDF, build: BoneBuild, lesions: readonly Lesion[], healingT: number): LesionResult {
  if (lesions.length === 0) return { sdf: base, markers: [], tag: null };
  let sdf = base;
  const markers: LesionMarker[] = [];
  const freshPlanes: Array<(x: number, y: number, z: number) => number> = [];
  lesions.slice(0, 31).forEach((lesion, idx) => {
    const slot = idx + 1;
    const noise = makeNoise(seedFrom(lesion.id));
    const site = resolveSite(base, build, lesion);
    const sev = clamp(lesion.render?.severity ?? 0.5, 0, 1);
    const e = healingStage(lesion, healingT);
    const R = (lesion.render?.radiusMm ?? 0) / 1000 || (site.r ? site.r * 2.2 : 0.01 * (0.6 + sev));
    const C = site.center, n = site.normal;
    const kind = lesion.kind;
    const prev = sdf;
    const isFracture = kind === 'healed-fracture' || kind === 'unhealed-fracture' || kind === 'postmortem-break';

    if (isFracture && site.axisP && site.tangent && site.r !== undefined && site.dir) {
      const P = site.axisP, T = site.tangent, r = site.r, dir = site.dir;
      const pattern = lesion.render?.pattern ?? (kind === 'healed-fracture' ? 'oblique' : kind === 'postmortem-break' ? 'transverse' : 'spiral');
      const tilt = pattern === 'transverse' ? 4 : pattern === 'oblique' ? 35 : pattern === 'spiral' ? 45 : 25;
      const nPlane = vnorm(m3apply(axisAngle(vnorm(vcross(T, dir)), tilt), T));
      const jagAmp = kind === 'healed-fracture' ? 0.0005 : 0.0011;
      const plane = (x: number, y: number, z: number) =>
        (x - P[0]) * nPlane[0] + (y - P[1]) * nPlane[1] + (z - P[2]) * nPlane[2] + jagAmp * noise(x * 900, y * 900, z * 900);
      const unhealed = kind !== 'healed-fracture' || e < 0.08;
      const ang = (lesion.render?.angulationDeg ?? (kind === 'postmortem-break' ? 1 : 7 * sev + 2));
      const dispMm = lesion.render?.displacementMm ?? (kind === 'postmortem-break' ? 0.8 : 2.5 * sev + 0.5);
      const rot = axisAngle(vnorm(vcross(T, dir)), ang);
      const rotT: M3 = [rot[0], rot[3], rot[6], rot[1], rot[4], rot[7], rot[2], rot[5], rot[8]];
      const disp = vadd(vscale(dir, dispMm / 1000), vscale(T, -dispMm / 2500));
      const gap = unhealed ? 0.0011 : 0.0014 * (1 - smoothstep(0.15, 0.6, e));
      const callusAmt = kind === 'healed-fracture' ? smoothstep(0.08, 0.45, e) * (1 - 0.6 * smoothstep(0.65, 1, e)) : 0;
      const frame = frameY(T, dir);
      const callus = ellipsoid(P, [r * (1 + 0.6 * callusAmt * (0.6 + sev)), r * 2 + r * 1.4 * callusAmt, r * (1 + 0.6 * callusAmt * (0.6 + sev))], frame);
      const fx: SDF = (x, y, z) => {
        const prox = Math.max(prev(x, y, z), plane(x, y, z) + gap / 2);
        const qx = x - P[0] - disp[0], qy = y - P[1] - disp[1], qz = z - P[2] - disp[2];
        const lx = P[0] + rotT[0] * qx + rotT[1] * qy + rotT[2] * qz;
        const ly = P[1] + rotT[3] * qx + rotT[4] * qy + rotT[5] * qz;
        const lz = P[2] + rotT[6] * qx + rotT[7] * qy + rotT[8] * qz;
        const dist = Math.max(prev(lx, ly, lz), -plane(lx, ly, lz) + gap / 2);
        let d = Math.min(prox, dist);
        if (callusAmt > 0.02) {
          const woven = 0.0007 * (1 - e) * noise(x * 600, y * 600, z * 600);
          let c = callus(x, y, z) + woven;
          if (gap > 0.0002) c = Math.max(c, -(Math.abs(plane(x, y, z)) - gap * 0.35));
          d = smin(d, c, r * 0.55);
        }
        return d;
      };
      sdf = fx;
      if (kind === 'postmortem-break') freshPlanes.push((x, y, z) => Math.abs(plane(x, y, z)));
    } else if (kind === 'depressed-fracture' || isFracture) {
      const depth = R * 0.24 * (0.5 + sev);
      const Rs = R * 1.35;
      const dent = sphere(vadd(C, vscale(n, Rs - depth)), Rs);
      const k = R * (0.2 + 0.5 * e);
      const t1 = perpendicular(n), t2 = vcross(n, t1);
      const crackW = 0.00055 * (1 - smoothstep(0.3, 0.7, e));
      const cracks: Array<[V3, number]> = [0, 1, 2, 3, 4].map((i) => {
        const a = i * 1.257 + noise(i, 0.3, 0.7) * 0.6;
        return [vnorm(vadd(vscale(t1, Math.cos(a)), vscale(t2, Math.sin(a)))), R * (1.6 + 0.8 * Math.abs(noise(i, 1.1, 0.2)))];
      });
      sdf = (x, y, z) => {
        let d = smax(prev(x, y, z), -dent(x, y, z), k);
        if (crackW > 0.00005) {
          const px = x - C[0], py = y - C[1], pz = z - C[2];
          const dist = Math.sqrt(px * px + py * py + pz * pz);
          for (const [m, len] of cracks) {
            const lateral = Math.abs(px * m[1] * n[2] - px * m[2] * n[1] + py * (m[2] * n[0] - m[0] * n[2]) + pz * (m[0] * n[1] - m[1] * n[0]));
            const along = px * m[0] + py * m[1] + pz * m[2];
            if (along < 0) continue;
            const crack = Math.max(lateral - crackW, dist - len);
            d = Math.max(d, -crack);
          }
        }
        return d;
      };
    } else if (kind === 'puncture') {
      const count = Math.max(1, Math.min(6, lesion.render?.count ?? 2));
      const spacing = (lesion.render?.spacingMm ?? 30) / 1000;
      const rr = Math.max(0.0012, (lesion.render?.radiusMm ?? 2.5) / 1000);
      const t1 = perpendicular(n);
      const holes: SDF[] = [];
      for (let i = 0; i < count; i++) {
        const off = count === 1 ? 0 : (i / (count - 1) - 0.5) * spacing;
        const ci = vadd(C, vscale(t1, off));
        holes.push(capsule(vadd(ci, vscale(n, 0.006)), vadd(ci, vscale(n, -0.012)), rr));
      }
      sdf = (x, y, z) => { let d = prev(x, y, z); for (const h of holes) d = smax(d, -h(x, y, z), 0.0004); return d; };
    } else if (kind === 'bite-marks' || kind === 'cut-marks') {
      const count = Math.max(1, Math.min(12, lesion.render?.count ?? (kind === 'bite-marks' ? 6 : 4)));
      const t1 = perpendicular(n), t2 = vcross(n, t1);
      const grooves: SDF[] = [];
      for (let i = 0; i < count; i++) {
        const u = noise(i * 1.7, 0.5, 0.1) * R * 0.8, v = noise(0.3, i * 1.3, 0.9) * R * 0.8;
        const c0 = vadd(C, vadd(vscale(t1, u), vscale(t2, kind === 'cut-marks' ? (i - count / 2) * 0.0018 : v)));
        const dirv = kind === 'cut-marks' ? t1 : vnorm(vadd(vscale(t1, Math.cos(i)), vscale(t2, Math.sin(i))));
        const half = kind === 'cut-marks' ? 0.005 : 0.0018 + 0.0015 * Math.abs(noise(i, 2.2, 1.4));
        const rad = kind === 'cut-marks' ? 0.00045 : 0.0009;
        const sink = vscale(n, -rad * 0.35);
        grooves.push(capsule(vadd(vadd(c0, vscale(dirv, -half)), sink), vadd(vadd(c0, vscale(dirv, half)), sink), rad));
      }
      sdf = (x, y, z) => { let d = prev(x, y, z); for (const g of grooves) d = Math.max(d, -g(x, y, z)); return d; };
    } else if (kind === 'projectile-wound') {
      const t1 = perpendicular(n);
      const slit = capsule(vadd(C, vscale(t1, -0.005)), vadd(C, vscale(t1, 0.005)), 0.0011);
      const k = 0.0004 + 0.0012 * e;
      const lip = sphere(C, 0.004 + 0.002 * e);
      sdf = (x, y, z) => {
        let d = smax(prev(x, y, z), -slit(x, y, z), k);
        if (e > 0.35) d = smin(d, lip(x, y, z) + 0.0025, 0.002);
        return d;
      };
    } else if (kind === 'osteoarthritis') {
      const ringR = Math.max(0.006, R * 0.55);
      const ring = torus(vadd(C, vscale(n, -0.002)), ringR, 0.0011 + 0.0012 * sev, frameY(n));
      sdf = (x, y, z) => {
        const bump = ring(x, y, z) - 0.0007 * noise(x * 800, y * 800, z * 800);
        return smin(prev(x, y, z), bump, 0.0015);
      };
    } else if (kind === 'infection' || (kind === 'tumor' && sev < 0.6 && false)) {
      const amp = 0.0006 + 0.0012 * sev;
      const whole = sev >= 0.9;
      sdf = (x, y, z) => {
        const dc = Math.sqrt((x - C[0]) ** 2 + (y - C[1]) ** 2 + (z - C[2]) ** 2);
        const w = whole ? 1 : 1 - smoothstep(R * 0.5, R, dc);
        if (w <= 0) return prev(x, y, z);
        const nz = 0.5 + 0.5 * noise(x * 700, y * 700, z * 700);
        return prev(x, y, z) - amp * nz * w;
      };
    } else if (kind === 'tumor') {
      if (sev < 0.45) {
        const nid = sphere(vadd(C, vscale(n, 0.0005)), 0.0028 + 0.002 * sev);
        const pit = sphere(vadd(C, vscale(n, 0.0022)), 0.0013);
        sdf = (x, y, z) => smax(smin(prev(x, y, z), nid(x, y, z), 0.0015), -pit(x, y, z), 0.0004);
      } else if (site.axisP && site.tangent && site.r !== undefined && lesion.render?.pattern === undefined && sev < 0.75) {
        const fus = ellipsoid(site.axisP, [site.r * 1.45, site.r * 3.2, site.r * 1.45], frameY(site.tangent));
        sdf = (x, y, z) => smin(prev(x, y, z), fus(x, y, z), site.r! * 0.6);
      } else {
        const mass = ellipsoid(vadd(C, vscale(n, R * 0.15)), [R * 0.6, R * 0.6, R * 0.6]);
        sdf = (x, y, z) => smin(prev(x, y, z), mass(x, y, z) - 0.0016 * Math.max(0, noise(x * 1100, y * 1100, z * 1100)), 0.003);
      }
    } else if (kind === 'exostosis') {
      const T = site.tangent ?? perpendicular(n);
      const spur = ellipsoid(vadd(C, vscale(n, R * 0.18)), [R * 0.42, R * 1.3, R * 0.42], frameY(T, n));
      sdf = (x, y, z) => smin(prev(x, y, z), spur(x, y, z) - 0.0008 * noise(x * 500, y * 500, z * 500), R * 0.3);
    } else if (kind === 'atrophy') {
      // Handled at build time (shaft radius scale); nothing to sculpt here.
    } else if (kind === 'amputation' && site.axisP && site.tangent && site.r !== undefined) {
      const P = site.axisP, T = site.tangent, r = site.r;
      const cut = (x: number, y: number, z: number) => (x - P[0]) * T[0] + (y - P[1]) * T[1] + (z - P[2]) * T[2];
      sdf = (x, y, z) => smax(prev(x, y, z), cut(x, y, z), r * 0.7);
    } else if (kind === 'spinal-pathology') {
      const pit = sphere(vadd(C, vscale(n, 0.0012)), 0.0025 + 0.002 * sev);
      const lip = torus(vadd(C, vscale(n, -0.003)), Math.max(0.008, R * 0.6), 0.0009 + 0.0009 * sev, frameY(n));
      const wedge = lesion.render?.pattern === 'compression';
      sdf = (x, y, z) => {
        let d = smax(prev(x, y, z), -pit(x, y, z), 0.0006);
        d = smin(d, lip(x, y, z), 0.0012);
        if (wedge) d = smax(d, (y - C[1]) * 0.7 + (z - C[2]) * 0.7 - 0.002 * (1 - sev), 0.002);
        return d;
      };
    } else if (kind === 'developmental') {
      const flat = sphere(vadd(C, vscale(n, 0.06 - 0.003 * (0.5 + sev))), 0.06);
      sdf = (x, y, z) => smax(prev(x, y, z), -flat(x, y, z), 0.012);
    } else if (kind === 'deformation') {
      const sh = 0.07 * sev;
      const rot = rotXYZ(0, 0, 0);
      void rot;
      sdf = (x, y, z) => prev(x - sh * (y - C[1]), y, z + sh * 0.6 * (x - C[0]));
    } else if (kind === 'dental-disease' || kind === 'tooth-loss') {
      if (lesion.bone === 'cranium' || lesion.bone === 'mandible') {
        const hole = sphere(vadd(C, vscale(n, -0.001)), 0.0022 + 0.0015 * sev);
        sdf = (x, y, z) => smax(prev(x, y, z), -hole(x, y, z), 0.0005);
      }
    }
    markers.push({ id: lesion.id, slot, kind, center: C, normal: n, radius: Math.max(R, 0.006) });
  });

  const tag = (x: number, y: number, z: number): number => {
    let best = 0, bestSlot = 0, flags = 0;
    for (const m of markers) {
      const d = Math.sqrt((x - m.center[0]) ** 2 + (y - m.center[1]) ** 2 + (z - m.center[2]) ** 2);
      const w = 1 - smoothstep(m.radius * 0.45, m.radius * 1.1, d);
      if (w > best) { best = w; bestSlot = m.slot; }
      if (w > 0.25) {
        if (m.kind === 'osteoarthritis' && w > 0.55) flags |= TAG_POLISH;
        if (m.kind === 'infection' || m.kind === 'tumor' || (m.kind === 'healed-fracture')) flags |= TAG_POROUS;
      }
    }
    for (const f of freshPlanes) if (f(x, y, z) < 0.0016) flags |= TAG_FRESH;
    return flags | (bestSlot << 8) | Math.round(best * 255);
  };
  return { sdf, markers, tag };
}
