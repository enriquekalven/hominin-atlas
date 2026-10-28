/**
 * Worker pool + LRU cache for bone meshing.
 * Cancels stale jobs when the user switches species or scrubs morph/healing sliders.
 * Falls back to time-sliced main-thread execution when Web Workers are unavailable.
 */
import type { BuildRequest, MaterialKind } from '../sdf/build';
import type { LesionMarker } from '../sdf/lesions';
import { executeBuildJob, type WorkerRequest, type WorkerResponse } from './worker';

export interface MeshedBone {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  ao: Uint8Array;
  curvature: Int8Array;
  tags: Uint16Array;
  markers: LesionMarker[];
  material: MaterialKind;
}

interface QueueItem {
  jobId: number;
  batchId: number;
  key: string;
  req: BuildRequest;
  resolve: (val: MeshedBone | null) => void;
  reject: (err: Error) => void;
}

const MAX_CACHE = 420;

export function cacheKeyFor(req: BuildRequest): string {
  const morph = req.morph ? `>${req.morph.toSpeciesId}@${req.morph.t.toFixed(2)}` : '';
  const isSkull = req.boneId === 'cranium' || req.boneId === 'mandible' || req.boneId.startsWith('teeth');
  const own = req.lesions
    .filter((l) => l.bone === req.boneId || (isSkull && (l.kind === 'tooth-loss' || l.kind === 'dental-disease')))
    .map((l) => `${l.id}:${req.healingT.toFixed(2)}`)
    .join(',');
  return `${req.speciesId}${morph}|${req.boneId}|${req.quality}|${own}`;
}

export interface MeshPool {
  enqueue(batchId: number, req: BuildRequest): Promise<MeshedBone | null>;
  cancelBatch(batchId: number): void;
  dispose(): void;
}

function toMeshedBone(r: Extract<WorkerResponse, { ok: true }>): MeshedBone {
  return {
    positions: r.positions, normals: r.normals, indices: r.indices,
    ao: r.ao, curvature: r.curvature, tags: r.tags, markers: r.markers, material: r.material,
  };
}

export function createMeshPool(): MeshPool {
  const cache = new Map<string, MeshedBone>();
  const queue: QueueItem[] = [];
  const active = new Map<number, { item: QueueItem; workerIdx: number }>();
  const canceledBatches = new Set<number>();
  const workers: Worker[] = [];
  const busyWorkers = new Set<number>();
  let nextJobId = 1;
  let disposed = false;
  let fallbackTimer = 0;

  const count = typeof navigator !== 'undefined' && navigator.hardwareConcurrency
    ? Math.max(2, Math.min(4, navigator.hardwareConcurrency - 1))
    : 2;

  if (typeof Worker !== 'undefined') {
    try {
      for (let i = 0; i < count; i++) {
        const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
        w.onmessage = (ev: MessageEvent<WorkerResponse>) => onWorkerDone(i, ev.data);
        w.onerror = () => onWorkerError(i);
        workers.push(w);
      }
    } catch {
      workers.length = 0;
    }
  }

  function remember(key: string, val: MeshedBone): void {
    if (cache.has(key)) cache.delete(key);
    else if (cache.size >= MAX_CACHE) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(key, val);
  }

  function pump(): void {
    if (disposed || queue.length === 0) return;
    if (workers.length === 0) return pumpFallback();
    for (let i = 0; i < workers.length; i++) {
      if (busyWorkers.has(i)) continue;
      const item = queue.shift();
      if (!item) break;
      if (canceledBatches.has(item.batchId)) { item.resolve(null); i--; continue; }
      const hit = cache.get(item.key);
      if (hit) { item.resolve(hit); i--; continue; }
      busyWorkers.add(i);
      active.set(item.jobId, { item, workerIdx: i });
      const msg: WorkerRequest = { jobId: item.jobId, req: item.req };
      workers[i].postMessage(msg);
    }
  }

  function pumpFallback(): void {
    if (fallbackTimer || disposed || queue.length === 0) return;
    fallbackTimer = window.setTimeout(() => {
      fallbackTimer = 0;
      if (disposed) return;
      const t0 = performance.now();
      while (queue.length > 0 && performance.now() - t0 < 12) {
        const item = queue.shift()!;
        if (canceledBatches.has(item.batchId)) { item.resolve(null); continue; }
        const hit = cache.get(item.key);
        if (hit) { item.resolve(hit); continue; }
        try {
          const bone = toMeshedBone(executeBuildJob(item.jobId, item.req));
          remember(item.key, bone);
          item.resolve(bone);
        } catch (err) {
          item.reject(err instanceof Error ? err : new Error('Mesh build failed'));
        }
      }
      if (queue.length > 0) pumpFallback();
    }, 0);
  }

  function onWorkerDone(workerIdx: number, data: WorkerResponse): void {
    busyWorkers.delete(workerIdx);
    const entry = active.get(data.jobId);
    active.delete(data.jobId);
    if (entry) {
      const { item } = entry;
      if (canceledBatches.has(item.batchId)) item.resolve(null);
      else if (data.ok) { const bone = toMeshedBone(data); remember(item.key, bone); item.resolve(bone); }
      else item.reject(new Error(data.error));
    }
    pump();
  }

  function onWorkerError(workerIdx: number): void {
    busyWorkers.delete(workerIdx);
    for (const [jobId, entry] of active.entries()) {
      if (entry.workerIdx === workerIdx) { active.delete(jobId); entry.item.reject(new Error('Worker error')); }
    }
    pump();
  }

  return {
    enqueue(batchId, req) {
      if (disposed || canceledBatches.has(batchId)) return Promise.resolve(null);
      const key = cacheKeyFor(req);
      const hit = cache.get(key);
      if (hit) { remember(key, hit); return Promise.resolve(hit); }
      return new Promise<MeshedBone | null>((resolve, reject) => {
        queue.push({ jobId: nextJobId++, batchId, key, req, resolve, reject });
        pump();
      });
    },
    cancelBatch(batchId) {
      canceledBatches.add(batchId);
      for (let i = queue.length - 1; i >= 0; i--) {
        if (queue[i].batchId === batchId) queue.splice(i, 1)[0].resolve(null);
      }
    },
    dispose() {
      disposed = true;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      for (const q of queue.splice(0)) q.resolve(null);
      for (const w of workers) w.terminate();
      workers.length = 0;
    },
  };
}
