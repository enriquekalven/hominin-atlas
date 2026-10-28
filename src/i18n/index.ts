/**
 * Public i18n facade for Hominin Atlas: combines UI chrome strings (`ui.ts`)
 * and localized paleoanthropology/paleopathology catalog (`catalog.ts`).
 */
import type { Audience, DualText, LangCode, Lesion, Species } from '../data/types';
import { ATTIRE_SUMMARY } from '../ui/portrait';
import { CATALOG_BY_LANG, type LocalizedLesionEntry, type LocalizedSpeciesEntry } from './catalog';
import {
  applyDocumentLang,
  detectBrowserLang,
  LANGUAGE_BY_CODE,
  SUPPORTED_LANGUAGES,
  UI_TEXT,
  type LanguageOption,
  type UIStrings,
} from './ui';

export {
  applyDocumentLang,
  detectBrowserLang,
  LANGUAGE_BY_CODE,
  SUPPORTED_LANGUAGES,
  UI_TEXT,
  type LanguageOption,
  type LocalizedLesionEntry,
  type LocalizedSpeciesEntry,
  type UIStrings,
};

export function uiText(lang: LangCode): UIStrings {
  return UI_TEXT[lang] ?? UI_TEXT.en;
}

export function pickDual(text: DualText, audience: Audience): string {
  return audience === 'kids' ? text.kids : text.clinician;
}

export function localizedSpecies(sp: Species, lang: LangCode): LocalizedSpeciesEntry {
  const entry = CATALOG_BY_LANG[lang]?.species?.[sp.id];
  if (entry) return entry;
  return {
    common: sp.common,
    overview: sp.overview,
    attire: ATTIRE_SUMMARY[sp.id],
    locomotion: sp.locomotion,
    diet: sp.diet,
    technology: sp.technology,
    keyTraits: sp.keyTraits,
    funFacts: sp.funFacts,
  };
}

export function localizedLesion(lesion: Lesion, lang: LangCode): LocalizedLesionEntry {
  const entry = CATALOG_BY_LANG[lang]?.lesions?.[lesion.id];
  if (entry) return entry;
  return {
    title: lesion.title,
    summary: lesion.summary,
  };
}

export function narrationClipUrl(lang: LangCode, clipId: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}audio/${encodeURIComponent(lang)}/${encodeURIComponent(clipId)}.mp3`;
}
