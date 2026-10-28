/**
 * Accessible modal dialogs on the native <dialog> element (top layer, inert background).
 * Adds: Tab focus wrap, Esc + backdrop close, focus return to the opener, one dialog at a time.
 * Replaces alert/confirm/prompt, which the contract forbids.
 */
import { button, focusables, h, uid, type Children } from './dom';
import { icon } from './icons';

export interface DialogHandle {
  el: HTMLDialogElement;
  body: HTMLElement;
  titleEl: HTMLElement;
  close(): void;
  isOpen(): boolean;
}

export interface DialogOptions {
  title: Children;
  /** Extra class for sizing, e.g. 'dialog--wide'. */
  className?: string;
  /** Short description announced after the title. */
  description?: string;
  build(body: HTMLElement, handle: DialogHandle): void;
  onClose?(): void;
  /** Element to focus first (defaults to the first focusable control in the body, else the close button). */
  initialFocus?(): HTMLElement | null;
}

let modalRoot: HTMLElement | null = null;
let current: DialogHandle | null = null;
let audienceAttr = 'kids';

export function initDialogs(root: HTMLElement): void {
  modalRoot = root;
}

/** Dialogs live outside #app, so they carry the audience attribute themselves (for CSS). */
export function setDialogAudience(audience: string): void {
  audienceAttr = audience;
  modalRoot?.setAttribute('data-audience', audience);
  current?.el.setAttribute('data-audience', audience);
}

export function currentDialog(): DialogHandle | null {
  return current && current.isOpen() ? current : null;
}

export function openDialog(opts: DialogOptions): DialogHandle {
  current?.close();
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const titleId = uid('dlg-title');
  const descId = opts.description ? uid('dlg-desc') : null;
  const titleEl = h('h2', { id: titleId, class: 'dialog__title' }, opts.title);
  const closeBtn = button(icon('close'), { class: 'btn btn--icon dialog__close', 'aria-label': 'Close dialog' });
  const body = h('div', { class: 'dialog__body' });
  const el = h(
    'dialog',
    {
      class: `dialog ${opts.className ?? ''}`.trim(),
      'aria-labelledby': titleId,
      'aria-describedby': descId,
      'data-audience': audienceAttr,
    },
    h('header', { class: 'dialog__head' }, titleEl, closeBtn),
    descId ? h('p', { id: descId, class: 'dialog__desc' }, opts.description ?? '') : null,
    body,
  );

  let open = true;
  const handle: DialogHandle = {
    el,
    body,
    titleEl,
    isOpen: () => open,
    close() {
      if (!open) return;
      open = false;
      if (el.open) el.close();
      cleanup();
    },
  };

  const cleanup = () => {
    open = false;
    el.remove();
    if (current === handle) current = null;
    opts.onClose?.();
    if (opener && opener.isConnected && !current) opener.focus({ preventScroll: true });
  };

  closeBtn.addEventListener('click', () => handle.close());
  el.addEventListener('close', () => {
    if (open) cleanup();
  });
  el.addEventListener('cancel', (e) => {
    e.preventDefault(); // close through our own path so cleanup + focus return always run
    handle.close();
  });
  el.addEventListener('click', (e) => {
    if (e.target !== el) return;
    const r = el.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) handle.close();
  });
  el.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const items = focusables(el);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  opts.build(body, handle);
  (modalRoot ?? document.body).appendChild(el);
  current = handle;
  if (typeof el.showModal === 'function') el.showModal();
  else el.setAttribute('open', '');
  const target = opts.initialFocus?.() ?? focusables(body)[0] ?? closeBtn;
  target.focus({ preventScroll: true });
  return handle;
}
