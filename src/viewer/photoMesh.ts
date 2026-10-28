/** Photorealistic 3D volumetric human reconstruction from matched Front + Back full-body images. */
import * as THREE from 'three';
import type { MorphParams } from '../morph/params';

export interface PhotoMeshData {
  geometry: THREE.BufferGeometry; atlasTexture: THREE.CanvasTexture;
  basePositions: Float32Array; stature: number;
}

function segmentForeground(rgba: Uint8ClampedArray, w: number, h: number): Uint8Array {
  const isBg = new Uint8Array(w * h), ext = new Uint8Array(w * h), q = new Int32Array(w * h);
  for (let y = 0; y < h; y++) {
    let brL = 0, bgL = 0, bbL = 0, brR = 0, bgR = 0, bbR = 0;
    for (let k = 0; k < 4; k++) {
      const iL = (y * w + k) * 4, iR = (y * w + w - 1 - k) * 4;
      brL += rgba[iL] * 0.25; bgL += rgba[iL + 1] * 0.25; bbL += rgba[iL + 2] * 0.25;
      brR += rgba[iR] * 0.25; bgR += rgba[iR + 1] * 0.25; bbR += rgba[iR + 2] * 0.25;
    }
    if (brL + bgL + bbL > 180) { brL = 11; bgL = 18; bbL = 32; }
    if (brR + bgR + bbR > 180) { brR = 11; bgR = 18; bbR = 32; }
    for (let x = 0; x < w; x++) {
      const t = x / Math.max(1, w - 1), br = brL * (1 - t) + brR * t, bg = bgL * (1 - t) + bgR * t, bb = bbL * (1 - t) + bbR * t;
      const idx = y * w + x, i = idx * 4, r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b, dl = lum - (0.299 * br + 0.587 * bg + 0.114 * bb);
      const dChroma = Math.hypot(r - (br + dl), g - (bg + dl), b - (bb + dl));
      if (b >= r && ((dl >= -14 && dl <= 26 && dChroma < 9.8) || (y > h * 0.76 && lum < 44 && dChroma < 12.5))) isBg[idx] = 1;
    }
  }
  let qh = 0, qt = 0;
  const push = (idx: number) => { if (!ext[idx]) { ext[idx] = 1; q[qt++] = idx; } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  for (let y = Math.floor(h * 0.55); y < h; y++) for (let x = Math.floor(w * 0.44); x <= Math.floor(w * 0.56); x++) {
    const idx = y * w + x; if (isBg[idx] && isBg[idx - 1] && isBg[idx + 1]) push(idx);
  }
  while (qh < qt) {
    const cur = q[qh++], cx = cur % w, cy = (cur - cx) / w;
    for (const n of [cx > 0 ? cur - 1 : -1, cx + 1 < w ? cur + 1 : -1, cy > 0 ? cur - w : -1, cy + 1 < h ? cur + w : -1]) if (n >= 0 && !ext[n] && isBg[n]) push(n);
  }
  const fg = new Uint8Array(w * h), comp = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) fg[i] = ext[i] ? 0 : 1;
  qh = 0; qt = 0;
  for (let dx = -40, sy = Math.floor(h * 0.36) * w + Math.floor(w * 0.5); dx <= 40; dx++) if (fg[sy + dx]) { comp[sy + dx] = 1; q[qt++] = sy + dx; break; }
  while (qh < qt) {
    const cur = q[qh++], cx = cur % w, cy = (cur - cx) / w;
    for (const n of [cx > 0 ? cur - 1 : -1, cx + 1 < w ? cur + 1 : -1, cy > 0 ? cur - w : -1, cy + 1 < h ? cur + w : -1]) if (n >= 0 && !comp[n] && fg[n]) { comp[n] = 1; q[qt++] = n; }
  }
  let cur = comp;
  for (let e = 0; e < 2; e++) {
    const next = new Uint8Array(w * h);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x; if (cur[i] && cur[i - 1] && cur[i + 1] && cur[i - w] && cur[i + w]) next[i] = 1;
    }
    cur = next;
  }
  return cur;
}

