/**
 * Store actions shared by several regions, so every entry point (rail, search, timeline, tree,
 * shortcuts) changes selection the same way.
 */
import type { Panel } from '../app/store';
import type { SpeciesId } from '../data/types';
import type { UICtx } from './context';
import { railOrder } from './filters';

/** Select a species and clear everything that belonged to the previous one. */
export function selectSpecies(ctx: UICtx, id: SpeciesId): void {
  const s = ctx.store.get();
  if (!ctx.byId.has(id)) return;
  if (s.speciesId === id) return;
  ctx.store.set({
    speciesId: id,
    specimenId: null,
    selectedLesionId: null,
    selectedBoneId: null,
    healingT: 1,
    morphT: 0,
    compareSpeciesId: s.compareSpeciesId === id ? null : s.compareSpeciesId,
  });
}

/** Move to the previous / next species in rail order (clamped at both ends). */
export function stepSpecies(ctx: UICtx, delta: number): SpeciesId | null {
  const order = railOrder(ctx.species);
  if (order.length === 0) return null;
  const idx = order.findIndex((sp) => sp.id === ctx.store.get().speciesId);
  const next = order[Math.min(order.length - 1, Math.max(0, (idx < 0 ? 0 : idx) + delta))];
  selectSpecies(ctx, next.id);
  return next.id;
}

/** Select (or clear) a lesion; selecting also asks the viewer to frame it. */
export function selectLesion(ctx: UICtx, lesionId: string | null): void {
  ctx.store.set({ selectedLesionId: lesionId, healingT: 1 });
  if (lesionId) ctx.events.emit('ui:focus-lesion', { lesionId });
}

export function selectSpecimen(ctx: UICtx, specimenId: string): void {
  const s = ctx.store.get();
  if (s.specimenId === specimenId) return;
  ctx.store.set({ specimenId, selectedLesionId: null, selectedBoneId: null, healingT: 1 });
}

/** Switch the info panel tab and reveal it on small screens. */
export function openTab(ctx: UICtx, panel: Panel): void {
  ctx.store.set({ panel });
  ctx.expandPanel();
}
