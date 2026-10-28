/**
 * Viewport overlay toolbar: render mode, framing, view toggles, camera reset, snapshot and the
 * clinician tools (measure, section plane). Every control writes the store; the viewer reacts.
 */
import type { Framing, RenderMode, Tool } from '../app/store';
import type { UICtx } from './context';
import { watch } from './context';
import { h, uid } from './dom';
import { RENDER_MODE_LABEL, pick } from './labels';
import { iconButton, segmented, toggleButton } from './widgets';

export function overlayToolbar(ctx: UICtx): HTMLElement {
  const { store, events } = ctx;
  const s0 = store.get();
  const render = segmented<RenderMode>({
    label: 'Render mode',
    className: 'seg--render',
    options: (['fossil', 'bone', 'xray'] as const).map((v) => ({ value: v, label: pick(RENDER_MODE_LABEL[v], s0.audience) })),
    value: s0.renderMode,
    onChange: (v) => store.set({ renderMode: v }),
  });
  const framing = segmented<Framing>({
    label: 'Framing',
    options: [
      { value: 'body', label: 'Body' },
      { value: 'skull', label: 'Skull' },
    ],
    value: s0.framing,
    onChange: (v) => store.set({ framing: v }),
  });
  const flesh = toggleButton({
    label: 'Skin & attire',
    icon: 'outline',
    pressed: s0.showFlesh,
    onToggle: (v) => store.set({ showFlesh: v }),
    className: 'ov-btn ov-btn--flesh',
  });
  const ghosts = toggleButton({
    label: 'Missing bones as ghosts',
    icon: 'ghost',
    pressed: s0.showReconstructed,
    onToggle: (v) => store.set({ showReconstructed: v }),
    className: 'ov-btn',
  });
  const rotate = toggleButton({ label: 'Auto-rotate', icon: 'rotate', pressed: s0.autoRotate, onToggle: (v) => store.set({ autoRotate: v }), className: 'ov-btn' });
  const reset = iconButton('reset', 'Reset camera', () => events.emit('ui:reset-camera', {}), { class: 'btn ov-btn', 'aria-keyshortcuts': 'R' });
  const snap = iconButton('camera', 'Snapshot', () => events.emit('ui:snapshot', {}), { class: 'btn ov-btn' });

  // Clinician tools.
  const toolBtn = (tool: Exclude<Tool, 'orbit'>, label: string, iconName: 'ruler' | 'section') =>
    toggleButton({
      label,
      icon: iconName,
      pressed: s0.tool === tool,
      onToggle: (on) => store.set({ tool: on ? tool : 'orbit' }),
      className: 'ov-btn',
    });
  const measure = toolBtn('measure', 'Measure', 'ruler');
  const section = toolBtn('section', 'Section', 'section');
  const levelId = uid('section-level');
  const level = h('input', { id: levelId, type: 'range', min: '0', max: '1', step: '0.01', class: 'range range--compact' });
  level.addEventListener('input', () => store.set({ sectionLevel: Number(level.value) }));
  const levelField = h(
    'div',
    { class: 'ov-section' },
    h('label', { for: levelId }, 'Section height'),
    level,
    h('output', { for: levelId, class: 'num ov-section__value' }),
  );
  const tools = h('div', { class: 'ov-group ov-tools', role: 'group', 'aria-label': 'Clinician tools' }, measure.el, section.el, levelField);

  watch(store, (s) => s.audience, (a) => {
    render.relabel({ xray: pick(RENDER_MODE_LABEL.xray, a) });
    tools.hidden = a !== 'clinician';
    // Clinician-only tools switch off in kids mode.
    if (a === 'kids' && store.get().tool !== 'orbit') store.set({ tool: 'orbit' });
  });
  store.select((s) => s.renderMode, (v) => render.update(v));
  store.select((s) => s.framing, (v) => framing.update(v));
  store.select((s) => s.showFlesh, flesh.update);
  store.select((s) => s.showReconstructed, ghosts.update);
  store.select((s) => s.autoRotate, rotate.update);
  watch(store, (s) => s.tool, (t) => {
    measure.update(t === 'measure');
    section.update(t === 'section');
    levelField.hidden = t !== 'section';
  });
  watch(store, (s) => s.sectionLevel, (v) => {
    level.value = String(v);
    const pct = `${Math.round(v * 100)}% of stature`;
    level.setAttribute('aria-valuetext', pct);
    (levelField.lastElementChild as HTMLElement).textContent = `${Math.round(v * 100)}%`;
  });

  return h(
    'div',
    { class: 'ov-toolbar' },
    h('div', { class: 'ov-group', role: 'group', 'aria-label': 'Appearance' }, render.el, framing.el),
    h('div', { class: 'ov-group', role: 'group', 'aria-label': 'View options' }, flesh.el, ghosts.el, rotate.el, reset, snap),
    tools,
  );
}
