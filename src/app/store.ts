/**
 * Tiny typed store shared by UI and 3D viewer. UI and viewer never call each other directly:
 * both read/write this store and talk through the event bus in ./events.ts.
 *
 * Persistence policy (intent-aware):
 * - MUST_PERSIST keys are saved to localStorage and validated against allow-lists on load.
 * - Everything else (what-if sliders, selections, tools) resets on reload.
 * No secrets or personal data are stored.
 */
import { SPECIES_IDS, type Audience, type SpeciesId } from '../data/types';
import type { BoneId } from '../anatomy/bones';

export type RenderMode = 'fossil' | 'bone' | 'xray';
export type Framing = 'body' | 'skull';
export type CompareMode = 'side-by-side' | 'overlay' | 'morph';
export type Tool = 'orbit' | 'measure' | 'section';
export type Panel = 'overview' | 'injuries' | 'specimens' | 'compare' | 'tree' | 'glossary';

export interface AppState {
  audience: Audience;
  speciesId: SpeciesId;
  specimenId: string | null;
  renderMode: RenderMode;
  framing: Framing;
  showFlesh: boolean;
  showReconstructed: boolean;
  autoRotate: boolean;
  panel: Panel;
  compareSpeciesId: SpeciesId | null;
  compareMode: CompareMode;
  /** 0 = species A, 1 = species B (morph mode). */
  morphT: number;
  /** 0 = moment of injury, 1 = as the fossil was found. */
  healingT: number;
  selectedLesionId: string | null;
  selectedBoneId: BoneId | null;
  tool: Tool;
  /** Section plane height as a fraction of stature, 0..1. */
  sectionLevel: number;
  lineup: boolean;
  quizOpen: boolean;
  quizBest: number;
  badges: string[];
}

export const DEFAULT_STATE: AppState = {
  audience: 'kids',
  speciesId: 'homo-neanderthalensis',
  specimenId: null,
  renderMode: 'fossil',
  framing: 'body',
  showFlesh: false,
  showReconstructed: true,
  autoRotate: true,
  panel: 'overview',
  compareSpeciesId: null,
  compareMode: 'side-by-side',
  morphT: 0,
  healingT: 1,
  selectedLesionId: null,
  selectedBoneId: null,
  tool: 'orbit',
  sectionLevel: 0.5,
  lineup: false,
  quizOpen: false,
  quizBest: 0,
  badges: [],
};

const STORAGE_KEY = 'hominin-atlas:v1';

/** Keys that survive reload. Each has a validator so tampered/corrupt storage can't break the app. */
const MUST_PERSIST: { [K in keyof AppState]?: (v: unknown) => v is AppState[K] } = {
  audience: (v): v is Audience => v === 'kids' || v === 'clinician',
  speciesId: (v): v is SpeciesId => typeof v === 'string' && (SPECIES_IDS as readonly string[]).includes(v),
  specimenId: (v): v is string | null => v === null || (typeof v === 'string' && /^[a-z0-9-]{1,64}$/.test(v)),
  renderMode: (v): v is RenderMode => v === 'fossil' || v === 'bone' || v === 'xray',
  showFlesh: (v): v is boolean => typeof v === 'boolean',
  showReconstructed: (v): v is boolean => typeof v === 'boolean',
  autoRotate: (v): v is boolean => typeof v === 'boolean',
  quizBest: (v): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1000,
  badges: (v): v is string[] =>
    Array.isArray(v) && v.length <= 64 && v.every((b) => typeof b === 'string' && /^[a-z0-9-]{1,40}$/.test(b)),
};

export type Listener = (state: AppState, prev: AppState) => void;

export interface Store {
  get(): AppState;
  set(patch: Partial<AppState>): void;
  subscribe(listener: Listener): () => void;
  /** Subscribe to one derived value; fires only when it changes (Object.is). */
  select<T>(selector: (s: AppState) => T, onChange: (value: T, prev: T) => void): () => void;
}

export function loadPersisted(storage: Pick<Storage, 'getItem'> | null): Partial<AppState> {
  if (!storage) return {};
  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return {};
  }
  if (!raw || raw.length > 20_000) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
  const out: Partial<AppState> = {};
  for (const [key, validate] of Object.entries(MUST_PERSIST)) {
    const value = (parsed as Record<string, unknown>)[key];
    if (validate && value !== undefined && validate(value)) {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
}

function persist(storage: Pick<Storage, 'setItem'> | null, state: AppState): void {
  if (!storage) return;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(MUST_PERSIST)) out[key] = state[key as keyof AppState];
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(out));
  } catch {
    // Storage full or blocked (private mode): persistence is best-effort.
  }
}

function safeStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function createStore(initial: Partial<AppState> = {}, storage: Storage | null = safeStorage()): Store {
  let state: AppState = { ...DEFAULT_STATE, ...loadPersisted(storage), ...initial };
  const listeners = new Set<Listener>();
  let persistTimer: ReturnType<typeof setTimeout> | null = null;

  return {
    get: () => state,
    set(patch) {
      const prev = state;
      const next = { ...state, ...patch };
      let changed = false;
      for (const k of Object.keys(patch) as (keyof AppState)[]) {
        if (!Object.is(prev[k], next[k])) {
          changed = true;
          break;
        }
      }
      if (!changed) return;
      state = next;
      for (const l of [...listeners]) l(state, prev);
      if (persistTimer) clearTimeout(persistTimer);
      persistTimer = setTimeout(() => persist(storage, state), 150);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    select(selector, onChange) {
      let current = selector(state);
      const l: Listener = (s) => {
        const v = selector(s);
        if (!Object.is(v, current)) {
          const prev = current;
          current = v;
          onChange(v, prev);
        }
      };
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}
