/**
 * Web Worker entry point for off-main-thread SDF evaluation and Surface Nets meshing.
 * Transfers typed-array geometry buffers back to the main thread with zero copy.
 */
import { buildBone, type BuildRequest, type MaterialKind } from '../sdf/build';
import type { LesionMarker } from '../sdf/lesions';
import { meshSDF } from '../mesher/surfaceNets';

export interface WorkerRequest {
  jobId: number;
  req: BuildRequest;
}

export interface WorkerSuccess {
  jobId: number;
  ok: true;
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  ao: Uint8Array;
  curvature: Int8Array;
  tags: Uint16Array;
  markers: LesionMarker[];
  material: MaterialKind;
}

export interface WorkerFailure {
  jobId: number;
  ok: false;
  error: string;
}

export type WorkerResponse = WorkerSuccess | WorkerFailure;

export function executeBuildJob(jobId: number, req: BuildRequest): WorkerSuccess {
  const b = buildBone(req);
  const maxSamples = req.quality === 'high' ? 3_200_000 : req.quality === 'preview' ? 1_600_000 : 900_000;
  const m = meshSDF(b.sdf, b.bounds, {
    voxel: b.voxel,
    maxSamples,
    vertexTag: b.tag ?? undefined,
  });
  return {
    jobId,
    ok: true,
    positions: m.positions,
    normals: m.normals,
    indices: m.indices,
    ao: m.ao,
    curvature: m.curvature,
    tags: m.tags,
    markers: b.markers,
    material: b.material,
  };
}

interface WorkerGlobal {
  onmessage: ((ev: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse, transfer?: Transferable[]): void;
}

if (typeof self !== 'undefined' && typeof (self as { document?: unknown }).document === 'undefined') {
  const ctx = self as unknown as WorkerGlobal;
  ctx.onmessage = (ev: MessageEvent<WorkerRequest>) => {
    const { jobId, req } = ev.data;
    try {
      const res = executeBuildJob(jobId, req);
      ctx.postMessage(res, [
        res.positions.buffer,
        res.normals.buffer,
        res.indices.buffer,
        res.ao.buffer,
        res.curvature.buffer,
        res.tags.buffer,
      ]);
    } catch (err) {
      ctx.postMessage({
        jobId,
        ok: false,
        error: err instanceof Error ? err.message : 'Mesh generation failed',
      });
    }
  };
}
