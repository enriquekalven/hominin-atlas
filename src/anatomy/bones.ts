/**
 * Canonical skeleton vocabulary shared by the data layer, the UI and the 3D engine.
 *
 * Coordinate conventions (used by the 3D engine, documented here for data authors):
 * - The body faces +Z, Y is up, the subject's LEFT side is +X and RIGHT side is -X.
 * - Bone ids ending in `_L` / `_R` refer to the subject's anatomical left / right.
 */

export type Side = 'L' | 'R';
export type BoneRegion =
  | 'skull'
  | 'spine'
  | 'thorax'
  | 'shoulder'
  | 'arm'
  | 'hand'
  | 'pelvis'
  | 'leg'
  | 'foot';

type C = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type T = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
type Lu = 1 | 2 | 3 | 4 | 5 | 6;
type RibN = T;
type Ray = 1 | 2 | 3 | 4 | 5;
type MidRay = 2 | 3 | 4 | 5;

export type BoneId =
  | 'cranium'
  | 'mandible'
  | 'teeth_upper'
  | 'teeth_lower'
  | 'hyoid'
  | `vert_C${C}`
  | `vert_T${T}`
  | `vert_L${Lu}`
  | 'sacrum'
  | 'coccyx'
  | `rib_${Side}${RibN}`
  | 'sternum'
  | `clavicle_${Side}`
  | `scapula_${Side}`
  | `humerus_${Side}`
  | `radius_${Side}`
  | `ulna_${Side}`
  | `carpals_${Side}`
  | `metacarpal_${Side}${Ray}`
  | `hand_phalanx_prox_${Side}${Ray}`
  | `hand_phalanx_mid_${Side}${MidRay}`
  | `hand_phalanx_dist_${Side}${Ray}`
  | `pelvis_${Side}`
  | `femur_${Side}`
  | `patella_${Side}`
  | `tibia_${Side}`
  | `fibula_${Side}`
  | `talus_${Side}`
  | `calcaneus_${Side}`
  | `tarsals_${Side}`
  | `metatarsal_${Side}${Ray}`
  | `foot_phalanx_prox_${Side}${Ray}`
  | `foot_phalanx_mid_${Side}${MidRay}`
  | `foot_phalanx_dist_${Side}${Ray}`;

/** Group tokens usable in specimen completeness lists, in addition to individual BoneIds. */
export type BoneGroup =
  | 'all'
  | 'skull'
  | 'teeth'
  | 'spine'
  | 'cervical'
  | 'thoracic'
  | 'lumbar'
  | 'ribs'
  | 'ribs_L'
  | 'ribs_R'
  | 'shoulder_L'
  | 'shoulder_R'
  | 'arm_L'
  | 'arm_R'
  | 'hand_L'
  | 'hand_R'
  | 'pelvis'
  | 'leg_L'
  | 'leg_R'
  | 'foot_L'
  | 'foot_R';

export type BoneRef = BoneId | BoneGroup;

export interface VertebralFormula {
  cervical: 7;
  thoracic: 12 | 13;
  lumbar: 3 | 4 | 5 | 6;
}

export const HUMAN_FORMULA: VertebralFormula = { cervical: 7, thoracic: 12, lumbar: 5 };

const SIDES: Side[] = ['L', 'R'];

/** Every bone id for a given vertebral formula, in a stable, anatomically ordered list. */
export function boneIdsFor(formula: VertebralFormula = HUMAN_FORMULA): BoneId[] {
  const ids: BoneId[] = ['cranium', 'mandible', 'teeth_upper', 'teeth_lower', 'hyoid'];
  for (let i = 1; i <= formula.cervical; i++) ids.push(`vert_C${i as C}`);
  for (let i = 1; i <= formula.thoracic; i++) ids.push(`vert_T${i as T}`);
  for (let i = 1; i <= formula.lumbar; i++) ids.push(`vert_L${i as Lu}`);
  ids.push('sacrum', 'coccyx', 'sternum');
  for (const s of SIDES) {
    for (let i = 1; i <= formula.thoracic; i++) ids.push(`rib_${s}${i as RibN}`);
    ids.push(`clavicle_${s}`, `scapula_${s}`, `humerus_${s}`, `radius_${s}`, `ulna_${s}`, `carpals_${s}`);
    for (let r = 1; r <= 5; r++) ids.push(`metacarpal_${s}${r as Ray}`);
    for (let r = 1; r <= 5; r++) ids.push(`hand_phalanx_prox_${s}${r as Ray}`);
    for (let r = 2; r <= 5; r++) ids.push(`hand_phalanx_mid_${s}${r as MidRay}`);
    for (let r = 1; r <= 5; r++) ids.push(`hand_phalanx_dist_${s}${r as Ray}`);
    ids.push(`pelvis_${s}`, `femur_${s}`, `patella_${s}`, `tibia_${s}`, `fibula_${s}`);
    ids.push(`talus_${s}`, `calcaneus_${s}`, `tarsals_${s}`);
    for (let r = 1; r <= 5; r++) ids.push(`metatarsal_${s}${r as Ray}`);
    for (let r = 1; r <= 5; r++) ids.push(`foot_phalanx_prox_${s}${r as Ray}`);
    for (let r = 2; r <= 5; r++) ids.push(`foot_phalanx_mid_${s}${r as MidRay}`);
    for (let r = 1; r <= 5; r++) ids.push(`foot_phalanx_dist_${s}${r as Ray}`);
  }
  return ids;
}

