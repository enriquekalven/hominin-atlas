/**
 * Read-only data access helpers. The records themselves live in ./species/*, ./citations.ts,
 * ./glossary.ts, ./quiz.ts, ./ecology.ts, and ./phylogeny.ts (owned by the data curator).
 */
import type { Citation, Lesion, Species, SpeciesId, Specimen } from './types';
import { SPECIES_LIST } from './species';
import { CITATIONS } from './citations';

export { GLOSSARY } from './glossary';
export { QUIZ } from './quiz';
export { PALEOECOLOGY, type PaleoecologyEntry } from './ecology';
export {
  PHYLOGENY_HYPOTHESES,
  applyPhylogenyHypothesis,
  getPhylogenyHypothesis,
  type PhylogenyHypothesis,
  type PhylogenyHypothesisId,
} from './phylogeny';

/** All taxa: the living outgroups first, then hominins by oldest first appearance. */
export const SPECIES: readonly Species[] = [...SPECIES_LIST].sort((a, b) => {
  const pa = a.group === 'living-relative' ? 0 : 1;
  const pb = b.group === 'living-relative' ? 0 : 1;
  return pa - pb || b.rangeKa.start - a.rangeKa.start;
});

export const CITATION_MAP: ReadonlyMap<string, Citation> = new Map(CITATIONS.map((c) => [c.id, c]));

export function getSpecies(id: SpeciesId): Species | undefined {
  return SPECIES.find((s) => s.id === id);
}

export function getCitation(id: string): Citation | undefined {
  return CITATION_MAP.get(id);
}

export function flagshipSpecimen(species: Species): Specimen | undefined {
  return species.specimens.find((s) => s.isFlagship) ?? species.specimens[0];
}

export function getSpecimen(species: Species, specimenId: string | null): Specimen | undefined {
  if (specimenId) {
    const found = species.specimens.find((s) => s.id === specimenId);
    if (found) return found;
  }
  return flagshipSpecimen(species);
}

export interface LesionRef {
  species: Species;
  specimen: Specimen;
  lesion: Lesion;
}

export function findLesion(lesionId: string): LesionRef | undefined {
  for (const species of SPECIES) {
    for (const specimen of species.specimens) {
      const lesion = specimen.lesions.find((l) => l.id === lesionId);
      if (lesion) return { species, specimen, lesion };
    }
  }
  return undefined;
}

/** Safe external link for a citation (DOI resolver or https URL), or null. */
export function citationHref(c: Citation): string | null {
  if (c.doi && /^10\.\d{4,9}\/\S+$/.test(c.doi)) return `https://doi.org/${encodeURI(c.doi)}`;
  if (c.url && /^https:\/\/[^\s]+$/.test(c.url)) return c.url;
  return null;
}
