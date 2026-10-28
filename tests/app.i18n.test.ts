import { describe, expect, it } from 'vitest';
import {
  FIREBASE_APP_ID,
  GA_MEASUREMENT_ID,
  isAnalyticsNetworkEnabled,
} from '../src/app/analytics';
import { SPECIES } from '../src/data';
import { LANG_CODES } from '../src/data/types';
import {
  LANGUAGE_BY_CODE,
  SUPPORTED_LANGUAGES,
  localizedLesion,
  localizedSpecies,
  narrationClipUrl,
  uiText,
} from '../src/i18n';

describe('12-language i18n catalog & Chirp 3 HD voice configuration', () => {
  it('includes Arabic (RTL), German, Dutch, and all 12 supported languages with Chirp3-HD-Aoede voices', () => {
    expect(LANG_CODES).toContain('ar');
    expect(LANG_CODES).toContain('de');
    expect(LANG_CODES).toContain('nl');
    expect(SUPPORTED_LANGUAGES.length).toBe(12);

    expect(LANGUAGE_BY_CODE.ar.dir).toBe('rtl');
    expect(LANGUAGE_BY_CODE.ar.chirpVoice).toBe('ar-XA-Chirp3-HD-Aoede');
    expect(LANGUAGE_BY_CODE.de.dir).toBe('ltr');
    expect(LANGUAGE_BY_CODE.de.chirpVoice).toBe('de-DE-Chirp3-HD-Aoede');
    expect(LANGUAGE_BY_CODE.nl.dir).toBe('ltr');
    expect(LANGUAGE_BY_CODE.nl.chirpVoice).toBe('nl-NL-Chirp3-HD-Aoede');

    for (const lang of LANG_CODES) {
      const meta = LANGUAGE_BY_CODE[lang];
      expect(meta).toBeDefined();
      expect(meta.chirpVoice).toMatch(/Chirp3-HD-Aoede$/);
      const ui = uiText(lang);
      expect(ui.readAloud.length).toBeGreaterThan(1);
      expect(ui.stopReading.length).toBeGreaterThan(1);
    }
  });

  it('provides non-empty localized species and lesion texts across all 12 languages', () => {
    const neand = SPECIES.find((s) => s.id === 'homo-neanderthalensis')!;
    expect(localizedSpecies(neand, 'ar').common.kids).not.toBe(neand.common.kids);
    expect(localizedSpecies(neand, 'de').overview.kids).not.toBe(neand.overview.kids);
    expect(localizedSpecies(neand, 'nl').overview.kids).not.toBe(neand.overview.kids);

    for (const lang of LANG_CODES) {
      for (const sp of SPECIES) {
        const entry = localizedSpecies(sp, lang);
        expect(entry.common.kids.trim().length).toBeGreaterThan(0);
        expect(entry.common.clinician.trim().length).toBeGreaterThan(0);
        expect(entry.overview.kids.trim().length).toBeGreaterThan(10);
        expect(entry.overview.clinician.trim().length).toBeGreaterThan(10);
        expect(entry.attire.kids.trim().length).toBeGreaterThan(5);
        expect(entry.keyTraits.kids.length).toBe(sp.keyTraits.kids.length);
        expect(entry.keyTraits.clinician.length).toBe(sp.keyTraits.clinician.length);
        for (const spec of sp.specimens) {
          for (const l of spec.lesions) {
            const lLoc = localizedLesion(l, lang);
            expect(lLoc.title.kids.trim().length).toBeGreaterThan(0);
            expect(lLoc.summary.kids.trim().length).toBeGreaterThan(5);
          }
        }
      }
    }
  });

  it('builds clean static audio paths for Chirp 3 HD clips', () => {
    expect(narrationClipUrl('ar', 'homo-neanderthalensis-kids')).toBe('/audio/ar/homo-neanderthalensis-kids.mp3');
    expect(narrationClipUrl('de', 'homo-neanderthalensis-clinician')).toBe('/audio/de/homo-neanderthalensis-clinician.mp3');
    expect(narrationClipUrl('nl', 'lesion-shanidar-1-left-orbit-kids')).toBe('/audio/nl/lesion-shanidar-1-left-orbit-kids.mp3');
  });
});

describe('Google Analytics 4 configuration & host gating', () => {
  it('uses dedicated Hominin Atlas GA4 stream G-SV6BEEVQZX and disables beacons on localhost unless debug_ga=1', () => {
    expect(GA_MEASUREMENT_ID).toBe('G-SV6BEEVQZX');
    expect(FIREBASE_APP_ID).toBe('1:697625214430:web:c0cafeff9a27580282f14f');

    expect(isAnalyticsNetworkEnabled({ hostname: '127.0.0.1', search: '' })).toBe(false);
    expect(isAnalyticsNetworkEnabled({ hostname: 'localhost', search: '' })).toBe(false);
    expect(isAnalyticsNetworkEnabled({ hostname: 'localhost', search: '?debug_ga=1' })).toBe(true);
    expect(isAnalyticsNetworkEnabled({ hostname: 'hominin-atlas.web.app', search: '' })).toBe(true);
    expect(isAnalyticsNetworkEnabled({ hostname: 'hominin-atlas.firebaseapp.com', search: '' })).toBe(true);
  });
});
