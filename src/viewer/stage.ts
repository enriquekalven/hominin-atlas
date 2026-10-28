/**
 * Scene stage coordinator: manages primary, comparison (`side-by-side` / `overlay` / `morph`)
 * and size `lineup` skeletons, incremental fracture-healing rebuilds and progress events.
 */
import * as THREE from 'three';
import { boneName, type BoneId } from '../anatomy/bones';
import type { EventBus } from '../app/events';
import type { AppState } from '../app/store';
import { getSpecimen } from '../data';
import type { Lesion, Species, SpeciesId } from '../data/types';
import { getModel, type BuildRequest, type Quality } from '../sdf/build';
import type { HotspotManager } from './hotspots';
import type { MaterialBank } from './materials';
import type { MeshPool } from './pool';
import { applyActorAppearance, applyPoseAnimation, createSkeletonActor, mountBoneMesh, prioritizeBones, type SkeletonActor } from './rig';

const LINEUP_DEFAULT: SpeciesId[] = ['homo-floresiensis', 'australopithecus-afarensis', 'pan-troglodytes', 'homo-habilis',
  'homo-naledi', 'homo-neanderthalensis', 'homo-sapiens', 'homo-erectus'];

export interface StageController {
  rebuild(state: AppState, qualityOverride?: Quality): void;
  updateHealing(state: AppState): void;
  refreshAppearance(state: AppState): void;
  primaryActor(): SkeletonActor | null;
  /** Every figure on stage: primary, comparison partner and the whole size line-up. */
  actors(): SkeletonActor[];
  /** Poses every figure on stage together (so the whole line-up walks, not just the selected species). */
  animate(kind: 'chomp' | 'walk' | 'none', timeSec: number): void;
  pickTargets(): THREE.Object3D[];
  currentSpan(): { stature: number; spanX: number; focus?: readonly number[] };
  dispose(): void;
}

const markReady = (): void => { (globalThis as { __ready?: boolean }).__ready = true; };
const compareLook = (s: AppState): 'overlay' | 'side' => (s.compareMode === 'overlay' ? 'overlay' : 'side');

