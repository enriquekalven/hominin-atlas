import { describe, expect, it } from 'vitest';
import {
  DASH,
  abbreviateBinomial,
  formatAge,
  formatKa,
  formatKaRange,
  formatMeasure,
  formatMm,
  formatNumber,
  formatPercent,
  formatWhen,
  formatYearsAgo,
  listJoin,
  metricDiff,
  monogram,
  roundSig,
  speciesDates,
  speciesName,
  taxonParts,
} from '../src/ui/format';

const R = (best: number | null, min: number | null = null, max: number | null = null) => ({ best, min, max });

describe('ages', () => {
  it('formats single ages in Ma / ka', () => {
    expect(formatKa(7000)).toBe('7 Ma');
    expect(formatKa(1950)).toBe('1.95 Ma');
    expect(formatKa(430)).toBe('430 ka');
    expect(formatKa(40)).toBe('40 ka');
    expect(formatKa(4.5)).toBe('4.5 ka');
    expect(formatKa(0)).toBe('today');
    expect(formatKa(Number.NaN)).toBe(DASH);
  });

  it('formats ranges like "7–6 Ma", "430–40 ka", mixed units and living taxa', () => {
    expect(formatKaRange(7000, 6000)).toBe('7–6 Ma');
    expect(formatKaRange(430, 40)).toBe('430–40 ka');
    expect(formatKaRange(1900, 110)).toBe('1.9 Ma – 110 ka');
    expect(formatKaRange(300, 0)).toBe('300 ka – today');
    expect(formatKaRange(50, 50)).toBe('50 ka');
    expect(formatKaRange(Number.NaN, 3)).toBe(DASH);
  });

  it('labels living species "living" in lists', () => {
    expect(speciesDates({ status: 'living', rangeKa: { start: 300, end: 0 } })).toBe('living');
    expect(speciesDates({ status: 'extinct', rangeKa: { start: 430, end: 40 } })).toBe('430–40 ka');
  });

  it('writes plain-language ages for kids', () => {
    expect(formatYearsAgo(50)).toBe('50,000 years ago');
    expect(formatYearsAgo(2000)).toBe('2 million years ago');
    expect(formatYearsAgo(1500)).toBe('1.5 million years ago');
    expect(formatYearsAgo(1.2)).toBe('1,200 years ago');
    expect(formatYearsAgo(49.37)).toBe('49,000 years ago');
    expect(formatYearsAgo(1)).toBe('today');
    expect(formatYearsAgo(0)).toBe('today');
  });

  it('picks the wording by audience', () => {
    expect(formatWhen(50, 'kids')).toBe('50,000 years ago');
    expect(formatWhen(49.37, 'clinician')).toBe('49 ka');
    expect(formatWhen(0.5, 'clinician')).toBe('today');
  });

  it('formats specimen ages', () => {
    expect(formatAge(R(50, 45, 65), 'clinician')).toBe('c. 50 ka (65–45 ka)');
    expect(formatAge(R(50), 'clinician')).toBe('c. 50 ka');
    expect(formatAge(R(null, 45, 65), 'clinician')).toBe('65–45 ka');
    expect(formatAge(R(null), 'clinician')).toBe(DASH);
    expect(formatAge(R(3200), 'kids')).toBe('About 3.2 million years ago');
    expect(formatAge(R(null, 45, 65), 'kids')).toBe('Between 45,000 and 65,000 years ago');
  });
});

describe('measurements (null-safe)', () => {
  it('shows best value with range', () => {
    expect(formatMeasure(R(1410, 1172, 1740), 'cc')).toBe('1,410 cc (1,172–1,740)');
    expect(formatMeasure(R(40), 'kg')).toBe('40 kg');
    expect(formatMeasure(R(1.5), 'm')).toBe('1.5 m');
  });

  it('falls back to ranges, bounds or a dash, never to 0', () => {
    expect(formatMeasure(R(null, 1200, 1750), 'cc')).toBe('1,200–1,750 cc');
    expect(formatMeasure(R(null, 900), 'cc')).toBe('≥ 900 cc');
    expect(formatMeasure(R(null, null, 60), 'kg')).toBe('≤ 60 kg');
    expect(formatMeasure(R(null), 'cc')).toBe(DASH);
    expect(formatMeasure(null, 'cc')).toBe(DASH);
  });

  it('computes differences with ratio, or a dash when unknown', () => {
    expect(metricDiff(R(1000), R(1400), 'cc')).toBe('+400 cc (×1.4)');
    expect(metricDiff(R(160), R(106), 'cm')).toBe('−54 cm (×0.66)');
    expect(metricDiff(R(30), R(30), 'kg')).toBe('±0 kg (×1)');
    expect(metricDiff(R(null), R(1400), 'cc')).toBe(DASH);
    expect(metricDiff(R(0), R(5), 'kg')).toBe('+5 kg');
  });

  it('formats percents, millimetres and numbers', () => {
    expect(formatPercent(null)).toBe(DASH);
    expect(formatPercent(40)).toBe('40%');
    expect(formatPercent(7.5)).toBe('7.5%');
    expect(formatMm(123.45)).toBe('123 mm');
    expect(formatMm(12.34)).toBe('12.3 mm');
    expect(formatMm(-1)).toBe(DASH);
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(roundSig(1234)).toBe(1200);
  });
});

describe('scientific names', () => {
  it('italicises genus and epithet only', () => {
    expect(taxonParts('Homo neanderthalensis')).toEqual([{ text: 'Homo neanderthalensis', italic: true }]);
    expect(taxonParts('Homo sp. (Denisovans)')).toEqual([
      { text: 'Homo', italic: true },
      { text: ' sp. (Denisovans)', italic: false },
    ]);
    expect(taxonParts('Australopithecus cf. afarensis')).toEqual([
      { text: 'Australopithecus', italic: true },
      { text: ' cf.', italic: false },
      { text: ' afarensis', italic: true },
    ]);
  });

  it('abbreviates genus names', () => {
    expect(abbreviateBinomial('Homo erectus')).toBe('H. erectus');
    expect(abbreviateBinomial('Homo sp. (Denisovans)')).toBe('H. sp. (Denisovans)');
    expect(abbreviateBinomial('Homo')).toBe('Homo');
  });

  it('builds portrait monograms', () => {
    expect(monogram('Homo erectus')).toBe('He');
    expect(monogram('Homo sp. (Denisovans)')).toBe('Hd');
    expect(monogram('Pan troglodytes')).toBe('Pt');
    expect(monogram('', 'Lucy')).toBe('L');
  });

  it('names species by audience and joins lists', () => {
    const s = { binomial: 'Homo floresiensis', common: { kids: 'Flores hobbits', clinician: 'Flores hominin' } };
    expect(speciesName(s, 'kids')).toBe('Flores hobbits');
    expect(speciesName(s, 'clinician')).toBe('Homo floresiensis');
    expect(listJoin(['A', 'B', 'C'])).toBe('A, B and C');
    expect(listJoin(['A'])).toBe('A');
    expect(listJoin([])).toBe('');
  });
});
