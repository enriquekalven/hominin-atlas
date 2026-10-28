/**
 * Deterministic 3D gradient noise (Perlin-style) for bone-surface irregularities, woven bone,
 * osteophytes and fracture-line jitter. Same seed => same bones on every machine.
 */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GRAD3 = new Float32Array([
  1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1,
  -1,
]);

export interface Noise3 {
  (x: number, y: number, z: number): number;
}

/** Gradient noise in roughly [-1, 1]. */
export function makeNoise(seed = 1): Noise3 {
  const rand = mulberry32(seed);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = p[i];
    p[i] = p[j];
    p[j] = t;
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const grad = (h: number, x: number, y: number, z: number) => {
    const g = (h % 12) * 3;
    return GRAD3[g] * x + GRAD3[g + 1] * y + GRAD3[g + 2] * z;
  };

  return (x, y, z) => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = x - xi, yf = y - yi, zf = z - zi;
    const X = xi & 255, Y = yi & 255, Z = zi & 255;
    const u = fade(xf), v = fade(yf), w = fade(zf);
    const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
    const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
    const x1 = grad(perm[AA], xf, yf, zf) + u * (grad(perm[BA], xf - 1, yf, zf) - grad(perm[AA], xf, yf, zf));
    const x2 =
      grad(perm[AB], xf, yf - 1, zf) + u * (grad(perm[BB], xf - 1, yf - 1, zf) - grad(perm[AB], xf, yf - 1, zf));
    const x3 =
      grad(perm[AA + 1], xf, yf, zf - 1) +
      u * (grad(perm[BA + 1], xf - 1, yf, zf - 1) - grad(perm[AA + 1], xf, yf, zf - 1));
    const x4 =
      grad(perm[AB + 1], xf, yf - 1, zf - 1) +
      u * (grad(perm[BB + 1], xf - 1, yf - 1, zf - 1) - grad(perm[AB + 1], xf, yf - 1, zf - 1));
    const y1 = x1 + v * (x2 - x1);
    const y2 = x3 + v * (x4 - x3);
    return y1 + w * (y2 - y1);
  };
}

/** Fractal sum of `octaves` noise layers; result roughly in [-1, 1]. */
export function fbm(noise: Noise3, x: number, y: number, z: number, octaves = 3): number {
  let amp = 0.5, freq = 1, sum = 0, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise(x * freq, y * freq, z * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

/** Hash a string to a 32-bit seed (stable across runs). */
export function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const sharedNoise = makeNoise(7);
