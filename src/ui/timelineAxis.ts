/**
 * Timeline axis: tick labels thinned to the available width (ResizeObserver) and faint grid lines.
 */
import type { Audience } from '../data/types';
import { h } from './dom';
import { TICKS, kaToT, tickAlign, visibleTicks, type Tick } from './timeScale';

/** Rough label width at the axis font size (≈ 7.4 px per character at 12–13 px, plus padding). */
const labelPx = (audience: Audience) => (t: Tick) =>
  (audience === 'kids' ? t.label.kids : t.label.clinician).length * (audience === 'kids' ? 8.2 : 7.2) + 6;

export interface Axis {
  refresh(): void;
}

export function mountAxis(axis: HTMLElement, grid: HTMLElement, getAudience: () => Audience): Axis {
  let lastKey = '';
  const render = () => {
    const width = axis.clientWidth;
    const audience = getAudience();
    const ticks = visibleTicks(TICKS, width, labelPx(audience));
    const key = `${audience}|${ticks.map((t) => t.ka).join(',')}`;
    if (key === lastKey) return;
    lastKey = key;
    axis.replaceChildren(
      ...ticks.map((t) => {
        const pos = kaToT(t.ka);
        const el = h('span', { class: 'tl-tick num', 'data-align': tickAlign(pos) }, audience === 'kids' ? t.label.kids : t.label.clinician);
        el.style.left = `${(pos * 100).toFixed(3)}%`;
        return el;
      }),
    );
    grid.replaceChildren(
      ...ticks.map((t) => {
        const el = h('span', { class: 'tl-gridline' });
        el.style.left = `${(kaToT(t.ka) * 100).toFixed(3)}%`;
        return el;
      }),
    );
  };
  render();
  if (typeof ResizeObserver === 'function') new ResizeObserver(() => render()).observe(axis);
  else window.addEventListener('resize', render);
  return { refresh: render };
}
