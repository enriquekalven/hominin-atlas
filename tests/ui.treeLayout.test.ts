import { describe, expect, it } from 'vitest';
import type { SpeciesId } from '../src/data/types';
import { layoutTree } from '../src/ui/treeLayout';

type Node = {
  id: SpeciesId;
  rangeKa: { start: number; end: number };
  ancestry: { parent: SpeciesId | null; uncertain: boolean; note: string | null };
  geneFlow: SpeciesId[];
};

const n = (id: SpeciesId, start: number, end: number, parent: SpeciesId | null = null, uncertain = false, geneFlow: SpeciesId[] = []): Node => ({
  id,
  rangeKa: { start, end },
  ancestry: { parent, uncertain, note: null },
  geneFlow,
});

describe('layoutTree', () => {
  const list: Node[] = [
    n('homo-sapiens', 300, 0, 'homo-heidelbergensis', false, ['homo-neanderthalensis', 'denisovans']),
    n('homo-erectus', 1900, 110, 'homo-habilis', true),
    n('homo-habilis', 2400, 1650),
    n('homo-heidelbergensis', 700, 200, 'homo-erectus', true),
    n('homo-neanderthalensis', 430, 40, 'homo-heidelbergensis', false, ['homo-sapiens', 'denisovans']),
    n('denisovans', 285, 30, 'homo-heidelbergensis', true),
  ];
  const layout = layoutTree(list);
  const col = (id: SpeciesId) => layout.nodes.find((x) => x.id === id)!.col;

  it('gives every species exactly one column', () => {
    expect(layout.columns).toBe(list.length);
    expect(new Set(layout.nodes.map((x) => x.col)).size).toBe(list.length);
  });

  it('places parents to the left of their descendants (depth-first)', () => {
    expect(col('homo-habilis')).toBe(0);
    expect(col('homo-erectus')).toBeGreaterThan(col('homo-habilis'));
    expect(col('homo-heidelbergensis')).toBeGreaterThan(col('homo-erectus'));
    for (const id of ['homo-sapiens', 'homo-neanderthalensis', 'denisovans'] as SpeciesId[]) {
      expect(col(id)).toBeGreaterThan(col('homo-heidelbergensis'));
    }
  });

  it('orders siblings oldest first', () => {
    expect(col('homo-neanderthalensis')).toBeLessThan(col('homo-sapiens'));
    expect(col('homo-sapiens')).toBeLessThan(col('denisovans'));
  });

  it('ladderizes: a leaf sibling comes before an older sibling with a large clade', () => {
    const r = layoutTree([
      n('australopithecus-afarensis', 3850, 2950),
      n('australopithecus-africanus', 3300, 2100, 'australopithecus-afarensis'),
      n('homo-habilis', 2400, 1650, 'australopithecus-africanus'),
      n('homo-erectus', 1900, 110, 'homo-habilis'),
      n('paranthropus-boisei', 2300, 1200, 'australopithecus-afarensis'),
    ]);
    const order = r.nodes.map((x) => x.id);
    expect(order).toEqual(['australopithecus-afarensis', 'paranthropus-boisei', 'australopithecus-africanus', 'homo-habilis', 'homo-erectus']);
  });

  it('records depth, parent and uncertainty', () => {
    const erectus = layout.nodes.find((x) => x.id === 'homo-erectus')!;
    expect(erectus).toMatchObject({ depth: 1, parent: 'homo-habilis', uncertain: true });
  });

  it('deduplicates gene flow listed on both partners', () => {
    const pairs = layout.links.map((l) => `${l.a}|${l.b}`).sort();
    expect(pairs).toEqual(['denisovans|homo-neanderthalensis', 'denisovans|homo-sapiens', 'homo-neanderthalensis|homo-sapiens']);
  });

  it('draws gene flow inside the shared time window', () => {
    const link = layout.links.find((l) => l.a === 'homo-neanderthalensis' && l.b === 'homo-sapiens')!;
    expect(link.ka).toBeLessThanOrEqual(300);
    expect(link.ka).toBeGreaterThanOrEqual(40);
  });

  it('treats unknown parents, self-parents and cycles as roots', () => {
    const odd = layoutTree([
      n('homo-naledi', 335, 236, 'homo-luzonensis'),
      n('homo-floresiensis', 100, 50, 'homo-floresiensis'),
      n('paranthropus-boisei', 2300, 1200, 'paranthropus-robustus'),
      n('paranthropus-robustus', 2000, 1000, 'paranthropus-boisei'),
    ]);
    expect(odd.columns).toBe(4);
    expect(odd.nodes.find((x) => x.id === 'homo-naledi')!.parent).toBeNull();
    expect(odd.nodes.find((x) => x.id === 'homo-floresiensis')!.parent).toBeNull();
    const roots = odd.nodes.filter((x) => x.parent === null).map((x) => x.id);
    expect(roots).toContain('paranthropus-boisei');
  });

  it('ignores gene flow to taxa missing from the dataset', () => {
    const r = layoutTree([n('homo-sapiens', 300, 0, null, false, ['denisovans'])]);
    expect(r.links).toEqual([]);
  });

  it('handles an empty dataset', () => {
    expect(layoutTree([])).toEqual({ nodes: [], links: [], columns: 0 });
  });
});
