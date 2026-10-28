/**
 * Shared UI context passed to every region, plus tiny store-binding helpers.
 */
import type { AppState, Store } from '../app/store';
import type { EventBus } from '../app/events';
import type { Audience, Species, SpeciesId } from '../data/types';

export type ToastKind = 'info' | 'success' | 'error';

export interface UICtx {
  store: Store;
  events: EventBus;
  /** All taxa, oldest first (as passed to mountUI). May be empty while data is being curated. */
  species: readonly Species[];
  byId: ReadonlyMap<SpeciesId, Species>;
  /** Polite screen-reader announcement. */
  announce(message: string): void;
  toast(message: string, kind?: ToastKind): void;
  /** On small screens, slide the info panel (bottom sheet) up. No-op on wide layouts. */
  expandPanel(): void;
}

export function currentSpecies(ctx: UICtx): Species | undefined {
  return ctx.byId.get(ctx.store.get().speciesId);
}

export function audienceOf(ctx: UICtx): Audience {
  return ctx.store.get().audience;
}

/** Run `fn` now and whenever the selected value changes. Returns the unsubscribe function. */
export function watch<T>(store: Store, selector: (s: AppState) => T, fn: (value: T) => void): () => void {
  fn(selector(store.get()));
  return store.select(selector, (v) => fn(v));
}
