/**
 * Skull anatomy & framing contracts: the "Skull" camera aims at each species' real skull (including the
 * knuckle-walking chimpanzee), and the lower jaw keeps anatomical proportions instead of a box shape.
 */
import { describe, expect, it } from 'vitest';
import { SPECIES_IDS } from '../src/data/types';
import { getModel } from '../src/sdf/build';
import { m3apply, vadd, type V3 } from '../src/sdf/core';
import { groupWorld } from '../src/sdf/layout';
import { buildSkull } from '../src/sdf/skull';

function craniumCentreWorld(id: (typeof SPECIES_IDS)[number]): V3 {
  const { params, layout } = getModel({ speciesId: id });
  const { min, max } = buildSkull(params.skull).bounds.cranium;
  const head = groupWorld(layout, 'head');
  const local = vadd(layout.placements.get('cranium')!.pos, [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2]);
  return vadd(head.pos, m3apply(head.rot, local));
}

describe('Skull framing focus', () => {
  it('sits just below the actual skull of every species, including the knuckle-walking chimpanzee', () => {
    for (const id of SPECIES_IDS) {
      const focus = getModel({ speciesId: id }).layout.skullFocus;
      const skull = craniumCentreWorld(id);
      const miss = Math.hypot(focus[1] - skull[1], focus[2] - skull[2]);
      expect({ id, near: miss < 0.12, below: focus[1] < skull[1] }).toEqual({ id, near: true, below: true });
    }
  });
});

/** Outward bone normal where a ray from 45° front-left (toward the cheek anchor) first hits the cranium. */
function cheekNormal(id: (typeof SPECIES_IDS)[number]): V3 {
  const sk = buildSkull(getModel({ speciesId: id }).params.skull);
  const f = sk.cranium, aim = sk.anchors['zygomatic-L'], d: V3 = [Math.SQRT1_2, 0, Math.SQRT1_2];
  let t = 0.07;
  for (let k = 0; k < 600 && t > -0.02; k++) {
    const q = vadd(aim, [d[0] * t, d[1] * t, d[2] * t]), dist = f(q[0], q[1], q[2]);
    if (dist < 0.00005) break;
    t -= Math.max(0.0001, 0.5 * dist);
  }
  const [x, y, z] = vadd(aim, [d[0] * t, d[1] * t, d[2] * t]), e = 0.0004;
  const n: V3 = [f(x + e, y, z) - f(x - e, y, z), f(x, y + e, z) - f(x, y - e, z), f(x, y, z + e) - f(x, y, z - e)];
  const l = Math.hypot(...n);
  return [n[0] / l, n[1] / l, n[2] / l];
}

describe('Cheekbones (zygomatics)', () => {
  it('dished-face species (Paranthropus) have forward-facing cheekbones, not sideways "ear-muff" discs', () => {
    const wrong = SPECIES_IDS.filter((id) => getModel({ speciesId: id }).params.skull.dishedFace >= 0.5).map((id) => {
      const n = cheekNormal(id);
      return { id, forward: +n[2].toFixed(2), sideways: +n[0].toFixed(2) };
    }).filter((r) => !(r.forward > r.sideways));
    expect(wrong).toEqual([]);
  });
});

/** Landmarks found by sampling the mandible SDF (skull frame: +Y up, +Z forward, occlusal plane horizontal). */
const landmarkCache = new Map<string, ReturnType<typeof measureJaw>>();
const jawLandmarks = (id: (typeof SPECIES_IDS)[number]) => {
  if (!landmarkCache.has(id)) landmarkCache.set(id, measureJaw(id));
  return landmarkCache.get(id)!;
};

