/**
 * Skeleton layout ("rig"): where every bone sits, computed deterministically from MorphParams.
 * Used by the main thread (to place meshes in a Three.js hierarchy) and by mesh workers (bones
 * whose shape depends on their neighbours, e.g. ribs, sternum, cartilage).
 *
 * World: ground at y = 0, body faces +Z, subject's left = +X. Bones are modelled for the LEFT
 * side; right-side bones reuse left geometry with a mirror flag.
 */
import {
  basis, catmullRom, lerp, m3apply, m3mul, resample, rotX, rotY, rotZ, vadd, vcross, vlen, vnorm, vscale, vsub,
  M3_IDENTITY, type M3, type V3,
} from './core';
import type { MorphParams } from '../morph/params';
import { boneIdsFor, type BoneId, type Side } from '../anatomy/bones';
import { skullAttachment } from './skullAttach';

export type GroupId =
  | 'root' | 'trunk' | 'head' | 'jaw'
  | `shoulder_${Side}` | `elbow_${Side}` | `wrist_${Side}` | `hip_${Side}` | `knee_${Side}` | `ankle_${Side}`;

export interface GroupDef {
  id: GroupId;
  parent: GroupId | null;
  pos: V3;
  rot: M3;
}

export interface Placement {
  group: GroupId;
  pos: V3;
  rot: M3;
  mirror: boolean;
}

export interface VertebraSpec {
  region: 'C' | 'T' | 'L';
  index: number;
  height: number;
  rx: number;
  rz: number;
}

export interface RibSpec {
  index: number;
  points: V3[];
  ra: number[];
  rb: number[];
  floating: boolean;
}

export interface SmallBoneSpec {
  length: number;
  baseR: number;
  headR: number;
  shaftR: number;
  curvature: number;
}

export interface Layout {
  stature: number;
  k: number;
  groups: GroupDef[];
  placements: Map<string, Placement>;
  vertebrae: Map<string, VertebraSpec>;
  ribs: Map<number, RibSpec>;
  /** Sternum outline in trunk frame. */
  sternum: { top: V3; bottom: V3; manubriumW: number; bodyW: number; thick: number; tilt: number };
  /** Costal cartilage polylines in trunk frame (left side; mirrored for right). */
  cartilage: V3[][];
  small: Map<string, SmallBoneSpec>;
  lengths: { humerus: number; radius: number; ulna: number; femurMech: number; tibia: number; fibula: number; clavicle: number };
  femurKneeX: number;
  footHeight: number;
  sacralSlope: number;
  boneIds: BoneId[];
  /**
   * Point (figure-root frame) the "Skull" camera framing aims at: a fixed offset below the skull, so
   * on-all-fours species (head low and forward) are framed like upright ones instead of empty space.
   */
  skullFocus: V3;
}

const D = Math.PI / 180;

/** Conjugate a rotation by the X mirror (S R S): mirrored skeleton side. */
export function mirrorRot(r: M3): M3 {
  return [r[0], -r[1], -r[2], -r[3], r[4], r[5], -r[6], r[7], r[8]];
}
export function mirrorPos(p: V3): V3 {
  return [-p[0], p[1], p[2]];
}
export function transpose(r: M3): M3 {
  return [r[0], r[3], r[6], r[1], r[4], r[7], r[2], r[5], r[8]];
}

const BARREL = [0.38, 0.58, 0.72, 0.82, 0.9, 0.96, 1.0, 1.0, 0.98, 0.94, 0.86, 0.76];
const FUNNEL = [0.34, 0.47, 0.57, 0.65, 0.72, 0.79, 0.85, 0.9, 0.95, 0.98, 1.0, 1.0];
const DEPTH = [0.45, 0.62, 0.74, 0.84, 0.92, 0.97, 1.0, 1.0, 0.98, 0.95, 0.85, 0.7];

