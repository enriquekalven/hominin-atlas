/**
 * Cheap skull attachment points (no SDF construction), kept in sync with buildSkull().
 */
import type { V3 } from './core';
import type { SkullParams } from '../morph/params';

export function skullScale(p: SkullParams): number {
  return (p.vaultLength + p.vaultBreadth + p.vaultHeight) / (0.19 + 0.142 + 0.118);
}

export function skullAttachment(p: SkullParams): { condyleBase: V3; jawHinge: V3; s: number } {
  const s = skullScale(p);
  return {
    condyleBase: [0, -0.0345 * s - 0.0055 * s, p.foramenMagnumZ - 0.012 * s],
    jawHinge: [0, -0.0115 * s, 0.012 * s],
    s,
  };
}
