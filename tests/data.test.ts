/**
 * Scientific data integrity tests (enforcing docs/CONTRACT.md and src/data/types.ts).
 */
import { describe, expect, it } from 'vitest';
import { isBoneId, isBoneRef } from '../src/anatomy/bones';
import { anchorsForBone, isValidFdi } from '../src/anatomy/sites';
import {
  CITATION_MAP,
  GLOSSARY,
  PALEOECOLOGY,
  PHYLOGENY_HYPOTHESES,
  QUIZ,
  SPECIES,
  applyPhylogenyHypothesis,
  citationHref,
  flagshipSpecimen,
} from '../src/data';
import { SPECIES_IDS } from '../src/data/types';

describe('Hominin Atlas scientific dataset', () => {
  it('covers all 21 canonical SPECIES_IDS with unique ids', () => {
    expect(SPECIES_IDS.length).toBe(21);
    const ids = SPECIES.map((s) => s.id);
    expect(new Set(ids).size).toBe(SPECIES_IDS.length);
    for (const id of SPECIES_IDS) {
      expect(ids).toContain(id);
    }
  });

  it('enforces valid geological ranges and null-honest measurements (never 0)', () => {
    for (const sp of SPECIES) {
      expect(sp.rangeKa.start).toBeGreaterThanOrEqual(sp.rangeKa.end);
      expect(sp.rangeKa.end).toBeGreaterThanOrEqual(0);
      if (sp.status === 'living') expect(sp.rangeKa.end).toBe(0);
      for (const m of [sp.brainCc, sp.statureCm, sp.massKg]) {
        for (const v of [m.best, m.min, m.max]) {
          if (v !== null) expect(v).toBeGreaterThan(0);
        }
      }
    }
  });

  it('gives every species at least one specimen and exactly one flagship specimen', () => {
    const seenSpecimenIds = new Set<string>();
    for (const sp of SPECIES) {
      expect(sp.specimens.length).toBeGreaterThan(0);
      const flagships = sp.specimens.filter((x) => x.isFlagship);
      expect(flagships.length).toBe(1);
      expect(flagshipSpecimen(sp)).toBeDefined();

      for (const spec of sp.specimens) {
        expect(seenSpecimenIds.has(spec.id)).toBe(false);
        seenSpecimenIds.add(spec.id);
        expect(spec.site.lat).toBeGreaterThanOrEqual(-90);
        expect(spec.site.lat).toBeLessThanOrEqual(90);
        expect(spec.site.lon).toBeGreaterThanOrEqual(-180);
        expect(spec.site.lon).toBeLessThanOrEqual(180);
        for (const hex of spec.taphonomy.colors) {
          expect(hex).toMatch(/^#[0-9a-fA-F]{6}$/);
        }
        for (const ref of [...spec.completeness.found, ...spec.completeness.partial]) {
          expect(isBoneRef(ref)).toBe(true);
        }
      }
    }
  });

  it('validates every lesion bone, anchor/site, evidence debateNote, and citation link', () => {
    const seenLesions = new Set<string>();
    for (const sp of SPECIES) {
      for (const spec of sp.specimens) {
        for (const l of spec.lesions) {
          expect(seenLesions.has(l.id)).toBe(false);
          seenLesions.add(l.id);
          expect(isBoneId(l.bone)).toBe(true);

          if (l.site.anchor) {
            expect(anchorsForBone(l.bone)).toContain(l.site.anchor);
          }
          if (l.site.t !== undefined) {
            expect(l.site.t).toBeGreaterThanOrEqual(0);
            expect(l.site.t).toBeLessThanOrEqual(1);
          }
          if (l.site.teeth) {
            for (const code of l.site.teeth) expect(isValidFdi(code)).toBe(true);
          }
          if (l.evidence === 'debated') {
            expect(l.debateNote && l.debateNote.trim().length > 10).toBe(true);
          }
          expect(l.citations.length).toBeGreaterThan(0);
          for (const cid of l.citations) {
            const c = CITATION_MAP.get(cid);
            expect(c, `missing citation ${cid} on lesion ${l.id}`).toBeDefined();
            expect(citationHref(c!)).not.toBeNull();
          }
        }
      }
    }
  });

  it('enforces 100% DOI / archival publisher URLs (zero Google Scholar search links), paleoecology, and acyclic phylogenies', () => {
    for (const [, c] of CITATION_MAP) {
      const href = citationHref(c);
      expect(href, `citation ${c.id} missing valid href`).not.toBeNull();
      expect(href!).not.toContain('scholar.google.com');
    }

    for (const sp of SPECIES) {
      const eco = PALEOECOLOGY[sp.id];
      expect(eco, `missing paleoecology for ${sp.id}`).toBeDefined();
      expect(eco.dietIsotope.clinician.length).toBeGreaterThan(8);
      expect(eco.lithicMode.clinician.length).toBeGreaterThan(8);
    }

    for (const hyp of PHYLOGENY_HYPOTHESES) {
      const modeled = applyPhylogenyHypothesis(SPECIES, hyp.id);
      const byId = new Map(modeled.map((s) => [s.id, s]));
      for (const sp of modeled) {
        const seen = new Set<string>([sp.id]);
        let cur = sp.ancestry.parent;
        while (cur) {
          expect(seen.has(cur), `cycle in ${hyp.id} starting at ${sp.id}`).toBe(false);
          seen.add(cur);
          const parentSp = byId.get(cur);
          expect(parentSp, `unknown parent ${cur} in ${hyp.id}`).toBeDefined();
          cur = parentSp!.ancestry.parent;
        }
      }
    }
  });

  it('provides non-empty glossary and quiz banks with valid answer indices', () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(15);
    expect(QUIZ.length).toBeGreaterThanOrEqual(10);
    for (const q of QUIZ) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.answers.length);
    }
  });

  it('catches negative fixtures: 0 measurement, unknown boneId, debated lesion without debateNote, and missing citation', () => {
    const auditRecord = (sample: {
      measureBest: number | null;
      bone: string;
      evidence: 'established' | 'probable' | 'debated';
      debateNote?: string;
      citationId: string;
    }): string[] => {
      const errs: string[] = [];
      if (sample.measureBest !== null && sample.measureBest <= 0) errs.push('zero-measure');
      if (!isBoneId(sample.bone)) errs.push('unknown-bone');
      if (sample.evidence === 'debated' && (!sample.debateNote || sample.debateNote.trim().length < 10)) {
        errs.push('missing-debate-note');
      }
      if (!CITATION_MAP.has(sample.citationId)) errs.push('missing-citation');
      return errs;
    };

    expect(
      auditRecord({
        measureBest: 0,
        bone: 'not_a_real_bone',
        evidence: 'debated',
        debateNote: '',
        citationId: 'nonexistent-1999',
      }),
    ).toEqual(['zero-measure', 'unknown-bone', 'missing-debate-note', 'missing-citation']);
  });
});
