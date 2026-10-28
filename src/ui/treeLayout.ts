/**
 * Pure layout for the family-tree range chart (unit-tested in tests/ui.treeLayout.test.ts).
 * One column per species in depth-first order (parent left of its descendants, smaller clades first);
 * the vertical axis is log time, shared with the timeline (see timeScale.ts).
 */
import type { Species, SpeciesId } from '../data/types';

type TreeInput = Pick<Species, 'id' | 'rangeKa' | 'ancestry' | 'geneFlow'>;

export interface TreeNode {
  id: SpeciesId;
  col: number;
  depth: number;
  parent: SpeciesId | null;
  uncertain: boolean;
  startKa: number;
  endKa: number;
}

export interface GeneFlowLink {
  a: SpeciesId;
  b: SpeciesId;
  /** Age (ka) at which to draw the arc: log-midpoint of the shared time window. */
  ka: number;
}

export interface TreeLayout {
  nodes: TreeNode[];
  links: GeneFlowLink[];
  columns: number;
}

export function layoutTree(list: readonly TreeInput[]): TreeLayout {
  const byId = new Map(list.map((s) => [s.id, s]));

  // Resolve parents that exist in the dataset; break cycles by treating the node as a root.
  const parentOf = new Map<SpeciesId, SpeciesId | null>();
  for (const s of list) {
    const p = s.ancestry.parent;
    parentOf.set(s.id, p && p !== s.id && byId.has(p) ? p : null);
  }
  for (const s of list) {
    const seen = new Set<SpeciesId>([s.id]);
    let cur = parentOf.get(s.id) ?? null;
    while (cur) {
      if (seen.has(cur)) {
        parentOf.set(s.id, null);
        break;
      }
      seen.add(cur);
      cur = parentOf.get(cur) ?? null;
    }
  }

  const olderFirst = (a: TreeInput, b: TreeInput) =>
    b.rangeKa.start - a.rangeKa.start || a.id.localeCompare(b.id);
  const children = new Map<SpeciesId, TreeInput[]>();
  const roots: TreeInput[] = [];
  for (const s of list) {
    const p = parentOf.get(s.id) ?? null;
    if (p) {
      const arr = children.get(p);
      if (arr) arr.push(s);
      else children.set(p, [s]);
    } else {
      roots.push(s);
    }
  }
  // Ladderize: smaller clades first (shorter connectors), then older first.
  const size = new Map<SpeciesId, number>();
  const sizeOf = (id: SpeciesId): number => {
    const known = size.get(id);
    if (known !== undefined) return known;
    const n = 1 + (children.get(id) ?? []).reduce((acc, c) => acc + sizeOf(c.id), 0);
    size.set(id, n);
    return n;
  };
  const ladder = (a: TreeInput, b: TreeInput) => sizeOf(a.id) - sizeOf(b.id) || olderFirst(a, b);
  roots.sort(olderFirst);
  for (const arr of children.values()) arr.sort(ladder);

  const nodes: TreeNode[] = [];
  const visit = (s: TreeInput, depth: number) => {
    nodes.push({
      id: s.id,
      col: nodes.length,
      depth,
      parent: parentOf.get(s.id) ?? null,
      uncertain: s.ancestry.uncertain,
      startKa: s.rangeKa.start,
      endKa: s.rangeKa.end,
    });
    for (const c of children.get(s.id) ?? []) visit(c, depth + 1);
  };
  for (const r of roots) visit(r, 0);

  const links: GeneFlowLink[] = [];
  const seenPairs = new Set<string>();
  for (const s of list) {
    for (const other of s.geneFlow) {
      const o = byId.get(other);
      if (!o || o.id === s.id) continue;
      const [a, b] = s.id < o.id ? [s, o] : [o, s];
      const key = `${a.id}|${b.id}`;
      if (seenPairs.has(key)) continue;
      seenPairs.add(key);
      const older = Math.min(a.rangeKa.start, b.rangeKa.start);
      const younger = Math.max(a.rangeKa.end, b.rangeKa.end, 1);
      const hi = Math.max(older, younger);
      const lo = Math.max(1, Math.min(older, younger));
      links.push({ a: a.id, b: b.id, ka: Math.sqrt(hi * lo) });
    }
  }

  return { nodes, links, columns: nodes.length };
}
