/**
 * Viewport overlay status layer: loading bar (viewer:progress), error toasts (viewer:error),
 * reconstruction caption, selected-bone chip, compare / line-up chips, measurement read-out,
 * kids animation buttons and snapshot download (viewer:snapshot).
 */
import { boneName } from '../anatomy/bones';
import type { UICtx } from './context';
import { watch } from './context';
import { button, h } from './dom';
import { icon } from './icons';
import { formatMm, speciesName } from './format';
import { RECONSTRUCTION_CAPTION } from './labels';
import { downloadBytes, parseImageDataUrl, snapshotFileName } from './download';
import { toggleButton } from './widgets';

export function progressBar(ctx: UICtx): HTMLElement {
  const fill = h('span', { class: 'progress__fill' });
  const label = h('span', { class: 'progress__label' });
  const bar = h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', hidden: true }, fill, label);
  let hideTimer = 0;
  ctx.events.on('viewer:progress', ({ done, total, label: text }) => {
    const pct = total > 0 ? Math.max(0, Math.min(100, Math.round((done / total) * 100))) : 0;
    window.clearTimeout(hideTimer);
    if (total > 0 && done >= total) {
      bar.hidden = true;
      return;
    }
    bar.hidden = false;
    bar.setAttribute('aria-valuenow', String(pct));
    bar.setAttribute('aria-label', text ? `Building skeleton: ${text}` : 'Building skeleton');
    fill.style.transform = `scaleX(${pct / 100})`;
    label.textContent = text ? `${text} · ${pct}%` : `${pct}%`;
  });
  ctx.events.on('viewer:ready', () => {
    hideTimer = window.setTimeout(() => (bar.hidden = true), 120);
  });
  ctx.events.on('viewer:error', ({ message }) => {
    bar.hidden = true;
    ctx.toast(typeof message === 'string' && message ? message : 'The 3D view had a problem.', 'error');
  });
  return bar;
}

export function overlayChips(ctx: UICtx): HTMLElement {
  const { store } = ctx;
  const wrap = h('div', { class: 'ov-chips' });
  const boneChip = h('div', { class: 'chip chip--status', hidden: true });
  const compareChip = h('div', { class: 'chip chip--status', hidden: true });
  const lineupChip = h('div', { class: 'chip chip--status', hidden: true });
  wrap.append(boneChip, compareChip, lineupChip);

  const closeBtn = (label: string, fn: () => void) => button(icon('close'), { class: 'chip__close', 'aria-label': label }, fn);
  watch(store, (s) => `${s.selectedBoneId}|${s.audience}`, () => {
    const s = store.get();
    boneChip.hidden = !s.selectedBoneId;
    if (!s.selectedBoneId) return boneChip.replaceChildren();
    const n = boneName(s.selectedBoneId);
    boneChip.replaceChildren(
      h('span', { class: 'chip__label' }, s.audience === 'kids' ? 'Bone: ' : 'Selected: '),
      h('strong', null, s.audience === 'kids' ? n.kids : n.clinician),
      closeBtn('Clear bone selection', () => store.set({ selectedBoneId: null })),
    );
  });
  watch(store, (s) => `${s.compareSpeciesId}|${s.speciesId}|${s.compareMode}|${s.audience}`, () => {
    const s = store.get();
    const b = s.compareSpeciesId ? ctx.byId.get(s.compareSpeciesId) : undefined;
    compareChip.hidden = !b;
    if (!b) return compareChip.replaceChildren();
    compareChip.replaceChildren(
      h('span', { class: 'chip__label' }, 'Comparing with '),
      h('strong', null, speciesName(b, s.audience)),
      closeBtn('Stop comparing', () => store.set({ compareSpeciesId: null })),
    );
  });
  watch(store, (s) => `${s.lineup}|${s.audience}`, () => {
    const s = store.get();
    lineupChip.hidden = !s.lineup;
    if (!s.lineup) return lineupChip.replaceChildren();
    lineupChip.replaceChildren(
      icon('lineup'),
      h('span', { class: 'chip__label' }, s.audience === 'kids' ? 'Everyone lined up by size' : 'Size line-up (true scale)'),
      closeBtn('Exit size line-up', () => store.set({ lineup: false })),
    );
  });
  return wrap;
}

export function measurementReadout(ctx: UICtx): HTMLElement {
  const out = h('p', { class: 'ov-measure', role: 'status', hidden: true });
  ctx.events.on('viewer:measure', ({ mm }) => {
    if (ctx.store.get().audience !== 'clinician') return;
    out.hidden = false;
    out.replaceChildren(icon('ruler'), h('span', null, 'Last measurement: '), h('strong', { class: 'num' }, formatMm(mm)), h('span', { class: 'muted' }, ' (approximate, reconstruction scale)'));
  });
  watch(ctx.store, (s) => `${s.tool}|${s.speciesId}|${s.audience}`, () => {
    if (ctx.store.get().tool !== 'measure') out.hidden = true;
  });
  return out;
}

export function kidsActions(ctx: UICtx): HTMLElement {
  let playing: 'chomp' | 'walk' | 'none' = 'none';
  const set = (kind: 'chomp' | 'walk' | 'none') => {
    playing = kind;
    chomp.update(kind === 'chomp');
    walk.update(kind === 'walk');
    ctx.events.emit('ui:animate', { kind });
  };
  const chomp = toggleButton({ label: 'Chomp!', icon: 'chomp', pressed: false, onToggle: (on) => set(on ? 'chomp' : 'none'), className: 'btn--fun' });
  const walk = toggleButton({ label: 'Walk', icon: 'walk', pressed: false, onToggle: (on) => set(on ? 'walk' : 'none'), className: 'btn--fun' });
  const wrap = h('div', { class: 'ov-kids', role: 'group', 'aria-label': 'Animations' }, chomp.el, walk.el);
  watch(ctx.store, (s) => `${s.audience}|${s.speciesId}`, () => {
    wrap.hidden = ctx.store.get().audience !== 'kids';
    if (playing !== 'none') set('none');
  });
  return wrap;
}

export function mountSnapshotDownload(ctx: UICtx): void {
  ctx.events.on('viewer:snapshot', ({ dataUrl }) => {
    const img = parseImageDataUrl(dataUrl);
    if (!img) {
      ctx.toast('The snapshot could not be saved.', 'error');
      return;
    }
    downloadBytes(img.bytes, img.mime, snapshotFileName(ctx.store.get().speciesId, img.mime));
    ctx.toast('Snapshot saved to your downloads.', 'success');
  });
}

/** Permanent disclaimer. Narrow stages show a short visible form; the full sentence stays readable to AT. */
export function reconstructionCaption(): HTMLElement {
  return h(
    'p',
    { class: 'ov-caption' },
    icon('info'),
    h('span', { class: 'ov-caption__long' }, RECONSTRUCTION_CAPTION),
    h('span', { class: 'ov-caption__short', 'aria-hidden': 'true' }, 'Reconstruction, not a fossil scan'),
  );
}