function dilateAndSharpen(rgba: Uint8ClampedArray, mask: Uint8Array, w: number, h: number, passes = 14, amt = 0.18): void {
  const cur = new Uint8Array(mask);
  for (let p = 0; p < passes; p++) {
    const tag = p + 1, nextTag = p + 2;
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x; if (cur[idx]) continue;
      let sr = 0, sg = 0, sb = 0, c = 0;
      for (const n of [idx - 1, idx + 1, idx - w, idx + w]) if (cur[n] === tag) { const ni = n * 4; sr += rgba[ni]; sg += rgba[ni + 1]; sb += rgba[ni + 2]; c++; }
      if (c > 0) { const i = idx * 4; rgba[i] = sr / c; rgba[i + 1] = sg / c; rgba[i + 2] = sb / c; rgba[i + 3] = 255; cur[idx] = nextTag; }
    }
  }
  const s = new Uint8ClampedArray(rgba);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = (y * w + x) * 4;
    for (let c = 0; c < 3; c++) rgba[i + c] = Math.max(0, Math.min(255, Math.round(s[i + c] + amt * (4 * s[i + c] - s[i - 4 + c] - s[i + 4 + c] - s[i - w * 4 + c] - s[i + w * 4 + c]))));
  }
}

function smoothArr(arr: Float32Array, passes = 5): void {
  const tmp = new Float32Array(arr.length);
  for (let p = 0; p < passes; p++) {
    tmp[0] = arr[0]; tmp[arr.length - 1] = arr[arr.length - 1];
    for (let i = 1; i < arr.length - 1; i++) tmp[i] = 0.25 * arr[i - 1] + 0.5 * arr[i] + 0.25 * arr[i + 1];
    arr.set(tmp);
  }
}

