/**
 * Species rail: oldest → youngest, grouped by clade. A list of buttons with aria-current and a
 * roving tabindex; arrow keys move the selection (selection follows focus), Home / End jump.
 */
import type { Audience, Species, SpeciesId } from '../data/types';
import type { UICtx } from './context';
import { watch } from './context';
import { button, h, uid } from './dom';
import { groupSpecies, railOrder } from './filters';
import { abbreviateBinomial, speciesDates } from './format';
import { GROUP_LABEL, pick } from './labels';
import { portrait } from './portrait';
import { emptyState, taxon } from './widgets';
import { selectSpecies } from './actions';

export function mountRail(root: HTMLElement, ctx: UICtx): void {
  const { store } = ctx;
  const buttons = new Map<SpeciesId, HTMLButtonElement>();
  const scroller = h('div', { class: 'rail__scroll' });
  root.replaceChildren(h('h2', { class: 'sr-only' }, 'Species'), scroller);

  const item = (sp: Species, audience: Audience): HTMLLIElement => {
    const name =
      audience === 'kids'
        ? h('span', { class: 'rail__name' }, sp.common.kids)
        : h('span', { class: 'rail__name' }, taxon(sp.binomial));
    const short = h(
      'span',
      { class: 'rail__short', 'aria-hidden': 'true' },
      audience === 'kids' ? sp.common.kids : taxon(abbreviateBinomial(sp.binomial)),
    );
    const b = button(
      [
        portrait(sp, 'portrait--thumb'),
        h('span', { class: 'rail__text' }, name, h('span', { class: 'rail__date num' }, speciesDates(sp))),
        short,
      ],
      {
        class: 'rail__item',
        'data-id': sp.id,
        title: audience === 'kids' ? `${sp.common.kids} (${sp.binomial})` : `${sp.binomial} — ${sp.common.clinician}`,
      },
      () => selectSpecies(ctx, sp.id),
    );
    buttons.set(sp.id, b);
    return h('li', null, b);
  };

  const build = (audience: Audience) => {
    buttons.clear();
    if (ctx.species.length === 0) {
      scroller.replaceChildren(
        emptyState(
          audience === 'kids' ? 'No relatives yet' : 'No taxa loaded',
          audience === 'kids' ? 'Scientists are still adding them. Check back soon!' : 'The species dataset is still being curated.',
        ),
      );
      return;
    }
    const groups = groupSpecies(ctx.species).map((g) => {
      const id = uid('rail-group');
      return h(
        'section',
        { class: 'rail__group', 'aria-labelledby': id },
        h('h3', { id, class: 'rail__group-title' }, pick(GROUP_LABEL[g.group], audience)),
        h('ul', { class: 'rail__list', role: 'list' }, g.species.map((sp) => item(sp, audience))),
      );
    });
    scroller.replaceChildren(...groups);
    sync(store.get().speciesId, false);
  };

  const sync = (id: SpeciesId, reveal: boolean) => {
    const hasSelected = buttons.has(id);
    let first = true;
    for (const [sid, b] of buttons) {
      const on = sid === id;
      if (on) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
      // Roving tabindex: the selected item (or the first one if none) is the single tab stop.
      b.tabIndex = on || (!hasSelected && first) ? 0 : -1;
      first = false;
    }
    if (reveal) buttons.get(id)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  scroller.addEventListener('keydown', (e) => {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    const target = e.target as HTMLElement;
    if (!keys.includes(e.key) || !target.classList.contains('rail__item')) return;
    e.preventDefault();
    const order = railOrder(ctx.species);
    const idx = order.findIndex((sp) => sp.id === target.dataset.id);
    let next = idx;
    if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = order.length - 1;
    else next = idx + (e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 1);
    next = Math.max(0, Math.min(order.length - 1, next));
    const sp = order[next];
    if (!sp) return;
    selectSpecies(ctx, sp.id);
    buttons.get(sp.id)?.focus();
  });

  watch(store, (s) => s.audience, build);
  store.select((s) => s.speciesId, (id) => sync(id, true));
}
