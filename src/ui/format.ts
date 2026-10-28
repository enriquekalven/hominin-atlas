/**
 * Pure, DOM-free formatting helpers (unit-tested in tests/ui.format.test.ts).
 * Ages are in thousands of years (ka); 1 Ma = 1000 ka.
 */
import type { Audience, Range, Species } from '../data/types';

export const DASH = '—';

const INT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** Thousands separators, up to `maxFrac` decimals, trailing zeros trimmed. */
export function formatNumber(n: number, maxFrac = 0): string {
  if (!Number.isFinite(n)) return DASH;
  if (maxFrac === 0) return INT.format(n);
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: maxFrac }).format(n);
}

/** Round to `digits` significant figures (49.37 → 49, 1234 → 1200). */
export function roundSig(n: number, digits = 2): number {
  if (!Number.isFinite(n) || n === 0) return n;
  return Number(n.toPrecision(digits));
}

function trimDecimals(n: number, maxFrac: number): string {
  return String(Number(n.toFixed(maxFrac)));
}

/** A single age as number + unit: 7000 → {7, Ma}; 430 → {430, ka}. */
export function kaParts(ka: number): { value: string; unit: 'Ma' | 'ka' } {
  if (ka >= 1000) return { value: trimDecimals(ka / 1000, 2), unit: 'Ma' };
  if (ka >= 10) return { value: formatNumber(Math.round(ka)), unit: 'ka' };
  return { value: trimDecimals(ka, ka >= 1 ? 1 : 2), unit: 'ka' };
}

/** "7 Ma", "430 ka", "today" (for ages ≤ 0). */
export function formatKa(ka: number): string {
  if (!Number.isFinite(ka)) return DASH;
  if (ka <= 0) return 'today';
  const p = kaParts(ka);
  return `${p.value} ${p.unit}`;
}

/** "7–6 Ma", "430–40 ka", "1.9 Ma – 110 ka", "300 ka – today". */
export function formatKaRange(startKa: number, endKa: number): string {
  if (!Number.isFinite(startKa) || !Number.isFinite(endKa)) return DASH;
  if (endKa <= 0) return `${formatKa(startKa)} – today`;
  const a = kaParts(startKa);
  const b = kaParts(endKa);
  if (a.value === b.value && a.unit === b.unit) return `${a.value} ${a.unit}`;
  if (a.unit === b.unit) return `${a.value}–${b.value} ${a.unit}`;
  return `${a.value} ${a.unit} – ${b.value} ${b.unit}`;
}

/** Compact date label for lists: 'living' for living species, otherwise the range. */
export function speciesDates(sp: Pick<Species, 'status' | 'rangeKa'>): string {
  if (sp.status === 'living') return 'living';
  return formatKaRange(sp.rangeKa.start, sp.rangeKa.end);
}

/** Plain-language age for kids: "50,000 years ago", "2 million years ago", "today". */
export function formatYearsAgo(ka: number): string {
  if (!Number.isFinite(ka)) return DASH;
  if (ka <= 1) return 'today';
  if (ka < 1000) return `${formatNumber(roundSig(ka * 1000, 2))} years ago`;
  return `${trimDecimals(roundSig(ka / 1000, 2), 2)} million years ago`;
}

/** Age label by audience: kids "50,000 years ago", clinician "50 ka". */
export function formatWhen(ka: number, audience: Audience): string {
  if (audience === 'kids') return formatYearsAgo(ka);
  return ka <= 1 ? 'today' : formatKa(roundSig(ka, 2));
}

