/**
 * "Healing timeline" what-if slider for fractures, bound to store.healingT
 * (0 = moment of injury, 1 = as the fossil was found).
 */
import type { Audience } from '../../data/types';
import type { UICtx } from '../context';
import { button, h, uid, type Scope } from '../dom';
import { HEALING_STAGES, healingStageIndex } from '../filters';

export function healingTimeline(ctx: UICtx, scope: Scope, audience: Audience): HTMLElement {
  const { store } = ctx;
  const id = uid('healing');
  const label = (i: number) => (audience === 'kids' ? HEALING_STAGES[i].kids : HEALING_STAGES[i].clinician);
  const input = h('input', {
    id,
    type: 'range',
    min: '0',
    max: '1',
    step: '0.01',
    class: 'range',
    'aria-describedby': `${id}-note`,
  });
  const readout = h('output', { class: 'healing__readout', for: id });
  const stageButtons = HEALING_STAGES.map((st, i) =>
    button(label(i), { class: 'healing__stage', 'data-stage': String(i) }, () => store.set({ healingT: st.t })),
  );

  const sync = (t: number) => {
    if (input.value !== String(t)) input.value = String(t);
    const i = healingStageIndex(t);
    readout.textContent = label(i);
    input.setAttribute('aria-valuetext', `${label(i)} (${Math.round(t * 100)}%)`);
    stageButtons.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
  };
  input.addEventListener('input', () => store.set({ healingT: Number(input.value) }));
  sync(store.get().healingT);
  scope.add(store.select((s) => s.healingT, sync));

  return h(
    'section',
    { class: 'healing' },
    h(
      'div',
      { class: 'healing__head' },
      h('label', { for: id, class: 'healing__title' }, audience === 'kids' ? 'Watch it heal' : 'Healing timeline'),
      h('span', { class: 'tag tag--whatif' }, 'What-if visualisation'),
    ),
    input,
    h('div', { class: 'healing__stages', role: 'group', 'aria-label': 'Jump to a healing stage' }, stageButtons),
    h('p', { class: 'healing__now' }, audience === 'kids' ? 'Now showing: ' : 'Stage: ', readout),
    h(
      'p',
      { id: `${id}-note`, class: 'note' },
      audience === 'kids'
        ? 'This shows how a broken bone usually heals. The real fossil only shows the end of the story.'
        : 'Illustrative sequence based on typical human fracture repair; not reconstructed from the specimen. The right end shows the fossil as found.',
    ),
  );
}
