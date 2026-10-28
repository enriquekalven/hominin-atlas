/**
 * 3D WebGL viewer entry point (`createViewer`).
 * Owns `#viewport` (the `<canvas>` and `<button class="hotspot">` markers) and communicates
 * with the UI exclusively through `store` and `events`.
 */
import * as THREE from 'three';
import type { EventBus } from '../app/events';
import type { Store } from '../app/store';
import type { Species } from '../data/types';
import { createCameraRig } from './camera';
import { createHotspotManager } from './hotspots';
import { createMaterialBank } from './materials';
import { createMeshPool } from './pool';
import { buildScanObject } from './scanLoader';
import { createStageController } from './stage';
import { createViewerTools } from './tools';

export interface ViewerDeps {
  container: HTMLElement;
  store: Store;
  events: EventBus;
  species: readonly Species[];
}

export interface ViewerHandle {
  dispose(): void;
}

export function createViewer(deps: ViewerDeps): ViewerHandle {
  const { container, store, events, species } = deps;
  container.replaceChildren();
  const canvas = document.createElement('canvas');
  canvas.className = 'viewer-canvas';
  container.appendChild(canvas);

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  } catch {
    const fallback = document.createElement('p');
    fallback.className = 'viewer-stub';
    fallback.textContent = 'WebGL 2 is required to display the 3D skeleton.';
    container.replaceChildren(fallback);
    queueMicrotask(() => events.emit('viewer:ready', { speciesId: store.get().speciesId }));
    return { dispose: () => fallback.remove() };
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x2c2218, 0.95));
  const addDir = (hex: number, intensity: number, x: number, y: number, z: number) => {
    const l = new THREE.DirectionalLight(hex, intensity);
    l.position.set(x, y, z);
    scene.add(l);
  };
  addDir(0xfff2dd, 2.1, 1.2, 2.2, 1.8);
  addDir(0x9ec5ff, 0.85, -1.4, 1.4, -1.6);
  addDir(0xffe6c8, 0.55, -1.1, 0.5, 1.4);
  scene.add(new THREE.GridHelper(3.2, 32, 0x29374d, 0x182336));

  const pool = createMeshPool();
  const bank = createMaterialBank();
  const hotspots = createHotspotManager(container, store, events);
  const tools = createViewerTools(scene, store, events);
  const stage = createStageController(scene, species, pool, bank, hotspots, events);
  const cam = createCameraRig(canvas, (cx, cy) => tools.handleTap(cx, cy, canvas, cam.camera, stage.pickTargets()));

  let width = 800, height = 600;
  const syncSize = () => {
    width = Math.max(1, container.clientWidth || 800);
    height = Math.max(1, container.clientHeight || 600);
    renderer.setSize(width, height, false);
    cam.resize(width, height);
  };
  syncSize();
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncSize) : null;
  ro?.observe(container);

  let animKind: 'chomp' | 'walk' | 'none' = 'none';
  let scanMesh: THREE.Mesh | null = null;
  const clearScanMesh = () => {
    if (!scanMesh) return;
    scanMesh.geometry.dispose();
    (scanMesh.material as THREE.Material).dispose();
    scanMesh.removeFromParent();
    scanMesh = null;
  };

  const focusLesion = (lesionId: string) => {
    const anchor = hotspots.resolveWorldAnchor(lesionId);
    if (anchor) cam.focusOn(anchor.point, anchor.normal, 0.34);
  };
  const frameCurrent = (instant = false) => {
    const { stature, spanX, focus } = stage.currentSpan();
    cam.frame(stature, store.get().framing, spanX, instant, focus);
  };

  stage.rebuild(store.get());
  frameCurrent(true);

  const unsubs: Array<() => void> = [
    store.select((s) => `${s.speciesId}|${s.specimenId}|${s.compareSpeciesId}|${s.compareMode === 'morph'}|${s.lineup}`, () => {
      const s = store.get();
      tools.clearMeasure();
      stage.rebuild(s);
      tools.updateSection(s.tool, s.sectionLevel, stage.currentSpan().stature, bank);
      frameCurrent(false);
    }),
    store.select((s) => s.compareMode, () => { stage.refreshAppearance(store.get()); frameCurrent(false); }),
    store.select((s) => s.morphT, () => {
      const s = store.get();
      if (s.compareSpeciesId && s.compareMode === 'morph') stage.rebuild(s, 'preview');
    }),
    store.select((s) => s.healingT, () => stage.updateHealing(store.get())),
    store.select((s) => `${s.renderMode}|${s.showFlesh}|${s.showReconstructed}|${s.selectedBoneId}|${s.selectedLesionId}`, () => {
      const s = store.get();
      hotspots.updateSelection(s.selectedLesionId);
      stage.refreshAppearance(s);
    }),
    store.select((s) => s.selectedLesionId, (id) => { if (id) focusLesion(id); }),
    store.select((s) => s.audience, (a) => hotspots.updateAudience(a)),
    store.select((s) => s.framing, () => frameCurrent(false)),
    store.select((s) => `${s.tool}|${s.sectionLevel}`, () => {
      const s = store.get();
      if (s.tool !== 'measure') tools.clearMeasure();
      tools.updateSection(s.tool, s.sectionLevel, stage.currentSpan().stature, bank);
    }),
    events.on('ui:focus-lesion', ({ lesionId }) => focusLesion(lesionId)),
    events.on('ui:focus-bone', ({ boneId }) => {
      const entry = stage.primaryActor()?.bones.get(boneId);
      if (!entry) return;
      entry.mesh.updateWorldMatrix(true, false);
      const center = new THREE.Box3().setFromObject(entry.mesh).getCenter(new THREE.Vector3());
      cam.focusOn(center, new THREE.Vector3(0, 0.15, 1), 0.45);
    }),
    events.on('ui:reset-camera', () => frameCurrent(false)),
    events.on('ui:animate', ({ kind }) => {
      animKind = kind;
      if (kind === 'none') stage.animate('none', 0);
    }),
    events.on('ui:snapshot', () => {
      renderer.render(scene, cam.camera);
      events.emit('viewer:snapshot', { dataUrl: canvas.toDataURL('image/png') });
    }),
    events.on('scan:load', ({ format, buffer }) => {
      clearScanMesh();
      try {
        scanMesh = buildScanObject(format, buffer);
        scene.add(scanMesh);
      } catch {
        events.emit('viewer:error', { message: 'Could not parse the 3D scan file.' });
      }
    }),
    events.on('scan:clear', clearScanMesh),
  ];

  let rafId = 0, lastMs = performance.now();
  const tick = (nowMs: number) => {
    rafId = window.requestAnimationFrame(tick);
    const dt = Math.min(0.05, Math.max(0.001, (nowMs - lastMs) / 1000));
    lastMs = nowMs;
    const s = store.get();
    if (animKind !== 'none') stage.animate(animKind, nowMs / 1000);
    cam.step(dt, s.autoRotate && animKind === 'none' && Boolean((window as { __ready?: boolean }).__ready));
    const showHotspots = !s.lineup && !(s.compareSpeciesId && s.compareMode === 'morph') && (!s.showFlesh || s.renderMode === 'xray' || s.panel === 'injuries');
    hotspots.project(cam.camera, width, height, showHotspots);
    renderer.render(scene, cam.camera);
  };
  rafId = window.requestAnimationFrame(tick);

  return {
    dispose() {
      window.cancelAnimationFrame(rafId);
      ro?.disconnect();
      for (const u of unsubs) u();
      cam.dispose(); hotspots.dispose(); tools.dispose(); stage.dispose(); bank.dispose(); pool.dispose();
      clearScanMesh();
      renderer.dispose();
      canvas.remove();
    },
  };
}