export function capitalize(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

/** "1,410 cc (1,172–1,740)", "1,200–1,750 cc", "≥ 900 cc", or "—" when unknown. */
export function formatMeasure(r: Range | null | undefined, unit: string): string {
  if (!r) return DASH;
  const f = (n: number) => formatNumber(n, n < 100 ? 1 : 0);
  const { best, min, max } = r;
  if (best !== null && Number.isFinite(best)) {
    const span = min !== null && max !== null && (min !== best || max !== best) ? ` (${f(min)}–${f(max)})` : '';
    return `${f(best)} ${unit}${span}`;
  }
  if (min !== null && max !== null) return `${f(min)}–${f(max)} ${unit}`;
  if (min !== null) return `≥ ${f(min)} ${unit}`;
  if (max !== null) return `≤ ${f(max)} ${unit}`;
  return DASH;
}

/** Geological age of a specimen. Kids: "About 50,000 years ago"; clinician: "c. 50 ka (65–45 ka)". */
export function formatAge(r: Range, audience: Audience): string {
  const { best, min, max } = r;
  if (audience === 'kids') {
    if (best !== null) return capitalize(`about ${formatYearsAgo(best)}`);
    if (min !== null && max !== null) {
      return `Between ${formatYearsAgo(Math.min(min, max)).replace(' years ago', '')} and ${formatYearsAgo(Math.max(min, max))}`;
    }
    return DASH;
  }
  const span = min !== null && max !== null ? formatKaRange(Math.max(min, max), Math.min(min, max)) : null;
  if (best !== null) return span && span !== formatKa(best) ? `c. ${formatKa(best)} (${span})` : `c. ${formatKa(best)}`;
  return span ?? DASH;
}

export function formatPercent(p: number | null): string {
  return p === null || !Number.isFinite(p) ? DASH : `${formatNumber(p, p < 10 ? 1 : 0)}%`;
}

/** Millimetres for measurement read-outs: one decimal under 100 mm. */
export function formatMm(mm: number): string {
  if (!Number.isFinite(mm) || mm < 0) return DASH;
  return `${formatNumber(mm, mm < 100 ? 1 : 0)} mm`;
}

export interface TaxonPart {
  text: string;
  italic: boolean;
}

const ROMAN_TOKENS = new Set(['sp.', 'spp.', 'cf.', 'aff.', 'ssp.', 'subsp.', 'indet.', 'var.']);

/**
 * Split a scientific name into italic / roman runs. Genus and epithets are italic; qualifiers
 * such as "sp." and any parenthetical (e.g. "(Denisovans)") stay roman.
 */
export function taxonParts(binomial: string): TaxonPart[] {
  const parts: TaxonPart[] = [];
  let inParen = false;
  const tokens = binomial.trim().split(/\s+/).filter(Boolean);
  tokens.forEach((tok, i) => {
    if (tok.startsWith('(')) inParen = true;
    const italic = !inParen && !ROMAN_TOKENS.has(tok.toLowerCase());
    if (tok.endsWith(')')) inParen = false;
    const text = i === 0 ? tok : ` ${tok}`;
    const last = parts[parts.length - 1];
    if (last && last.italic === italic) last.text += text;
    else parts.push({ text, italic });
  });
  return parts;
}

/** "Homo erectus" → "H. erectus"; "Homo sp. (Denisovans)" → "H. sp. (Denisovans)". */
export function abbreviateBinomial(binomial: string): string {
  const tokens = binomial.trim().split(/\s+/);
  if (tokens.length < 2 || tokens[0].length < 2) return binomial.trim();
  return [`${tokens[0][0]}.`, ...tokens.slice(1)].join(' ');
}

/** Two-letter monogram for portrait fallbacks: "Homo erectus" → "He"; "Homo sp. (Denisovans)" → "Hd". */
export function monogram(binomial: string, fallback = ''): string {
  const tokens = binomial.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return (fallback.trim()[0] ?? '?').toUpperCase();
  const genus = tokens[0][0] ?? '?';
  let second = tokens[1] ?? '';
  if (ROMAN_TOKENS.has(second.toLowerCase())) {
    const paren = /\(([^)]+)\)/.exec(binomial);
    second = paren ? paren[1] : '';
  }
  return `${genus.toUpperCase()}${(second.replace(/[^\p{L}]/gu, '')[0] ?? '').toLowerCase()}`;
}

/** Plain-text species name by audience (for aria-labels, options and announcements). */
export function speciesName(sp: Pick<Species, 'binomial' | 'common'>, audience: Audience): string {
  return audience === 'kids' ? sp.common.kids : sp.binomial;
}

/** Join names as "A, B and C". */
export function listJoin(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** Difference B − A of two ranges' best values with the ratio, e.g. "+440 cc (×1.45)"; '—' if unknown. */
export function metricDiff(a: Range, b: Range, unit: string): string {
  if (a.best === null || b.best === null || !Number.isFinite(a.best) || !Number.isFinite(b.best)) return DASH;
  const d = b.best - a.best;
  const sign = d > 0 ? '+' : d < 0 ? '−' : '±';
  const ratio = a.best > 0 ? ` (×${formatNumber(b.best / a.best, 2)})` : '';
  return `${sign}${formatNumber(Math.abs(d), Math.abs(d) < 10 ? 1 : 0)} ${unit}${ratio}`;
}
