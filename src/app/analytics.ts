/**
 * Google Analytics 4 (GA4) telemetry for Hominin Atlas (`project-maui`).
 *
 * Privacy & security posture:
 * - No inline script tags (preserves strict CSP without 'unsafe-inline').
 * - IP anonymization enabled; Google Signals, ad personalization, and cross-site tracking disabled.
 * - Restricted data processing enabled (`restricted_data_processing: true`) for Kids-mode safety.
 * - Network beacons disabled automatically outside production Firebase Hosting domains
 *   unless `?debug_ga=1` is present in the URL.
 */
import type { EventBus } from './events';
import type { AppState, Store } from './store';

export const GA_MEASUREMENT_ID = 'G-SV6BEEVQZX';
export const FIREBASE_APP_ID = '1:697625214430:web:c0cafeff9a27580282f14f';

export const PRODUCTION_HOSTS = new Set<string>([
  'hominin-atlas.web.app',
  'hominin-atlas.firebaseapp.com',
]);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __homininAnalytics?: {
      measurementId: string;
      firebaseAppId: string;
      networkEnabled: boolean;
      eventsSent: Array<{ name: string; params: Record<string, string | number | boolean> }>;
    };
  }
}

let initialized = false;

export function isAnalyticsNetworkEnabled(loc: Pick<Location, 'hostname' | 'search'> | null = typeof window !== 'undefined' ? window.location : null): boolean {
  if (!loc) return false;
  const params = new URLSearchParams(loc.search || '');
  if (params.get('debug_ga') === '1') return true;
  return PRODUCTION_HOSTS.has(loc.hostname);
}

export function initAnalytics(initial: Pick<AppState, 'audience' | 'lang' | 'speciesId'>): void {
  if (typeof window === 'undefined' || initialized) return;
  initialized = true;

  const networkEnabled = isAnalyticsNetworkEnabled(window.location);
  if (!networkEnabled) {
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  }

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(...args: unknown[]) {
      // Push standard Arguments / tuple into dataLayer for gtag.js consumption.
      window.dataLayer!.push(args);
    };
  }

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    restricted_data_processing: true,
    firebase_app_id: FIREBASE_APP_ID,
    site_name: 'hominin-atlas',
    audience_mode: initial.audience,
    ui_language: initial.lang,
    initial_species: initial.speciesId,
    debug_mode: new URLSearchParams(window.location.search).get('debug_ga') === '1',
  });

  window.__homininAnalytics = {
    measurementId: GA_MEASUREMENT_ID,
    firebaseAppId: FIREBASE_APP_ID,
    networkEnabled,
    eventsSent: [],
  };
}

export function trackEvent(name: string, params: Record<string, string | number | boolean> = {}): void {
  if (typeof window === 'undefined') return;
  const cleanName = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 40);
  if (!cleanName) return;

  if (window.__homininAnalytics) {
    window.__homininAnalytics.eventsSent.push({ name: cleanName, params });
    if (window.__homininAnalytics.eventsSent.length > 100) {
      window.__homininAnalytics.eventsSent.shift();
    }
  }
  if (typeof window.gtag === 'function') {
    window.gtag('event', cleanName, params);
  }
}

export function bindAnalytics(store: Store, events: EventBus): () => void {
  initAnalytics(store.get());

  const unsubs: Array<() => void> = [
    store.select(
      (s) => s.speciesId,
      (speciesId) => {
        const s = store.get();
        trackEvent('select_species', { species_id: speciesId, audience: s.audience, lang: s.lang });
      },
    ),
    store.select(
      (s) => s.selectedLesionId,
      (lesionId) => {
        if (!lesionId) return;
        const s = store.get();
        trackEvent('select_lesion', { lesion_id: lesionId, species_id: s.speciesId, audience: s.audience });
      },
    ),
    store.select(
      (s) => s.audience,
      (audience) => trackEvent('switch_audience_mode', { audience, lang: store.get().lang }),
    ),
    store.select(
      (s) => s.lang,
      (lang, prev) => trackEvent('switch_language', { lang, previous_lang: prev }),
    ),
    store.select(
      (s) => s.renderMode,
      (mode) => trackEvent('change_render_mode', { render_mode: mode }),
    ),
    store.select(
      (s) => s.showFlesh,
      (on) => trackEvent('toggle_skin_attire', { enabled: on, species_id: store.get().speciesId }),
    ),
    store.select(
      (s) => s.lineup,
      (on) => trackEvent('toggle_lineup', { enabled: on }),
    ),
    store.select(
      (s) => s.compareSpeciesId,
      (cmp) => {
        if (cmp) trackEvent('compare_species', { primary_species: store.get().speciesId, compare_species: cmp, mode: store.get().compareMode });
      },
    ),
    store.select(
      (s) => s.quizOpen,
      (open) => {
        if (open) trackEvent('open_quiz', { audience: store.get().audience, lang: store.get().lang });
      },
    ),
    events.on('ui:speak', ({ clipId, lang, mode }) => {
      trackEvent('read_aloud', { clip_id: clipId, lang, voice_engine: mode, audience: store.get().audience });
    }),
  ];

  return () => {
    for (const fn of unsubs) fn();
  };
}
