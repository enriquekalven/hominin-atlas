/**
 * Data contract for the Hominin Atlas.
 *
 * Rules every record must follow (enforced by tests/data.test.ts):
 * - No fabrication: unknown numbers are `null`, never 0 or a guess. Unknown text is `null`.
 * - Every lesion cites at least one source and carries an evidence level.
 *   `debated` lesions must explain the debate in `debateNote`.
 * - Kids text: short sentences, roughly a 9-year-old reading level, no gore.
 * - Clinician text: precise anatomical terms; say what is measured vs. inferred.
 * - Ages are in thousands of years ago (ka). 1 Ma = 1000 ka.
 */
import type { BoneId, BoneRef } from '../anatomy/bones';
import type { LesionSite } from '../anatomy/sites';

export type Audience = 'kids' | 'clinician';

export interface DualText {
  kids: string;
  clinician: string;
}

export type SpeciesId =
  | 'pan-troglodytes'
  | 'sahelanthropus-tchadensis'
  | 'ardipithecus-ramidus'
  | 'australopithecus-afarensis'
  | 'australopithecus-africanus'
  | 'australopithecus-sediba'
  | 'paranthropus-boisei'
  | 'paranthropus-robustus'
  | 'homo-habilis'
  | 'homo-erectus'
  | 'homo-heidelbergensis'
  | 'homo-neanderthalensis'
  | 'denisovans'
  | 'homo-floresiensis'
  | 'homo-luzonensis'
  | 'homo-naledi'
  | 'homo-sapiens';

export const SPECIES_IDS: readonly SpeciesId[] = [
  'pan-troglodytes',
  'sahelanthropus-tchadensis',
  'ardipithecus-ramidus',
  'australopithecus-afarensis',
  'australopithecus-africanus',
  'australopithecus-sediba',
  'paranthropus-boisei',
  'paranthropus-robustus',
  'homo-habilis',
  'homo-erectus',
  'homo-heidelbergensis',
  'homo-neanderthalensis',
  'denisovans',
  'homo-floresiensis',
  'homo-luzonensis',
  'homo-naledi',
  'homo-sapiens',
];

export interface Citation {
  /** Stable key, e.g. 'kappelman2016'. Referenced from species, specimens and lesions. */
  id: string;
  authors: string;
  year: number;
  title: string;
  journal: string | null;
  /** Bare DOI such as '10.1038/nature19332' (no https:// prefix). */
  doi: string | null;
  /** https:// URL when there is no DOI. */
  url: string | null;
}

export type EvidenceLevel = 'established' | 'probable' | 'debated';

export type LesionKind =
  | 'healed-fracture'
  | 'unhealed-fracture'
  | 'postmortem-break'
  | 'depressed-fracture'
  | 'puncture'
  | 'bite-marks'
  | 'cut-marks'
  | 'projectile-wound'
  | 'osteoarthritis'
  | 'infection'
  | 'tumor'
  | 'developmental'
  | 'dental-disease'
  | 'tooth-loss'
  | 'atrophy'
  | 'exostosis'
  | 'spinal-pathology'
  | 'amputation'
  | 'deformation';

export const LESION_KINDS: readonly LesionKind[] = [
  'healed-fracture',
  'unhealed-fracture',
  'postmortem-break',
  'depressed-fracture',
  'puncture',
  'bite-marks',
  'cut-marks',
  'projectile-wound',
  'osteoarthritis',
  'infection',
  'tumor',
  'developmental',
  'dental-disease',
  'tooth-loss',
  'atrophy',
  'exostosis',
  'spinal-pathology',
  'amputation',
  'deformation',
];

/** Kid-friendly and clinical labels for each lesion kind (used by legend + filters). */
export const LESION_KIND_LABEL: Record<LesionKind, DualText> = {
  'healed-fracture': { kids: 'Broken bone that healed', clinician: 'Healed (antemortem) fracture' },
  'unhealed-fracture': { kids: 'Broken bone (did not heal)', clinician: 'Unhealed fracture (perimortem)' },
  'postmortem-break': { kids: 'Broken after death', clinician: 'Postmortem (taphonomic) break' },
  'depressed-fracture': { kids: 'Dent in the skull', clinician: 'Depressed cranial fracture' },
  puncture: { kids: 'Holes from teeth or claws', clinician: 'Puncture lesion' },
  'bite-marks': { kids: 'Bite marks', clinician: 'Carnivore/crocodylian tooth marks' },
  'cut-marks': { kids: 'Stone-tool scratches', clinician: 'Lithic cut marks' },
  'projectile-wound': { kids: 'Weapon wound', clinician: 'Projectile / sharp-force wound' },
  osteoarthritis: { kids: 'Worn-out joint', clinician: 'Osteoarthritis / degenerative joint disease' },
  infection: { kids: 'Bone infection', clinician: 'Infectious / inflammatory lesion' },
  tumor: { kids: 'Bone lump (tumor)', clinician: 'Neoplasm' },
  developmental: { kids: 'Grew differently', clinician: 'Developmental / congenital condition' },
  'dental-disease': { kids: 'Tooth problem', clinician: 'Dental pathology' },
  'tooth-loss': { kids: 'Lost teeth', clinician: 'Antemortem tooth loss' },
  atrophy: { kids: 'Weak, thin bone', clinician: 'Disuse atrophy' },
  exostosis: { kids: 'Extra bone growth', clinician: 'Exostosis / heterotopic ossification' },
  'spinal-pathology': { kids: 'Back problem', clinician: 'Spinal pathology' },
  amputation: { kids: 'Missing part of a limb', clinician: 'Amputation / loss of distal segment' },
  deformation: { kids: 'Squashed in the ground', clinician: 'Taphonomic deformation' },
};

