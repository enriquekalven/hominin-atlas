/**
 * Tree tab: where the current species sits in the family tree (parent, descendants,
 * interbreeding), with a button to open the full family-tree chart.
 */
import type { Species } from '../../data/types';
import type { UICtx } from '../context';
import { currentSpecies } from '../context';
import { button, h } from '../dom';
import { icon } from '../icons';
import { speciesDates } from '../format';
import { emptyState, sectionTitle, taxon } from '../widgets';
import { selectSpecies } from '../actions';
import type { TabView } from './index';

export function createTreeTab(ctx: UICtx, openTree: () => void): TabView {
  const link = (sp: Species, kids: boolean) =>
    button(
      [kids ? sp.common.kids : taxon(sp.binomial), h('span', { class: 'chip__meta num' }, speciesDates(sp))],
      { class: 'chip', 'data-fk': `tree-${sp.id}` },
      () => selectSpecies(ctx, sp.id),
    );
  return {
    key: (s) => `${s.speciesId}|${s.audience}`,
    render(pane) {
      const sp = currentSpecies(ctx);
      const kids = ctx.store.get().audience === 'kids';
      const open = button([icon('tree'), h('span', { class: 'btn__label' }, kids ? 'Open the family tree' : 'Open phylogeny chart')], {
        class: 'btn btn--primary',
      }, openTree);
      if (!sp) {
        pane.append(emptyState('No species selected', 'Pick a species to see where it fits.'), open);
        return;
      }
      const parent = sp.ancestry.parent ? ctx.byId.get(sp.ancestry.parent) : undefined;
      const children = ctx.species.filter((x) => x.ancestry.parent === sp.id);
      // Gene flow may be recorded on either partner; show it from both sides.
      const flow = ctx.species.filter((x) => x.id !== sp.id && (sp.geneFlow.includes(x.id) || x.geneFlow.includes(sp.id)));
      const flowLabel = kids ? 'Interbred with' : 'Introgression with';

      pane.append(sectionTitle('h3', kids ? 'Family connections' : 'Phylogenetic position'));
      const dl = h('dl', { class: 'facts' });
      dl.append(
        h('dt', null, kids ? 'Came from' : 'Proposed ancestor'),
        h(
          'dd',
          null,
          parent
            ? [link(parent, kids), sp.ancestry.uncertain ? h('span', { class: 'tag tag--uncertain' }, kids ? 'Not sure' : 'Uncertain') : null]
            : kids
              ? 'Scientists do not know yet.'
              : 'Unresolved / not in this atlas',
        ),
        h('dt', null, kids ? 'Led to' : 'Proposed descendants'),
        h('dd', null, children.length ? h('div', { class: 'chips' }, children.map((c) => link(c, kids))) : '—'),
        h('dt', null, flowLabel),
        h('dd', null, flow.length ? h('div', { class: 'chips' }, flow.map((c) => link(c, kids))) : '—'),
      );
      pane.appendChild(dl);
      if (!kids && sp.ancestry.note) pane.appendChild(h('p', { class: 'note' }, sp.ancestry.note));
      if (kids && flow.length) {
        pane.appendChild(
          h('p', { class: 'muted' }, 'Some of these relatives met and had children together, so a little of their DNA lives on in people today.'),
        );
      }
      pane.appendChild(h('div', { class: 'actions' }, open));
    },
  };
}