function profileAt(arr: number[], t: number): number {
  const x = t * (arr.length - 1);
  const i = Math.min(arr.length - 2, Math.floor(x));
  return lerp(arr[i], arr[i + 1], x - i);
}

export function computeLayout(params: MorphParams): Layout {
  const b = params.body;
  const S = b.stature;
  const k = S / 1.74;
  const knuckle = b.posture === 'knuckle';
  const groups: GroupDef[] = [];
  const placements = new Map<string, Placement>();
  const put = (id: string, group: GroupId, pos: V3, rot: M3 = M3_IDENTITY, mirror = false) =>
    placements.set(id, { group, pos, rot, mirror });

  // ------------------------------------------------------------------ legs & pelvis heights
  const footHeight = 0.024 * S * Math.sqrt(b.footLength / (0.152 * S));
  const femurMech = b.femur - b.femoralHead - 0.008 * k;
  const tibiaLen = b.tibia;
  const hipHalf = b.hipJointWidth / 2;
  const kneeInset = femurMech * Math.tan(b.bicondylar * D) * 0.45;
  const kneeX = -kneeInset;
  const hipFlex = knuckle ? 28 : 0, kneeFlex = knuckle ? 34 : 0;
  const legDrop = (fl: number, kn: number) =>
    femurMech * Math.cos(fl * D) + tibiaLen * Math.cos((fl - kn) * D);
  const yHip = footHeight + legDrop(hipFlex, kneeFlex) + 0.004 * k;
  const pitch = knuckle ? 42 : 0;
  const rootRot = rotX(pitch * D);
  groups.push({ id: 'root', parent: null, pos: [0, yHip, 0], rot: rootRot });

  const sides: Side[] = ['L', 'R'];
  for (const side of sides) {
    const m = side === 'R';
    const hipRot = knuckle ? m3mul(rotX(-pitch * D), rotX(-hipFlex * D)) : M3_IDENTITY;
    groups.push({ id: `hip_${side}`, parent: 'root', pos: m ? [-hipHalf, 0, 0] : [hipHalf, 0, 0], rot: hipRot });
    const kneePos: V3 = [kneeX, -femurMech, 0];
    groups.push({ id: `knee_${side}`, parent: `hip_${side}`, pos: m ? mirrorPos(kneePos) : kneePos, rot: knuckle ? rotX(kneeFlex * D) : M3_IDENTITY });
    const toeOut = rotY((knuckle ? 14 : 6) * D);
    const ankleRot = knuckle ? m3mul(rotX(-(kneeFlex - hipFlex) * D), toeOut) : toeOut;
    groups.push({ id: `ankle_${side}`, parent: `knee_${side}`, pos: [0, -(tibiaLen + 0.004 * k), 0], rot: m ? mirrorRot(ankleRot) : ankleRot });
    put(`femur_${side}`, `hip_${side}`, [0, 0, 0], M3_IDENTITY, m);
    const pat: V3 = [kneeX + 0.002 * k, -femurMech + 0.024 * k, 0.03 * k * b.robusticity ** 0.3];
    put(`patella_${side}`, `hip_${side}`, m ? mirrorPos(pat) : pat, M3_IDENTITY, m);
    put(`tibia_${side}`, `knee_${side}`, [0, -0.003 * k, 0], M3_IDENTITY, m);
    const fib: V3 = [0.025 * k, -0.018 * k, -0.011 * k];
    put(`fibula_${side}`, `knee_${side}`, m ? mirrorPos(fib) : fib, M3_IDENTITY, m);
    put(`pelvis_${side}`, 'root', m ? [-hipHalf, 0, 0] : [hipHalf, 0, 0], M3_IDENTITY, m);
  }

  // ------------------------------------------------------------------ spine
  const formula = b.vertebrae;
  const ps = b.iliacHeight / 0.125;
  const sacralSlope = knuckle ? 10 : 8 + 26 * b.lordosis;
  const s1: V3 = [0, 0.52 * b.iliacHeight + 0.004 * k, -0.028 * k];
  const sacTilt = (knuckle ? 8 : 14 + 10 * b.lordosis) * D;
  put('sacrum', 'root', s1, rotX(sacTilt));
  const sacrumLen = 0.098 * k * Math.sqrt(ps);
  const sacTipLocal: V3 = [0, -sacrumLen, -0.22 * (-sacrumLen) - 2.6 * sacrumLen * sacrumLen / Math.max(0.6, ps)];
  const coccyxPos = vadd(s1, m3apply(rotX(sacTilt), vadd(sacTipLocal, [0, 0.002 * k, 0.006 * k])));
  put('coccyx', 'root', coccyxPos, rotX(-18 * D));

  type V = { id: BoneId; region: 'C' | 'T' | 'L'; index: number; seg: number; bodyFrac: number; rx: number };
  const verts: V[] = [];
  const lumbarLen = 0.104 * S * Math.pow(formula.lumbar / 5, 0.85);
  const thoracicLen = 0.16 * S * (formula.thoracic / 12);
  const cervicalLen = 0.072 * S;
  const rob = Math.sqrt(b.robusticity);
  for (let i = formula.lumbar; i >= 1; i--) {
    verts.push({ id: `vert_L${i}` as BoneId, region: 'L', index: i, seg: lumbarLen / formula.lumbar, bodyFrac: 0.76, rx: lerp(0.022, 0.0255, (formula.lumbar - i) / Math.max(1, formula.lumbar - 1)) * k * rob });
  }
  for (let i = formula.thoracic; i >= 1; i--) {
    verts.push({ id: `vert_T${i}` as BoneId, region: 'T', index: i, seg: thoracicLen / formula.thoracic, bodyFrac: 0.8, rx: lerp(0.0125, 0.021, (i - 1) / Math.max(1, formula.thoracic - 1)) * k * rob });
  }
  for (let i = 7; i >= 1; i--) {
    verts.push({ id: `vert_C${i}` as BoneId, region: 'C', index: i, seg: cervicalLen / 7, bodyFrac: 0.8, rx: lerp(0.0085, 0.0115, (i - 1) / 6) * k * rob });
  }
  // Sagittal curvature: angle from vertical, + leans the top forward (+Z).
  const th0 = sacralSlope;
  const thL1 = -14 * b.lordosis - (knuckle ? 4 : 0);
  const thT1 = thL1 + 30 * b.kyphosis;
  const thC1 = -4 * b.lordosis - (knuckle ? 8 : 0);
  const angleFor = (v: V): number => {
    if (v.region === 'L') return lerp(th0, thL1, (formula.lumbar - v.index + 0.5) / formula.lumbar);
    if (v.region === 'T') return lerp(thL1, thT1, (formula.thoracic - v.index + 0.5) / formula.thoracic);
    return lerp(thT1, thC1, (7 - v.index + 0.5) / 7);
  };
  const skullAtt = skullAttachment(params.skull);
  const headAbove = params.skull.vaultHeight + params.skull.sagittalCrest - skullAtt.condyleBase[1];
  let spineScale = 1;
  const runSpine = (scale: number) => {
    let p: V3 = [0, 0, 0];
    const out: { center: V3; rot: M3; height: number }[] = [];
    for (const v of verts) {
      const th = angleFor(v) * D;
      const dir: V3 = [0, Math.cos(th), Math.sin(th)];
      const fwd: V3 = [0, -Math.sin(th), Math.cos(th)];
      const seg = v.seg * scale;
      const h = seg * v.bodyFrac;
      const disc = seg - h;
      const center = vadd(p, vscale(dir, disc + h / 2));
      p = vadd(center, vscale(dir, h / 2));
      out.push({ center, rot: basis([1, 0, 0], dir, fwd), height: h });
    }
    return { list: out, top: p };
  };
  let spine = runSpine(1);
  if (!knuckle) {
    for (let it = 0; it < 3; it++) {
      const vertex = yHip + s1[1] + spine.top[1] + headAbove;
      spineScale *= Math.max(0.75, Math.min(1.35, 1 + (S - vertex) / Math.max(0.2, spine.top[1])));
      spine = runSpine(spineScale);
    }
  }
  // Balance: rotate the trunk about S1 so the head sits above the hip joints (bipeds).
  let trunkPitch = 0;
  if (!knuckle) {
    const c1 = spine.top;
    const target = 0.008 * k - s1[2];
    let lo = -0.6, hi = 0.6;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      const z = c1[1] * Math.sin(mid) + c1[2] * Math.cos(mid);
      if (z > target) hi = mid;
      else lo = mid;
    }
    trunkPitch = (lo + hi) / 2;
  }
  const trunkRot = rotX(trunkPitch);
  groups.push({ id: 'trunk', parent: 'root', pos: s1, rot: trunkRot });
  const vertebrae = new Map<string, VertebraSpec>();
  const vFrame = new Map<string, { center: V3; rot: M3 }>();
  spine.list.forEach((f, i) => {
    const v = verts[i];
    put(v.id, 'trunk', f.center, f.rot);
    vFrame.set(v.id, f);
    const rz = v.rx * (v.region === 'L' ? 0.7 : v.region === 'T' ? 0.82 : 0.68);
    vertebrae.set(v.id, { region: v.region, index: v.index, height: f.height, rx: v.rx, rz });
  });

  // ------------------------------------------------------------------ ribs, sternum, cartilage
  const ribs = new Map<number, RibSpec>();
  const ribEndsTrunk: V3[] = [];
  const nT = formula.thoracic;
  const fBlend = Math.max(0, Math.min(1, b.thoraxFunnel));
  for (let i = 1; i <= nT; i++) {
    const t = (i - 1) / (nT - 1);
    const W = (b.chestWidth / 2) * lerp(profileAt(BARREL, t), profileAt(FUNNEL, t), fBlend);
    const Dp = b.chestDepth * 0.84 * profileAt(DEPTH, t);
    const spec = vertebrae.get(`vert_T${i}`)!;
    const rxb = spec.rx, rzb = spec.rz;
    const drop = (0.034 + 0.068 * t) * k;
    const floating = i > nT - 2;
    let ctrl: V3[];
    if (i === 1) {
      ctrl = [
        [rxb + 0.002 * k, 0.003 * k, -rzb * 0.2],
        [rxb + 0.011 * k, 0.002 * k, -rzb - 0.005 * k],
        [W * 0.8, -0.008 * k, -rzb + Dp * 0.1],
        [W, -0.018 * k, -rzb + Dp * 0.45],
        [W * 0.62, -drop * 0.75, -rzb + Dp * 0.88],
      ];
    } else if (floating) {
      ctrl = [
        [rxb + 0.003 * k, 0.003 * k, -rzb * 0.15],
        [rxb + 0.016 * k, 0, -rzb - 0.012 * k],
        [W * 0.6, -drop * 0.18, -rzb - 0.018 * k],
        [W * 0.95, -drop * 0.5, -rzb + Dp * 0.18],
        [W * 0.98, -drop * 0.82, -rzb + Dp * 0.36],
      ];
    } else {
      const endW = i <= 7 ? lerp(0.32, 0.42, (i - 2) / 5) : lerp(0.55, 0.75, (i - 8) / 2);
      ctrl = [
        [rxb + 0.003 * k, 0.003 * k, -rzb * 0.15],
        [rxb + 0.016 * k, 0, -rzb - 0.012 * k],
        [W * 0.55, -drop * 0.15, -rzb - 0.018 * k - Dp * 0.04],
        [W * 0.92, -drop * 0.38, -rzb + Dp * 0.2],
        [W, -drop * 0.6, -rzb + Dp * 0.46],
        [W * 0.85, -drop * 0.82, -rzb + Dp * 0.72],
        [W * endW + 0.012 * k, -drop, -rzb + Dp * 0.88],
      ];
    }
    const pts = resample(catmullRom(ctrl, 5), i === 1 ? 10 : 14);
    const n = pts.length;
    const ra = pts.map((_, j) => {
      const u = j / (n - 1);
      if (i === 1) return 0.0026 * k;
      const base = (floating ? 0.0042 : 0.0056) * k;
      return base * (0.7 + 0.3 * Math.min(1, u * 4)) * (floating ? 1 - 0.5 * u : 1);
    });
    const rbv = pts.map((_, j) => (i === 1 ? 0.0072 * k * (0.7 + 0.3 * Math.sin((j / (n - 1)) * Math.PI)) : 0.0025 * k));
    ribs.set(i, { index: i, points: pts, ra, rb: rbv, floating });
    const f = vFrame.get(`vert_T${i}`)!;
    placements.set(`rib_L${i}`, { group: 'trunk', pos: f.center, rot: f.rot, mirror: false });
    placements.set(`rib_R${i}`, { group: 'trunk', pos: f.center, rot: f.rot, mirror: true });
    ribEndsTrunk.push(vadd(f.center, m3apply(f.rot, pts[n - 1])));
  }
  const e1 = ribEndsTrunk[0];
  const e7 = ribEndsTrunk[Math.min(6, ribEndsTrunk.length - 1)];
  const zStern = (ribEndsTrunk.slice(1, 7).reduce((a, p) => a + p[2], 0) / 6) + 0.02 * k;
  const top: V3 = [0, e1[1] + 0.006 * k, zStern - 0.01 * k];
  const bottom: V3 = [0, e7[1] - 0.026 * k, zStern + 0.008 * k];
  const sternum = { top, bottom, manubriumW: 0.026 * k, bodyW: 0.015 * k, thick: 0.0062 * k, tilt: Math.atan2(bottom[2] - top[2], top[1] - bottom[1]) };
  put('sternum', 'trunk', [0, 0, 0]);
  const cartilage: V3[][] = [];
  const sternalAt = (u: number): V3 => {
    const p = [lerp(top[1], bottom[1] + 0.03 * k, u), lerp(top[2], bottom[2], u)];
    return [u < 0.08 ? sternum.manubriumW * 0.8 : sternum.bodyW * 0.95, p[0], p[1]];
  };
  for (let i = 1; i <= Math.min(10, nT - 2); i++) {
    const end = ribEndsTrunk[i - 1];
    if (i <= 7) {
      const a = sternalAt((i - 1) / 6.3);
      const mid: V3 = [lerp(end[0], a[0], 0.55), lerp(end[1], a[1], 0.4), lerp(end[2], a[2], 0.6) + 0.005 * k];
      cartilage.push([end, mid, a]);
    } else {
      const a = sternalAt(1);
      const joinY = lerp(end[1], a[1], 0.7);
      cartilage.push([end, [lerp(end[0], a[0], 0.5), joinY - 0.01 * k, lerp(end[2], a[2], 0.6)], [a[0] + 0.012 * k * (i - 7), a[1] - 0.004 * k * (i - 7), a[2] - 0.004 * k]]);
    }
  }
  put('costal_cartilage', 'trunk', [0, 0, 0]);
  put('costal_cartilage_R', 'trunk', [0, 0, 0], M3_IDENTITY, true);

  // ------------------------------------------------------------------ shoulder girdle & arms
  const sc: V3 = [0.022 * k, top[1] + 0.004 * k, top[2] - 0.005 * k];
  const acX = b.shoulderWidth / 2 - 0.022 * k;
  const dx = Math.max(0.02, acX - sc[0]);
  const backZ = Math.max(0.052 * k, dx * 0.36);
  const upY = (0.016 + 0.0012 * b.glenoidTilt) * k;
  const Lc = Math.hypot(dx, upY, backZ);
  const ac: V3 = [sc[0] + dx, sc[1] + upY, sc[2] - backZ];
  const clX = vnorm(vsub(ac, sc));
  let clY = vsub([0, 1, 0], vscale(clX, clX[1]));
  clY = vnorm(clY);
  const clZ = vcross(clX, clY);
  const clRot = basis(clX, clY, clZ);
  put('clavicle_L', 'trunk', sc, clRot);
  put('clavicle_R', 'trunk', mirrorPos(sc), mirrorRot(clRot), true);
  const gl: V3 = vadd(ac, [-0.004 * k, -0.028 * k, -0.006 * k]);
  const scapRot = m3mul(rotY(-32 * D), rotZ(b.glenoidTilt * D));
  put('scapula_L', 'trunk', gl, scapRot);
  put('scapula_R', 'trunk', mirrorPos(gl), mirrorRot(scapRot), true);
  const headR = 0.021 * k * Math.pow(b.robusticity, 0.25);
  const shoulder: V3 = vadd(gl, [headR, -0.002 * k, 0]);
  const invTrunkWorld = transpose(m3mul(rootRot, trunkRot));
  const armHang = knuckle ? invTrunkWorld : m3mul(rotX(-trunkPitch), rotZ(4 * D));
  const Lh = b.humerus;
  const Lr = b.radius;
  const Lu = b.radius * 1.075;
  for (const side of sides) {
    const m = side === 'R';
    groups.push({ id: `shoulder_${side}`, parent: 'trunk', pos: m ? mirrorPos(shoulder) : shoulder, rot: m ? mirrorRot(armHang) : armHang });
    const elbow: V3 = [0.003 * k, -(Lh - headR - 0.006 * k), 0.003 * k];
    const carrying = rotZ((knuckle ? 2 : 9) * D);
    groups.push({ id: `elbow_${side}`, parent: `shoulder_${side}`, pos: m ? mirrorPos(elbow) : elbow, rot: m ? mirrorRot(carrying) : carrying });
    const wristPos: V3 = [0.005 * k, -(Lr + 0.002 * k), 0.004 * k];
    const wristRot = knuckle ? rotX(-18 * D) : M3_IDENTITY;
    groups.push({ id: `wrist_${side}`, parent: `elbow_${side}`, pos: m ? mirrorPos(wristPos) : wristPos, rot: m ? mirrorRot(wristRot) : wristRot });
    put(`humerus_${side}`, `shoulder_${side}`, [0, 0, 0], M3_IDENTITY, m);
    const rad: V3 = [0.013 * k, -0.002 * k, 0.003 * k];
    const uln: V3 = [-0.008 * k, 0.006 * k, -0.005 * k];
    put(`radius_${side}`, `elbow_${side}`, m ? mirrorPos(rad) : rad, M3_IDENTITY, m);
    put(`ulna_${side}`, `elbow_${side}`, m ? mirrorPos(uln) : uln, M3_IDENTITY, m);
  }

  // ------------------------------------------------------------------ hands
  const small = new Map<string, SmallBoneSpec>();
  const kh = b.handLength / 0.19;
  const curv = b.fingerCurvature;
  const flexMcp = knuckle ? 70 : 8, flexPip = knuckle ? 85 : 12, flexDip = knuckle ? 30 : 8;
  const mcBase: V3[] = [[0.019, -0.017, 0.009], [0.012, -0.027, 0.003], [0.002, -0.028, 0.002], [-0.008, -0.027, 0.001], [-0.017, -0.025, 0]];
  const mcLen = [0.046 * b.thumbLength, 0.068, 0.065, 0.059, 0.054];
  const proxLen = [0.032 * b.thumbLength, 0.04, 0.045, 0.042, 0.033];
  const midLen = [0, 0.024, 0.028, 0.026, 0.019];
  const distLen = [0.022 * b.thumbLength, 0.017, 0.019, 0.018, 0.016];
  const spread = [0, 4, 0, -4, -8];
  const handPlace = (side: Side) => {
    const m = side === 'R';
    const g: GroupId = `wrist_${side}`;
    const P = (id: string, pos: V3, rot: M3) => put(`${id}_${side}`.replace(/_(L|R)_(\d)$/, '_$1$2'), g, m ? mirrorPos(pos) : pos, m ? mirrorRot(rot) : rot, m);
    put(`carpals_${side}`, g, m ? mirrorPos([0, -0.012 * kh, 0.002 * kh]) : [0, -0.012 * kh, 0.002 * kh], M3_IDENTITY, m);
    for (let r = 1; r <= 5; r++) {
      const base = vscale(mcBase[r - 1], kh);
      let rot = r === 1 ? m3mul(rotY(-42 * D), m3mul(rotZ(38 * D), rotX(-25 * D))) : rotZ(spread[r - 1] * D);
      rot = m3mul(rot, rotX(-(knuckle ? 10 : 2) * D));
      const lens = [mcLen[r - 1], proxLen[r - 1], midLen[r - 1], distLen[r - 1]].map((l) => l * kh);
      const names = [`metacarpal`, `hand_phalanx_prox`, `hand_phalanx_mid`, `hand_phalanx_dist`];
      const flex = [0, r === 1 ? 10 : flexMcp, flexPip, flexDip];
      let pos = base;
      let cur = rot;
      for (let seg = 0; seg < 4; seg++) {
        if (seg === 2 && r === 1) continue;
        cur = m3mul(cur, rotX(-flex[seg] * D));
        const len = lens[seg];
        const id = `${names[seg]}_${side}${r}`;
        put(id, g, m ? mirrorPos(pos) : pos, m ? mirrorRot(cur) : cur, m);
        const baseR = (seg === 0 ? 0.0055 : seg === 1 ? 0.005 : 0.0042) * kh * (r === 1 ? 1.15 : 1) * Math.pow(b.robusticity, 0.3);
        small.set(id, { length: len, baseR, headR: baseR * (seg === 3 ? 0.55 : 0.85), shaftR: baseR * 0.62, curvature: seg === 0 ? 0 : curv * (seg === 3 ? 0.3 : 1) });
        pos = vadd(pos, m3apply(cur, [0, -len, 0]));
      }
    }
    void P;
  };
  handPlace('L');
  handPlace('R');

  // ------------------------------------------------------------------ feet
  const kf = b.footLength / 0.265;
  const toeScale = 1 + 0.02 * b.halluxAbduction;
  const archLift = lerp(0.0, 0.01, b.footArch) * kf;
  const footPlace = (side: Side) => {
    const m = side === 'R';
    const g: GroupId = `ankle_${side}`;
    for (const id of ['talus', 'calcaneus', 'tarsals']) put(`${id}_${side}`, g, [0, 0, 0], M3_IDENTITY, m);
    const mtBase: V3[] = [[-0.016, -0.03, 0.074], [-0.006, -0.028, 0.076], [0.003, -0.029, 0.072], [0.012, -0.031, 0.068], [0.02, -0.034, 0.062]];
    const mtLen = [0.062, 0.073, 0.069, 0.066, 0.064];
    const pp = [0.03, 0.026, 0.022, 0.02, 0.018].map((l) => l * toeScale);
    const mp = [0, 0.012, 0.011, 0.01, 0.008].map((l) => l * toeScale);
    const dp = [0.022, 0.01, 0.009, 0.009, 0.008].map((l) => l * Math.sqrt(toeScale));
    for (let r = 1; r <= 5; r++) {
      const base: V3 = [mtBase[r - 1][0] * kf, mtBase[r - 1][1] * kf + archLift, mtBase[r - 1][2] * kf];
      const headY = -footHeight + 0.012 * kf;
      const len0 = mtLen[r - 1] * kf;
      const declination = Math.asin(Math.max(-0.9, Math.min(0.9, (base[1] - headY) / len0)));
      const abd = r === 1 ? -b.halluxAbduction * D : (r - 3) * 2.5 * D;
      let cur = m3mul(rotY(abd), rotX(-(90 * D - declination)));
      const lens = [len0, pp[r - 1] * kf, mp[r - 1] * kf, dp[r - 1] * kf];
      const names = ['metatarsal', 'foot_phalanx_prox', 'foot_phalanx_mid', 'foot_phalanx_dist'];
      const flex = [0, -(90 * D - declination) / D * 0.85 + 4, 18, 8];
      let pos = base;
      for (let seg = 0; seg < 4; seg++) {
        if (seg === 2 && r === 1) continue;
        if (seg > 0) cur = m3mul(cur, rotX(-flex[seg] * D));
        const id = `${names[seg]}_${side}${r}`;
        put(id, g, m ? mirrorPos(pos) : pos, m ? mirrorRot(cur) : cur, m);
        const baseR = (seg === 0 ? (r === 1 ? 0.0085 : 0.0055) : seg === 1 ? (r === 1 ? 0.0075 : 0.0045) : r === 1 ? 0.0065 : 0.0036) * kf * Math.pow(b.robusticity, 0.3);
        small.set(id, { length: lens[seg], baseR, headR: baseR * 0.85, shaftR: baseR * 0.6, curvature: seg === 0 ? 0 : b.fingerCurvature * 0.6 });
        pos = vadd(pos, m3apply(cur, [0, -lens[seg], 0]));
      }
    }
  };
  footPlace('L');
  footPlace('R');

  // ------------------------------------------------------------------ head
  const c1Top = spine.top;
  const headRot = transpose(m3mul(rootRot, trunkRot));
  groups.push({ id: 'head', parent: 'trunk', pos: c1Top, rot: headRot });
  const cb = skullAtt.condyleBase;
  const neg: V3 = [-cb[0], -cb[1], -cb[2]];
  put('cranium', 'head', neg);
  put('teeth_upper', 'head', neg);
  const hinge = skullAtt.jawHinge;
  groups.push({ id: 'jaw', parent: 'head', pos: vsub(hinge, cb), rot: M3_IDENTITY });
  const negH: V3 = [-hinge[0], -hinge[1], -hinge[2]];
  put('mandible', 'jaw', negH);
  put('teeth_lower', 'jaw', negH);
  const c3 = vFrame.get('vert_C3');
  if (c3) put('hyoid', 'trunk', vadd(c3.center, m3apply(c3.rot, [0, 0.004 * k, 0.034 * k])), c3.rot);

  void vlen;
  const layout: Layout = {
    stature: S,
    k,
    groups,
    placements,
    vertebrae,
    ribs,
    sternum,
    cartilage,
    small,
    lengths: { humerus: Lh, radius: Lr, ulna: Lu, femurMech, tibia: tibiaLen, fibula: tibiaLen * 0.98, clavicle: Lc },
    femurKneeX: kneeX,
    footHeight,
    sacralSlope,
    boneIds: boneIdsFor(formula),
    skullFocus: [0, 0, 0],
  };
  // Aim 7 cm (skull-scaled) below the ear canals, slightly forward: the composition upright species already
  // had, but anchored to the skull so the knuckle-walking chimp (head ~0.4 m forward/low) is framed too.
  const head = groupWorld(layout, 'head');
  layout.skullFocus = vadd(head.pos, m3apply(head.rot, vadd(neg, [0, -0.07 * skullAtt.s, 0.014 * skullAtt.s])));
  return layout;
}

/** World transform of a group (composed up the hierarchy) — handy for tests and hotspot math. */
export function groupWorld(layout: Layout, id: GroupId): { pos: V3; rot: M3 } {
  const g = layout.groups.find((x) => x.id === id);
  if (!g) return { pos: [0, 0, 0], rot: M3_IDENTITY };
  if (!g.parent) return { pos: g.pos, rot: g.rot };
  const parent = groupWorld(layout, g.parent);
  return { pos: vadd(parent.pos, m3apply(parent.rot, g.pos)), rot: m3mul(parent.rot, g.rot) };
}