/** Superset of all ids any supported vertebral formula can produce (used for validation). */
export const ALL_BONE_IDS: ReadonlySet<string> = new Set<string>(
  boneIdsFor({ cervical: 7, thoracic: 13, lumbar: 6 }),
);

export const BONE_GROUPS: ReadonlySet<string> = new Set<BoneGroup>([
  'all', 'skull', 'teeth', 'spine', 'cervical', 'thoracic', 'lumbar', 'ribs', 'ribs_L', 'ribs_R',
  'shoulder_L', 'shoulder_R', 'arm_L', 'arm_R', 'hand_L', 'hand_R', 'pelvis', 'leg_L', 'leg_R',
  'foot_L', 'foot_R',
]);

export function isBoneId(value: string): value is BoneId {
  return ALL_BONE_IDS.has(value);
}

export function isBoneRef(value: string): value is BoneRef {
  return ALL_BONE_IDS.has(value) || BONE_GROUPS.has(value);
}

export function boneSide(id: BoneId): Side | null {
  const m = /_(L|R)\d*$/.exec(id);
  return m ? (m[1] as Side) : null;
}

export function boneRegion(id: BoneId): BoneRegion {
  if (id === 'cranium' || id === 'mandible' || id.startsWith('teeth') || id === 'hyoid') return 'skull';
  if (id.startsWith('vert_') || id === 'sacrum' || id === 'coccyx') return 'spine';
  if (id.startsWith('rib_') || id === 'sternum') return 'thorax';
  if (id.startsWith('clavicle') || id.startsWith('scapula')) return 'shoulder';
  if (id.startsWith('humerus') || id.startsWith('radius') || id.startsWith('ulna')) return 'arm';
  if (id.startsWith('carpals') || id.startsWith('metacarpal') || id.startsWith('hand_')) return 'hand';
  if (id.startsWith('pelvis')) return 'pelvis';
  if (id.startsWith('femur') || id.startsWith('patella') || id.startsWith('tibia') || id.startsWith('fibula')) {
    return 'leg';
  }
  return 'foot';
}

/** Expand group tokens into concrete bone ids for a skeleton with the given formula. */
export function expandBoneRefs(refs: readonly BoneRef[], formula: VertebralFormula = HUMAN_FORMULA): Set<BoneId> {
  const all = boneIdsFor(formula);
  const out = new Set<BoneId>();
  const add = (pred: (id: BoneId) => boolean) => all.filter(pred).forEach((id) => out.add(id));
  for (const ref of refs) {
    switch (ref) {
      case 'all': add(() => true); break;
      case 'skull': add((id) => boneRegion(id) === 'skull'); break;
      case 'teeth': add((id) => id.startsWith('teeth')); break;
      case 'spine': add((id) => boneRegion(id) === 'spine'); break;
      case 'cervical': add((id) => id.startsWith('vert_C')); break;
      case 'thoracic': add((id) => id.startsWith('vert_T')); break;
      case 'lumbar': add((id) => id.startsWith('vert_L')); break;
      case 'ribs': add((id) => id.startsWith('rib_')); break;
      case 'ribs_L': add((id) => id.startsWith('rib_L')); break;
      case 'ribs_R': add((id) => id.startsWith('rib_R')); break;
      case 'pelvis': add((id) => id.startsWith('pelvis') || id === 'sacrum'); break;
      default: {
        const m = /^(shoulder|arm|hand|leg|foot)_(L|R)$/.exec(ref);
        if (m) {
          const region = m[1] as BoneRegion;
          const side = m[2] as Side;
          add((id) => boneRegion(id) === region && boneSide(id) === side);
        } else if (all.includes(ref as BoneId)) {
          out.add(ref as BoneId);
        }
      }
    }
  }
  return out;
}

const ORDINAL = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', '13th'];
const DIGIT_HAND = ['', 'thumb', 'index finger', 'middle finger', 'ring finger', 'little finger'];
const DIGIT_FOOT = ['', 'big toe', '2nd toe', '3rd toe', '4th toe', 'little toe'];

