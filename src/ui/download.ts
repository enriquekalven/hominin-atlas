/**
 * Snapshot download helpers. The viewer replies to 'ui:snapshot' with a data URL; we decode it
 * locally into a Blob and trigger a download via a temporary <a download> (no network).
 */
const DATA_URL = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/;
const MAX_SNAPSHOT_BYTES = 40 * 1024 * 1024;

/** Decode a base64 raster data URL. Returns null for anything that is not png/jpeg/webp. */
export function parseImageDataUrl(url: string): { mime: string; bytes: Uint8Array } | null {
  if (typeof url !== 'string' || url.length > MAX_SNAPSHOT_BYTES * 1.4) return null;
  const m = DATA_URL.exec(url);
  if (!m) return null;
  let bin: string;
  try {
    bin = atob(m[2]);
  } catch {
    return null;
  }
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { mime: m[1], bytes };
}

const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

/** "hominin-atlas-homo-erectus-2026-10-26-1530.png" (safe characters only). */
export function snapshotFileName(speciesId: string, mime: string, date: Date = new Date()): string {
  const safe = speciesId.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 48) || 'view';
  const p = (n: number) => String(n).padStart(2, '0');
  const stamp = `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}`;
  return `hominin-atlas-${safe}-${stamp}.${EXT[mime] ?? 'png'}`;
}

/** Trigger a browser download of in-memory bytes. */
export function downloadBytes(bytes: Uint8Array, mime: string, fileName: string): void {
  const blob = new Blob([bytes as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', fileName);
  a.setAttribute('class', 'sr-only');
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
