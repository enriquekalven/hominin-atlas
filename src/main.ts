import { createStore } from './app/store';
import { createEventBus } from './app/events';
import { SPECIES } from './data';
import { mountUI } from './ui';
import { createViewer } from './viewer';

function boot(): void {
  const store = createStore();
  const events = createEventBus();

  // Reconcile persisted species with the dataset (dataset may change between versions).
  const ids = new Set(SPECIES.map((s) => s.id));
  if (SPECIES.length > 0 && !ids.has(store.get().speciesId)) {
    store.set({ speciesId: SPECIES[SPECIES.length - 1].id, specimenId: null });
  }

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