export type Healing = 'none' | 'early' | 'advanced' | 'remodeled';
export type Timing = 'antemortem' | 'perimortem' | 'postmortem' | 'unknown';

/** Optional hints for how the 3D engine sculpts the lesion. All values have sensible defaults. */
export interface LesionRender {
  /** 0..1 overall size / intensity. Default 0.5. */
  severity?: number;
  /** Malunion angulation in degrees for healed fractures. */
  angulationDeg?: number;
  /** Fragment displacement in mm. */
  displacementMm?: number;
  /** Radius of a depression, puncture or lesion area in mm. */
  radiusMm?: number;
  /** Number of punctures / tooth marks / cut marks. */
  count?: number;
  /** Spacing between punctures in mm (e.g. distance between carnivore canines). */
  spacingMm?: number;
  pattern?: 'transverse' | 'oblique' | 'spiral' | 'comminuted' | 'compression' | 'greenstick';
}

export interface Lesion {
  /** Unique across the whole dataset, kebab-case: '<specimen>-<what>' e.g. 'shanidar-1-right-humerus'. */
  id: string;
  kind: LesionKind;
  bone: BoneId;
  site: LesionSite;
  timing: Timing;
  healing: Healing | null;
  title: DualText;
  summary: DualText;
  clinical: {
    morphology: string;
    differential: string[];
    modernAnalogue: string | null;
    functionalImpact: string | null;
    survivalInterval: string | null;
  };
  evidence: EvidenceLevel;
  debateNote: string | null;
  citations: string[];
  render?: LesionRender;
}

export interface FossilSite {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export interface Range {
  best: number | null;
  min: number | null;
  max: number | null;
}

export interface Specimen {
  /** kebab-case unique id, e.g. 'al-288-1'. */
  id: string;
  /** Official catalogue number, e.g. 'A.L. 288-1'. */
  catalog: string;
  nickname: string | null;
  site: FossilSite;
  /** Geological age in ka, plus the dating method(s) used. */
  ageKa: Range & { method: string | null };
  sex: 'female' | 'male' | 'unknown';
  ageAtDeath: string | null;
  discovery: { year: number | null; by: string | null };
  completeness: {
    /** Fraction of the skeleton recovered in percent, only if published. */
    percent: number | null;
    /** Bones (or groups) recovered in reasonably complete condition. */
    found: BoneRef[];
    /** Bones (or groups) represented only by fragments. */
    partial: BoneRef[];
  };
  story: DualText;
  /** Colors of the actual fossil (hex): [base, mottling, dark stains], plus an optional note. */
  taphonomy: { colors: [string, string, string]; note: string | null };
  lesions: Lesion[];
  citations: string[];
  /** The specimen shown by default for its species. Exactly one per species. */
  isFlagship: boolean;
}

export type CladeGroup =
  | 'living-relative'
  | 'early-hominin'
  | 'australopith'
  | 'paranthropus'
  | 'early-homo'
  | 'archaic-homo'
  | 'island-homo'
  | 'modern-human';

export interface Species {
  id: SpeciesId;
  /** Formal name, italicised in the UI, e.g. 'Homo neanderthalensis'. Denisovans: 'Homo sp. (Denisovans)'. */
  binomial: string;
  common: DualText;
  nickname: string | null;
  group: CladeGroup;
  status: 'extinct' | 'living';
  /** First and last appearance in ka (start > end). Living species use end = 0. */
  rangeKa: { start: number; end: number };
  regions: string[];
  brainCc: Range;
  statureCm: Range;
  massKg: Range;
  locomotion: DualText;
  diet: DualText;
  technology: DualText;
  overview: DualText;
  keyTraits: { kids: string[]; clinician: string[] };
  funFacts: string[];
  ancestry: { parent: SpeciesId | null; uncertain: boolean; note: string | null };
  geneFlow: SpeciesId[];
  specimens: Specimen[];
  citations: string[];
}

export interface GlossaryTerm {
  term: string;
  kids: string;
  clinician: string;
}

export interface QuizQuestion {
  id: string;
  audience: 'kids' | 'clinician' | 'both';
  prompt: string;
  answers: string[];
  correctIndex: number;
  explanation: string;
  speciesId: SpeciesId | null;
}
