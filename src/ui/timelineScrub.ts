/**
 * Time scrubber: a native range input (keyboard + screen-reader friendly) plus pointer dragging
 * anywhere on the timeline background. Lists the species alive at the chosen moment.
 * The scrub position is local UI state (it does not drive the 3D view).
 */
import type { UICtx } from './context';
import { button, h } from './dom';
import { formatWhen, roundSig, speciesName } from './format';
import { aliveAt, aliveCaption, aliveReadout, kaToT, tToKa } from './timeScale';
import { selectSpecies } from './actions';
import { taxon } from './widgets';

const STEPS = 1000;

export function mountScrubber(opts: { ctx: UICtx; plot: HTMLElement; lanes: HTMLElement; head: HTMLElement }): { refresh(): void } {
  const { ctx, plot, lanes, head } = opts;
  let t = kaToT(50);

  const input = h('input', { type: 'range', min: '0', max: String(STEPS), step: '1', class: 'tl-scrub' });
  const cursor = h('div', { class: 'tl-cursor', 'aria-hidden': 'true' });
  const label = h('span', { class: 'tl-cursor__label num', 'aria-hidden': 'true' });
  const row = h('div', { class: 'tl-scrubrow' }, h('span', { class: 'tl-track', 'aria-hidden': 'true' }), label, input);
  const caption = h('p', { class: 'tl-caption' });
  const chips = h('div', { class: 'tl-alive chips', role: 'group' });
  plot.append(cursor, row);
  head.append(caption, chips);

  const render = () => {
    const audience = ctx.store.get().audience;
    const ka = roundSig(tToKa(t), 2);
    const alive = aliveAt(ctx.species, ka);
    const when = formatWhen(ka, audience);
    input.value = String(Math.round(t * STEPS));
    input.setAttribute('aria-label', audience === 'kids' ? 'Travel through time' : 'Time scrubber');
    input.setAttribute('aria-valuetext', `${when}: ${alive.length} species alive`);
    cursor.style.left = `${(t * 100).toFixed(3)}%`;
    label.style.left = `${(t * 100).toFixed(3)}%`;
    label.textContent = when;
    label.dataset.side = t > 0.72 ? 'left' : 'right';
    if (ctx.species.length === 0) {
      caption.textContent = audience === 'kids' ? 'Drag the time slider to travel back in time.' : 'Drag the scrubber to list taxa alive at a given time.';
      chips.replaceChildren();
      return;
    }
    caption.textContent =
      audience === 'kids'
        ? aliveCaption(ka, alive)
        : aliveReadout(ka, alive.length, audience);
    chips.setAttribute('aria-label', audience === 'kids' ? 'Alive at this time' : 'Taxa alive at this time');
    chips.replaceChildren(
      ...alive.map((sp) =>
        button(audience === 'kids' ? sp.common.kids : taxon(sp.binomial), { class: 'chip chip--small', title: speciesName(sp, audience) }, () =>
          selectSpecies(ctx, sp.id),
        ),
      ),
    );
  };

  let frame = 0;
  const setT = (next: number) => {
    t = Math.min(1, Math.max(0, next));
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        render();
      });
    }
  };

  input.addEventListener('input', () => setT(Number(input.value) / STEPS));

  // Drag on empty timeline space (bars stay clickable).
  let dragging = false;
  const tFromEvent = (e: PointerEvent) => {
    const r = lanes.getBoundingClientRect();
    return r.width > 0 ? (e.clientX - r.left) / r.width : t;
  };
  lanes.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).closest('.tl-bar') || e.button !== 0) return;
    dragging = true;
    lanes.setPointerCapture(e.pointerId);
    lanes.classList.add('is-scrubbing');
    setT(tFromEvent(e));
  });
  lanes.addEventListener('pointermove', (e) => {
    if (dragging) setT(tFromEvent(e));
  });
  const end = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    lanes.classList.remove('is-scrubbing');
    if (lanes.hasPointerCapture(e.pointerId)) lanes.releasePointerCapture(e.pointerId);
  };
  lanes.addEventListener('pointerup', end);
  lanes.addEventListener('pointercancel', end);

  render();
  return { refresh: render };
}
