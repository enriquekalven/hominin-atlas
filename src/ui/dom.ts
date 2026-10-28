/**
 * Tiny DOM builders used by every UI module.
 *
 * Security contract (docs/CONTRACT.md):
 * - Elements are created with createElement / createElementNS; text is always a Text node.
 * - Attributes are set with setAttribute only. Inline event-handler attributes ("on*") and inline
 *   "style" attributes are rejected (the CSP forbids them anyway); set `el.style.*` from JS instead.
 * - URL-bearing attributes (href, src, ...) must pass `isSafeUrl`.
 */
export type Child = Node | string | number | null | undefined | false;
export type Children = Child | readonly Children[];
export type AttrValue = string | number | boolean | null | undefined;
export type Attrs = Record<string, AttrValue>;

export const SVG_NS = 'http://www.w3.org/2000/svg';
const URL_ATTRS = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'poster', 'srcset']);

/**
 * URLs the UI may place in href/src: relative paths and fragments, https:, blob:, and base64
 * raster data URLs. Rejects javascript:, http:, protocol-relative ("//host") and everything else.
 */
export function isSafeUrl(value: string): boolean {
  const v = value.trim();
  if (v === '' || v.startsWith('//') || v.startsWith('\\')) return false;
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(v);
  if (!scheme) return true; // relative path or #fragment
  const proto = scheme[1].toLowerCase();
  if (proto === 'https') return /^https:\/\/[^\s"'<>]+$/i.test(v);
  if (proto === 'blob') return true;
  if (proto === 'data') return /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(v);
  return false;
}

/** Throws for attribute names / values the security contract forbids. Exported for tests. */
export function checkAttr(name: string, value: string): void {
  const lower = name.toLowerCase();
  if (lower.startsWith('on')) throw new Error(`Event-handler attribute not allowed: ${name}`);
  if (lower === 'style') throw new Error('Inline style attribute not allowed; use el.style');
  if (URL_ATTRS.has(lower) && !isSafeUrl(value)) throw new Error(`Unsafe URL rejected for ${name}`);
}

function applyAttrs(el: Element, attrs: Attrs | null | undefined): void {
  if (!attrs) return;
  for (const [name, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    const str = value === true ? '' : String(value);
    checkAttr(name, str);
    el.setAttribute(name, str);
  }
}

export function append(parent: Node, children: readonly Children[]): void {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(parent, c as readonly Children[]);
    else if (typeof c === 'string' || typeof c === 'number') parent.appendChild(document.createTextNode(String(c)));
    else parent.appendChild(c as Node);
  }
}

/** Create an HTML element. `attrs` go through setAttribute; children become nodes / text nodes. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Attrs | null,
  ...children: Children[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  applyAttrs(el, attrs);
  append(el, children);
  return el;
}

/** Create an SVG element in the SVG namespace. */
export function s<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs?: Attrs | null,
  ...children: Children[]
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  applyAttrs(el, attrs);
  append(el, children);
  return el;
}

/** Replace all children of `el` (text-safe). */
export function setChildren(el: Element, ...children: Children[]): void {
  el.replaceChildren();
  append(el, children);
}

/** A <button type="button"> with an optional click handler. */
export function button(
  content: Children,
  attrs: Attrs = {},
  onClick?: (e: MouseEvent) => void,
): HTMLButtonElement {
  const b = h('button', { type: 'button', ...attrs }, content);
  if (onClick) b.addEventListener('click', onClick);
  return b;
}

/** External link: https only, opens in a new tab with rel="noopener noreferrer". */
export function externalLink(href: string, text: Children, attrs: Attrs = {}): HTMLAnchorElement | HTMLSpanElement {
  if (!/^https:\/\/[^\s"'<>]+$/i.test(href)) return h('span', attrs, text);
  return h(
    'a',
    { ...attrs, href, target: '_blank', rel: 'noopener noreferrer' },
    text,
    h('span', { class: 'sr-only' }, ' (opens in a new tab)'),
  );
}

/** Visually hidden text for screen readers. */
export function srOnly(text: string): HTMLSpanElement {
  return h('span', { class: 'sr-only' }, text);
}

let uidCounter = 0;
/** Unique, stable-per-session DOM id. */
export function uid(prefix: string): string {
  uidCounter += 1;
  return `${prefix}-${uidCounter}`;
}

/** Collects teardown callbacks so a view can be re-rendered without leaking subscriptions. */
export interface Scope {
  add(fn: () => void): void;
  dispose(): void;
}

export function createScope(): Scope {
  let fns: (() => void)[] = [];
  return {
    add(fn) {
      fns.push(fn);
    },
    dispose() {
      const list = fns;
      fns = [];
      for (const fn of list) {
        try {
          fn();
        } catch {
          // Teardown must never throw into the caller.
        }
      }
    },
  };
}

/** addEventListener that returns its own remover (handy with Scope). */
export function listen<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  type: K,
  fn: (e: HTMLElementEventMap[K]) => void,
  opts?: AddEventListenerOptions,
): () => void {
  target.addEventListener(type, fn, opts);
  return () => target.removeEventListener(type, fn, opts);
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), summary';

/** Visible, focusable descendants in DOM order. */
export function focusables(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('hidden') && el.getClientRects().length > 0,
  );
}
