/**
 * Toast notifications in #toast-root (an aria-live="polite" region from index.html).
 */
import type { ToastKind } from './context';
import { button, h } from './dom';
import { icon, type IconName } from './icons';

const MAX_TOASTS = 3;
const ICON: Record<ToastKind, IconName> = { info: 'info', success: 'check', error: 'warning' };
const PREFIX: Record<ToastKind, string> = { info: '', success: '', error: 'Error: ' };

export function createToaster(root: HTMLElement): (message: string, kind?: ToastKind) => void {
  return (message, kind = 'info') => {
    const text = message.trim().slice(0, 300);
    if (!text) return;
    const close = button(icon('close'), { class: 'btn btn--icon toast__close', 'aria-label': 'Dismiss notification' });
    const el = h(
      'div',
      { class: `toast toast--${kind}` },
      icon(ICON[kind], 'toast__icon'),
      h('p', { class: 'toast__text' }, PREFIX[kind] ? h('span', { class: 'sr-only' }, PREFIX[kind]) : null, text),
      close,
    );
    let timer = 0;
    const remove = () => {
      window.clearTimeout(timer);
      el.remove();
    };
    close.addEventListener('click', remove);
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(remove, kind === 'error' ? 10000 : 5000);
    };
    // Pause auto-dismiss while the pointer or focus is on the toast (WCAG 2.2.1 timing adjustable).
    el.addEventListener('pointerenter', () => window.clearTimeout(timer));
    el.addEventListener('pointerleave', arm);
    el.addEventListener('focusin', () => window.clearTimeout(timer));
    el.addEventListener('focusout', arm);
    root.appendChild(el);
    while (root.children.length > MAX_TOASTS) root.firstElementChild?.remove();
    arm();
  };
}
