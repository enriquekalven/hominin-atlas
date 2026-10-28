import { createStore, loadPersisted } from './app/store';
import { createEventBus } from './app/events';
import { parseUrlQuery, syncUrlWithStore } from './app/url';
import { SPECIES } from './data';
import { mountUI } from './ui';
import { createViewer } from './viewer';

function boot(): void {
  let persistedSpecies: typeof SPECIES[number]['id'] | undefined;
  try {
    persistedSpecies = loadPersisted(typeof localStorage === 'undefined' ? null : localStorage).speciesId;
  } catch {
    persistedSpecies = undefined;
  }
  const urlInitial = typeof window !== 'undefined' ? parseUrlQuery(window.location.search, SPECIES, persistedSpecies) : {};
  // Explicit species in URL without specimen resets persisted specimenId so another taxon's specimen isn't inherited.
  if (urlInitial.speciesId && urlInitial.specimenId === undefined) {
    urlInitial.specimenId = null;
  }
  const store = createStore(urlInitial);
  const events = createEventBus();

  // Reconcile persisted species with the dataset (dataset may change between versions).
  const ids = new Set(SPECIES.map((s) => s.id));
  if (SPECIES.length > 0 && !ids.has(store.get().speciesId)) {
    store.set({ speciesId: SPECIES[SPECIES.length - 1].id, specimenId: null });
  }
  syncUrlWithStore(store);

  mountUI({ store, events, species: SPECIES });

  const container = document.getElementById('viewport');
  if (container) {
    createViewer({ container, store, events, species: SPECIES });
  }

  // Exposed for automated smoke tests only (read-only snapshot, no secrets in state).
  (window as unknown as { __atlas?: unknown }).__atlas = {
    getState: () => ({ ...store.get() }),
    setState: (patch: Parameters<typeof store.set>[0]) => store.set(patch),
    events,
  };
}

boot();
