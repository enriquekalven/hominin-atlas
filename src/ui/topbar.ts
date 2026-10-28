/**
 * Top bar: wordmark (the page's only h1), tagline, species search, audience toggle and tools.
 */
import type { Audience } from '../data/types';
import type { UICtx } from './context';
import { watch } from './context';
import { button, h } from './dom';
import { icon } from './icons';
import { speciesCombobox } from './combobox';
import { iconButton, segmented, toggleButton } from './widgets';
import { openTab } from './actions';

export interface TopbarActions {
  openTree(): void;
  openHelp(): void;
  openScan(): void;
}

const TAGLINE: Record<Audience, string> = {
  kids: 'Meet our ancient relatives through their bones',
  clinician: 'Comparative skeletal anatomy and paleopathology of the hominins',
};

/** Simple skull-and-axis mark drawn with CSS-friendly SVG (decorative). */
function wordmarkGlyph(): HTMLElement {
  return h('span', { class: 'brand__glyph', 'aria-hidden': 'true' });
}

export function mountTopbar(root: HTMLElement, ctx: UICtx, actions: TopbarActions): void {
  const { store } = ctx;
  const tagline = h('p', { class: 'brand__tagline' });
  const brand = h(
    'div',
    { class: 'brand' },
    wordmarkGlyph(),
    h('div', { class: 'brand__text' }, h('h1', { class: 'brand__name' }, 'Hominin Atlas'), tagline),
  );

  const audience = segmented<Audience>({
    label: 'Audience',
    className: 'seg--audience',
    options: [
      { value: 'kids', label: 'Kids' },
      { value: 'clinician', label: 'Clinician' },
    ],
    value: store.get().audience,
    onChange: (a) => store.set({ audience: a }),
  });

  const lineup = toggleButton({
    label: 'Size line-up',
    icon: 'lineup',
    pressed: store.get().lineup,
    onToggle: (next) => store.set({ lineup: next }),
    className: 'tb-btn',
  });
  const quiz = iconButton('quiz', 'Quiz', () => store.set({ quizOpen: true }), { class: 'btn tb-btn tb-quiz' });
  const tools = h(
    'div',
    { class: 'tb-tools', role: 'group', 'aria-label': 'Tools' },
    iconButton('tree', 'Family tree', () => actions.openTree(), { class: 'btn tb-btn' }),
    lineup.el,
    quiz,
    iconButton('book', 'Glossary', () => openTab(ctx, 'glossary'), { class: 'btn tb-btn' }),
    iconButton('upload', 'Load scan', () => actions.openScan(), { class: 'btn tb-btn' }),
  );
  const help = iconButton('help', 'Help', () => actions.openHelp(), {
    class: 'btn tb-btn tb-help',
    'aria-keyshortcuts': 'Shift+Slash',
  });

  // Small screens: search collapses behind a toggle so the tool row keeps its hit targets.
  const search = h('div', { class: 'tb-search', id: 'tb-search' }, speciesCombobox(ctx));
  const searchToggle = button(icon('search'), {
    class: 'btn btn--icon tb-search-toggle',
    'aria-label': 'Find a species',
    'aria-controls': 'tb-search',
    'aria-expanded': 'false',
  });
  const setSearch = (open: boolean) => {
    root.dataset.search = open ? 'open' : 'closed';
    searchToggle.setAttribute('aria-expanded', String(open));
    searchToggle.replaceChildren(icon(open ? 'close' : 'search'));
    searchToggle.setAttribute('aria-label', open ? 'Close search' : 'Find a species');
  };
  searchToggle.addEventListener('click', () => {
    const open = root.dataset.search !== 'open';
    setSearch(open);
    if (open) search.querySelector<HTMLInputElement>('input')?.focus();
  });
  search.addEventListener('focusout', (e) => {
    const input = search.querySelector<HTMLInputElement>('input');
    const next = e.relatedTarget instanceof Node ? e.relatedTarget : null;
    if (root.dataset.search === 'open' && input && !input.value && next !== searchToggle && !(next && search.contains(next))) setSearch(false);
  });
  setSearch(false);

  root.replaceChildren(
    brand,
    h('div', { class: 'tb-audience' }, audience.el),
    searchToggle,
    search,
    tools,
    help,
  );

  watch(store, (s) => s.audience, (a) => {
    audience.update(a);
    tagline.textContent = TAGLINE[a];
    quiz.classList.toggle('btn--primary', a === 'kids');
  });
  store.select((s) => s.lineup, (on) => lineup.update(on));
}