export interface BoneName {
  kids: string;
  clinician: string;
}

/** Human-readable names. Kids names are plain English, clinician names use Terminologia Anatomica. */
export function boneName(id: BoneId): BoneName {
  const side = boneSide(id);
  const sideWord = side === 'L' ? 'Left' : side === 'R' ? 'Right' : '';
  const sideK = sideWord ? `${sideWord} ` : '';
  const sideC = sideWord ? `${sideWord.toLowerCase()} ` : '';
  const num = Number((/(\d+)$/.exec(id) ?? ['', '0'])[1]);
  const fixed: Record<string, BoneName> = {
    cranium: { kids: 'Skull', clinician: 'Cranium' },
    mandible: { kids: 'Lower jaw', clinician: 'Mandible' },
    teeth_upper: { kids: 'Top teeth', clinician: 'Maxillary dentition' },
    teeth_lower: { kids: 'Bottom teeth', clinician: 'Mandibular dentition' },
    hyoid: { kids: 'Tongue bone', clinician: 'Hyoid' },
    sacrum: { kids: 'Bottom of the spine', clinician: 'Sacrum' },
    coccyx: { kids: 'Tailbone', clinician: 'Coccyx' },
    sternum: { kids: 'Breastbone', clinician: 'Sternum' },
  };
  if (fixed[id]) return fixed[id];
  if (id.startsWith('vert_C')) {
    const extra = num === 1 ? ' (atlas)' : num === 2 ? ' (axis)' : '';
    return { kids: `Neck bone ${num}${extra}`, clinician: `C${num} vertebra${extra}` };
  }
  if (id.startsWith('vert_T')) return { kids: `Back bone ${num}`, clinician: `T${num} vertebra` };
  if (id.startsWith('vert_L')) return { kids: `Lower-back bone ${num}`, clinician: `L${num} vertebra` };
  if (id.startsWith('rib_')) return { kids: `${sideK}rib ${num}`, clinician: `${ORDINAL[num]} rib, ${sideC.trim()}` };
  const base = id.replace(/_(L|R)\d*$/, '');
  const simple: Record<string, BoneName> = {
    clavicle: { kids: 'collarbone', clinician: 'clavicle' },
    scapula: { kids: 'shoulder blade', clinician: 'scapula' },
    humerus: { kids: 'upper arm bone', clinician: 'humerus' },
    radius: { kids: 'forearm bone (thumb side)', clinician: 'radius' },
    ulna: { kids: 'forearm bone (pinky side)', clinician: 'ulna' },
    carpals: { kids: 'wrist bones', clinician: 'carpus' },
    pelvis: { kids: 'hip bone', clinician: 'os coxae' },
    femur: { kids: 'thigh bone', clinician: 'femur' },
    patella: { kids: 'kneecap', clinician: 'patella' },
    tibia: { kids: 'shin bone', clinician: 'tibia' },
    fibula: { kids: 'calf bone', clinician: 'fibula' },
    talus: { kids: 'ankle bone', clinician: 'talus' },
    calcaneus: { kids: 'heel bone', clinician: 'calcaneus' },
    tarsals: { kids: 'middle foot bones', clinician: 'navicular, cuboid and cuneiforms' },
  };
  if (simple[base]) {
    return { kids: `${sideK}${simple[base].kids}`, clinician: `${sideC}${simple[base].clinician}`.replace(/^./, (c) => c.toUpperCase()) };
  }
  if (base === 'metacarpal') {
    return { kids: `${sideK}hand bone (${DIGIT_HAND[num]})`, clinician: `${ORDINAL[num]} metacarpal, ${sideC.trim()}` };
  }
  if (base === 'metatarsal') {
    return { kids: `${sideK}foot bone (${DIGIT_FOOT[num]})`, clinician: `${ORDINAL[num]} metatarsal, ${sideC.trim()}` };
  }
  const ph = /^(hand|foot)_phalanx_(prox|mid|dist)$/.exec(base);
  if (ph) {
    const seg = ph[2] === 'prox' ? 'proximal' : ph[2] === 'mid' ? 'intermediate' : 'distal';
    const digit = ph[1] === 'hand' ? DIGIT_HAND[num] : DIGIT_FOOT[num];
    const kidsPart = ph[1] === 'hand' ? 'finger bone' : 'toe bone';
    return {
      kids: `${sideK}${kidsPart} (${digit})`,
      clinician: `${seg.replace(/^./, (c) => c.toUpperCase())} ${ph[1] === 'hand' ? 'manual' : 'pedal'} phalanx, digit ${num}, ${sideC.trim()}`,
    };
  }
  return { kids: id, clinician: id };
}
