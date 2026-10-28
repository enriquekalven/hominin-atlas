import { describe, expect, it } from 'vitest';
import type { CladeGroup, Species, SpeciesId } from '../src/data/types';
import {
  KA_OLDEST,
  KA_YOUNGEST,
  TICKS,
  aliveAt,
  aliveCaption,
  aliveReadout,
  assignLanes,
  kaToT,
  tToKa,
  tickAlign,
  visibleTicks,
} from '../src/ui/timeScale';

const EMPTY = { best: null, min: null, max: null };
const TXT = { kids: '', clinician: '' };

function sp(id: SpeciesId, binomial: string, start: number, end: number, group: CladeGroup, kidsName: string = id): Species {
  return {
    id,
    binomial,
    common: { kids: kidsName, clinician: kidsName },
    nickname: null,
    group,
    status: end === 0 ? 'living' : 'extinct',
    rangeKa: { start, end },
    regions: [],
    brainCc: EMPTY,
    statureCm: EMPTY,
    massKg: EMPTY,
    locomotion: TXT,
    diet: TXT,
    technology: TXT,
    overview: TXT,
    keyTraits: { kids: [], clinician: [] },
    funFacts: [],
    ancestry: { parent: null, uncertain: false, note: null },
    geneFlow: [],
    specimens: [],
    citations: [],
  };
}

const LIST: Species[] = [
  sp('pan-troglodytes', 'Pan troglodytes', 6000, 0, 'living-relative', 'Chimpanzees'),
  sp('australopithecus-afarensis', 'Australopithecus afarensis', 3850, 2950, 'australopith', 'Lucy’s kind'),
  sp('homo-neanderthalensis', 'Homo neanderthalensis', 430, 40, 'archaic-homo', 'Neanderthals'),
  sp('denisovans', 'Homo sp. (Denisovans)', 285, 30, 'archaic-homo', 'Denisovans'),
  sp('homo-floresiensis', 'Homo floresiensis', 100, 50, 'island-homo', 'Flores hobbits'),
  sp('homo-luzonensis', 'Homo luzonensis', 134, 50, 'island-homo', 'Luzon people'),
  sp('homo-sapiens', 'Homo sapiens', 300, 0, 'modern-human', 'Modern humans'),
];

describe('kaToT / tToKa (log time scale)', () => {
  it('maps the domain ends to 0 (8 Ma) and 1 (today)', () => {
    expect(kaToT(KA_OLDEST)).toBe(0);
    expect(kaToT(KA_YOUNGEST)).toBe(1);
  });

  it('clamps ages outside the domain; today (0 ka) sits on the young edge', () => {
    expect(kaToT(20_000)).toBe(0);
    expect(kaToT(0)).toBe(1);
    expect(kaToT(-3)).toBe(1);
    expect(kaToT(0.4)).toBe(1);
    expect(kaToT(Number.NaN)).toBe(1);
  });

  it('gives every decade the same width', () => {
    const decade1 = kaToT(100) - kaToT(1000);
    const decade2 = kaToT(10) - kaToT(100);
    const decade3 = kaToT(1) - kaToT(10);
    expect(decade1).toBeCloseTo(decade2, 12);
    expect(decade2).toBeCloseTo(decade3, 12);
  });

  it('is strictly increasing toward the present', () => {
    const ages = [7000, 5000, 3000, 2000, 1000, 500, 200, 100, 50, 10, 1];
    for (let i = 1; i < ages.length; i++) expect(kaToT(ages[i])).toBeGreaterThan(kaToT(ages[i - 1]));
  });

  it('round-trips through tToKa', () => {
    for (const ka of [7000, 2580, 1234, 300, 42, 1.5]) expect(tToKa(kaToT(ka))).toBeCloseTo(ka, 6);
  });

  it('clamps t and tolerates NaN', () => {
    expect(tToKa(-1)).toBeCloseTo(KA_OLDEST, 6);
    expect(tToKa(2)).toBeCloseTo(KA_YOUNGEST, 6);
    expect(tToKa(Number.NaN)).toBeCloseTo(KA_YOUNGEST, 6);
  });
});

describe('TICKS', () => {
  it('lists 7, 5, 3, 2, 1 Ma, 500, 200, 100, 50, 10 ka and today, oldest first', () => {
    expect(TICKS.map((t) => t.ka)).toEqual([7000, 5000, 3000, 2000, 1000, 500, 200, 100, 50, 10, 1]);
    expect(TICKS.map((t) => t.label.clinician)).toEqual([
      '7 Ma', '5 Ma', '3 Ma', '2 Ma', '1 Ma', '500 ka', '200 ka', '100 ka', '50 ka', '10 ka', 'Today',
    ]);
    expect(TICKS[5].label.kids).toBe('500,000');
  });

  it('aligns edge labels inward', () => {
    expect(tickAlign(kaToT(7000))).toBe('start');
    expect(tickAlign(kaToT(1))).toBe('end');
    expect(tickAlign(kaToT(100))).toBe('center');
  });
});

