/**
 * Validation for user-supplied 3D scan files (drag & drop / file picker).
 * Files are parsed locally in the browser and never uploaded. We still treat them as untrusted:
 * allow-listed extensions, a size cap, and magic-byte / structure checks before any parser sees them.
 */
import type { ScanFormat } from './events';

export const MAX_SCAN_BYTES = 150 * 1024 * 1024; // 150 MB

export type ScanValidation =
  | { ok: true; format: ScanFormat; safeName: string }
  | { ok: false; reason: string };

const EXT_TO_FORMAT: Record<string, ScanFormat> = { stl: 'stl', glb: 'glb', obj: 'obj', ply: 'ply' };

/** Strip any path components and control characters; keep a short display-only name. */
export function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? 'scan';
  // eslint-disable-next-line no-control-regex
  const cleaned = base.replace(/[\u0000-\u001f\u007f<>"'`]/g, '').trim();
  return (cleaned || 'scan').slice(0, 80);
}

function asciiPrefix(bytes: Uint8Array, n: number): string {
  let s = '';
  for (let i = 0; i < Math.min(n, bytes.length); i++) s += String.fromCharCode(bytes[i]);
  return s;
}

export function validateScan(name: string, buffer: ArrayBuffer): ScanValidation {
  const safeName = sanitizeFileName(name);
  const ext = (safeName.split('.').pop() ?? '').toLowerCase();
  const format = EXT_TO_FORMAT[ext];
  if (!format) return { ok: false, reason: 'Unsupported file type. Use .stl, .glb, .obj or .ply.' };
  if (buffer.byteLength === 0) return { ok: false, reason: 'The file is empty.' };
  if (buffer.byteLength > MAX_SCAN_BYTES) return { ok: false, reason: 'The file is larger than 150 MB.' };

  const bytes = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 512));
  const head = asciiPrefix(bytes, 512);

  switch (format) {
    case 'glb': {
      if (buffer.byteLength < 20) return { ok: false, reason: 'GLB file is truncated.' };
      const view = new DataView(buffer);
      const magic = view.getUint32(0, true);
      const version = view.getUint32(4, true);
      const declared = view.getUint32(8, true);
      if (magic !== 0x46546c67) return { ok: false, reason: 'Not a binary glTF (.glb) file.' };
      if (version !== 2) return { ok: false, reason: 'Only glTF 2.0 is supported.' };
      if (declared > buffer.byteLength) return { ok: false, reason: 'GLB file is truncated.' };
      return { ok: true, format, safeName };
    }
    case 'ply': {
      if (!head.startsWith('ply')) return { ok: false, reason: 'Not a PLY file.' };
      return { ok: true, format, safeName };
    }
    case 'stl': {
      if (buffer.byteLength >= 84) {
        const triCount = new DataView(buffer).getUint32(80, true);
        if (84 + triCount * 50 === buffer.byteLength) return { ok: true, format, safeName };
      }
      if (/^\s*solid[\s\S]*facet/i.test(head) || /^\s*solid\s/i.test(head)) return { ok: true, format, safeName };
      return { ok: false, reason: 'Not a valid STL file.' };
    }
    case 'obj': {
      // Must be text and contain vertex records; reject binary content.
      for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        if (b === 0) return { ok: false, reason: 'Not a text OBJ file.' };
      }
      if (!/(^|\n)\s*(v|vn|vt|o|g|#|mtllib|f)\s/.test(head)) return { ok: false, reason: 'Not a valid OBJ file.' };
      return { ok: true, format, safeName };
    }
  }
}
