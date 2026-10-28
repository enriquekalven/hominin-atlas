/**
 * Unit and negative-input tests for `src/app/store.ts`, `src/app/events.ts`, and `src/app/scanFile.ts`.
 */
import { describe, expect, it, vi } from 'vitest';
import { createEventBus } from '../src/app/events';
import { MAX_SCAN_BYTES, sanitizeFileName, validateScan } from '../src/app/scanFile';
import { DEFAULT_STATE, createStore, loadPersisted } from '../src/app/store';

function makeMockStorage(initial: Record<string, string> = {}) {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    map,
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => {
      map.delete(k);
    },
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  } satisfies Storage & { map: Map<string, string> };
}

describe('app/store: persistence allow-list & state selection', () => {
  it('loads valid MUST_PERSIST keys and drops tampered or unknown values', () => {
    const raw = JSON.stringify({
      audience: 'clinician',
      speciesId: 'homo-floresiensis',
      specimenId: 'lb1',
      renderMode: 'xray',
      showFlesh: true,
      showReconstructed: false,
      autoRotate: false,
      quizBest: 12,
      badges: ['bone-detective', 'first-fossil'],
      // Ephemeral keys that must NOT be restored from storage:
      healingT: 0.2,
      morphT: 0.75,
      tool: 'measure',
      selectedLesionId: 'shanidar-1-cranium',
      selectedBoneId: 'cranium',
    });
    const storage = makeMockStorage({ 'hominin-atlas:v1': raw });
    const loaded = loadPersisted(storage);
    expect(loaded).toEqual({
      audience: 'clinician',
      speciesId: 'homo-floresiensis',
      specimenId: 'lb1',
      renderMode: 'xray',
      showFlesh: true,
      showReconstructed: false,
      autoRotate: false,
      quizBest: 12,
      badges: ['bone-detective', 'first-fossil'],
    });
    expect(loaded.healingT).toBeUndefined();
    expect(loaded.tool).toBeUndefined();
    expect(loaded.selectedLesionId).toBeUndefined();
  });

  it('rejects corrupt JSON, oversized payloads, and invalid allow-list entries', () => {
    expect(loadPersisted(makeMockStorage({ 'hominin-atlas:v1': '{broken-json' }))).toEqual({});
    expect(loadPersisted(makeMockStorage({ 'hominin-atlas:v1': 'x'.repeat(25_000) }))).toEqual({});
    const badValues = JSON.stringify({
      audience: 'admin',
      speciesId: 'tyrannosaurus-rex',
      specimenId: '<script>alert(1)</script>',
      renderMode: 'wireframe',
      quizBest: -5,
      badges: ['valid-badge', 'INVALID_UPPERCASE!'],
    });
    expect(loadPersisted(makeMockStorage({ 'hominin-atlas:v1': badValues }))).toEqual({});
  });

  it('fires select() only when the selected value changes and persists only MUST_PERSIST keys', () => {
    vi.useFakeTimers();
    try {
      const storage = makeMockStorage();
      const store = createStore({}, storage);
      expect(store.get()).toEqual(DEFAULT_STATE);

      const seen: string[] = [];
      const unsub = store.select(
        (s) => s.speciesId,
        (next) => seen.push(next),
      );

      // Updating unrelated state does not fire the speciesId selector.
      store.set({ healingT: 0.35, tool: 'measure' });
      expect(seen).toEqual([]);

      // Updating speciesId fires the selector once; setting the same value is a no-op.
      store.set({ speciesId: 'homo-erectus', audience: 'clinician' });
      store.set({ speciesId: 'homo-erectus' });
      expect(seen).toEqual(['homo-erectus']);

      vi.advanceTimersByTime(200);
      const saved = JSON.parse(storage.getItem('hominin-atlas:v1') ?? '{}') as Record<string, unknown>;
      expect(saved.speciesId).toBe('homo-erectus');
      expect(saved.audience).toBe('clinician');
      expect(saved.healingT).toBeUndefined();
      expect(saved.tool).toBeUndefined();

      unsub();
      store.set({ speciesId: 'homo-sapiens' });
      expect(seen).toEqual(['homo-erectus']);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('app/events: typed event bus isolation', () => {
  it('delivers payloads to subscribers and isolates throwing handlers', () => {
    const bus = createEventBus();
    const calls: number[] = [];
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      bus.on('viewer:measure', () => {
        throw new Error('simulated listener fault');
      });
      const off = bus.on('viewer:measure', ({ mm }) => {
        calls.push(mm);
      });
      bus.emit('viewer:measure', { mm: 142.5 });
      expect(calls).toEqual([142.5]);
      off();
      bus.emit('viewer:measure', { mm: 99 });
      expect(calls).toEqual([142.5]);
    } finally {
      errSpy.mockRestore();
    }
  });
});

describe('app/scanFile: untrusted 3D file validation', () => {
  it('sanitizes path traversal and HTML/quote characters in filenames', () => {
    expect(sanitizeFileName('../../etc/passwd/<img src=x>.stl')).toBe('img src=x.stl');
    expect(sanitizeFileName('C:\\Users\\paleo\\shanidar_1.glb')).toBe('shanidar_1.glb');
  });

  it('rejects unsupported extensions, empty buffers, and oversized buffers', () => {
    const buf = new TextEncoder().encode('v 0 0 0\nf 1 1 1\n').buffer;
    expect(validateScan('malware.exe', buf).ok).toBe(false);
    expect(validateScan('empty.stl', new ArrayBuffer(0)).ok).toBe(false);
    const fakeHuge = { byteLength: MAX_SCAN_BYTES + 1 } as ArrayBuffer;
    expect(validateScan('huge.stl', fakeHuge).ok).toBe(false);
  });

  it('validates GLB magic header, version 2, and declared byte length', () => {
    const good = new ArrayBuffer(28);
    const v = new DataView(good);
    v.setUint32(0, 0x46546c67, true); // 'glTF'
    v.setUint32(4, 2, true);
    v.setUint32(8, 28, true);
    expect(validateScan('cranium.glb', good)).toEqual({
      ok: true,
      format: 'glb',
      safeName: 'cranium.glb',
    });

    const badMagic = good.slice(0);
    new DataView(badMagic).setUint32(0, 0xdeadbeef, true);
    expect(validateScan('cranium.glb', badMagic).ok).toBe(false);

    const truncated = good.slice(0);
    new DataView(truncated).setUint32(8, 9999, true);
    expect(validateScan('cranium.glb', truncated).ok).toBe(false);
  });

  it('rejects binary masquerading as .obj or .ply', () => {
    const nulObj = new Uint8Array([0x76, 0x20, 0x00, 0x31]).buffer;
    expect(validateScan('bad.obj', nulObj).ok).toBe(false);
    const badPly = new TextEncoder().encode('not-a-ply-header\n').buffer;
    expect(validateScan('bad.ply', badPly).ok).toBe(false);
  });
});
