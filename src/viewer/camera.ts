/**
 * Damped orbital camera rig with touch pinch/pan, body vs skull framing, and lesion/bone fly-to.
 * Snaps on first frame so headless screenshots and initial loads never capture mid-swoop.
 */
import * as THREE from 'three';
import type { Framing } from '../app/store';

export interface CameraRig {
  camera: THREE.PerspectiveCamera;
  resize(width: number, height: number): void;
  /** `focus` (figure-root frame) is where Skull framing aims; without it, an upright head height is assumed. */
  frame(stature: number, framing: Framing, spanX?: number, instant?: boolean, focus?: readonly number[]): void;
  focusOn(point: THREE.Vector3, normal: THREE.Vector3, distance?: number): void;
  step(dtSec: number, autoRotate: boolean): void;
  wasClick(): boolean;
  dispose(): void;
}

function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}

export function createCameraRig(canvas: HTMLCanvasElement, onTap?: (clientX: number, clientY: number) => void): CameraRig {
  const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 60);
  const target = new THREE.Vector3(0, 0.85, 0);
  const goalTarget = target.clone();

  let theta = 0.22;
  let phi = 1.48;
  let dist = 3.2;
  let goalTheta = theta;
  let goalPhi = phi;
  let goalDist = dist;
  let hasFramedOnce = false;
  let focusedClose = false;
  let lastUserMs = -10_000;
  let dragMoved = 0;

  const pointers = new Map<number, { x: number; y: number }>();
  let panMode = false;
  let pinchDist = 0;

  function applyTransform(): void {
    const sinP = Math.sin(phi);
    camera.position.set(
      target.x + dist * sinP * Math.sin(theta),
      target.y + dist * Math.cos(phi),
      target.z + dist * sinP * Math.cos(theta),
    );
    camera.lookAt(target);
  }

  function panBy(dxPx: number, dyPx: number): void {
    const scale = (dist * Math.tan((camera.fov * Math.PI) / 360) * 2) / Math.max(1, canvas.clientHeight);
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    camera.matrix.extractBasis(right, up, new THREE.Vector3());
    goalTarget.addScaledVector(right, -dxPx * scale);
    goalTarget.addScaledVector(up, dyPx * scale);
    goalTarget.y = clamp(goalTarget.y, 0.02, 2.4);
  }

  const onPointerDown = (e: PointerEvent) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    lastUserMs = performance.now();
    if (pointers.size === 1) {
      dragMoved = 0;
      panMode = e.button === 2 || e.button === 1 || e.shiftKey;
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    prev.x = e.clientX;
    prev.y = e.clientY;
    dragMoved += Math.hypot(dx, dy);
    lastUserMs = performance.now();

    if (pointers.size === 1) {
      if (panMode) {
        panBy(dx, dy);
      } else {
        goalTheta -= dx * 0.0065;
        goalPhi = clamp(goalPhi - dy * 0.0065, 0.14, Math.PI - 0.14);
      }
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist > 8 && d > 8) {
        goalDist = clamp(goalDist * (pinchDist / d), 0.14, 18);
      }
      pinchDist = d;
      panBy(dx * 0.5, dy * 0.5);
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    const wasSingle = pointers.size === 1 && e.button === 0 && !e.shiftKey;
    pointers.delete(e.pointerId);
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    if (wasSingle && dragMoved < 6 && onTap) onTap(e.clientX, e.clientY);
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    lastUserMs = performance.now();
    const factor = Math.exp(clamp(e.deltaY, -120, 120) * 0.0014);
    goalDist = clamp(goalDist * factor, 0.14, 18);
  };

  const onContext = (e: Event) => e.preventDefault();

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('contextmenu', onContext);

  applyTransform();

  return {
    camera,
    resize(width, height) {
      camera.aspect = Math.max(0.2, width / Math.max(1, height));
      camera.updateProjectionMatrix();
    },
    frame(stature, framing, spanX = 0, instant = false, focus) {
      focusedClose = false;
      lastUserMs = performance.now();
      const vFov = (camera.fov * Math.PI) / 180;
      const tanHalf = Math.tan(vFov / 2);
      if (framing === 'skull') {
        goalTarget.set(0, focus ? focus[1] : stature * 0.89, focus ? focus[2] : 0.02 * stature);
        goalDist = clamp((0.32 * (stature / 1.65)) / tanHalf, 0.42, 1.4);
        goalTheta = 0.28;
        goalPhi = 1.46;
      } else {
        goalTarget.set(0, stature * 0.58, 0);
        const fitH = (stature * 0.72) / tanHalf;
        const fitW = spanX > 0 ? (spanX * 0.62) / (tanHalf * Math.max(0.55, camera.aspect)) : 0;
        goalDist = clamp(Math.max(fitH, fitW), 1.4, 16);
        goalTheta = spanX > 1.2 ? 0.06 : 0.22;
        goalPhi = 1.48;
      }
      if (instant || !hasFramedOnce) {
        hasFramedOnce = true;
        target.copy(goalTarget);
        theta = goalTheta;
        phi = goalPhi;
        dist = goalDist;
        applyTransform();
      }
    },
    focusOn(point, normal, distance = 0.36) {
      focusedClose = true;
      goalTarget.copy(point);
      const dir = normal.clone().normalize();
      if (dir.lengthSq() < 0.01) dir.set(0, 0.15, 1).normalize();
      // Bias slightly toward the front (+Z) so lateral/posterior markers remain comfortable to inspect.
      dir.z = Math.abs(dir.z) < 0.18 ? (dir.z >= 0 ? 0.24 : -0.24) : dir.z;
      dir.y = clamp(dir.y + 0.12, -0.45, 0.55);
      dir.normalize();
      goalTheta = Math.atan2(dir.x, dir.z);
      goalPhi = clamp(Math.acos(clamp(dir.y, -0.95, 0.95)), 0.35, Math.PI - 0.35);
      goalDist = clamp(distance, 0.22, 1.2);
    },
    step(dtSec, autoRotate) {
      const idle = performance.now() - lastUserMs > 4800 && pointers.size === 0;
      if (autoRotate && idle && !focusedClose) goalTheta += dtSec * 0.24;
      const k = 1 - Math.exp(-Math.min(0.1, dtSec) * 11);
      // Shortest-angle wrap for theta so fly-to never spins the long way around.
      const diff = ((goalTheta - theta + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      theta += diff * k;
      phi += (goalPhi - phi) * k;
      dist += (goalDist - dist) * k;
      target.lerp(goalTarget, k);
      applyTransform();
    },
    wasClick: () => dragMoved < 6,
    dispose() {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', onContext);
    },
  };
}
