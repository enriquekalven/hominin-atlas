/**
 * Small reusable controls: segmented radio group, toggle button, icon button, evidence badge,
 * taxon name, empty state.
 */
import type { Audience, EvidenceLevel } from '../data/types';
import { button, h, type Attrs, type Children } from './dom';
import { icon, type IconName } from './icons';
import { EVIDENCE_HINT, EVIDENCE_LABEL, pick } from './labels';
import { taxonParts } from './format';

export interface SegOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

export interface Segmented<T extends string> {
  el: HTMLElement;
  update(value: T): void;
  relabel(labels: Partial<Record<T, string>>): void;
}

/**
 * Segmented control implemented as an ARIA radio group: one tab stop, arrow keys move and select
 * (selection follows focus, like native radios), Home / End jump to the ends.
 */
export function segmented<T extends string>(opts: {
  label: string;
  options: readonly SegOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}): Segmented<T> {
  const group = h('div', { role: 'radiogroup', 'aria-label': opts.label, class: `seg ${opts.className ?? ''}`.trim() });
  const buttons = new Map<T, HTMLButtonElement>();
  const labels = new Map<T, HTMLSpanElement>();
  for (const o of opts.options) {
    const text = h('span', { class: 'seg__text' }, o.label);
    const b = button([o.icon ? icon(o.icon) : null, text], { role: 'radio', class: 'seg__opt', 'data-value': o.value });
    b.addEventListener('click', () => opts.onChange(o.value));
    buttons.set(o.value, b);
    labels.set(o.value, text);
    group.appendChild(b);
  }
  group.addEventListener('keydown', (e) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const values = opts.options.map((o) => o.value);
    const cur = values.findIndex((v) => buttons.get(v) === document.activeElement);
    let next = cur < 0 ? 0 : cur;
    if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = values.length - 1;
    else next = (next + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + values.length) % values.length;
    buttons.get(values[next])?.focus();
    opts.onChange(values[next]);
  });
  const update = (value: T) => {
    for (const [v, b] of buttons) {
      const on = v === value;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    }
  };
  update(opts.value);
  return {
    el: group,
    update,
    relabel(map) {
      for (const [v, text] of Object.entries(map) as [T, string][]) {
        const span = labels.get(v);
        if (span) span.textContent = text;
      }
    },
  };
}

/** Toggle button with aria-pressed; label stays constant (state is conveyed by aria-pressed). */
export function toggleButton(opts: {
  label: string;
  icon?: IconName;
  pressed: boolean;
  onToggle: (next: boolean) => void;
  className?: string;
  hideLabel?: boolean;
}): { el: HTMLButtonElement; update(pressed: boolean): void } {
  const b = button(
    [opts.icon ? icon(opts.icon) : null, h('span', { class: opts.hideLabel ? 'sr-only' : 'btn__label' }, opts.label)],
    { class: `btn btn--toggle ${opts.className ?? ''}`.trim(), title: opts.hideLabel ? opts.label : null },
  );
  const update = (p: boolean) => b.setAttribute('aria-pressed', String(p));
  b.addEventListener('click', () => opts.onToggle(b.getAttribute('aria-pressed') !== 'true'));
  update(opts.pressed);
  return { el: b, update };
}

/** Icon button whose visible label can collapse to icon-only on narrow layouts (CSS). */
export function iconButton(
  name: IconName,
  label: string,
  onClick: (e: MouseEvent) => void,
  attrs: Attrs = {},
): HTMLButtonElement {
  return button([icon(name), h('span', { class: 'btn__label' }, label)], { class: 'btn', title: label, ...attrs }, onClick);
}

const EVIDENCE_ICON: Record<EvidenceLevel, IconName> = {
  established: 'established',
  probable: 'probable',
  debated: 'debated',
};

/** Evidence badge distinguishable by icon + text, not colour alone. */
export function evidenceBadge(level: EvidenceLevel, audience: Audience): HTMLSpanElement {
  return h(
    'span',
    { class: `badge badge--${level}`, title: EVIDENCE_HINT[level] },
    icon(EVIDENCE_ICON[level]),
    h('span', { class: 'sr-only' }, 'Evidence: '),
    pick(EVIDENCE_LABEL[level], audience),
  );
}

/** Scientific name with correct italics ("Homo sp." italic genus, roman qualifier). */
export function taxon(binomial: string, className = 'taxon'): HTMLSpanElement {
  const wrap = h('span', { class: className });
  for (const part of taxonParts(binomial)) {
    wrap.appendChild(part.italic ? h('i', null, part.text) : document.createTextNode(part.text));
  }
  return wrap;
}

/** Friendly empty / waiting state used across regions. */
export function emptyState(title: string, body?: Children, iconName: IconName = 'info'): HTMLElement {
  return h(
    'div',
    { class: 'empty', role: 'status' },
    icon(iconName, 'empty__icon'),
    h('p', { class: 'empty__title' }, title),
    body ? h('p', { class: 'empty__body' }, body) : null,
  );
}

/** Heading with an optional count, e.g. "Healed fractures (2)". */
export function sectionTitle(level: 'h3' | 'h4', text: string, count?: number): HTMLElement {
  return h(level, { class: 'section-title' }, text, count !== undefined ? h('span', { class: 'count' }, String(count)) : null);
}
