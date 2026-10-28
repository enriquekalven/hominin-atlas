/**
 * UI entry point. Builds every DOM region except #viewport (owned by the 3D viewer).
 * All controls write to the shared store; the viewer and the UI react to store changes and talk
 * through the typed event bus. See docs/UI.md for the module map.
 */
import type { Store } from '../app/store';
import type { EventBus } from '../app/events';
import type { Species, SpeciesId } from '../data/types';
import { applyDocumentLang, localizedSpecies, uiText } from '../i18n';
import type { UICtx } from './context';
import { watch } from './context';
import { h } from './dom';
import { initDialogs, setDialogAudience } from './dialogs';
import { createToaster } from './toast';
import { bindSpeechLifecycle, stopSpeaking } from './speech';
import { mountTopbar } from './topbar';
import { mountRail } from './rail';
import { mountPanel } from './panel';
import { mountTimeline } from './timeline';
import { overlayToolbar } from './overlay';
import { lifeReconstructionCard } from './lifeCard';
import { kidsActions, measurementReadout, mountSnapshotDownload, overlayChips, progressBar, reconstructionCaption } from './overlayStatus';
import { mountScanLoader } from './scanDrop';
import { mountQuiz } from './quiz';
import { openTreeDialog } from './tree';
import { mountShortcuts, openHelpDialog } from './shortcuts';

export interface UIDeps {
  store: Store;
  events: EventBus;
  species: readonly Species[];
}

function region(id: string): HTMLElement | null {
  const el = document.getElementById(id);
  if (!el) console.warn(`UI: missing #${id} region`);
  return el;
}

export function mountUI(deps: UIDeps): void {
  const { store, events, species } = deps;
  const app = region('app');
  const topbar = region('topbar');
  const rail = region('rail');
  const stage = region('stage');
  const overlay = region('viewport-overlay');
  const panelRoot = region('panel');
  const timeline = region('timeline');
  const modalRoot = region('modal-root');
  const toastRoot = region('toast-root');
  if (!app || !topbar || !rail || !stage || !overlay || !panelRoot || !timeline) return;

  const announcer = h('div', { class: 'sr-only', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
  let panelApi: { expand(): void } | null = null;
  const ctx: UICtx = {
    store,
    events,
    species,
    byId: new Map<SpeciesId, Species>(species.map((s) => [s.id, s])),
    announce(message) {
      announcer.textContent = '';
      window.setTimeout(() => (announcer.textContent = message), 30);
    },
    toast: toastRoot ? createToaster(toastRoot) : () => undefined,
    expandPanel: () => panelApi?.expand(),
  };

  initDialogs(modalRoot ?? document.body);
  bindSpeechLifecycle();

  watch(store, (s) => s.audience, (a) => {
    app.setAttribute('data-audience', a);
    toastRoot?.setAttribute('data-audience', a);
    setDialogAudience(a);
    stopSpeaking();
  });

  const syncTitle = () => {
    const s = store.get();
    const sp = ctx.byId.get(s.speciesId);
    if (!sp) return;
    const loc = localizedSpecies(sp, s.lang);
    document.title = `${loc.common.clinician} · ${uiText(s.lang).atlasTitle}`;
  };

  watch(store, (s) => s.lang, (lang) => {
    applyDocumentLang(lang);
    stopSpeaking();
    syncTitle();
  });

  const scan = mountScanLoader(ctx, stage, overlay);
  const openTree = () => openTreeDialog(ctx);
  const openHelp = () => openHelpDialog(ctx);

  mountTopbar(topbar, ctx, { openTree, openHelp, openScan: scan.openDialog });
  topbar.appendChild(announcer);
  mountRail(rail, ctx);
  panelApi = mountPanel(panelRoot, ctx, { openTree });
  mountTimeline(timeline, ctx);

  overlay.append(
    progressBar(ctx),
    h('div', { class: 'ov-top' }, overlayToolbar(ctx)),
    lifeReconstructionCard(ctx),
    h(
      'div',
      { class: 'ov-bottom' },
      reconstructionCaption(),
      kidsActions(ctx),
      h('div', { class: 'ov-right' }, overlayChips(ctx), scan.chip, measurementReadout(ctx)),
    ),
  );
  mountSnapshotDownload(ctx);
  mountQuiz(ctx);
  mountShortcuts(ctx, openHelp);

  store.select((s) => s.speciesId, () => {
    stopSpeaking();
    syncTitle();
  });
  syncTitle();
}
