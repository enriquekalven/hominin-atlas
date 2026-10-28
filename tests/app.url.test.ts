import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE } from '../src/app/store';
import { parseUrlQuery, serializeUrlQuery } from '../src/app/url';
import { SPECIES } from '../src/data';

describe('URL deep-link parser and serializer (src/app/url.ts)', () => {
  it('parses all documented README deep links accurately', () => {
    const q1 = parseUrlQuery(
      '?species=homo-neanderthalensis&audience=clinician&panel=injuries&lesion=shanidar-1-left-orbit',
      SPECIES,
    );
    expect(q1).toMatchObject({
      speciesId: 'homo-neanderthalensis',
      audience: 'clinician',
      panel: 'injuries',
      selectedLesionId: 'shanidar-1-left-orbit',
      selectedBoneId: 'cranium',
    });

    const q2 = parseUrlQuery('?species=homo-floresiensis&audience=kids&mode=bone&frame=skull', SPECIES);
    expect(q2).toEqual({
      speciesId: 'homo-floresiensis',
      audience: 'kids',
      renderMode: 'bone',
      framing: 'skull',
    });

    const q3 = parseUrlQuery('?species=australopithecus-afarensis&compare=homo-sapiens&cmode=side-by-side', SPECIES);
    expect(q3).toEqual({
      speciesId: 'australopithecus-afarensis',
      compareSpeciesId: 'homo-sapiens',
      compareMode: 'side-by-side',
    });

    const q4 = parseUrlQuery('?species=homo-sapiens&lineup=1&flesh=1', SPECIES);
    expect(q4).toEqual({
      speciesId: 'homo-sapiens',
      lineup: true,
      showFlesh: true,
    });
  });

  it('rejects unknown species, cross-species lesions, and malicious payloads', () => {
    const bad = parseUrlQuery(
      '?species=<script>alert(1)</script>&audience=admin&mode=wireframe&lesion=al-288-1-femur&compare=homo-neanderthalensis',
      SPECIES,
    );
    // Default fallback species is homo-neanderthalensis, so compare=homo-neanderthalensis (self) and Lucy's lesion are rejected.
    expect(bad).toEqual({});
  });

  it('auto-selects secondary specimen when deep-linking to one of its lesions', () => {
    const neand = SPECIES.find((s) => s.id === 'homo-neanderthalensis')!;
    const secondary = neand.specimens.find((sp) => sp.id !== neand.specimens[0].id && sp.lesions.length > 0);
    if (secondary) {
      const lesion = secondary.lesions[0];
      const parsed = parseUrlQuery(`?species=homo-neanderthalensis&lesion=${lesion.id}`, SPECIES);
      expect(parsed.specimenId).toBe(secondary.id);
      expect(parsed.selectedLesionId).toBe(lesion.id);
      expect(parsed.selectedBoneId).toBe(lesion.bone);
    }
  });

  it('round-trips non-default state through serializeUrlQuery and parseUrlQuery', () => {
    const custom = {
      ...DEFAULT_STATE,
      speciesId: 'paranthropus-boisei' as const,
      audience: 'clinician' as const,
      renderMode: 'xray' as const,
      framing: 'skull' as const,
      showFlesh: true,
      panel: 'specimens' as const,
    };
    const qs = serializeUrlQuery(custom);
    expect(qs).toContain('species=paranthropus-boisei');
    expect(qs).toContain('audience=clinician');
    expect(qs).toContain('mode=xray');
    expect(qs).toContain('frame=skull');
    expect(qs).toContain('flesh=1');
    const back = parseUrlQuery(qs, SPECIES);
    expect(back).toMatchObject({
      speciesId: 'paranthropus-boisei',
      audience: 'clinician',
      renderMode: 'xray',
      framing: 'skull',
      showFlesh: true,
      panel: 'specimens',
    });
  });
});
