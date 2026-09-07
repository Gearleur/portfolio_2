import { clamp01 } from '../stage/easing';

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
