import { defineConfig, type Plugin } from 'vite';

/**
 * Security headers.
 * - Dev server needs ws:// for Vite HMR, so dev and production policies differ.
 * - CSS is linked as a static file (public/styles.css), never injected from JS,
 *   so style-src can stay 'self' without 'unsafe-inline'.
 */
const PROD_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

const DEV_CSP = PROD_CSP.replace("connect-src 'self'", "connect-src 'self' ws://127.0.0.1:* ws://localhost:*");

const baseHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
};

/** Inject a strict CSP <meta> into the production HTML for static hosts that cannot set headers. */
function cspMetaPlugin(): Plugin {
  return {
    name: 'csp-meta',
    apply: 'build',
    transformIndexHtml(html) {
      // frame-ancestors is ignored inside <meta>; it is delivered via HTTP headers (public/_headers).
      const metaPolicy = PROD_CSP.replace("; frame-ancestors 'none'", '');
      return html.replace(
        '<!--CSP-->',
        `<meta http-equiv="Content-Security-Policy" content="${metaPolicy}" />`,
      );
    },
  };
}

export default defineConfig({
  plugins: [cspMetaPlugin()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    headers: { ...baseHeaders, 'Content-Security-Policy': DEV_CSP },
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    headers: { ...baseHeaders, 'Content-Security-Policy': PROD_CSP },
  },
  worker: { format: 'es' },
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
  },
});
