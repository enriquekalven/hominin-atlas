import { describe, expect, it } from 'vitest';
import type { CladeGroup, GlossaryTerm, Lesion, LesionKind, Species, SpeciesId } from '../src/data/types';
import {
  filterGlossary,
  groupLesions,
  groupSpecies,
  healingStageIndex,
  normalize,
  railOrder,
  searchSpecies,
  showsHealingTimeline,
} from '../src/ui/filters';

type Mini = Pick<Species, 'id' | 'binomial' | 'common' | 'nickname' | 'group'>;
const mk = (id: SpeciesId, binomial: string, kids: string, clinician: string, nickname: string | null, group: CladeGroup): Mini => ({
  id,
  binomial,
  common: { kids, clinician },
  nickname,
  group,
});

const LIST: Mini[] = [
  mk('pan-troglodytes', 'Pan troglodytes', 'Chimpanzees', 'Common chimpanzee', null, 'living-relative'),
  mk('australopithecus-afarensis', 'Australopithecus afarensis', 'Lucy’s kind', 'Australopithecus afarensis', 'Lucy', 'australopith'),
  mk('homo-erectus', 'Homo erectus', 'Upright humans', 'Homo erectus', null, 'early-homo'),
  mk('homo-neanderthalensis', 'Homo neanderthalensis', 'Neanderthals', 'Neanderthal', null, 'archaic-homo'),
  mk('homo-floresiensis', 'Homo floresiensis', 'Flores people', 'Flores hominin', 'The Hobbit', 'island-homo'),
  mk('denisovans', 'Homo sp. (Denisovans)', 'Denisovans', 'Denisovan', null, 'archaic-homo'),
  mk('homo-sapiens', 'Homo sapiens', 'Modern humans', 'Anatomically modern human', null, 'modern-human'),
];

describe('normalize', () => {
  it('folds case, accents and whitespace', () => {
    expect(normalize('  Ñandú   ÁRBOL ')).toBe('nandu arbol');
  });
});

describe('searchSpecies', () => {
  it('returns everything for an empty query', () => {
    expect(searchSpecies(LIST, '  ')).toHaveLength(LIST.length);
  });

  it('ranks whole-field prefixes first', () => {
    expect(searchSpecies(LIST, 'nean')[0].id).toBe('homo-neanderthalensis');
  });

  it('matches nicknames and word prefixes, ignoring accents and case', () => {
    expect(searchSpecies(LIST, 'HOBBIT').map((s) => s.id)).toEqual(['homo-floresiensis']);
    expect(searchSpecies(LIST, 'lucy')[0].id).toBe('australopithecus-afarensis');
    expect(searchSpecies(LIST, 'denísovans')[0].id).toBe('denisovans');
  });

  it('keeps dataset order among equal matches', () => {
    expect(searchSpecies(LIST, 'homo').map((s) => s.id)).toEqual([
      'homo-erectus',
      'homo-neanderthalensis',
      'homo-floresiensis',
      'denisovans',
      'homo-sapiens',
    ]);
  });

  it('returns nothing when nothing matches', () => {
    expect(searchSpecies(LIST, 'zzz')).toEqual([]);
  });
});

describe('filterGlossary', () => {
  const terms: GlossaryTerm[] = [
    { term: 'Callus', kids: 'A soft patch that becomes new bone', clinician: 'Reparative tissue bridging a fracture' },
    { term: 'Antemortem', kids: 'Before death', clinician: 'Occurring before death with evidence of healing' },
    { term: 'Fracture', kids: 'A broken bone', clinician: 'Discontinuity of bone; see callus' },
  ];

  it('sorts alphabetically with no query', () => {
    expect(filterGlossary(terms, '', 'kids').map((t) => t.term)).toEqual(['Antemortem', 'Callus', 'Fracture']);
  });

  it('puts term matches before definition matches', () => {
    expect(filterGlossary(terms, 'callus', 'clinician').map((t) => t.term)).toEqual(['Callus', 'Fracture']);
  });

  it('searches the definition of the current audience only', () => {
    expect(filterGlossary(terms, 'broken', 'kids').map((t) => t.term)).toEqual(['Fracture']);
    expect(filterGlossary(terms, 'broken', 'clinician')).toEqual([]);
  });
});

describe('groupSpecies / railOrder', () => {
  it('groups by clade in order of each group’s oldest member', () => {
    const groups = groupSpecies(LIST);
    expect(groups.map((g) => g.group)).toEqual([
      'living-relative',
      'australopith',
      'early-homo',
      'archaic-homo',
      'island-homo',
      'modern-human',
    ]);
    expect(groups[3].species.map((s) => s.id)).toEqual(['homo-neanderthalensis', 'denisovans']);
  });

  it('flattens groups for keyboard navigation', () => {
    expect(railOrder(LIST).map((s) => s.id)).toEqual([
      'pan-troglodytes',
      'australopithecus-afarensis',
      'homo-erectus',
      'homo-neanderthalensis',
      'denisovans',
      'homo-floresiensis',
      'homo-sapiens',
    ]);
  });

  it('handles an empty dataset', () => {
    expect(groupSpecies([])).toEqual([]);
  });
});

describe('lesion helpers', () => {
  const lesion = (id: string, kind: LesionKind, healing: Lesion['healing'] = null): Lesion =>
    ({ id, kind, healing }) as unknown as Lesion;

  it('groups lesions in canonical kind order', () => {
    const groups = groupLesions([
      lesion('a', 'osteoarthritis'),
      lesion('b', 'healed-fracture'),
      lesion('c', 'osteoarthritis'),
      lesion('d', 'tooth-loss'),
    ]);
    expect(groups.map((g) => g.kind)).toEqual(['healed-fracture', 'osteoarthritis', 'tooth-loss']);
    expect(groups[1].lesions.map((l) => l.id)).toEqual(['a', 'c']);
  });

  it('offers the healing timeline only for fractures with some healing', () => {
    expect(showsHealingTimeline(lesion('a', 'healed-fracture'))).toBe(true);
    expect(showsHealingTimeline(lesion('b', 'depressed-fracture', 'early'))).toBe(true);
    expect(showsHealingTimeline(lesion('c', 'unhealed-fracture', 'none'))).toBe(false);
    expect(showsHealingTimeline(lesion('d', 'depressed-fracture', null))).toBe(false);
    expect(showsHealingTimeline(lesion('e', 'osteoarthritis', 'remodeled'))).toBe(false);
  });

  it('maps the slider to the nearest healing stage', () => {
    expect(healingStageIndex(0)).toBe(0);
    expect(healingStageIndex(0.3)).toBe(1);
    expect(healingStageIndex(0.6)).toBe(2);
    expect(healingStageIndex(1)).toBe(3);
    expect(healingStageIndex(-2)).toBe(0);
    expect(healingStageIndex(Number.NaN)).toBe(3);
  });
});
