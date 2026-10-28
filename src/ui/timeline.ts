/**
 * Timeline (#timeline): log-scaled time axis with one bar per species (click to select) and a
 * draggable time scrubber listing who was alive at that moment.
 */
import type { Audience, Species, SpeciesId } from '../data/types';
import type { UICtx } from './context';
import { watch } from './context';
import { button, h } from './dom';
import { speciesDates, speciesName } from './format';
import { assignLanes, kaToT } from './timeScale';
import { mountAxis } from './timelineAxis';
import { mountScrubber } from './timelineScrub';
import { selectSpecies } from './actions';

export function mountTimeline(root: HTMLElement, ctx: UICtx): void {
  const { store } = ctx;
  const title = h('h2', { class: 'tl-title' });
  const head = h('div', { class: 'tl-head' }, title);
  const lanes = h('div', { class: 'tl-lanes', role: 'group' });
  const grid = h('div', { class: 'tl-grid', 'aria-hidden': 'true' });
  const axis = h('div', { class: 'tl-axis', 'aria-hidden': 'true' });
  // Ruler on top (tick labels), species lanes, then the playhead handle row (added by the scrubber).
  const plot = h('div', { class: 'tl-plot' }, axis, grid, lanes);
  root.replaceChildren(head, plot);

  const ordered = [...ctx.species].sort((a, b) => b.rangeKa.start - a.rangeKa.start);
  const intervals = ordered.map((sp) => ({ t0: kaToT(sp.rangeKa.start), t1: kaToT(sp.rangeKa.end) }));
  const { lanes: laneOf, count } = assignLanes(intervals, 0.012);
  lanes.style.setProperty('--lanes', String(Math.max(count, 1)));
  const bars = new Map<SpeciesId, HTMLButtonElement>();

  const buildBars = (audience: Audience) => {
    bars.clear();
    lanes.setAttribute('aria-label', audience === 'kids' ? 'When each relative lived' : 'Temporal ranges');
    if (ordered.length === 0) {
      lanes.replaceChildren(h('p', { class: 'tl-empty' }, 'Species time ranges will appear here once the data is added.'));
      return;
    }
    lanes.replaceChildren(
      ...ordered.map((sp, i) => {
        const { t0, t1 } = intervals[i];
        const name = speciesName(sp, audience);
        const b = button(h('span', { class: `tl-bar__label${t0 > 0.72 ? ' is-end' : ''}` }, name), {
          class: `tl-bar tl-bar--${sp.group}`,
          'data-id': sp.id,
          'aria-label': `${name}, ${speciesDates(sp)}`,
        }, () => selectSpecies(ctx, sp.id));
        b.style.left = `${(t0 * 100).toFixed(3)}%`;
        b.style.width = `max(6px, ${((t1 - t0) * 100).toFixed(3)}%)`;
        b.style.setProperty('--lane', String(laneOf[i]));
        bars.set(sp.id, b);
        return b;
      }),
    );
    syncSelected(store.get().speciesId);
  };

  const syncSelected = (id: SpeciesId) => {
    const has = bars.has(id);
    let first = true;
    for (const [sid, b] of bars) {
      const on = sid === id;
      b.classList.toggle('is-selected', on);
      if (on) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
      b.tabIndex = on || (!has && first) ? 0 : -1;
      first = false;
    }
  };

  // Roving focus across bars in chronological order; arrows move selection like the rail.
  lanes.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('tl-bar')) return;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const idx = ordered.findIndex((sp) => sp.id === target.dataset.id);
    const last = ordered.length - 1;
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? last : Math.max(0, Math.min(last, idx + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1)));
    const sp: Species | undefined = ordered[next];
    if (!sp) return;
    selectSpecies(ctx, sp.id);
    bars.get(sp.id)?.focus();
  });

  const axisCtl = mountAxis(axis, grid, () => store.get().audience);
  const scrub = mountScrubber({ ctx, plot, lanes, head });

  watch(store, (s) => s.audience, (a) => {
    title.textContent = a === 'kids' ? 'Time travel' : 'Timeline';
    buildBars(a);
    axisCtl.refresh();
    scrub.refresh();
  });
  store.select((s) => s.speciesId, syncSelected);
}
