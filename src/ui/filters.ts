/**
 * Pure list helpers: species search, glossary filter, rail grouping, lesion grouping.
 * Unit-tested in tests/ui.filters.test.ts.
 */
import {
  LESION_KINDS,
  type Audience,
  type CladeGroup,
  type GlossaryTerm,
  type Lesion,
  type LesionKind,
  type Species,
} from '../data/types';

/** Lowercase, accent-free, single-spaced text for matching. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

type Searchable = Pick<Species, 'id' | 'binomial' | 'common' | 'nickname'>;

function haystacks(s: Searchable): string[] {
  return [s.common.kids, s.common.clinician, s.binomial, s.nickname ?? '', s.id.replace(/-/g, ' ')].map(normalize);
}

/**
 * Rank species for the search combobox: whole-field prefix (0) > word prefix (1) > substring (2).
 * Ties keep dataset order (oldest first). Empty query returns everything.
 */
export function searchSpecies<T extends Searchable>(list: readonly T[], query: string): T[] {
  const q = normalize(query);
  if (!q) return [...list];
  const scored: { s: T; score: number; i: number }[] = [];
  list.forEach((s, i) => {
    let best = Infinity;
    for (const hay of haystacks(s)) {
      if (!hay) continue;
      if (hay.startsWith(q)) best = Math.min(best, 0);
      else if (hay.split(/[\s().,'"-]+/).some((w) => w.startsWith(q))) best = Math.min(best, 1);
      else if (hay.includes(q)) best = Math.min(best, 2);
    }
    if (best < Infinity) scored.push({ s, score: best, i });
  });
  return scored.sort((a, b) => a.score - b.score || a.i - b.i).map((x) => x.s);
}

/** Glossary terms matching the query (term matches first), alphabetical within each rank. */
export function filterGlossary(terms: readonly GlossaryTerm[], query: string, audience: Audience): GlossaryTerm[] {
  const q = normalize(query);
  const byTerm = (a: GlossaryTerm, b: GlossaryTerm) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' });
  if (!q) return [...terms].sort(byTerm);
  const termHits: GlossaryTerm[] = [];
  const defHits: GlossaryTerm[] = [];
  for (const t of terms) {
    if (normalize(t.term).includes(q)) termHits.push(t);
    else if (normalize(audience === 'kids' ? t.kids : t.clinician).includes(q)) defHits.push(t);
  }
  return [...termHits.sort(byTerm), ...defHits.sort(byTerm)];
}

export interface SpeciesGroup<T> {
  group: CladeGroup;
  species: T[];
}

/**
 * Group species by clade for the rail. Groups appear in order of their oldest member and keep
 * the input order inside each group, so a pre-sorted (oldest → youngest) list stays chronological.
 */
export function groupSpecies<T extends Pick<Species, 'group'>>(list: readonly T[]): SpeciesGroup<T>[] {
  const groups = new Map<CladeGroup, T[]>();
  for (const s of list) {
    const arr = groups.get(s.group);
    if (arr) arr.push(s);
    else groups.set(s.group, [s]);
  }
  return [...groups.entries()].map(([group, species]) => ({ group, species }));
}

/** Flattened rail order (what arrow keys walk through). */
export function railOrder<T extends Pick<Species, 'group'>>(list: readonly T[]): T[] {
  return groupSpecies(list).flatMap((g) => g.species);
}

export interface LesionGroup {
  kind: LesionKind;
  lesions: Lesion[];
}

/** Lesions grouped by kind in the canonical LESION_KINDS order. */
export function groupLesions(lesions: readonly Lesion[]): LesionGroup[] {
  const order = new Map(LESION_KINDS.map((k, i) => [k, i]));
  const groups = new Map<LesionKind, Lesion[]>();
  for (const l of lesions) {
    const arr = groups.get(l.kind);
    if (arr) arr.push(l);
    else groups.set(l.kind, [l]);
  }
  return [...groups.entries()]
    .sort((a, b) => (order.get(a[0]) ?? 99) - (order.get(b[0]) ?? 99))
    .map(([kind, ls]) => ({ kind, lesions: ls }));
}

/** Fracture kinds that get the what-if healing timeline (only if some healing is recorded). */
const HEALING_KINDS: ReadonlySet<LesionKind> = new Set(['healed-fracture', 'depressed-fracture', 'unhealed-fracture']);

export function showsHealingTimeline(l: Pick<Lesion, 'kind' | 'healing'>): boolean {
  if (!HEALING_KINDS.has(l.kind)) return false;
  if (l.kind === 'healed-fracture') return true;
  return l.healing !== null && l.healing !== 'none';
}

export const HEALING_STAGES = [
  { t: 0, kids: 'Just broken', clinician: 'Injury' },
  { t: 1 / 3, kids: 'Soft patch (2–3 weeks)', clinician: 'Soft callus (~2–3 wk)' },
  { t: 2 / 3, kids: 'Hard patch (6–12 weeks)', clinician: 'Hard callus (~6–12 wk)' },
  { t: 1, kids: 'Healed (months–years)', clinician: 'Remodelled (months–years)' },
] as const;

/** Index of the healing stage nearest to t (0..1). */
export function healingStageIndex(t: number): number {
  const c = Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 1;
  let best = 0;
  HEALING_STAGES.forEach((st, i) => {
    if (Math.abs(st.t - c) < Math.abs(HEALING_STAGES[best].t - c)) best = i;
  });
  return best;
}
