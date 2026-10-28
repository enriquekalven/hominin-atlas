/**
 * Allow-listed URL query-string parser and serializer for shareable deep links.
 * Validates every query parameter against known taxa, specimens, lesions, and UI modes
 * so untrusted query strings can never inject invalid state.
 */
import {
  DEFAULT_STATE,
  type AppState,
  type CompareMode,
  type Framing,
  type Panel,
  type RenderMode,
  type Store,
} from './store';
import { LANG_CODES, type Audience, type LangCode, type Species, type SpeciesId } from '../data/types';

const PANELS: readonly Panel[] = ['overview', 'injuries', 'specimens', 'compare', 'tree', 'glossary'];
const MODES: readonly RenderMode[] = ['fossil', 'bone', 'xray'];
const FRAMES: readonly Framing[] = ['body', 'skull'];
const CMODES: readonly CompareMode[] = ['side-by-side', 'overlay', 'morph'];

export function parseUrlQuery(
  search: string,
  speciesList: readonly Species[],
  fallbackSpeciesId: SpeciesId = DEFAULT_STATE.speciesId,
): Partial<AppState> {
  if (!search || search === '?') return {};
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const byId = new Map<string, Species>(speciesList.map((s) => [s.id, s]));
  const out: Partial<AppState> = {};

  const langRaw = params.get('lang')?.trim().toLowerCase();
  if (langRaw && (LANG_CODES as readonly string[]).includes(langRaw)) {
    out.lang = langRaw as LangCode;
  }

  const spRaw = params.get('species');
  if (spRaw && byId.has(spRaw)) {
    out.speciesId = spRaw as SpeciesId;
  }
  const activeSpecies = byId.get(out.speciesId ?? fallbackSpeciesId) ?? speciesList[0];

  const aud = params.get('audience');
  if (aud === 'kids' || aud === 'clinician') {
    out.audience = aud as Audience;
  }

  const panel = params.get('panel');
  if (panel && (PANELS as readonly string[]).includes(panel)) {
    out.panel = panel as Panel;
  }

  const mode = params.get('mode');
  if (mode && (MODES as readonly string[]).includes(mode)) {
    out.renderMode = mode as RenderMode;
  }

  const frame = params.get('frame');
  if (frame && (FRAMES as readonly string[]).includes(frame)) {
    out.framing = frame as Framing;
  }

  const flesh = params.get('flesh');
  if (flesh === '1' || flesh === 'true') out.showFlesh = true;
  else if (flesh === '0' || flesh === 'false') out.showFlesh = false;

  const lineup = params.get('lineup');
  if (lineup === '1' || lineup === 'true') out.lineup = true;
  else if (lineup === '0' || lineup === 'false') out.lineup = false;

  const cmp = params.get('compare');
  if (cmp && byId.has(cmp) && cmp !== (out.speciesId ?? fallbackSpeciesId)) {
    out.compareSpeciesId = cmp as SpeciesId;
  }

  const cmode = params.get('cmode');
  if (cmode && (CMODES as readonly string[]).includes(cmode)) {
    out.compareMode = cmode as CompareMode;
  }

  if (activeSpecies) {
    const specRaw = params.get('specimen');
    if (specRaw && activeSpecies.specimens.some((sp) => sp.id === specRaw)) {
      out.specimenId = specRaw;
    }

    const lesionRaw = params.get('lesion');
    if (lesionRaw) {
      for (const spec of activeSpecies.specimens) {
        const hit = spec.lesions.find((l) => l.id === lesionRaw);
        if (hit) {
          out.selectedLesionId = hit.id;
          out.selectedBoneId = hit.bone;
          if (!out.specimenId && spec.id !== activeSpecies.specimens[0]?.id) {
            out.specimenId = spec.id;
          }
          break;
        }
      }
    }
  }

  return out;
}

export function serializeUrlQuery(state: AppState): string {
  const p = new URLSearchParams();
  p.set('species', state.speciesId);
  if (state.lang !== DEFAULT_STATE.lang) p.set('lang', state.lang);
  if (state.audience !== DEFAULT_STATE.audience) p.set('audience', state.audience);
  if (state.specimenId) p.set('specimen', state.specimenId);
  if (state.panel !== DEFAULT_STATE.panel) p.set('panel', state.panel);
  if (state.selectedLesionId) p.set('lesion', state.selectedLesionId);
  if (state.renderMode !== DEFAULT_STATE.renderMode) p.set('mode', state.renderMode);
  if (state.framing !== DEFAULT_STATE.framing) p.set('frame', state.framing);
  if (state.showFlesh) p.set('flesh', '1');
  if (state.lineup) p.set('lineup', '1');
  if (state.compareSpeciesId && state.compareSpeciesId !== state.speciesId) {
    p.set('compare', state.compareSpeciesId);
    if (state.compareMode !== DEFAULT_STATE.compareMode) p.set('cmode', state.compareMode);
  }
  const str = p.toString();
  return str ? `?${str}` : '';
}

export function syncUrlWithStore(store: Store): () => void {
  if (typeof window === 'undefined' || !window.history?.replaceState) return () => {};
  let timer: ReturnType<typeof setTimeout> | null = null;
  const flush = () => {
    const qs = serializeUrlQuery(store.get());
    const nextUrl = `${window.location.pathname}${qs}${window.location.hash}`;
    const curUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== curUrl) {
      try {
        window.history.replaceState(null, '', nextUrl);
      } catch {
        // Ignore SecurityError in sandboxed contexts.
      }
    }
  };
  return store.subscribe(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, 120);
  });
}