export function createStageController(
  scene: THREE.Scene, speciesList: readonly Species[], pool: MeshPool, bank: MaterialBank, hotspots: HotspotManager, events: EventBus, onInvalidate?: () => void,
): StageController {
  const byId = new Map<SpeciesId, Species>(speciesList.map((s) => [s.id, s]));
  let primary: SkeletonActor | null = null, secondary: SkeletonActor | null = null, lineupActors: SkeletonActor[] = [];
  let batchSeq = 1, activeSpanX = 0;
  // Latest UI state: bones stream in for seconds, so their callbacks must not re-apply the stale snapshot from rebuild().
  let live: AppState | null = null;
  const latest = (fallback: AppState): AppState => live ?? fallback;

  function clearActors(): void {
    primary?.dispose(); secondary?.dispose(); for (const a of lineupActors) a.dispose();
    primary = null; secondary = null; lineupActors = [];
  }

  const actors = (): SkeletonActor[] => [...new Set([primary, secondary, ...lineupActors])].filter((a): a is SkeletonActor => a !== null);

  async function populateActor(
    batchId: number, actor: SkeletonActor, lesions: readonly Lesion[], quality: Quality, healingT: number,
    morph: BuildRequest['morph'], onBoneDone?: (done: number, total: number, boneId: string) => void,
  ): Promise<boolean> {
    const order = prioritizeBones(actor.layout, lesions);
    let done = 0;
    const total = order.length;
    await Promise.all(
      order.map(async (boneId) => {
        const mesh = await pool.enqueue(batchId, { speciesId: actor.speciesId, boneId, quality, lesions, healingT, morph });
        if (!mesh) return;
        mountBoneMesh(actor, boneId, mesh, bank);
        done++;
        onBoneDone?.(done, total, boneId);
      }),
    );
    return done === total;
  }

  function buildLineup(batchId: number, state: AppState, sp: Species): void {
    const ids = LINEUP_DEFAULT.includes(sp.id) ? [...LINEUP_DEFAULT] : [...LINEUP_DEFAULT, sp.id];
    const valid = ids.filter((id) => byId.has(id)).sort((a, b) => getModel({ speciesId: a }).layout.stature - getModel({ speciesId: b }).layout.stature);
    const spacing = 0.54;
    activeSpanX = Math.max(1.2, (valid.length - 1) * spacing + 0.6);
    const startX = -((valid.length - 1) * spacing) / 2;
    hotspots.syncSpecimen(null, [], state.audience, null);

    let totalBones = 0, doneBones = 0;
    lineupActors = valid.map((id, i) => {
      const m = getModel({ speciesId: id });
      const act = createSkeletonActor(id, getSpecimen(byId.get(id)!, null), m.params, m.layout, bank, onInvalidate);
      act.root.position.x = startX + i * spacing;
      scene.add(act.root);
      if (id === sp.id) primary = act;
      totalBones += m.layout.boneIds.length + 2;
      return act;
    });

    void (async () => {
      for (const act of lineupActors) {
        await populateActor(batchId, act, [], 'lineup', 1, null, (_d, _t, boneId) => {
          doneBones++;
          if (doneBones % 12 === 0 || doneBones === totalBones) events.emit('viewer:progress', { done: doneBones, total: totalBones, label: boneId });
        });
        applyActorAppearance(act, bank, latest(state), act.speciesId === sp.id ? 'primary' : 'lineup');
        onInvalidate?.();
      }
      if (batchId === batchSeq) { markReady(); events.emit('viewer:ready', { speciesId: sp.id }); }
    })();
  }

  return {
    rebuild(state, qualityOverride) {
      live = state;
      pool.cancelBatch(batchSeq);
      const batchId = ++batchSeq;
      clearActors();
      const sp = byId.get(state.speciesId) ?? speciesList[0];
      if (!sp) return;
      if (state.lineup) return buildLineup(batchId, state, sp);

      const spec = getSpecimen(sp, state.specimenId);
      const lesions = spec?.lesions ?? [];
      const cmpId = state.compareSpeciesId && state.compareSpeciesId !== sp.id ? state.compareSpeciesId : null;
      const isMorph = !!cmpId && state.compareMode === 'morph';
      const morph = isMorph ? { toSpeciesId: cmpId, t: state.morphT } : null;
      const q: Quality = qualityOverride ?? (isMorph ? 'preview' : 'high');

      const { params, layout } = getModel({ speciesId: sp.id, morph });
      const act = createSkeletonActor(sp.id, spec, params, layout, bank, onInvalidate);
      primary = act;
      scene.add(act.root);

      let cmpActor: SkeletonActor | null = null;
      if (cmpId && !isMorph && byId.has(cmpId)) {
        const cm = getModel({ speciesId: cmpId });
        cmpActor = createSkeletonActor(cmpId, getSpecimen(byId.get(cmpId)!, null), cm.params, cm.layout, bank, onInvalidate);
        secondary = cmpActor;
        scene.add(cmpActor.root);
        const side = state.compareMode === 'side-by-side';
        act.root.position.x = side ? -0.36 : 0;
        cmpActor.root.position.x = side ? 0.36 : 0;
        activeSpanX = side ? 1.25 : 0;
      } else activeSpanX = 0;

      hotspots.syncSpecimen(act, isMorph ? [] : lesions, state.audience, state.selectedLesionId);
      let readyFired = false;
      void (async () => {
        const completed = await populateActor(batchId, act, isMorph ? [] : lesions, q, state.healingT, morph, (done, total, boneId) => {
          applyActorAppearance(act, bank, latest(state), 'primary');
          const label = boneId.startsWith('costal_') ? 'Costal cartilage' : boneName(boneId as BoneId).clinician;
          events.emit('viewer:progress', { done, total, label });
          if (!readyFired && done >= Math.min(18, total)) { readyFired = true; events.emit('viewer:ready', { speciesId: sp.id }); }
        });
        if (cmpActor && batchId === batchSeq) {
          await populateActor(batchId, cmpActor, [], 'preview', 1, null, () => { applyActorAppearance(cmpActor!, bank, latest(state), compareLook(latest(state))); onInvalidate?.(); });
        }
        if (completed && batchId === batchSeq) {
          applyActorAppearance(act, bank, latest(state), 'primary');
          markReady();
          if (!readyFired) events.emit('viewer:ready', { speciesId: sp.id });
        }
      })();
    },
    updateHealing(state) {
      live = state;
      if (!primary || state.lineup) return;
      const lesions = primary.specimen?.lesions ?? [];
      const affected = [...new Set(lesions.map((l) => l.bone))];
      if (affected.length === 0) return;
      const batchId = ++batchSeq, act = primary;
      for (const boneId of affected) {
        void pool.enqueue(batchId, { speciesId: act.speciesId, boneId, quality: 'preview', lesions, healingT: state.healingT }).then((mesh) => {
          if (!mesh || act !== primary) return;
          mountBoneMesh(act, boneId, mesh, bank);
          applyActorAppearance(act, bank, latest(state), 'primary');
          onInvalidate?.();
        });
      }
    },
    refreshAppearance(state) {
      live = state;
      if (state.lineup) {
        for (const a of lineupActors) applyActorAppearance(a, bank, state, a.speciesId === state.speciesId ? 'primary' : 'lineup');
        return;
      }
      if (primary) applyActorAppearance(primary, bank, state, 'primary');
      if (secondary) {
        const side = state.compareMode === 'side-by-side';
        secondary.root.position.x = side ? 0.36 : 0;
        if (primary) primary.root.position.x = side ? -0.36 : 0;
        activeSpanX = side ? 1.25 : 0;
        applyActorAppearance(secondary, bank, state, compareLook(state));
      }
    },
    primaryActor: () => primary,
    actors,
    animate(kind, timeSec) { for (const a of actors()) applyPoseAnimation(a, kind, timeSec); },
    pickTargets: () => (lineupActors.length > 0 ? lineupActors.map((a) => a.root) : primary ? [primary.root] : []),
    currentSpan: () => ({ stature: primary?.layout.stature ?? 1.65, spanX: activeSpanX, focus: primary?.layout.skullFocus }),
    dispose() { pool.cancelBatch(batchSeq); clearActors(); },
  };
}
