/**
 * Top bar: wordmark (the page's only h1), tagline, species search, audience toggle, language selector, and tools.
 */
import { LANG_CODES, type Audience, type LangCode } from '../data/types';
import { pickDual, SUPPORTED_LANGUAGES, uiText } from '../i18n';
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

/** Simple skull-and-axis mark drawn with CSS-friendly SVG (decorative). */
function wordmarkGlyph(): HTMLElement {
  return h('span', { class: 'brand__glyph', 'aria-hidden': 'true' });
}

export function mountTopbar(root: HTMLElement, ctx: UICtx, actions: TopbarActions): void {
  const { store } = ctx;
  const brandName = h('h1', { class: 'brand__name' }, 'Hominin Atlas');
  const tagline = h('p', { class: 'brand__tagline' });
  const brand = h('div', { class: 'brand' }, wordmarkGlyph(), h('div', { class: 'brand__text' }, brandName, tagline));

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

  const langSelect = h(
    'select',
    { class: 'select tb-lang', 'aria-label': 'Language' },
    SUPPORTED_LANGUAGES.map((l) => h('option', { value: l.code }, l.label)),
  );
  langSelect.value = store.get().lang;
  langSelect.addEventListener('change', () => {
    const val = langSelect.value;
    if ((LANG_CODES as readonly string[]).includes(val)) {
      store.set({ lang: val as LangCode });
    }
  });

  const lineup = toggleButton({
    label: 'Size line-up',
    icon: 'lineup',
    pressed: store.get().lineup,
    onToggle: (next) => store.set({ lineup: next }),
    className: 'tb-btn',
  });
  const quiz = iconButton('quiz', 'Quiz', () => store.set({ quizOpen: true }), { class: 'btn tb-btn tb-quiz' });
  const shareLink = () => {
    const url = window.location.href;
    const okMsg = store.get().audience === 'kids' ? 'Link copied! Share this hominin with a friend.' : 'Deep link copied to clipboard.';
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(url).then(() => ctx.toast(okMsg, 'success'), () => ctx.toast(url, 'info'));
    } else {
      ctx.toast(url, 'info');
    }
  };
  const tools = h(
    'div',
    { class: 'tb-tools', role: 'group', 'aria-label': 'Tools' },
    iconButton('tree', 'Family tree', () => actions.openTree(), { class: 'btn tb-btn' }),
    lineup.el,
    quiz,
    iconButton('book', 'Glossary', () => openTab(ctx, 'glossary'), { class: 'btn tb-btn' }),
    iconButton('upload', 'Load scan', () => actions.openScan(), { class: 'btn tb-btn' }),
    iconButton('link', 'Share', shareLink, { class: 'btn tb-btn', title: 'Copy link to current view' }),
    langSelect,
  );
  const help = iconButton('help', 'Help', () => actions.openHelp(), {
    class: 'btn tb-btn tb-help',
    'aria-keyshortcuts': 'Shift+Slash',
  });

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

  root.replaceChildren(brand, h('div', { class: 'tb-audience' }, audience.el), searchToggle, search, tools, help);

  watch(store, (s) => `${s.audience}|${s.lang}`, () => {
    const s = store.get();
    const t = uiText(s.lang);
    audience.update(s.audience);
    audience.relabel({ kids: t.audienceKids, clinician: t.audienceClinician });
    langSelect.value = s.lang;
    langSelect.setAttribute('aria-label', t.languageLabel);
    brandName.textContent = t.atlasTitle;
    tagline.textContent = pickDual(t.tagline, s.audience);
    quiz.classList.toggle('btn--primary', s.audience === 'kids');
  });
  store.select((s) => s.lineup, (on) => lineup.update(on));
}