describe('visibleTicks', () => {
  const w40 = () => 40;

  it('keeps every tick when there is room', () => {
    expect(visibleTicks(TICKS, 5000, w40)).toHaveLength(TICKS.length);
  });

  it('drops low-priority ticks first, keeps "today", and never overlaps labels', () => {
    const width = 360;
    const kept = visibleTicks(TICKS, width, w40);
    expect(kept.length).toBeLessThan(TICKS.length);
    expect(kept.some((t) => t.ka === 1)).toBe(true);
    expect(kept.map((t) => t.ka)).toEqual([...kept.map((t) => t.ka)].sort((a, b) => b - a));
    for (let i = 1; i < kept.length; i++) {
      const gap = (kaToT(kept[i].ka) - kaToT(kept[i - 1].ka)) * width;
      expect(gap).toBeGreaterThanOrEqual(40 + 8 - 1e-9);
    }
  });

  it('returns nothing for a zero-width axis', () => {
    expect(visibleTicks(TICKS, 0, w40)).toEqual([]);
  });
});

describe('assignLanes', () => {
  it('packs disjoint intervals into a single lane', () => {
    const r = assignLanes([
      { t0: 0, t1: 0.2 },
      { t0: 0.3, t1: 0.5 },
      { t0: 0.6, t1: 1 },
    ]);
    expect(r).toEqual({ lanes: [0, 0, 0], count: 1 });
  });

  it('separates overlapping intervals and reuses freed lanes', () => {
    const r = assignLanes([
      { t0: 0.0, t1: 0.5 },
      { t0: 0.2, t1: 0.7 },
      { t0: 0.6, t1: 0.9 },
    ]);
    expect(r.count).toBe(2);
    expect(r.lanes[0]).not.toBe(r.lanes[1]);
    expect(r.lanes[2]).toBe(r.lanes[0]);
  });

  it('respects the minimum gap and returns lanes in input order', () => {
    const r = assignLanes(
      [
        { t0: 0.5, t1: 0.6 },
        { t0: 0.0, t1: 0.495 },
      ],
      0.01,
    );
    expect(r.count).toBe(2);
    expect(r.lanes).toEqual([1, 0]);
  });

  it('handles an empty list', () => {
    expect(assignLanes([])).toEqual({ lanes: [], count: 0 });
  });
});

describe('aliveAt and the kids caption (computed from data)', () => {
  it('uses inclusive bounds', () => {
    expect(aliveAt(LIST, 40).map((s) => s.id)).toContain('homo-neanderthalensis');
    expect(aliveAt(LIST, 39).map((s) => s.id)).not.toContain('homo-neanderthalensis');
  });

  it('treats 1 ka and younger as today', () => {
    expect(aliveAt(LIST, 1).map((s) => s.id)).toEqual(['pan-troglodytes', 'homo-sapiens']);
  });

  it('counts kinds of humans, ignoring living relatives', () => {
    expect(aliveCaption(50, aliveAt(LIST, 50))).toBe('50,000 years ago, at least 5 kinds of humans were alive!');
  });

  it('follows the data when the dataset changes', () => {
    const fewer = LIST.filter((s) => s.id !== 'homo-luzonensis');
    expect(aliveCaption(50, aliveAt(fewer, 50))).toBe('50,000 years ago, at least 4 kinds of humans were alive!');
  });

  it('describes today with only modern humans', () => {
    expect(aliveCaption(1, aliveAt(LIST, 1))).toBe('Today, we are the only kind of human left.');
  });

  it('describes times with only early relatives', () => {
    expect(aliveCaption(3000, aliveAt(LIST, 3000))).toBe('3 million years ago, at least one kind of early human relative was alive.');
  });

  it('describes times before any hominin in the atlas', () => {
    expect(aliveCaption(7000, aliveAt(LIST, 7000))).toBe('7 million years ago, none of the relatives in this atlas were alive yet.');
  });

  it('builds short read-outs by audience', () => {
    expect(aliveReadout(50, 5, 'clinician')).toBe('50 ka: 5 taxa alive');
    expect(aliveReadout(50, 1, 'kids')).toBe('50,000 years ago: 1 kind alive');
    expect(aliveReadout(7000, 0, 'clinician')).toBe('7 Ma: no taxa from this atlas');
  });
});
