/**
 * Typed event bus between the UI and the 3D viewer (one-shot notifications that are not state).
 */
import type { BoneId } from '../anatomy/bones';
import type { LangCode } from '../data/types';

export type ScanFormat = 'stl' | 'glb' | 'obj' | 'ply';

export interface EventMap {
  /** Viewer -> UI: geometry generation progress for the current scene. */
  'viewer:progress': { done: number; total: number; label: string };
  /** Viewer -> UI: first frame of the current species rendered. */
  'viewer:ready': { speciesId: string };
  /** Viewer -> UI: recoverable problem (generic, user-safe message). */
  'viewer:error': { message: string };
  /** Viewer -> UI: user clicked a bone (also mirrored to store.selectedBoneId). */
  'viewer:bone-picked': { boneId: BoneId };
  /** Viewer -> UI: a measurement finished (millimetres, reconstruction scale). */
  'viewer:measure': { mm: number };
  /** UI -> Viewer: frame the camera on a lesion or bone. */
  'ui:focus-lesion': { lesionId: string };
  'ui:focus-bone': { boneId: BoneId };
  /** UI -> Viewer: reset camera to default framing. */
  'ui:reset-camera': Record<string, never>;
  /** UI -> Viewer: take a PNG snapshot (viewer replies with viewer:snapshot). */
  'ui:snapshot': Record<string, never>;
  'viewer:snapshot': { dataUrl: string };
  /** UI -> Viewer: a validated local 3D scan file to display (never uploaded anywhere). */
  'scan:load': { name: string; format: ScanFormat; buffer: ArrayBuffer };
  'scan:clear': Record<string, never>;
  /** UI -> App: load a bundled CC0 museum scan preset from /scans/*.glb. */
  'scan:preset': { presetId: string };
  'scan:preset-error': { message: string };
  /** UI -> Viewer: start / stop the "chomp" or walking demo animation (kids mode). */
  'ui:animate': { kind: 'chomp' | 'walk' | 'none' };
  /** UI -> Analytics: read-aloud audio started (Chirp 3 HD studio clip or browser fallback). */
  'ui:speak': { clipId: string; lang: LangCode; mode: 'chirp3-hd' | 'browser-tts' };
}

type Handler<K extends keyof EventMap> = (payload: EventMap[K]) => void;

export interface EventBus {
  on<K extends keyof EventMap>(type: K, handler: Handler<K>): () => void;
  emit<K extends keyof EventMap>(type: K, payload: EventMap[K]): void;
}

export function createEventBus(): EventBus {
  const handlers = new Map<keyof EventMap, Set<Handler<keyof EventMap>>>();
  return {
    on(type, handler) {
      let set = handlers.get(type);
      if (!set) {
        set = new Set();
        handlers.set(type, set);
      }
      set.add(handler as Handler<keyof EventMap>);
      return () => set!.delete(handler as Handler<keyof EventMap>);
    },
    emit(type, payload) {
      const set = handlers.get(type);
      if (!set) return;
      for (const h of [...set]) {
        try {
          (h as Handler<typeof type>)(payload);
        } catch (err) {
          // Never let one faulty listener break the others. Log without payload contents.
          console.error(`Event handler for "${String(type)}" failed`, err instanceof Error ? err.message : '');
        }
      }
    },
  };
}
