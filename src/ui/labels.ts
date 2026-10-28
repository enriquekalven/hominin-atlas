/**
 * Audience-dependent UI vocabulary. Kids labels are plain words; clinician labels are precise.
 * Data-owned labels (e.g. LESION_KIND_LABEL) stay in src/data; only UI chrome lives here.
 */
import type { Panel, RenderMode } from '../app/store';
import type { Audience, CladeGroup, DualText, EvidenceLevel, Healing, Timing } from '../data/types';

export function pick(text: DualText, audience: Audience): string {
  return audience === 'kids' ? text.kids : text.clinician;
}

export const GROUP_LABEL: Record<CladeGroup, DualText> = {
  'living-relative': { kids: 'Living cousins', clinician: 'Living relative (outgroup)' },
  'early-hominin': { kids: 'The very first', clinician: 'Earliest hominins' },
  australopith: { kids: 'Southern apes', clinician: 'Australopiths' },
  paranthropus: { kids: 'Big-jaw chewers', clinician: 'Robust australopiths' },
  'early-homo': { kids: 'Early humans', clinician: 'Early Homo' },
  'archaic-homo': { kids: 'Ancient humans', clinician: 'Archaic Homo' },
  'island-homo': { kids: 'Island humans', clinician: 'Insular Homo' },
  'modern-human': { kids: 'Modern humans (us)', clinician: 'Anatomically modern humans' },
};

export const TAB_LABEL: Record<Panel, DualText> = {
  overview: { kids: 'About', clinician: 'Overview' },
  injuries: { kids: 'Injuries', clinician: 'Pathology' },
  specimens: { kids: 'Fossils', clinician: 'Specimens' },
  compare: { kids: 'Compare', clinician: 'Compare' },
  tree: { kids: 'Family', clinician: 'Phylogeny' },
  glossary: { kids: 'Words', clinician: 'Glossary' },
};

export const PANEL_ORDER: readonly Panel[] = ['overview', 'injuries', 'specimens', 'compare', 'tree', 'glossary'];

export const EVIDENCE_LABEL: Record<EvidenceLevel, DualText> = {
  established: { kids: 'Scientists agree', clinician: 'Established' },
  probable: { kids: 'Very likely', clinician: 'Probable' },
  debated: { kids: 'Scientists disagree', clinician: 'Debated' },
};

export const EVIDENCE_HINT: Record<EvidenceLevel, string> = {
  established: 'Widely accepted in the peer-reviewed literature.',
  probable: 'Best-supported interpretation, with some uncertainty.',
  debated: 'Contested: competing interpretations are published.',
};

export const TIMING_LABEL: Record<Timing, string> = {
  antemortem: 'Antemortem (before death, with survival)',
  perimortem: 'Perimortem (around the time of death)',
  postmortem: 'Postmortem (after death)',
  unknown: 'Timing unknown',
};

export const HEALING_LABEL: Record<Healing, string> = {
  none: 'No healing',
  early: 'Early healing (woven bone / callus)',
  advanced: 'Advanced healing (consolidated callus)',
  remodeled: 'Fully remodelled',
};

export const RENDER_MODE_LABEL: Record<RenderMode, DualText> = {
  fossil: { kids: 'Fossil', clinician: 'Fossil' },
  bone: { kids: 'Clean bone', clinician: 'Clean bone' },
  xray: { kids: 'X-ray', clinician: 'Radiograph (simulated)' },
};

export const SEX_LABEL = { female: 'Female', male: 'Male', unknown: 'Unknown' } as const;

export const STAT_LABEL = {
  brain: { kids: 'Brain size', clinician: 'Endocranial volume' },
  stature: { kids: 'Height', clinician: 'Stature' },
  mass: { kids: 'Weight', clinician: 'Body mass' },
  range: { kids: 'When they lived', clinician: 'Temporal range' },
  regions: { kids: 'Where they lived', clinician: 'Geographic range' },
  locomotion: { kids: 'How they moved', clinician: 'Locomotion' },
  diet: { kids: 'What they ate', clinician: 'Diet' },
  technology: { kids: 'Tools', clinician: 'Technology' },
} satisfies Record<string, DualText>;

export const RECONSTRUCTION_CAPTION = 'Procedural 3D reconstruction — not a scan of the original fossil';
export const PORTRAIT_CAPTION = 'AI-generated artistic impression; skin, hair and eye colour are unknown';
