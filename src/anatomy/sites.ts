/**
 * Named anatomical landmarks used to place lesions on bones whose shape is not a simple shaft.
 * Long bones, ribs, clavicles and phalanges use `t` (0..1 along the bone) + `azimuthDeg` instead.
 */

export const SKULL_ANCHORS = [
  'glabella',
  'frontal-mid',
  'frontal-L',
  'frontal-R',
  'supraorbital-L',
  'supraorbital-R',
  'orbit-L',
  'orbit-R',
  'orbit-floor-L',
  'orbit-floor-R',
  'nasal',
  'zygomatic-L',
  'zygomatic-R',
  'maxilla-L',
  'maxilla-R',
  'palate',
  'vertex',
  'parietal-L',
  'parietal-R',
  'temporal-L',
  'temporal-R',
  'ear-L',
  'ear-R',
  'mastoid-L',
  'mastoid-R',
  'occipital',
  'occipital-L',
  'occipital-R',
  'cranial-base',
] as const;

export const MANDIBLE_ANCHORS = [
  'mandible-symphysis',
  'mandible-body-L',
  'mandible-body-R',
  'mandible-ramus-L',
  'mandible-ramus-R',
  'mandible-condyle-L',
  'mandible-condyle-R',
] as const;

export const PELVIS_ANCHORS = [
  'iliac-crest',
  'iliac-blade',
  'acetabulum',
  'ischial-tuberosity',
  'pubic-ramus',
  'pubic-symphysis',
  'auricular-surface',
] as const;

export const VERTEBRA_ANCHORS = [
  'body',
  'endplate-superior',
  'endplate-inferior',
  'spinous-process',
  'lamina',
  'pedicle',
  'transverse-process-L',
  'transverse-process-R',
  'facet',
] as const;

export const SCAPULA_ANCHORS = ['glenoid', 'acromion', 'coracoid', 'spine', 'blade'] as const;

export type SkullAnchor = (typeof SKULL_ANCHORS)[number];
export type MandibleAnchor = (typeof MANDIBLE_ANCHORS)[number];
export type PelvisAnchor = (typeof PELVIS_ANCHORS)[number];
export type VertebraAnchor = (typeof VERTEBRA_ANCHORS)[number];
export type ScapulaAnchor = (typeof SCAPULA_ANCHORS)[number];
export type Anchor = SkullAnchor | MandibleAnchor | PelvisAnchor | VertebraAnchor | ScapulaAnchor;

/** Which anchors are valid for which bones (validated by tests). */
export function anchorsForBone(boneId: string): readonly string[] {
  if (boneId === 'cranium') return SKULL_ANCHORS;
  if (boneId === 'mandible') return MANDIBLE_ANCHORS;
  if (boneId.startsWith('pelvis_')) return PELVIS_ANCHORS;
  if (boneId.startsWith('vert_') || boneId === 'sacrum') return VERTEBRA_ANCHORS;
  if (boneId.startsWith('scapula_')) return SCAPULA_ANCHORS;
  return [];
}

/**
 * Where on a bone a lesion sits.
 * - `t`: 0 = proximal / superior / medial end, 1 = distal / inferior / lateral end.
 *   (Femur: 0 = hip end, 1 = knee end. Rib: 0 = spine end, 1 = sternal end. Clavicle: 0 = sternal end.)
 * - `azimuthDeg`: direction around the shaft, 0 = anterior, 90 = lateral, 180 = posterior, 270 = medial.
 * - `anchor`: named landmark for cranium, mandible, pelvis, vertebrae, sacrum, scapula.
 * - `teeth`: FDI tooth numbers (11-18, 21-28, 31-38, 41-48) for dental lesions on teeth_upper / teeth_lower.
 */
export interface LesionSite {
  t?: number;
  azimuthDeg?: number;
  anchor?: Anchor;
  teeth?: number[];
}

/** FDI two-digit notation: quadrant 1 = upper right, 2 = upper left, 3 = lower left, 4 = lower right. */
export function isValidFdi(code: number): boolean {
  const q = Math.floor(code / 10);
  const n = code % 10;
  return Number.isInteger(code) && q >= 1 && q <= 4 && n >= 1 && n <= 8;
}
