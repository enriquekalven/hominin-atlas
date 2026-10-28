/**
 * Morphological parameters that drive the procedural skeletons.
 *
 * These are reconstruction inputs, not measurements of specific fossils. Values are approximate
 * adult averages chosen from published ranges (cranial dimensions, limb lengths, indices) and
 * qualitative descriptions (brow ridge form, occipital bun, iliac flare...). Where the skeleton of
 * a taxon is unknown (e.g. Denisovan or H. luzonensis bodies), the preset borrows from the closest
 * well-known relatives, and the viewer shows those bones as reconstructed.
 */
import type { VertebralFormula } from '../anatomy/bones';
import type { SpeciesId } from '../data/types';

export interface SkullParams {
  /** Glabella–opisthocranion length (m). */
  vaultLength: number;
  vaultBreadth: number;
  /** Porion–vertex height (m). */
  vaultHeight: number;
  vaultThickness: number;
  /** Fraction of vault length in front of porion (0.45 bun-heavy .. 0.58 ape). */
  porionFraction: number;
  /** 0 vertical forehead .. 1 strongly receding. */
  frontalSlope: number;
  /** Minimum frontal breadth relative to max breadth (postorbital constriction). */
  frontalBreadth: number;
  parietalBossing: number;
  /** 0 = widest low on the vault (H. erectus) .. 1 = widest high (H. sapiens). */
  maxBreadthHeight: number;
  occipitalBun: number;
  occipitalAngulation: number;
  sagittalCrest: number;
  sagittalKeel: number;
  nuchalTorus: number;
  mastoidSize: number;
  /** Basion position relative to porion along z (m); + anterior (biped), - posterior (ape). */
  foramenMagnumZ: number;
  browRidge: number;
  /** 0 = two separate arches (sapiens) .. 1 = continuous bar (erectus, apes). */
  browContinuous: number;
  browProjection: number;
  faceHeight: number;
  faceWidth: number;
  midfaceProjection: number;
  prognathism: number;
  orbitWidth: number;
  orbitHeight: number;
  /** 0 round .. 1 rectangular. */
  orbitShape: number;
  nasalWidth: number;
  nasalHeight: number;
  zygomaticFlare: number;
  zygomaticRetreat: number;
  cheekHeight: number;
  dishedFace: number;
  /** Dental arcade outer breadth at the molars (m). */
  arcadeWidth: number;
  /** Arcade breadth at the canines (m). */
  arcadeFront: number;
  /** 0 parabolic (human) .. 1 U-shaped with parallel tooth rows (ape). */
  arcadeSquareness: number;
  incisorSize: number;
  canineSize: number;
  canineHeight: number;
  premolarSize: number;
  molarSize: number;
  diastema: number;
  /** 0 no chin .. 1 full mental eminence. */
  chin: number;
  mandibleHeight: number;
  mandibleThickness: number;
  ramusWidth: number;
  gonialFlare: number;
  retromolarSpace: number;
}

export interface BodyParams {
  stature: number;
  vertebrae: VertebralFormula;
  humerus: number;
  radius: number;
  femur: number;
  tibia: number;
  handLength: number;
  footLength: number;
  shoulderWidth: number;
  pelvisWidth: number;
  hipJointWidth: number;
  chestWidth: number;
  chestDepth: number;
  /** -0.3 barrel-shaped (sapiens) .. 1 funnel-shaped (ape). */
  thoraxFunnel: number;
  /** Shaft radius multiplier (1 = modern human). */
  robusticity: number;
  /** Cortical wall thickness as fraction of shaft radius. */
  cortical: number;
  iliacFlare: number;
  iliacHeight: number;
  /** 0 = flat, dorsally facing blades (ape) .. 1 = laterally wrapping bowl (human). */
  iliacOrientation: number;
  femoralNeck: number;
  femoralHead: number;
  /** Bicondylar (valgus) angle in degrees. */
  bicondylar: number;
  femurBow: number;
  lordosis: number;
  kyphosis: number;
  halluxAbduction: number;
  footArch: number;
  fingerCurvature: number;
  /** Thumb length relative to modern human proportions. */
  thumbLength: number;
  /** Glenoid cranial tilt in degrees (climbing shoulders face upward). */
  glenoidTilt: number;
  clavicleLength: number;
  posture: 'biped' | 'knuckle';
}

export interface MorphParams {
  skull: SkullParams;
  body: BodyParams;
}

const H7_12_5: VertebralFormula = { cervical: 7, thoracic: 12, lumbar: 5 };

