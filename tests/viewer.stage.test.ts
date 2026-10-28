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

describe('viewer tools: lifelike figure picking & caliper measurement', () => {
  it('selects another species when tapping its 3D lifelike photo-mesh in size line-up', async () => {
    const { createStore } = await import('../src/app/store');
    const { createViewerTools } = await import('../src/viewer/tools');
    const scene = new THREE.Scene();
    const store = createStore({ speciesId: 'homo-sapiens', lineup: true, showFlesh: true }, null);
    const events = createEventBus();
    const tools = createViewerTools(scene, store, events);

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 2),
      new THREE.MeshBasicMaterial(),
    );
    mesh.position.set(0, 1, 0);
    mesh.userData = { isPhotoMesh: true, speciesId: 'homo-floresiensis' };
    mesh.updateMatrixWorld(true);

    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 20);
    cam.position.set(0, 1, 3);
    cam.lookAt(0, 1, 0);
    cam.updateMatrixWorld(true);

    const fakeCanvas = {
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 200 }),
    } as unknown as HTMLCanvasElement;

    tools.handleTap(100, 100, fakeCanvas, cam, [mesh]);
    expect(store.get().speciesId).toBe('homo-floresiensis');

    // Clinician caliper also measures across 3D photo-meshes.
    store.set({ audience: 'clinician', lineup: false, tool: 'measure' });
    let measuredMm = 0;
    events.on('viewer:measure', ({ mm }) => { measuredMm = mm; });
    tools.handleTap(100, 90, fakeCanvas, cam, [mesh]);
    tools.handleTap(100, 110, fakeCanvas, cam, [mesh]);
    expect(measuredMm).toBeGreaterThan(50);
    tools.dispose();
  });
});

describe('hotspots: screen-space collision separation', () => {
  it('pushes overlapping projected markers apart so clustered lesions stay independently tappable', async () => {
    const { separateHotspots } = await import('../src/viewer/hotspots');
    const pts = [
      { x: 400, y: 260 },
      { x: 402, y: 261 },
      { x: 401, y: 259 },
    ];
    separateHotspots(pts, 800, 600, 26);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        expect(Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)).toBeGreaterThanOrEqual(25.5);
      }
    }
  });
});