export function buildPhotoMeshFromImages(
  frontImg: HTMLImageElement, backImg: HTMLImageElement | null, stature: number, params: MorphParams,
): PhotoMeshData | null {
  const hw = 640, th = 960, cF = document.createElement('canvas'); cF.width = hw; cF.height = th;
  const ctxF = cF.getContext('2d'); if (!ctxF) return null;
  ctxF.drawImage(frontImg, 0, 0, hw, th);
  const rawF = ctxF.getImageData(0, 0, hw, th).data, maskF = segmentForeground(rawF, hw, th);
  let yTopF = th, yBotF = 0, xMinF = hw, xMaxF = 0;
  for (let y = 0; y < th; y++) for (let x = 0; x < hw; x++) if (maskF[y * hw + x]) {
    if (y < yTopF) yTopF = y; if (y > yBotF) yBotF = y; if (x < xMinF) xMinF = x; if (x > xMaxF) xMaxF = x;
  }
  if (yBotF <= yTopF + 20) return null;

  let rawB = new Uint8ClampedArray(rawF), maskB = maskF, yTopB = yTopF, yBotB = yBotF;
  if (backImg) {
    const cB = document.createElement('canvas'); cB.width = hw; cB.height = th;
    const ctxB = cB.getContext('2d')!; ctxB.drawImage(backImg, 0, 0, hw, th);
    rawB = ctxB.getImageData(0, 0, hw, th).data; maskB = segmentForeground(rawB, hw, th); yTopB = th; yBotB = 0;
    for (let y = 0; y < th; y++) for (let x = 0; x < hw; x++) if (maskB[y * hw + x]) { if (y < yTopB) yTopB = y; if (y > yBotB) yBotB = y; }
    if (yBotB <= yTopB + 20) { rawB = new Uint8ClampedArray(rawF); maskB = maskF; yTopB = yTopF; yBotB = yBotF; }
  }
  dilateAndSharpen(rawF, maskF, hw, th); dilateAndSharpen(rawB, maskB, hw, th);

  const gh = 180, nTheta = 56, spanH = Math.max(1, yBotF - yTopF), scaleM = stature / spanH, xMidGlobal = (xMinF + xMaxF) * 0.5;
  const xL = new Float32Array(gh), xR = new Float32Array(gh), lLeg0 = new Float32Array(gh), lLeg1 = new Float32Array(gh), rLeg0 = new Float32Array(gh), rLeg1 = new Float32Array(gh);
  let splitGy = Math.floor(gh * 0.65), splitFound = false;

  for (let gy = 0; gy < gh; gy++) {
    const s = gy / (gh - 1), py = Math.min(th - 1, Math.round(yTopF + s * spanH)), runs: [number, number][] = [];
    for (let x = 0, x0 = -1; x <= hw; x++) {
      const on = x < hw && maskF[py * hw + x];
      if (on && x0 < 0) x0 = x; else if (!on && x0 >= 0) { if (x - x0 >= 8) runs.push([x0, x - 1]); x0 = -1; }
    }
    let l = runs.length ? runs[0][0] : (gy > 0 ? xL[gy - 1] : xMidGlobal - 16), r = runs.length ? runs[runs.length - 1][1] : (gy > 0 ? xR[gy - 1] : xMidGlobal + 16);
    const bodyRuns = runs.filter(([a, b]) => b - a >= 24);
    if (s > 0.58 && bodyRuns.length >= 2) {
      let bestL = bodyRuns[0], bestR = bodyRuns[bodyRuns.length - 1];
      for (const br of bodyRuns) {
        const c = (br[0] + br[1]) * 0.5;
        if (c < xMidGlobal && Math.abs(c - (xMidGlobal - 56)) < Math.abs((bestL[0] + bestL[1]) * 0.5 - (xMidGlobal - 56))) bestL = br;
        if (c >= xMidGlobal && Math.abs(c - (xMidGlobal + 56)) < Math.abs((bestR[0] + bestR[1]) * 0.5 - (xMidGlobal + 56))) bestR = br;
      }
      if (bestL !== bestR && bestR[0] - bestL[1] >= 16) {
        lLeg0[gy] = bestL[0]; lLeg1[gy] = bestL[1]; rLeg0[gy] = bestR[0]; rLeg1[gy] = bestR[1]; l = bestL[0]; r = bestR[1];
        if (!splitFound && s > 0.60) { splitGy = gy; splitFound = true; }
      }
    }
    if (!lLeg1[gy]) { const mid = (l + r) * 0.5; lLeg0[gy] = l; lLeg1[gy] = mid - 8; rLeg0[gy] = mid + 8; rLeg1[gy] = r; }
    xL[gy] = l; xR[gy] = r;
  }
  smoothArr(xL, 2); smoothArr(xR, 2); smoothArr(lLeg0, 3); smoothArr(lLeg1, 3); smoothArr(rLeg0, 3); smoothArr(rLeg1, 3);

  const aw = 1024, ah = 1024, atlasCanvas = document.createElement('canvas'); atlasCanvas.width = aw; atlasCanvas.height = ah;
  const ctxA = atlasCanvas.getContext('2d')!, atlasImg = ctxA.createImageData(aw, ah), ad = atlasImg.data;
  const bXL = new Float32Array(gh), bXR = new Float32Array(gh), bProfile = new Float32Array(gh), headHW = (xR[13] - xL[13]) * 0.5 * scaleM;
  for (let gy = 0; gy < gh; gy++) {
    const s = gy / (gh - 1), pyB = Math.min(th - 1, Math.round(yTopB + s * Math.max(1, yBotB - yTopB))), hwM = (xR[gy] - xL[gy]) * 0.5 * scaleM;
    let l = hw, r = 0;
    for (let x = 0; x < hw; x++) if (maskB[pyB * hw + x]) { if (x < l) l = x; if (x > r) r = x; }
    bXL[gy] = l <= r ? l : xL[gy]; bXR[gy] = l <= r ? r : xR[gy];
    const domeZ = gy < 7 ? Math.sin(((gy + 0.6) / 7.6) * Math.PI * 0.5) : 1;
    bProfile[gy] = s < 0.14 ? Math.min(0.092 * stature, headHW * 1.06) * domeZ : s < 0.19 ? Math.min(0.068 * stature, headHW * 0.78) : Math.min(0.102 * stature, Math.max(0.045 * stature, hwM * 0.52));
  }
  smoothArr(bXL, 2); smoothArr(bXR, 2); smoothArr(bProfile, 6);
  const sampleBilinear = (raw: Uint8ClampedArray, xf: number, yf: number, out: number[]) => {
    const x0 = Math.max(0, Math.min(hw - 1, Math.floor(xf))), x1 = Math.min(hw - 1, x0 + 1), tx = xf - x0, y0 = Math.max(0, Math.min(th - 1, Math.floor(yf))), y1 = Math.min(th - 1, y0 + 1), ty = yf - y0;
    const i00 = (y0 * hw + x0) * 4, i10 = (y0 * hw + x1) * 4, i01 = (y1 * hw + x0) * 4, i11 = (y1 * hw + x1) * 4;
    for (let c = 0; c < 3; c++) out[c] = (raw[i00 + c] * (1 - tx) + raw[i10 + c] * tx) * (1 - ty) + (raw[i01 + c] * (1 - tx) + raw[i11 + c] * tx) * ty;
  };
  const rgbF = [0, 0, 0], rgbB = [0, 0, 0], spanHB = Math.max(1, yBotB - yTopB);
  for (let ay = 0; ay < ah; ay++) { // bounds interpolated between grid rows (nearest-row lookup made sawtooth edges in ~6-row bands)
    const s = ay / (ah - 1), gf = s * (gh - 1), g0 = Math.floor(gf), g1 = Math.min(gh - 1, g0 + 1), t = gf - g0, row = (a: Float32Array) => a[g0] + (a[g1] - a[g0]) * t;
    const f0 = row(xL), f1 = row(xR), b0 = row(bXL), b1 = row(bXR), yfF = yTopF + s * spanH, yfB = yTopB + s * spanHB;
    for (let ax = 0; ax < aw; ax++) {
      const theta = (ax / aw) * Math.PI * 2, u = 0.015 + 0.97 * (0.5 + 0.5 * Math.cos(theta)), wFront = Math.max(0, Math.min(1, (Math.sin(theta) + 0.25) / 0.50));
      sampleBilinear(rawF, f0 + u * (f1 - f0), yfF, rgbF); sampleBilinear(rawB, b0 + (1 - u) * (b1 - b0), yfB, rgbB);
      const di = (ay * aw + ax) * 4;
      ad[di] = rgbF[0] * wFront + rgbB[0] * (1 - wFront); ad[di + 1] = rgbF[1] * wFront + rgbB[1] * (1 - wFront); ad[di + 2] = rgbF[2] * wFront + rgbB[2] * (1 - wFront); ad[di + 3] = 255;
    }
  }
  ctxA.putImageData(atlasImg, 0, 0);
  // Rows are stretched to a fixed width (head ~4.6x wider than tall): anisotropic sampling keeps faces sharp.
  const atlasTexture = new THREE.CanvasTexture(atlasCanvas); atlasTexture.wrapS = THREE.RepeatWrapping; atlasTexture.colorSpace = THREE.SRGBColorSpace; atlasTexture.anisotropy = 16;

  const pos: number[] = [], uvs: number[] = [], indices: number[] = [];
  const addTube = (gy0: number, gy1: number, getBounds: (gy: number) => [number, number], isLeg: boolean) => {
    const rings = gy1 - gy0 + 1, baseV = pos.length / 3, halfW = new Float32Array(rings), center = new Float32Array(rings), stride = nTheta + 1;
    for (let r = 0; r < rings; r++) { const [b0, b1] = getBounds(gy0 + r); center[r] = (b0 + b1) * 0.5; halfW[r] = Math.max(4, (b1 - b0) * 0.5); }
    smoothArr(center, 2); smoothArr(halfW, 2);
    for (let r = 0; r < rings; r++) {
      const gy = gy0 + r, s = gy / (gh - 1), wy = Math.max(0, (1 - s) * stature), v = 1 - s, botCap = r === rings - 1 ? 0.2 : r === rings - 2 ? 0.7 : 1;
      const aM = halfW[r] * scaleM * (r === 0 && !isLeg ? 0.35 : botCap), xcM = (center[r] - xMidGlobal) * scaleM, bM = (isLeg ? Math.min(0.052 * stature, halfW[r] * scaleM * 0.86) : bProfile[gy]) * botCap;
      const spineZ = (s > 0.92 ? 0.022 * ((s - 0.92) / 0.08) : Math.sin(s * Math.PI * 2) * -0.005) * stature, fSpan = Math.max(8, xR[gy] - xL[gy]);
      for (let t = 0; t <= nTheta; t++) {
        const u = t / nTheta, thA = u * Math.PI * 2, ct = Math.cos(thA), st = Math.sin(thA), xW = xcM + aM * ct;
        const noseZ = !isLeg && s > 0.045 && s < 0.125 && st > 0 ? Math.pow(st, 1.8) * (0.01 + params.skull.prognathism * 0.009) * stature * Math.sin(((s - 0.045) / 0.08) * Math.PI) : 0;
        pos.push(xW, wy, spineZ + bM * (st >= 0 ? 1 : 0.92) * st + noseZ);
        const cBody = Math.max(-1, Math.min(1, ((xW / scaleM + xMidGlobal - xL[gy]) / fSpan) * 2 - 1));
        uvs.push(isLeg ? (st >= 0 ? Math.acos(cBody) / (Math.PI * 2) : 1 - Math.acos(cBody) / (Math.PI * 2)) : u, v);
      }
    }
    for (let r = 0; r < rings - 1; r++) for (let t = 0; t < nTheta; t++) {
      const i00 = baseV + r * stride + t; indices.push(i00, i00 + stride, i00 + 1, i00 + 1, i00 + stride, i00 + stride + 1);
    }
  };
  if (splitFound && splitGy < gh - 8) {
    addTube(0, splitGy + 1, (gy) => [xL[gy], xR[gy]], false); addTube(splitGy, gh - 1, (gy) => [lLeg0[gy], lLeg1[gy]], true); addTube(splitGy, gh - 1, (gy) => [rLeg0[gy], rLeg1[gy]], true);
  } else addTube(0, gh - 1, (gy) => [xL[gy], xR[gy]], false);
  const geometry = new THREE.BufferGeometry(), basePositions = new Float32Array(pos);
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(basePositions), 3)); geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices); geometry.computeVertexNormals(); return { geometry, atlasTexture, basePositions, stature };
}
