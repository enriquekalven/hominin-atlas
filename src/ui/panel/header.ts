/**
 * Panel header: species name (h2), scientific / common name and date range.
 */
import { localizedSpecies } from '../../i18n';
import type { UICtx } from '../context';
import { currentSpecies } from '../context';
import { h } from '../dom';
import { formatKaRange } from '../format';
import { taxon } from '../widgets';

export function renderPanelHeader(el: HTMLElement, ctx: UICtx): void {
  const sp = currentSpecies(ctx);
  const { audience, lang } = ctx.store.get();
  if (!sp) {
    el.replaceChildren(
      h('h2', { class: 'panel__name' }, ctx.species.length === 0 ? 'Species information' : 'Choose a species'),
      h(
        'p',
        { class: 'panel__sub' },
        ctx.species.length === 0 ? 'The species data is still being added.' : 'Pick a relative from the list to begin.',
      ),
    );
    return;
  }
  const loc = localizedSpecies(sp, lang);
  const dates = h('span', { class: 'panel__dates num' }, formatKaRange(sp.rangeKa.start, sp.rangeKa.end));
  const nickname = sp.nickname ? h('span', { class: 'panel__nick' }, `“${sp.nickname}”`) : null;
  const sep = () => h('span', { class: 'sep', 'aria-hidden': 'true' }, '·');
  if (audience === 'kids') {
    el.replaceChildren(
      h('h2', { class: 'panel__name' }, loc.common.kids),
      h('p', { class: 'panel__sub' }, taxon(sp.binomial), nickname ? [sep(), nickname] : null, sep(), dates),
    );
  } else {
    el.replaceChildren(
      h('h2', { class: 'panel__name panel__name--taxon' }, taxon(sp.binomial)),
      h('p', { class: 'panel__sub' }, loc.common.clinician, nickname ? [sep(), nickname] : null, sep(), dates),
    );
  }
}
