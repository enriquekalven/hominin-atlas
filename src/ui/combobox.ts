/**
 * Species search / jump: ARIA 1.2 combobox (input + listbox popup with aria-activedescendant).
 */
import type { Species } from '../data/types';
import type { UICtx } from './context';
import { watch } from './context';
import { h, uid } from './dom';
import { icon } from './icons';
import { searchSpecies } from './filters';
import { speciesDates, speciesName } from './format';
import { taxon } from './widgets';
import { selectSpecies } from './actions';

export function speciesCombobox(ctx: UICtx): HTMLElement {
  const listId = uid('species-list');
  const inputId = uid('species-search');
  const input = h('input', {
    id: inputId,
    type: 'search',
    class: 'combo__input',
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-expanded': 'false',
    'aria-controls': listId,
    autocomplete: 'off',
    spellcheck: 'false',
    enterkeyhint: 'go',
  });
  const list = h('ul', { id: listId, role: 'listbox', class: 'combo__list', 'aria-label': 'Matching species', hidden: true });
  const wrap = h(
    'div',
    { class: 'combo' },
    h('label', { for: inputId, class: 'sr-only' }, 'Find a species'),
    icon('search', 'combo__icon'),
    input,
    list,
  );

  let results: Species[] = [];
  let active = -1;

  const setActive = (i: number) => {
    active = i;
    list.querySelectorAll<HTMLElement>('[role="option"]').forEach((opt, j) => {
      opt.setAttribute('aria-selected', String(j === i));
      if (j === i) opt.scrollIntoView({ block: 'nearest' });
    });
    if (i >= 0) input.setAttribute('aria-activedescendant', `${listId}-${i}`);
    else input.removeAttribute('aria-activedescendant');
  };

  const close = () => {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    setActive(-1);
  };

  const choose = (sp: Species | undefined) => {
    if (!sp) return;
    selectSpecies(ctx, sp.id);
    input.value = '';
    close();
    ctx.announce(`Showing ${speciesName(sp, ctx.store.get().audience)}`);
  };

  const renderList = () => {
    const audience = ctx.store.get().audience;
    results = searchSpecies(ctx.species, input.value);
    const items =
      ctx.species.length === 0
        ? [h('li', { class: 'combo__empty', role: 'presentation' }, 'No species in the atlas yet.')]
        : results.length === 0
          ? [h('li', { class: 'combo__empty', role: 'presentation' }, `No species match “${input.value.trim()}”.`)]
          : results.map((sp, i) => {
              const li = h(
                'li',
                { id: `${listId}-${i}`, role: 'option', class: 'combo__opt', 'aria-selected': 'false' },
                h('span', { class: 'combo__name' }, audience === 'kids' ? sp.common.kids : taxon(sp.binomial)),
                h('span', { class: 'combo__meta' }, audience === 'kids' ? taxon(sp.binomial) : sp.common.clinician),
                h('span', { class: 'combo__date num' }, speciesDates(sp)),
              );
              li.addEventListener('pointerdown', (e) => e.preventDefault()); // keep focus in the input
              li.addEventListener('click', () => choose(sp));
              return li;
            });
    list.replaceChildren(...items);
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    setActive(results.length > 0 && input.value.trim() ? 0 : -1);
  };

  input.addEventListener('input', renderList);
  input.addEventListener('focus', () => {
    if (input.value.trim()) renderList();
  });
  input.addEventListener('blur', () => window.setTimeout(close, 0));
  input.addEventListener('keydown', (e) => {
    const open = !list.hidden;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) renderList();
      else if (results.length) setActive((active + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (open && results.length) setActive(active <= 0 ? results.length - 1 : active - 1);
    } else if (e.key === 'Enter') {
      if (open && active >= 0) {
        e.preventDefault();
        choose(results[active]);
      } else if (results.length === 1) {
        e.preventDefault();
        choose(results[0]);
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        e.stopPropagation();
        close();
      } else if (input.value) {
        e.preventDefault();
        e.stopPropagation();
        input.value = '';
      }
    }
  });

  watch(ctx.store, (s) => s.audience, (a) => {
    const empty = ctx.species.length === 0;
    input.placeholder = empty ? 'No species yet' : a === 'kids' ? 'Find a relative…' : 'Search taxa, nicknames…';
    if (!list.hidden) renderList();
  });
  return wrap;
}
