import { clamp01, lerp } from '../stage/easing';

export function actIndexFromProgress(progress: number, actCount: number): number {
  if (actCount <= 0) {
    return 0;
  }

  const index = Math.floor(clamp01(progress) * actCount);
  return Math.min(index, actCount - 1);
}

export function actProgress(progress: number, actCount: number, actIndex: number): number {
  if (actCount <= 0) {
    return 0;
  }

  const span = 1 / actCount;
  return clamp01((clamp01(progress) - actIndex * span) / span);
}

/*
 * Relie les profondeurs de camera authorees acte par acte (`cameraDepth`
 * dans `cinematicScript.ts`) par interpolation lineaire sur toute la
 * progression du scroll. Les profondeurs sont reparties a intervalles egaux
 * sur [0, 1] -- la premiere au tout debut, la derniere a la toute fin --
 * exactement comme `sampleCameraPath` relie les positions de la trajectoire
 * de recul par leurs `t`.
 */
export function roomDepthFromProgress(progress: number, depths: number[]): number {
  if (depths.length === 0) {
    return 0;
  }

  if (depths.length === 1) {
    return depths[0];
  }

  const clamped = clamp01(progress);
  const span = 1 / (depths.length - 1);
  const index = Math.min(Math.floor(clamped / span), depths.length - 2);
  const local = (clamped - index * span) / span;

  return lerp(depths[index], depths[index + 1], local);
}