const SAPIENS_SKULL: SkullParams = {
  vaultLength: 0.19, vaultBreadth: 0.142, vaultHeight: 0.118, vaultThickness: 0.0062, porionFraction: 0.5,
  frontalSlope: 0.15, frontalBreadth: 0.7, parietalBossing: 0.75, maxBreadthHeight: 0.85, occipitalBun: 0.05,
  occipitalAngulation: 0.1, sagittalCrest: 0, sagittalKeel: 0, nuchalTorus: 0, mastoidSize: 1.1,
  foramenMagnumZ: 0.006, browRidge: 0.0035, browContinuous: 0.1, browProjection: 0.004, faceHeight: 0.068,
  faceWidth: 0.132, midfaceProjection: 0, prognathism: 0.004, orbitWidth: 0.04, orbitHeight: 0.034,
  orbitShape: 0.5, nasalWidth: 0.025, nasalHeight: 0.052, zygomaticFlare: 0.1, zygomaticRetreat: 0.1,
  cheekHeight: 0.022, dishedFace: 0, arcadeWidth: 0.062, arcadeFront: 0.036, arcadeSquareness: 0.1,
  incisorSize: 0.0085, canineSize: 0.0076, canineHeight: 0.0098, premolarSize: 0.0068, molarSize: 0.0102,
  diastema: 0, chin: 1, mandibleHeight: 0.032, mandibleThickness: 0.013, ramusWidth: 0.032, gonialFlare: 0.3,
  retromolarSpace: 0,
};

const SAPIENS_BODY: BodyParams = {
  stature: 1.74, vertebrae: H7_12_5, humerus: 0.33, radius: 0.25, femur: 0.465, tibia: 0.385, handLength: 0.19,
  footLength: 0.265, shoulderWidth: 0.4, pelvisWidth: 0.285, hipJointWidth: 0.175, chestWidth: 0.3,
  chestDepth: 0.21, thoraxFunnel: -0.2, robusticity: 1, cortical: 0.35, iliacFlare: 0.35, iliacHeight: 0.125,
  iliacOrientation: 1, femoralNeck: 0.05, femoralHead: 0.024, bicondylar: 10, femurBow: 0.006, lordosis: 1,
  kyphosis: 1, halluxAbduction: 5, footArch: 1, fingerCurvature: 0.05, thumbLength: 1, glenoidTilt: 0,
  clavicleLength: 0.15, posture: 'biped',
};

function skull(over: Partial<SkullParams>): SkullParams {
  return { ...SAPIENS_SKULL, ...over };
}
function body(over: Partial<BodyParams>): BodyParams {
  return { ...SAPIENS_BODY, ...over };
}

/** Australopith-grade body plan shared by several early hominins (then tuned per taxon). */
const AUSTRALOPITH_BODY: Partial<BodyParams> = {
  thoraxFunnel: 0.85, cortical: 0.42, iliacFlare: 1, iliacOrientation: 0.72, bicondylar: 14, femurBow: 0.003,
  lordosis: 0.9, footArch: 0.55, fingerCurvature: 0.5, thumbLength: 0.9, glenoidTilt: 13, halluxAbduction: 3,
};