function measureJaw(id: (typeof SPECIES_IDS)[number]) {
  const p = getModel({ speciesId: id }).params.skull;
  const sk = buildSkull(p);
  const f = sk.mandible, { min, max } = sk.bounds.mandible, hinge = sk.jawHinge, mm = 0.001;
  const range = (a: number, b: number, step: number) => Array.from({ length: Math.floor((b - a) / step) + 1 }, (_, i) => a + i * step);
  /** First bone hit marching +Y (lowest point of a column) or +Z (rearmost point of a row); sphere-traced. */
  const lowestY = (x: number, z: number) => { for (let y = min[1]; y < max[1];) { const d = f(x, y, z); if (d < 0) return y; y += Math.max(0.25 * mm, 0.9 * d); } return null; };
  const rearmostZ = (x: number, y: number) => { for (let z = hinge[2] - 30 * mm; z < hinge[2] + 30 * mm;) { const d = f(x, y, z); if (d < 0) return z; z += Math.max(0.25 * mm, 0.9 * d); } return Infinity; };
  const xR = Math.abs(sk.anchors['mandible-ramus-L'][0]);
  const xs = range(xR - 14 * mm, xR + 6 * mm, 2 * mm);
  let menton: V3 = [0, Infinity, 0];
  for (const z of range(max[2] - 45 * mm, max[2], mm)) { const y = lowestY(0, z); if (y !== null && y < menton[1]) menton = [0, y, z]; }
  // Gonion = the jaw-angle corner: most posterior-inferior point of the lower outline (minimises y + z).
  let gonion: V3 = [0, Infinity, Infinity];
  for (const x of xs) for (const z of range(hinge[2] - 20 * mm, hinge[2] + 30 * mm, mm)) {
    const y = lowestY(x, z);
    if (y !== null && y + z < gonion[1] + gonion[2]) gonion = [x, y, z];
  }
  let condylion = -Infinity;
  for (const x of range(xR - 12 * mm, xR + 12 * mm, 2 * mm)) for (const z of range(hinge[2] - 8 * mm, hinge[2] + 8 * mm, 2 * mm))
    for (let y = max[1]; y > hinge[1] - 15 * mm; y -= 0.5 * mm) if (f(x, y, z) < 0) { condylion = Math.max(condylion, y); break; }
  // Posterior border of the ramus: rearmost bone at 30% and 65% of the way from the angle up to the condyle.
  const rear = (y: number) => Math.min(...xs.map((x) => rearmostZ(x, y)));
  const yA = gonion[1] + 0.3 * (condylion - gonion[1]), yB = gonion[1] + 0.65 * (condylion - gonion[1]);
  const ramusUp: [number, number] = [rear(yB) - rear(yA), yB - yA];
  return { p, menton, gonion, condylion, ramusUp };
}

describe('Lower jaw (mandible) anatomy', () => {
  it('lower border rises toward the jaw angle (mandibular plane 10-32° to the bite), not a flat box bottom', () => {
    const outOfRange = SPECIES_IDS.map((id) => {
      const { menton, gonion } = jawLandmarks(id);
      return { id, angleDeg: Math.round((Math.atan2(gonion[1] - menton[1], menton[2] - gonion[2]) * 180) / Math.PI) };
    }).filter((r) => r.angleDeg < 10 || r.angleDeg > 32);
    expect(outOfRange).toEqual([]);
  });

  it('jaw angle sits well above the bottom of the jaw (40-80% of the body height), not at the corner of a box', () => {
    // Measured against the jaw's own lowest point, so tall-faced species (whose hinge is naturally far above the
    // tooth row) are judged on jaw shape only.
    const outOfRange = SPECIES_IDS.map((id) => {
      const { p, menton, gonion } = jawLandmarks(id);
      return { id, raised: +((gonion[1] - menton[1]) / p.mandibleHeight).toFixed(2) };
    }).filter((r) => r.raised < 0.4 || r.raised > 0.8);
    expect(outOfRange).toEqual([]);
  });

  it('jaw angle (gonial angle) is obtuse, 105-135° (humans ~120°), not a 90° box corner', () => {
    const outOfRange = SPECIES_IDS.map((id) => {
      const { menton, gonion, ramusUp } = jawLandmarks(id);
      const fwd = [menton[2] - gonion[2], menton[1] - gonion[1]];
      const cos = (fwd[0] * ramusUp[0] + fwd[1] * ramusUp[1]) / (Math.hypot(fwd[0], fwd[1]) * Math.hypot(ramusUp[0], ramusUp[1]));
      return { id, gonialDeg: Math.round((Math.acos(cos) * 180) / Math.PI) };
    }).filter((r) => !(r.gonialDeg >= 105 && r.gonialDeg <= 135));
    expect(outOfRange).toEqual([]);
  });
});

