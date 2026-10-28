/**
 * Log-scaled time axis shared by the timeline and the family-tree chart (pure, unit-tested).
 *
 * Domain: ~8 Ma (left / top) to 1 ka (right / bottom). Ages younger than 1 ka, including
 * "today" (0 ka), clamp to the young edge so living species reach the end of the axis.
 */
import type { Audience, DualText, Species } from '../data/types';
import { formatWhen } from './format';

export const KA_OLDEST = 8000;
export const KA_YOUNGEST = 1;
const L_OLD = Math.log10(KA_OLDEST);
const L_YOUNG = Math.log10(KA_YOUNGEST);

/** Position along the axis: 0 = 8 Ma (oldest), 1 = today. */
export function kaToT(ka: number): number {
  if (Number.isNaN(ka)) return 1;
  const c = Math.min(KA_OLDEST, Math.max(KA_YOUNGEST, ka));
  return (L_OLD - Math.log10(c)) / (L_OLD - L_YOUNG);
}

/** Inverse of kaToT (t is clamped to 0..1). */
export function tToKa(t: number): number {
  const c = Number.isNaN(t) ? 1 : Math.min(1, Math.max(0, t));
  return 10 ** (L_OLD - c * (L_OLD - L_YOUNG));
}

export interface Tick {
  ka: number;
  label: DualText;
  /** 0 = always shown, higher numbers are dropped first when space is tight. */
  priority: number;
}

export const TICKS: readonly Tick[] = [
  { ka: 7000, label: { kids: '7 million', clinician: '7 Ma' }, priority: 1 },
  { ka: 5000, label: { kids: '5 million', clinician: '5 Ma' }, priority: 3 },
  { ka: 3000, label: { kids: '3 million', clinician: '3 Ma' }, priority: 2 },
  { ka: 2000, label: { kids: '2 million', clinician: '2 Ma' }, priority: 3 },
  { ka: 1000, label: { kids: '1 million', clinician: '1 Ma' }, priority: 1 },
  { ka: 500, label: { kids: '500,000', clinician: '500 ka' }, priority: 3 },
  { ka: 200, label: { kids: '200,000', clinician: '200 ka' }, priority: 2 },
  { ka: 100, label: { kids: '100,000', clinician: '100 ka' }, priority: 1 },
  { ka: 50, label: { kids: '50,000', clinician: '50 ka' }, priority: 2 },
  { ka: 10, label: { kids: '10,000', clinician: '10 ka' }, priority: 1 },
  { ka: KA_YOUNGEST, label: { kids: 'Today', clinician: 'Today' }, priority: 0 },
];

/**
 * Greedy label thinning: keep ticks in priority order as long as their labels do not overlap.
 * `labelPx` estimates label width in pixels. Returns kept ticks sorted oldest → youngest.
 */
export function visibleTicks(
  ticks: readonly Tick[],
  widthPx: number,
  labelPx: (t: Tick) => number,
  gapPx = 8,
): Tick[] {
  if (widthPx <= 0) return [];
  const order = [...ticks].sort((a, b) => a.priority - b.priority || b.ka - a.ka);
  const kept: { tick: Tick; x: number; w: number }[] = [];
  for (const tick of order) {
    const x = kaToT(tick.ka) * widthPx;
    const w = labelPx(tick);
    const clash = kept.some((k) => Math.abs(k.x - x) < (k.w + w) / 2 + gapPx);
    if (!clash) kept.push({ tick, x, w });
  }
  return kept.map((k) => k.tick).sort((a, b) => b.ka - a.ka);
}

/** Label alignment so the first/last labels do not overflow the axis. */
export function tickAlign(t: number): 'start' | 'center' | 'end' {
  if (t < 0.04) return 'start';
  if (t > 0.96) return 'end';
  return 'center';
}

export interface Interval {
  /** Axis position of the older edge (smaller t). */
  t0: number;
  /** Axis position of the younger edge (larger t). */
  t1: number;
}

/**
 * Pack intervals into the fewest lanes (greedy by start). Returns the lane index of each input
 * interval (same order) plus the lane count. `gap` is the minimum free space between neighbours.
 */
export function assignLanes(items: readonly Interval[], gap = 0.01): { lanes: number[]; count: number } {
  const order = items.map((it, i) => ({ ...it, i })).sort((a, b) => a.t0 - b.t0 || a.t1 - b.t1);
  const laneEnds: number[] = [];
  const lanes = new Array<number>(items.length).fill(0);
  for (const it of order) {
    let lane = laneEnds.findIndex((end) => end + gap <= it.t0);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(it.t1);
    } else {
      laneEnds[lane] = it.t1;
    }
    lanes[it.i] = lane;
  }
  return { lanes, count: laneEnds.length };
}

/** Species alive at `ka` (inclusive bounds), same rule as data/speciesAlive but list-injected. */
export function aliveAt<T extends Pick<Species, 'rangeKa'>>(list: readonly T[], ka: number): T[] {
  const k = ka <= KA_YOUNGEST ? 0 : ka;
  return list.filter((s) => s.rangeKa.start >= k && s.rangeKa.end <= k);
}

type CaptionSpecies = Pick<Species, 'id' | 'binomial' | 'group' | 'common'>;

const isHuman = (s: CaptionSpecies) => s.group !== 'living-relative' && /^Homo\b/.test(s.binomial);

/**
 * Kids caption for the time scrubber, computed from data (never hardcoded), e.g.
 * "50,000 years ago, at least 5 kinds of humans were alive!". Living relatives are not counted.
 */
export function aliveCaption(ka: number, alive: readonly CaptionSpecies[]): string {
  const today = ka <= KA_YOUNGEST;
  const when = today ? 'Today' : formatWhen(ka, 'kids').replace(/^./, (c) => c.toUpperCase());
  const hominins = alive.filter((s) => s.group !== 'living-relative');
  const humans = hominins.filter(isHuman);
  const others = hominins.length - humans.length;
  if (hominins.length === 0) return `${when}, none of the relatives in this atlas were alive yet.`;
  if (humans.length >= 2) {
    return today
      ? `Today, ${humans.length} kinds of humans are alive!`
      : `${when}, at least ${humans.length} kinds of humans were alive!`;
  }
  if (humans.length === 1) {
    const name = humans[0].common.kids;
    if (today && others === 0) {
      return humans[0].id === 'homo-sapiens'
        ? 'Today, we are the only kind of human left.'
        : `Today, only one kind of human is left: ${name}.`;
    }
    if (today) return `Today, ${name} and ${others} other relatives are alive.`;
    if (others === 0) return `${when}, only one kind of human was alive: ${name}.`;
    return `${when}, ${name} lived alongside at least ${others} other human ${others === 1 ? 'relative' : 'relatives'}.`;
  }
  return others === 1
    ? `${when}, at least one kind of early human relative was alive.`
    : `${when}, at least ${others} kinds of early human relatives were alive.`;
}

/** Short read-out: "50 ka: 5 taxa alive" (clinician) / "50,000 years ago: 5 kinds alive" (kids). */
export function aliveReadout(ka: number, count: number, audience: Audience): string {
  const when = formatWhen(ka, audience);
  if (count === 0) return `${when}: no taxa from this atlas`;
  const noun = audience === 'kids' ? (count === 1 ? 'kind' : 'kinds') : count === 1 ? 'taxon' : 'taxa';
  return `${when}: ${count} ${noun} alive`;
}
