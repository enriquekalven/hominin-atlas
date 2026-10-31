/**
 * Competing phylogenetic topology switcher (Consensus East African Homo vs. Berger 2010
 * A. sediba sister-to-Homo vs. Welker 2020 H. antecessor palaeoproteomic LCA).
 */
import {
  PHYLOGENY_HYPOTHESES,
  getPhylogenyHypothesis,
  type PhylogenyHypothesisId,
} from '../data';
import type { Audience } from '../data/types';
import type { UICtx } from './context';
import { h } from './dom';
import { pick } from './labels';
import { segmented } from './widgets';

export function renderPhylogenyBar(
  ctx: UICtx,
  audience: Audience,
  onSelect?: (id: PhylogenyHypothesisId) => void,
): HTMLElement {
  const current = ctx.store.get().phylogenyHypothesis;
  const summaryEl = h('p', { class: 'phylo-bar__summary' }, pick(getPhylogenyHypothesis(current).summary, audience));
  const seg = segmented<PhylogenyHypothesisId>({
    label: audience === 'kids' ? 'Family tree model' : 'Phylogenetic topology hypothesis',
    options: PHYLOGENY_HYPOTHESES.map((m) => ({
      value: m.id,
      label: pick(m.shortLabel, audience),
    })),
    value: current,
    onChange(next) {
      seg.update(next);
      summaryEl.textContent = pick(getPhylogenyHypothesis(next).summary, audience);
      ctx.store.set({ phylogenyHypothesis: next });
      onSelect?.(next);
    },
  });
  return h('div', { class: 'phylo-bar' }, seg.el, summaryEl);
}
