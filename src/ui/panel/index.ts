/**
 * Info panel shell: species header, tabs (store.panel) and lazily rendered tab panels.
 * Each tab declares a dependency key; it re-renders only when visible and its key changes.
 * On small screens the panel is a bottom sheet with a handle (peek ⇄ open).
 */
import type { AppState, Panel } from '../../app/store';
import type { UICtx } from '../context';
import { currentSpecies, watch } from '../context';
import { button, createScope, h, type Scope } from '../dom';
import { PANEL_ORDER, TAB_LABEL, pick } from '../labels';
import { stopIfDetached, stopSpeaking } from '../speech';
import { renderPanelHeader } from './header';
import { createOverviewTab } from './overview';
import { createInjuriesTab } from './injuries';
import { createSpecimensTab } from './specimens';
import { createCompareTab } from './compare';
import { createTreeTab } from './treeTab';
import { createGlossaryTab } from './glossary';

export interface TabView {
  key(s: AppState): string;
  render(container: HTMLElement, scope: Scope): void;
}

export interface PanelDeps {
  openTree(): void;
}

export function mountPanel(root: HTMLElement, ctx: UICtx, deps: PanelDeps): { expand(): void } {
  const { store } = ctx;
  const views: Record<Panel, TabView> = {
    overview: createOverviewTab(ctx),
    injuries: createInjuriesTab(ctx),
    specimens: createSpecimensTab(ctx),
    compare: createCompareTab(ctx),
    tree: createTreeTab(ctx, deps.openTree),
    glossary: createGlossaryTab(ctx),
  };

  const handle = button(h('span', { class: 'sheet-handle__bar', 'aria-hidden': 'true' }), {
    class: 'sheet-handle',
    'aria-controls': 'panel-body',
    'aria-expanded': 'false',
    'aria-label': 'Show species details',
  });
  const header = h('div', { class: 'panel__title' });
  const tablist = h('div', { role: 'tablist', class: 'tabs', 'aria-label': 'Species information' });
  const body = h('div', { id: 'panel-body', class: 'panel__body' });
  const tabs = new Map<Panel, HTMLButtonElement>();
  const panes = new Map<Panel, HTMLElement>();
  const scopes = new Map<Panel, Scope>();
  const keys = new Map<Panel, string>();

  const setSheet = (open: boolean) => {
    root.dataset.sheet = open ? 'open' : 'peek';
    handle.setAttribute('aria-expanded', String(open));
    handle.setAttribute('aria-label', open ? 'Hide species details' : 'Show species details');
  };

  for (const p of PANEL_ORDER) {
    const tab = button(null, { role: 'tab', id: `tab-${p}`, class: 'tab', 'aria-controls': `pane-${p}` });
    tab.addEventListener('click', () => {
      store.set({ panel: p });
      setSheet(true);
    });
    const pane = h('section', { role: 'tabpanel', id: `pane-${p}`, class: 'pane', 'aria-labelledby': `tab-${p}`, tabindex: '0' });
    tabs.set(p, tab);
    panes.set(p, pane);
    tablist.appendChild(tab);
    body.appendChild(pane);
  }

  tablist.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const idx = PANEL_ORDER.indexOf(store.get().panel);
    const n = PANEL_ORDER.length;
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (idx + (e.key === 'ArrowLeft' ? -1 : 1) + n) % n;
    store.set({ panel: PANEL_ORDER[next] });
    tabs.get(PANEL_ORDER[next])?.focus();
  });

  root.replaceChildren(h('div', { class: 'panel__head' }, handle, header, tablist), body);
  setSheet(false);

  // Handle: tap toggles; a vertical drag of more than 24px opens (up) or closes (down).
  let dragY: number | null = null;
  let dragged = false;
  handle.addEventListener('pointerdown', (e) => {
    dragY = e.clientY;
    dragged = false;
  });
  handle.addEventListener('pointerup', (e) => {
    if (dragY !== null && Math.abs(e.clientY - dragY) > 24) {
      setSheet(e.clientY < dragY);
      dragged = true;
    }
    dragY = null;
  });
  handle.addEventListener('click', () => {
    if (dragged) {
      dragged = false;
      return;
    }
    setSheet(root.dataset.sheet !== 'open');
  });

  const renderActive = () => {
    const s = store.get();
    const p = s.panel;
    const key = views[p].key(s);
    if (keys.get(p) === key) return;
    keys.set(p, key);
    scopes.get(p)?.dispose();
    const scope = createScope();
    scopes.set(p, scope);
    const pane = panes.get(p);
    if (!pane) return;
    // Keep keyboard focus on the "same" control across re-renders (controls carry data-fk).
    const focused = document.activeElement instanceof HTMLElement && pane.contains(document.activeElement) ? document.activeElement : null;
    const fk = focused?.dataset.fk;
    pane.replaceChildren();
    views[p].render(pane, scope);
    if (focused) {
      const target = fk ? pane.querySelector<HTMLElement>(`[data-fk="${CSS.escape(fk)}"]`) : null;
      (target ?? pane).focus({ preventScroll: true });
    }
    stopIfDetached();
  };

  const showTab = (p: Panel) => {
    for (const [id, tab] of tabs) {
      const on = id === p;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      const pane = panes.get(id);
      if (pane) pane.hidden = !on;
    }
    stopSpeaking(); // the speaking button may now be hidden
    renderActive();
  };

  const updateCount = () => {
    const tab = tabs.get('injuries');
    if (!tab) return;
    tab.querySelector('.count')?.remove();
    const sp = currentSpecies(ctx);
    const id = store.get().specimenId;
    const spec = sp ? (sp.specimens.find((x) => x.id === id) ?? sp.specimens.find((x) => x.isFlagship) ?? sp.specimens[0]) : undefined;
    const n = spec?.lesions.length ?? 0;
    if (n > 0) tab.appendChild(h('span', { class: 'count num', 'aria-label': `(${n})` }, String(n)));
  };

  watch(store, (s) => `${s.speciesId}|${s.audience}`, () => {
    stopSpeaking();
    renderPanelHeader(header, ctx);
  });
  watch(store, (s) => s.audience, (a) => {
    for (const [p, tab] of tabs) tab.replaceChildren(h('span', { class: 'tab__label' }, pick(TAB_LABEL[p], a)));
    updateCount();
  });
  store.select((s) => `${s.speciesId}|${s.specimenId}`, updateCount);
  watch(store, (s) => s.panel, showTab);
  store.subscribe(() => renderActive());
  // A lesion picked in the 3D view (hotspot) opens the injuries tab and reveals the sheet.
  store.select((s) => s.selectedLesionId, (id) => {
    if (!id) return;
    if (store.get().panel !== 'injuries') store.set({ panel: 'injuries' });
    setSheet(true);
  });

  return { expand: () => setSheet(true) };
}
