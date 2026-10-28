/**
 * Family-tree dialog: the SVG range chart, a legend, and a nested ordered-list version of the
 * same tree for screen readers. Picking a species selects it and closes the dialog.
 */
import type { Audience, Species, SpeciesId } from '../data/types';
import type { UICtx } from './context';
import { h } from './dom';
import { openDialog } from './dialogs';
import { speciesDates, speciesName } from './format';
import { layoutTree, type TreeLayout } from './treeLayout';
import { treeChart } from './treeChart';
import { emptyState } from './widgets';
import { selectSpecies } from './actions';

function textTree(layout: TreeLayout, byId: ReadonlyMap<SpeciesId, Species>, audience: Audience): HTMLElement {
  const kids = new Map<SpeciesId | null, SpeciesId[]>();
  for (const n of layout.nodes) {
    const arr = kids.get(n.parent);
    if (arr) arr.push(n.id);
    else kids.set(n.parent, [n.id]);
  }
  const uncertain = new Map(layout.nodes.map((n) => [n.id, n.uncertain]));
  const flowWord = audience === 'kids' ? 'interbred with' : 'introgression with';
  const flows = (id: SpeciesId) =>
    layout.links
      .filter((l) => l.a === id || l.b === id)
      .map((l) => byId.get(l.a === id ? l.b : l.a))
      .filter((x): x is Species => !!x)
      .map((x) => speciesName(x, audience));
  const branch = (parent: SpeciesId | null): HTMLOListElement | null => {
    const ids = kids.get(parent);
    if (!ids?.length) return null;
    return h(
      'ol',
      null,
      ids.map((id) => {
        const sp = byId.get(id);
        if (!sp) return null;
        const f = flows(id);
        const text = [
          `${speciesName(sp, audience)} (${speciesDates(sp)})`,
          parent && uncertain.get(id) ? ' — ancestry uncertain' : '',
          f.length ? `; ${flowWord} ${f.join(', ')}` : '',
        ].join('');
        return h('li', null, text, branch(id));
      }),
    );
  };
  return h(
    'div',
    { class: 'sr-only' },
    h('h3', null, 'Text version of the family tree'),
    h('p', null, 'Each nested list shows the species thought to descend from the one above it.'),
    branch(null),
  );
}

export function openTreeDialog(ctx: UICtx): void {
  const audience = ctx.store.get().audience;
  const kids = audience === 'kids';
  openDialog({
    title: kids ? 'Our family tree' : 'Hominin phylogeny (time-scaled)',
    className: 'dialog--wide',
    description: kids
      ? 'Older relatives are at the top. Tap a name to explore it.'
      : 'Columns are taxa; bars show first and last appearance on a log time axis. Select a column to open that taxon.',
    build(body, handle) {
      if (ctx.species.length === 0) {
        body.appendChild(emptyState('The family tree is still growing', 'Species will appear here once the data is added.'));
        return;
      }
      const layout = layoutTree(ctx.species);
      const pickSpecies = (id: SpeciesId) => {
        selectSpecies(ctx, id);
        handle.close();
      };
      const chart = treeChart(layout, ctx.byId, audience, ctx.store.get().speciesId, pickSpecies);
      const legendItem = (cls: string, text: string) =>
        h('li', null, h('span', { class: `legend__swatch ${cls}`, 'aria-hidden': 'true' }), text);
      body.append(
        textTree(layout, ctx.byId, audience),
        h('div', { class: 'tree__scroll' }, chart),
        h(
          'ul',
          { class: 'legend' },
          legendItem('legend--bar', kids ? 'When they lived' : 'Known temporal range'),
          legendItem('legend--anc', kids ? 'Probably came from' : 'Proposed ancestry'),
          legendItem('legend--uncertain', kids ? 'Maybe came from (not sure)' : 'Uncertain ancestry'),
          legendItem('legend--flow', kids ? 'Interbreeding' : 'Introgression (gene flow)'),
        ),
        h(
          'p',
          { class: 'note' },
          kids
            ? 'Scientists keep finding new fossils, so this tree can change!'
            : 'Ancestor–descendant links are hypotheses; dashed links are contested. Ages of 1 ka and younger are drawn at the bottom edge.',
        ),
      );
      queueMicrotask(() => body.querySelector<SVGElement>('.tree__node.is-selected')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
    },
    initialFocus: () => document.querySelector<HTMLElement>('.tree__node.is-selected'),
  });
}
