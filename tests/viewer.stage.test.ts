/**
 * Stage coordinator behaviour: every figure on stage animates together (size line-up "Walk"), and the
 * appearance applied while bone meshes are still streaming in always reflects the latest UI state.
 */
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createEventBus } from '../src/app/events';
import { DEFAULT_STATE } from '../src/app/store';
import { SPECIES } from '../src/data';
import type { HotspotManager } from '../src/viewer/hotspots';
import { createMaterialBank } from '../src/viewer/materials';
import type { MeshedBone, MeshPool } from '../src/viewer/pool';
import { createStageController } from '../src/viewer/stage';

const tinyBone = (): MeshedBone => ({
  positions: new Float32Array([0, 0, 0, 0.01, 0, 0, 0, 0.01, 0]),
  normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]),
  indices: new Uint32Array([0, 1, 2]),
  ao: new Uint8Array([255, 255, 255]),
  curvature: new Int8Array(3),
  tags: new Uint16Array(3),
  markers: [],
  material: 'bone',
});

/** Worker-pool fake: bone meshes arrive only when the test calls `finishBones()`, like real workers finishing later. */
function slowPool(): { pool: MeshPool; finishBones: () => Promise<void> } {
  const pending: Array<() => void> = [];
  return {
    pool: {
      enqueue: () => new Promise<MeshedBone | null>((resolve) => pending.push(() => resolve(tinyBone()))),
      cancelBatch: () => {},
      dispose: () => {},
    },
    async finishBones() {
      for (let round = 0; round < 50 && pending.length > 0; round++) {
        pending.splice(0).forEach((done) => done());
        await new Promise((r) => setTimeout(r, 0));
      }
    },
  };
}

const noHotspots: HotspotManager = {
  syncSpecimen: () => {}, updateSelection: () => {}, updateAudience: () => {},
  project: () => {}, resolveWorldAnchor: () => null, dispose: () => {},
};

const stageWith = (pool: MeshPool) =>
  createStageController(new THREE.Scene(), SPECIES, pool, createMaterialBank(), noHotspots, createEventBus());

describe('stage: size line-up animation', () => {
  it('walks every figure in the line-up, not only the selected species', () => {
    const stage = stageWith(slowPool().pool);
    stage.rebuild({ ...DEFAULT_STATE, lineup: true });
    const figures = stage.actors();
    expect(figures.length).toBe(8);

    stage.animate('walk', 0.4);

    const walking = figures.filter((a) => !a.groups.get('hip_L')!.matrix.equals(a.restMatrices.get('hip_L')!));
    expect(walking.map((a) => a.speciesId)).toEqual(figures.map((a) => a.speciesId));
  });

  it('returns every line-up figure to its rest pose when the animation stops', () => {
    const stage = stageWith(slowPool().pool);
    stage.rebuild({ ...DEFAULT_STATE, lineup: true });
    stage.animate('walk', 0.4);

    stage.animate('none', 0);

    for (const a of stage.actors()) expect(a.groups.get('hip_L')!.matrix.equals(a.restMatrices.get('hip_L')!)).toBe(true);
  });
});

describe('stage: appearance while bone meshes stream in', () => {
  it('keeps "Skin & attire" on when it is switched on before the skeleton finishes loading', async () => {
    const { pool, finishBones } = slowPool();
    const stage = stageWith(pool);
    stage.rebuild({ ...DEFAULT_STATE, showFlesh: false });
    stage.refreshAppearance({ ...DEFAULT_STATE, showFlesh: true });

    await finishBones();

    expect(stage.primaryActor()!.fleshGroup.visible).toBe(true);
  });
});