export const PRESETS: Record<SpeciesId, MorphParams> = {
  'pan-troglodytes': {
    skull: skull({
      vaultLength: 0.135, vaultBreadth: 0.1, vaultHeight: 0.072, vaultThickness: 0.005, porionFraction: 0.58,
      frontalSlope: 0.95, frontalBreadth: 0.58, parietalBossing: 0, maxBreadthHeight: 0.1, occipitalBun: 0,
      occipitalAngulation: 0.6, sagittalCrest: 0.002, nuchalTorus: 0.006, mastoidSize: 0.3, foramenMagnumZ: -0.022,
      browRidge: 0.0085, browContinuous: 0.95, browProjection: 0.012, faceHeight: 0.085, faceWidth: 0.12,
      prognathism: 0.05, orbitWidth: 0.036, orbitHeight: 0.036, orbitShape: 0.75, nasalWidth: 0.02,
      nasalHeight: 0.032, zygomaticFlare: 0.2, cheekHeight: 0.02, arcadeWidth: 0.06, arcadeFront: 0.055,
      arcadeSquareness: 1, incisorSize: 0.012, canineSize: 0.013, canineHeight: 0.02, premolarSize: 0.0085,
      molarSize: 0.0105, diastema: 0.006, chin: 0, mandibleHeight: 0.04, mandibleThickness: 0.016,
      ramusWidth: 0.042, gonialFlare: 0.4,
    }),
    body: body({
      stature: 1.2, vertebrae: { cervical: 7, thoracic: 13, lumbar: 4 }, humerus: 0.29, radius: 0.27, femur: 0.29,
      tibia: 0.24, handLength: 0.24, footLength: 0.24, shoulderWidth: 0.3, pelvisWidth: 0.26, hipJointWidth: 0.12,
      chestWidth: 0.25, chestDepth: 0.18, thoraxFunnel: 1, robusticity: 1.1, cortical: 0.4, iliacFlare: 0.1,
      iliacHeight: 0.17, iliacOrientation: 0, femoralNeck: 0.03, femoralHead: 0.018, bicondylar: 1, femurBow: 0.004,
      lordosis: 0, kyphosis: 1.1, halluxAbduction: 40, footArch: 0, fingerCurvature: 0.8, thumbLength: 0.55,
      glenoidTilt: 25, clavicleLength: 0.12, posture: 'knuckle',
    }),
  },
  'sahelanthropus-tchadensis': {
    skull: skull({
      vaultLength: 0.137, vaultBreadth: 0.098, vaultHeight: 0.072, vaultThickness: 0.006, porionFraction: 0.57,
      frontalSlope: 0.9, frontalBreadth: 0.6, parietalBossing: 0, maxBreadthHeight: 0.1, occipitalAngulation: 0.7,
      sagittalCrest: 0.003, nuchalTorus: 0.008, mastoidSize: 0.4, foramenMagnumZ: -0.006, browRidge: 0.0105,
      browContinuous: 1, browProjection: 0.015, faceHeight: 0.075, faceWidth: 0.125, prognathism: 0.02,
      orbitWidth: 0.036, orbitHeight: 0.034, orbitShape: 0.7, nasalWidth: 0.02, nasalHeight: 0.036,
      zygomaticFlare: 0.2, cheekHeight: 0.024, arcadeWidth: 0.056, arcadeFront: 0.044, arcadeSquareness: 0.9,
      incisorSize: 0.0095, canineSize: 0.0095, canineHeight: 0.0105, premolarSize: 0.0085, molarSize: 0.0115,
      diastema: 0.001, chin: 0, mandibleHeight: 0.034, mandibleThickness: 0.018, ramusWidth: 0.04,
    }),
    body: body({
      ...AUSTRALOPITH_BODY, stature: 1.2, humerus: 0.27, radius: 0.24, femur: 0.3, tibia: 0.25, handLength: 0.18,
      footLength: 0.2, shoulderWidth: 0.28, pelvisWidth: 0.24, hipJointWidth: 0.125, chestWidth: 0.22, chestDepth: 0.16,
      thoraxFunnel: 0.95, iliacFlare: 0.6, iliacHeight: 0.12, iliacOrientation: 0.5, femoralNeck: 0.038,
      femoralHead: 0.016, bicondylar: 7, lordosis: 0.5, halluxAbduction: 30, footArch: 0.1, fingerCurvature: 0.65,
      glenoidTilt: 18, clavicleLength: 0.11,
    }),
  },
  'ardipithecus-ramidus': {
    skull: skull({
      vaultLength: 0.13, vaultBreadth: 0.095, vaultHeight: 0.074, vaultThickness: 0.0045, porionFraction: 0.56,
      frontalSlope: 0.85, frontalBreadth: 0.62, parietalBossing: 0, maxBreadthHeight: 0.1, occipitalAngulation: 0.5,
      nuchalTorus: 0.003, mastoidSize: 0.4, foramenMagnumZ: -0.006, browRidge: 0.006, browContinuous: 0.85,
      browProjection: 0.007, faceHeight: 0.068, faceWidth: 0.11, prognathism: 0.026, orbitWidth: 0.034,
      orbitHeight: 0.032, nasalWidth: 0.02, nasalHeight: 0.036, zygomaticFlare: 0.2, cheekHeight: 0.02,
      arcadeWidth: 0.052, arcadeFront: 0.04, arcadeSquareness: 0.85, incisorSize: 0.009, canineSize: 0.01,
      canineHeight: 0.012, premolarSize: 0.008, molarSize: 0.011, diastema: 0.002, chin: 0, mandibleHeight: 0.03,
      mandibleThickness: 0.016, ramusWidth: 0.036,
    }),
    body: body({
      ...AUSTRALOPITH_BODY, stature: 1.2, humerus: 0.27, radius: 0.245, femur: 0.3, tibia: 0.255, handLength: 0.18,
      footLength: 0.2, shoulderWidth: 0.28, pelvisWidth: 0.24, hipJointWidth: 0.13, chestWidth: 0.22, chestDepth: 0.16,
      thoraxFunnel: 0.9, iliacFlare: 0.7, iliacHeight: 0.11, iliacOrientation: 0.6, femoralNeck: 0.04,
      femoralHead: 0.016, bicondylar: 8, lordosis: 0.6, halluxAbduction: 30, footArch: 0.1, fingerCurvature: 0.6,
      glenoidTilt: 15, clavicleLength: 0.11,
    }),
  },
  'australopithecus-afarensis': {
    skull: skull({
      vaultLength: 0.145, vaultBreadth: 0.105, vaultHeight: 0.08, vaultThickness: 0.005, porionFraction: 0.55,
      frontalSlope: 0.85, frontalBreadth: 0.62, parietalBossing: 0, maxBreadthHeight: 0.1, occipitalAngulation: 0.6,
      sagittalKeel: 0.2, sagittalCrest: 0.003, nuchalTorus: 0.004, mastoidSize: 0.6, foramenMagnumZ: -0.004,
      browRidge: 0.006, browContinuous: 0.7, browProjection: 0.008, faceHeight: 0.08, faceWidth: 0.125,
      midfaceProjection: 0.004, prognathism: 0.03, orbitWidth: 0.036, orbitHeight: 0.034, nasalWidth: 0.024,
      nasalHeight: 0.04, zygomaticFlare: 0.4, zygomaticRetreat: 0.2, cheekHeight: 0.026, dishedFace: 0.2,
      arcadeWidth: 0.058, arcadeFront: 0.042, arcadeSquareness: 0.75, incisorSize: 0.0105, canineSize: 0.0105,
      canineHeight: 0.013, premolarSize: 0.0095, molarSize: 0.013, diastema: 0.003, chin: 0, mandibleHeight: 0.036,
      mandibleThickness: 0.02, ramusWidth: 0.04, gonialFlare: 0.4,
    }),
    body: body({
      ...AUSTRALOPITH_BODY, stature: 1.1, humerus: 0.237, radius: 0.18, femur: 0.281, tibia: 0.24, handLength: 0.13,
      footLength: 0.17, shoulderWidth: 0.26, pelvisWidth: 0.255, hipJointWidth: 0.13, chestWidth: 0.21,
      chestDepth: 0.15, iliacHeight: 0.085, femoralNeck: 0.042, femoralHead: 0.0145, bicondylar: 15,
      clavicleLength: 0.1, halluxAbduction: 2,
    }),
  },
  'australopithecus-africanus': {
    skull: skull({
      vaultLength: 0.146, vaultBreadth: 0.108, vaultHeight: 0.085, vaultThickness: 0.005, porionFraction: 0.54,
      frontalSlope: 0.7, frontalBreadth: 0.64, parietalBossing: 0.1, maxBreadthHeight: 0.2, occipitalAngulation: 0.4,
      nuchalTorus: 0.003, mastoidSize: 0.6, foramenMagnumZ: -0.002, browRidge: 0.0055, browContinuous: 0.6,
      browProjection: 0.007, faceHeight: 0.075, faceWidth: 0.12, midfaceProjection: 0.003, prognathism: 0.026,
      orbitWidth: 0.035, orbitHeight: 0.034, nasalWidth: 0.022, nasalHeight: 0.038, zygomaticFlare: 0.4,
      zygomaticRetreat: 0.2, cheekHeight: 0.025, dishedFace: 0.2, arcadeWidth: 0.058, arcadeFront: 0.04,
      arcadeSquareness: 0.6, incisorSize: 0.0098, canineSize: 0.0098, canineHeight: 0.0115, premolarSize: 0.0095,
      molarSize: 0.0135, diastema: 0.002, chin: 0, mandibleHeight: 0.034, mandibleThickness: 0.02, ramusWidth: 0.04,
    }),
    body: body({
      ...AUSTRALOPITH_BODY, stature: 1.25, humerus: 0.26, radius: 0.2, femur: 0.31, tibia: 0.26, handLength: 0.14,
      footLength: 0.18, shoulderWidth: 0.28, pelvisWidth: 0.255, hipJointWidth: 0.13, chestWidth: 0.22,
      chestDepth: 0.16, thoraxFunnel: 0.8, iliacFlare: 0.9, iliacHeight: 0.09, femoralNeck: 0.045,
      femoralHead: 0.016, lordosis: 1, halluxAbduction: 6, clavicleLength: 0.105,
    }),
  },
  'australopithecus-sediba': {
    skull: skull({
      vaultLength: 0.14, vaultBreadth: 0.105, vaultHeight: 0.084, vaultThickness: 0.005, porionFraction: 0.53,
      frontalSlope: 0.6, frontalBreadth: 0.66, parietalBossing: 0.2, maxBreadthHeight: 0.3, occipitalAngulation: 0.3,
      nuchalTorus: 0.002, mastoidSize: 0.6, foramenMagnumZ: 0, browRidge: 0.0045, browContinuous: 0.4,
      browProjection: 0.006, faceHeight: 0.064, faceWidth: 0.112, prognathism: 0.018, orbitWidth: 0.034,
      orbitHeight: 0.032, nasalWidth: 0.022, nasalHeight: 0.036, zygomaticFlare: 0.2, zygomaticRetreat: 0.2,
      cheekHeight: 0.02, arcadeWidth: 0.056, arcadeFront: 0.036, arcadeSquareness: 0.45, incisorSize: 0.0085,
      canineSize: 0.0085, canineHeight: 0.01, premolarSize: 0.0085, molarSize: 0.0118, chin: 0.15,
      mandibleHeight: 0.03, mandibleThickness: 0.016, ramusWidth: 0.036,
    }),
    body: body({
      ...AUSTRALOPITH_BODY, stature: 1.3, humerus: 0.27, radius: 0.22, femur: 0.33, tibia: 0.29, handLength: 0.15,
      footLength: 0.2, shoulderWidth: 0.3, pelvisWidth: 0.24, hipJointWidth: 0.135, chestWidth: 0.23, chestDepth: 0.17,
      thoraxFunnel: 0.7, cortical: 0.4, iliacFlare: 0.6, iliacHeight: 0.09, iliacOrientation: 0.85,
      femoralNeck: 0.045, femoralHead: 0.017, bicondylar: 12, lordosis: 1, halluxAbduction: 5, footArch: 0.4,
      fingerCurvature: 0.45, thumbLength: 1.1, glenoidTilt: 12, clavicleLength: 0.11,
    }),
  },
  'paranthropus-boisei': {
    skull: skull({
      vaultLength: 0.16, vaultBreadth: 0.12, vaultHeight: 0.085, vaultThickness: 0.006, porionFraction: 0.54,
      frontalSlope: 0.8, frontalBreadth: 0.55, parietalBossing: 0, maxBreadthHeight: 0.2, occipitalAngulation: 0.4,
      sagittalCrest: 0.012, nuchalTorus: 0.004, mastoidSize: 0.8, foramenMagnumZ: 0.002, browRidge: 0.006,
      browContinuous: 0.6, browProjection: 0.006, faceHeight: 0.098, faceWidth: 0.16, prognathism: 0.01,
      midfaceProjection: -0.004, orbitWidth: 0.04, orbitHeight: 0.036, nasalWidth: 0.028, nasalHeight: 0.042,
      zygomaticFlare: 1, zygomaticRetreat: 0, cheekHeight: 0.036, dishedFace: 1, arcadeWidth: 0.075,
      arcadeFront: 0.04, arcadeSquareness: 0.6, incisorSize: 0.007, canineSize: 0.0075, canineHeight: 0.008,
      premolarSize: 0.0135, molarSize: 0.0175, chin: 0, mandibleHeight: 0.045, mandibleThickness: 0.026,
      ramusWidth: 0.05, gonialFlare: 0.6,
    }),
    body: body({
      ...AUSTRALOPITH_BODY, stature: 1.35, humerus: 0.29, radius: 0.23, femur: 0.34, tibia: 0.29, handLength: 0.15,
      footLength: 0.2, shoulderWidth: 0.32, pelvisWidth: 0.27, hipJointWidth: 0.14, chestWidth: 0.25, chestDepth: 0.18,
      thoraxFunnel: 0.75, robusticity: 1.3, cortical: 0.48, iliacFlare: 0.9, iliacHeight: 0.095, femoralNeck: 0.05,
      femoralHead: 0.017, bicondylar: 13, clavicleLength: 0.115,
    }),
  },
  'paranthropus-robustus': {
    skull: skull({
      vaultLength: 0.15, vaultBreadth: 0.115, vaultHeight: 0.082, vaultThickness: 0.006, porionFraction: 0.54,
      frontalSlope: 0.75, frontalBreadth: 0.58, parietalBossing: 0, maxBreadthHeight: 0.2, occipitalAngulation: 0.4,
      sagittalCrest: 0.008, nuchalTorus: 0.003, mastoidSize: 0.7, foramenMagnumZ: 0.002, browRidge: 0.0055,
      browContinuous: 0.6, browProjection: 0.006, faceHeight: 0.085, faceWidth: 0.145, prognathism: 0.008,
      midfaceProjection: -0.003, orbitWidth: 0.038, orbitHeight: 0.035, nasalWidth: 0.026, nasalHeight: 0.04,
      zygomaticFlare: 0.8, zygomaticRetreat: 0, cheekHeight: 0.032, dishedFace: 0.8, arcadeWidth: 0.068,
      arcadeFront: 0.038, arcadeSquareness: 0.55, incisorSize: 0.0072, canineSize: 0.0075, canineHeight: 0.0082,
      premolarSize: 0.0115, molarSize: 0.015, chin: 0, mandibleHeight: 0.04, mandibleThickness: 0.024,
      ramusWidth: 0.046, gonialFlare: 0.5,
    }),
    body: body({
      ...AUSTRALOPITH_BODY, stature: 1.2, humerus: 0.26, radius: 0.205, femur: 0.31, tibia: 0.265, handLength: 0.14,
      footLength: 0.185, shoulderWidth: 0.29, pelvisWidth: 0.25, hipJointWidth: 0.13, chestWidth: 0.23,
      chestDepth: 0.17, thoraxFunnel: 0.75, robusticity: 1.2, cortical: 0.46, iliacFlare: 0.9, iliacHeight: 0.09,
      femoralNeck: 0.046, femoralHead: 0.0155, bicondylar: 13, clavicleLength: 0.105,
    }),
  },
  'homo-habilis': {
    skull: skull({
      vaultLength: 0.155, vaultBreadth: 0.118, vaultHeight: 0.088, vaultThickness: 0.005, porionFraction: 0.52,
      frontalSlope: 0.55, frontalBreadth: 0.66, parietalBossing: 0.2, maxBreadthHeight: 0.4, occipitalAngulation: 0.3,
      nuchalTorus: 0.002, mastoidSize: 0.7, foramenMagnumZ: 0.002, browRidge: 0.006, browContinuous: 0.4,
      browProjection: 0.008, faceHeight: 0.064, faceWidth: 0.12, prognathism: 0.016, orbitWidth: 0.036,
      orbitHeight: 0.032, nasalWidth: 0.024, nasalHeight: 0.044, zygomaticFlare: 0.3, zygomaticRetreat: 0.2,
      cheekHeight: 0.022, arcadeWidth: 0.06, arcadeFront: 0.036, arcadeSquareness: 0.4, incisorSize: 0.0085,
      canineSize: 0.0085, canineHeight: 0.01, premolarSize: 0.009, molarSize: 0.013, chin: 0, mandibleHeight: 0.032,
      mandibleThickness: 0.018, ramusWidth: 0.036,
    }),
    body: body({
      ...AUSTRALOPITH_BODY, stature: 1.15, humerus: 0.26, radius: 0.21, femur: 0.3, tibia: 0.26, handLength: 0.14,
      footLength: 0.19, shoulderWidth: 0.28, pelvisWidth: 0.24, hipJointWidth: 0.13, chestWidth: 0.21,
      chestDepth: 0.16, thoraxFunnel: 0.6, robusticity: 1.05, iliacFlare: 0.75, iliacHeight: 0.095,
      iliacOrientation: 0.75, femoralNeck: 0.045, femoralHead: 0.017, bicondylar: 12, footArch: 0.6,
      fingerCurvature: 0.45, thumbLength: 0.95, glenoidTilt: 10, clavicleLength: 0.11, halluxAbduction: 6,
    }),
  },
  'homo-erectus': {
    skull: skull({
      vaultLength: 0.19, vaultBreadth: 0.14, vaultHeight: 0.098, vaultThickness: 0.01, porionFraction: 0.5,
      frontalSlope: 0.75, frontalBreadth: 0.62, parietalBossing: 0, maxBreadthHeight: 0.12, occipitalBun: 0.2,
      occipitalAngulation: 0.85, sagittalKeel: 0.7, nuchalTorus: 0.006, mastoidSize: 0.9, foramenMagnumZ: 0.002,
      browRidge: 0.01, browContinuous: 0.95, browProjection: 0.014, faceHeight: 0.08, faceWidth: 0.14,
      midfaceProjection: 0.006, prognathism: 0.014, orbitWidth: 0.042, orbitHeight: 0.036, orbitShape: 0.7,
      nasalWidth: 0.03, nasalHeight: 0.055, zygomaticFlare: 0.3, zygomaticRetreat: 0.2, cheekHeight: 0.026,
      arcadeWidth: 0.068, arcadeFront: 0.04, arcadeSquareness: 0.35, incisorSize: 0.0095, canineSize: 0.009,
      canineHeight: 0.011, premolarSize: 0.008, molarSize: 0.0122, chin: 0, mandibleHeight: 0.034,
      mandibleThickness: 0.017, ramusWidth: 0.04, gonialFlare: 0.4, retromolarSpace: 0.002,
    }),
    body: body({
      stature: 1.72, humerus: 0.32, radius: 0.255, femur: 0.47, tibia: 0.39, handLength: 0.19, footLength: 0.26,
      shoulderWidth: 0.38, pelvisWidth: 0.27, hipJointWidth: 0.17, chestWidth: 0.28, chestDepth: 0.2, thoraxFunnel: 0,
      robusticity: 1.15, cortical: 0.5, iliacFlare: 0.5, iliacHeight: 0.125, iliacOrientation: 0.9,
      femoralNeck: 0.06, femoralHead: 0.023, bicondylar: 9, lordosis: 0.9, footArch: 0.9, thumbLength: 0.95,
      glenoidTilt: 2, clavicleLength: 0.145,
    }),
  },
  'homo-heidelbergensis': {
    skull: skull({
      vaultLength: 0.208, vaultBreadth: 0.145, vaultHeight: 0.105, vaultThickness: 0.009, porionFraction: 0.49,
      frontalSlope: 0.65, frontalBreadth: 0.68, parietalBossing: 0.2, maxBreadthHeight: 0.35, occipitalBun: 0.2,
      occipitalAngulation: 0.5, sagittalKeel: 0.3, nuchalTorus: 0.006, mastoidSize: 1, foramenMagnumZ: 0.002,
      browRidge: 0.012, browContinuous: 0.6, browProjection: 0.016, faceHeight: 0.09, faceWidth: 0.15,
      midfaceProjection: 0.008, prognathism: 0.012, orbitWidth: 0.046, orbitHeight: 0.038, orbitShape: 0.6,
      nasalWidth: 0.034, nasalHeight: 0.062, zygomaticFlare: 0.2, zygomaticRetreat: 0.4, cheekHeight: 0.028,
      arcadeWidth: 0.07, arcadeFront: 0.042, arcadeSquareness: 0.4, incisorSize: 0.0095, canineSize: 0.009,
      canineHeight: 0.011, premolarSize: 0.008, molarSize: 0.0118, chin: 0.05, mandibleHeight: 0.036,
      mandibleThickness: 0.016, ramusWidth: 0.04, gonialFlare: 0.4, retromolarSpace: 0.004,
    }),
    body: body({
      stature: 1.75, humerus: 0.33, radius: 0.25, femur: 0.48, tibia: 0.39, handLength: 0.19, footLength: 0.27,
      shoulderWidth: 0.41, pelvisWidth: 0.3, hipJointWidth: 0.18, chestWidth: 0.31, chestDepth: 0.22,
      thoraxFunnel: 0.05, robusticity: 1.25, cortical: 0.48, iliacFlare: 0.55, iliacHeight: 0.13,
      iliacOrientation: 0.9, femoralNeck: 0.06, femoralHead: 0.025, femurBow: 0.008, lordosis: 0.85, footArch: 0.9,
      clavicleLength: 0.155,
    }),
  },
  'homo-neanderthalensis': {
    skull: skull({
      vaultLength: 0.205, vaultBreadth: 0.152, vaultHeight: 0.11, vaultThickness: 0.0075, porionFraction: 0.46,
      frontalSlope: 0.55, frontalBreadth: 0.72, parietalBossing: 0.2, maxBreadthHeight: 0.45, occipitalBun: 0.85,
      occipitalAngulation: 0.15, nuchalTorus: 0.003, mastoidSize: 0.7, foramenMagnumZ: 0, browRidge: 0.0095,
      browContinuous: 0.45, browProjection: 0.012, faceHeight: 0.088, faceWidth: 0.145, midfaceProjection: 0.014,
      prognathism: 0.01, orbitWidth: 0.044, orbitHeight: 0.04, orbitShape: 0.2, nasalWidth: 0.034,
      nasalHeight: 0.06, zygomaticFlare: 0, zygomaticRetreat: 0.85, cheekHeight: 0.024, arcadeWidth: 0.066,
      arcadeFront: 0.04, arcadeSquareness: 0.3, incisorSize: 0.0095, canineSize: 0.0085, canineHeight: 0.01,
      premolarSize: 0.0075, molarSize: 0.011, chin: 0.05, mandibleHeight: 0.036, mandibleThickness: 0.015,
      ramusWidth: 0.038, gonialFlare: 0.2, retromolarSpace: 0.008,
    }),
    body: body({
      stature: 1.66, humerus: 0.315, radius: 0.235, femur: 0.445, tibia: 0.35, handLength: 0.19, footLength: 0.255,
      shoulderWidth: 0.42, pelvisWidth: 0.31, hipJointWidth: 0.185, chestWidth: 0.33, chestDepth: 0.23,
      thoraxFunnel: 0.1, robusticity: 1.3, cortical: 0.48, iliacFlare: 0.55, iliacHeight: 0.12,
      iliacOrientation: 0.9, femoralNeck: 0.05, femoralHead: 0.026, femurBow: 0.012, lordosis: 0.6, kyphosis: 0.9,
      halluxAbduction: 4, footArch: 0.9, fingerCurvature: 0.08, clavicleLength: 0.16,
    }),
  },
  denisovans: {
    skull: skull({
      vaultLength: 0.221, vaultBreadth: 0.156, vaultHeight: 0.11, vaultThickness: 0.009, porionFraction: 0.49,
      frontalSlope: 0.7, frontalBreadth: 0.66, parietalBossing: 0.15, maxBreadthHeight: 0.3, occipitalBun: 0.25,
      occipitalAngulation: 0.4, sagittalKeel: 0.2, nuchalTorus: 0.006, mastoidSize: 0.9, foramenMagnumZ: 0.002,
      browRidge: 0.013, browContinuous: 0.7, browProjection: 0.016, faceHeight: 0.092, faceWidth: 0.155,
      midfaceProjection: 0.006, prognathism: 0.01, orbitWidth: 0.048, orbitHeight: 0.04, orbitShape: 0.85,
      nasalWidth: 0.036, nasalHeight: 0.064, zygomaticFlare: 0.25, zygomaticRetreat: 0.3, cheekHeight: 0.03,
      arcadeWidth: 0.074, arcadeFront: 0.044, arcadeSquareness: 0.45, incisorSize: 0.0098, canineSize: 0.0092,
      canineHeight: 0.011, premolarSize: 0.0085, molarSize: 0.0135, chin: 0, mandibleHeight: 0.038,
      mandibleThickness: 0.019, ramusWidth: 0.042, gonialFlare: 0.4, retromolarSpace: 0.006,
    }),
    body: body({
      stature: 1.65, humerus: 0.32, radius: 0.24, femur: 0.45, tibia: 0.36, handLength: 0.19, footLength: 0.26,
      shoulderWidth: 0.42, pelvisWidth: 0.31, hipJointWidth: 0.185, chestWidth: 0.33, chestDepth: 0.23,
      thoraxFunnel: 0.1, robusticity: 1.3, cortical: 0.48, iliacFlare: 0.55, iliacHeight: 0.12, iliacOrientation: 0.9,
      femoralNeck: 0.05, femoralHead: 0.025, femurBow: 0.01, lordosis: 0.7, clavicleLength: 0.158,
    }),
  },
  'homo-floresiensis': {
    skull: skull({
      vaultLength: 0.15, vaultBreadth: 0.124, vaultHeight: 0.082, vaultThickness: 0.0075, porionFraction: 0.5,
      frontalSlope: 0.6, frontalBreadth: 0.7, parietalBossing: 0.1, maxBreadthHeight: 0.3, occipitalBun: 0.1,
      occipitalAngulation: 0.6, sagittalKeel: 0.2, nuchalTorus: 0.003, mastoidSize: 0.7, foramenMagnumZ: 0.002,
      browRidge: 0.006, browContinuous: 0.6, browProjection: 0.007, faceHeight: 0.06, faceWidth: 0.11,
      prognathism: 0.01, orbitWidth: 0.034, orbitHeight: 0.03, nasalWidth: 0.022, nasalHeight: 0.04,
      zygomaticFlare: 0.2, zygomaticRetreat: 0.2, cheekHeight: 0.018, arcadeWidth: 0.054, arcadeFront: 0.032,
      arcadeSquareness: 0.35, incisorSize: 0.0075, canineSize: 0.0072, canineHeight: 0.0085, premolarSize: 0.0074,
      molarSize: 0.0105, chin: 0, mandibleHeight: 0.03, mandibleThickness: 0.016, ramusWidth: 0.03,
      retromolarSpace: 0.002,
    }),
    body: body({
      stature: 1.06, humerus: 0.243, radius: 0.18, femur: 0.28, tibia: 0.235, handLength: 0.12, footLength: 0.196,
      shoulderWidth: 0.25, pelvisWidth: 0.22, hipJointWidth: 0.12, chestWidth: 0.2, chestDepth: 0.15,
      thoraxFunnel: 0.4, robusticity: 1.1, cortical: 0.45, iliacFlare: 0.8, iliacHeight: 0.085,
      iliacOrientation: 0.75, femoralNeck: 0.04, femoralHead: 0.016, bicondylar: 9, femurBow: 0.004, footArch: 0.2,
      fingerCurvature: 0.2, thumbLength: 0.9, glenoidTilt: 4, clavicleLength: 0.1,
    }),
  },
  'homo-luzonensis': {
    skull: skull({
      vaultLength: 0.15, vaultBreadth: 0.122, vaultHeight: 0.085, vaultThickness: 0.007, porionFraction: 0.5,
      frontalSlope: 0.6, frontalBreadth: 0.7, parietalBossing: 0.15, maxBreadthHeight: 0.35, occipitalAngulation: 0.5,
      nuchalTorus: 0.003, mastoidSize: 0.7, foramenMagnumZ: 0.002, browRidge: 0.0055, browContinuous: 0.55,
      browProjection: 0.007, faceHeight: 0.058, faceWidth: 0.108, prognathism: 0.008, orbitWidth: 0.034,
      orbitHeight: 0.03, nasalWidth: 0.022, nasalHeight: 0.04, arcadeWidth: 0.052, arcadeFront: 0.032,
      arcadeSquareness: 0.3, incisorSize: 0.0075, canineSize: 0.007, canineHeight: 0.0082, premolarSize: 0.008,
      molarSize: 0.009, chin: 0, mandibleHeight: 0.028, mandibleThickness: 0.015, ramusWidth: 0.03,
    }),
    body: body({
      stature: 1.1, humerus: 0.245, radius: 0.185, femur: 0.29, tibia: 0.24, handLength: 0.125, footLength: 0.19,
      shoulderWidth: 0.26, pelvisWidth: 0.22, hipJointWidth: 0.122, chestWidth: 0.2, chestDepth: 0.15,
      thoraxFunnel: 0.4, robusticity: 1.05, cortical: 0.42, iliacFlare: 0.7, iliacHeight: 0.088,
      iliacOrientation: 0.8, femoralNeck: 0.04, femoralHead: 0.016, footArch: 0.4, fingerCurvature: 0.6,
      glenoidTilt: 6, clavicleLength: 0.1,
    }),
  },
  'homo-naledi': {
    skull: skull({
      vaultLength: 0.16, vaultBreadth: 0.125, vaultHeight: 0.09, vaultThickness: 0.006, porionFraction: 0.51,
      frontalSlope: 0.55, frontalBreadth: 0.68, parietalBossing: 0.25, maxBreadthHeight: 0.4, occipitalBun: 0.05,
      occipitalAngulation: 0.3, sagittalKeel: 0.4, nuchalTorus: 0.004, mastoidSize: 0.9, foramenMagnumZ: 0.004,
      browRidge: 0.0065, browContinuous: 0.5, browProjection: 0.008, faceHeight: 0.062, faceWidth: 0.118,
      prognathism: 0.008, orbitWidth: 0.036, orbitHeight: 0.032, nasalWidth: 0.024, nasalHeight: 0.044,
      zygomaticFlare: 0.15, zygomaticRetreat: 0.25, cheekHeight: 0.02, arcadeWidth: 0.056, arcadeFront: 0.034,
      arcadeSquareness: 0.3, incisorSize: 0.0078, canineSize: 0.0072, canineHeight: 0.0085, premolarSize: 0.0068,
      molarSize: 0.01, chin: 0.05, mandibleHeight: 0.028, mandibleThickness: 0.014, ramusWidth: 0.032,
    }),
    body: body({
      stature: 1.44, humerus: 0.27, radius: 0.21, femur: 0.39, tibia: 0.33, handLength: 0.16, footLength: 0.21,
      shoulderWidth: 0.32, pelvisWidth: 0.25, hipJointWidth: 0.145, chestWidth: 0.25, chestDepth: 0.18,
      thoraxFunnel: 0.5, robusticity: 0.9, cortical: 0.38, iliacFlare: 0.75, iliacHeight: 0.1, iliacOrientation: 0.8,
      femoralNeck: 0.055, femoralHead: 0.019, halluxAbduction: 3, footArch: 0.6, fingerCurvature: 0.55,
      thumbLength: 1.05, glenoidTilt: 8, clavicleLength: 0.12,
    }),
  },
  'homo-sapiens': { skull: skull({}), body: body({}) },
};

function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Linear blend of two parameter sets (used by the morph slider). Discrete fields snap at t = 0.5. */
export function blendParams(a: MorphParams, b: MorphParams, t: number): MorphParams {
  const skullOut = {} as Record<string, number>;
  for (const k of Object.keys(a.skull) as (keyof SkullParams)[]) {
    skullOut[k] = lerpNum(a.skull[k], b.skull[k], t);
  }
  const bodyOut = { ...(t < 0.5 ? a.body : b.body) } as BodyParams;
  for (const k of Object.keys(a.body) as (keyof BodyParams)[]) {
    const va = a.body[k];
    const vb = b.body[k];
    if (typeof va === 'number' && typeof vb === 'number') {
      (bodyOut as unknown as Record<string, number>)[k] = lerpNum(va, vb, t);
    }
  }
  return { skull: skullOut as unknown as SkullParams, body: bodyOut };
}

export function presetFor(id: SpeciesId): MorphParams {
  return PRESETS[id];
}
