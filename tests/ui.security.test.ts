/**
 * Static guards for the UI security contract (docs/CONTRACT.md) and code-size budget.
 * Runs in node: reads source files as text, no DOM needed.
 */
import { describe, expect, it } from 'vitest';
import { checkAttr, isSafeUrl } from '../src/ui/dom';
import css from '../public/styles.css?raw';
import headers from '../public/_headers?raw';
import viteConfig from '../vite.config.ts?raw';

// Vite resolves these at test time; no Node typings or fs access needed.
const SOURCES = import.meta.glob('../src/ui/**/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const FILES = Object.entries(SOURCES).map(([path, text]) => ({ rel: path.replace(/^\.\.\//, ''), text }));

describe('UI source: forbidden APIs', () => {
  const rules: [string, RegExp][] = [
    ['innerHTML / outerHTML', /\.(inner|outer)HTML\b/],
    ['insertAdjacentHTML', /insertAdjacentHTML/],
    ['document.write', /document\.write/],
    ['eval / new Function', /\beval\s*\(|new\s+Function\s*\(/],
    ['alert / confirm / prompt', /(^|[^.\w])(alert|confirm|prompt)\s*\(/m],
    ['runtime network calls', /\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource/],
    ['CSS imported from TS', /import\s+['"][^'"]+\.css['"]/],
    ['console.log of state', /console\.log\s*\(/],
    ['inline style attribute', /setAttribute\(\s*['"]style['"]/],
    ['inline event-handler attribute', /setAttribute\(\s*['"]on\w+['"]/],
    // The SVG namespace URI is an identifier, never fetched.
    ['insecure http:// URL', /['"`]http:\/\/(?!www\.w3\.org\/2000\/svg['"`])/],
  ];
  for (const [name, re] of rules) {
    it(`never uses ${name}`, () => {
      const offenders = FILES.filter((f) => re.test(f.text)).map((f) => f.rel);
      expect(offenders).toEqual([]);
    });
  }

  it('keeps modules small (< 200 lines; the generated world path is exempt)', () => {
    const big = FILES.filter((f) => !f.rel.endsWith('worldPath.ts'))
      .map((f) => ({ rel: f.rel, lines: f.text.split('\n').length }))
      .filter((f) => f.lines >= 200);
    expect(big).toEqual([]);
  });

  it('opens external links with rel="noopener noreferrer" in a new tab', () => {
    const dom = FILES.find((f) => f.rel === 'src/ui/dom.ts')!;
    expect(dom.text).toMatch(/target: '_blank', rel: 'noopener noreferrer'/);
    const blankTargets = FILES.filter((f) => /_blank/.test(f.text)).map((f) => f.rel);
    expect(blankTargets).toEqual(['src/ui/dom.ts']);
  });
});

describe('dom.ts attribute and URL guards', () => {
  it('accepts local, https, blob and raster data URLs', () => {
    for (const ok of ['/portraits/homo-sapiens.jpg', './portraits/x.jpg', '#panel', 'https://doi.org/10.1038/nature19332', 'blob:http://127.0.0.1/abc', 'data:image/png;base64,AAAA']) {
      expect(isSafeUrl(ok)).toBe(true);
    }
  });

  it('rejects script, insecure, protocol-relative and non-image data URLs', () => {
    for (const bad of ['javascript:alert(1)', ' JaVaScRiPt:alert(1)', 'http://example.com', '//evil.example', 'data:text/html,<b>x</b>', 'data:image/svg+xml;base64,AAAA', 'vbscript:x', '']) {
      expect(isSafeUrl(bad)).toBe(false);
    }
  });

  it('refuses inline handlers, inline styles and unsafe hrefs', () => {
    expect(() => checkAttr('onclick', 'x()')).toThrow();
    expect(() => checkAttr('ONLOAD', 'x()')).toThrow();
    expect(() => checkAttr('style', 'color:red')).toThrow();
    expect(() => checkAttr('href', 'javascript:alert(1)')).toThrow();
    expect(() => checkAttr('src', 'http://cdn.example/x.js')).toThrow();
    expect(() => checkAttr('href', 'https://doi.org/10.1/x')).not.toThrow();
    expect(() => checkAttr('class', 'btn')).not.toThrow();
  });
});

describe('static assets', () => {
  it('styles.css loads nothing remote and uses no web fonts', () => {
    expect(css).not.toMatch(/@import/);
    expect(css).not.toMatch(/@font-face/);
    expect(css).not.toMatch(/url\(\s*['"]?(https?:)?\/\//);
  });

  it('styles.css avoids purple / indigo hues', () => {
    expect(css.toLowerCase()).not.toMatch(/#(6366f1|4f46e5|8b5cf6|7c3aed|a855f7|9333ea)|indigo|purple|violet/);
  });

  it('public/_headers mirrors the production CSP and security headers in vite.config.ts', () => {
    const vite = viteConfig;
    const block = /const PROD_CSP = \[([\s\S]*?)\]\.join\('; '\)/.exec(vite);
    expect(block).not.toBeNull();
    const directives = [...block![1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    const csp = /Content-Security-Policy:\s*(.+)/.exec(headers)?.[1].trim();
    expect(csp).toBe(directives.join('; '));
    expect(headers).toMatch(/X-Frame-Options:\s*DENY/);
    expect(headers).toMatch(/X-Content-Type-Options:\s*nosniff/);
    for (const name of ['Referrer-Policy', 'Permissions-Policy']) {
      const fromVite = new RegExp(`'${name}': '([^']+)'`).exec(vite)?.[1];
      const fromHeaders = new RegExp(`${name}:\\s*(.+)`).exec(headers)?.[1].trim();
      expect(fromHeaders).toBe(fromVite);
    }
  });
});
