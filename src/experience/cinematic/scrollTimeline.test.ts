import { describe, expect, it } from 'vitest';
import { actIndexFromProgress, actProgress, roomDepthFromProgress } from './scrollTimeline';

describe('actIndexFromProgress', () => {
  it('starts on the first act', () => {
    expect(actIndexFromProgress(0, 5)).toBe(0);
  });

  it('ends on the last act', () => {
    expect(actIndexFromProgress(1, 5)).toBe(4);
  });

  it('splits the range evenly', () => {
    expect(actIndexFromProgress(0.25, 4)).toBe(1);
    expect(actIndexFromProgress(0.5, 4)).toBe(2);
  });

  it('clamps outside the unit range', () => {
    expect(actIndexFromProgress(-2, 4)).toBe(0);
    expect(actIndexFromProgress(7, 4)).toBe(3);
  });

  it('returns zero when there is no act', () => {
    expect(actIndexFromProgress(0.5, 0)).toBe(0);
  });
});

describe('actProgress', () => {
  it('reports the progress inside the current act', () => {
    expect(actProgress(0.25, 4, 1)).toBeCloseTo(0, 5);
    expect(actProgress(0.375, 4, 1)).toBeCloseTo(0.5, 5);
  });

  it('clamps for acts outside the current window', () => {
    expect(actProgress(0.9, 4, 0)).toBe(1);
    expect(actProgress(0.1, 4, 3)).toBe(0);
  });
});

describe('roomDepthFromProgress', () => {
  const depths = [10.4, 18.2, 26.5, 34.8, 42.0];

  it('starts on the first depth', () => {
    expect(roomDepthFromProgress(0, depths)).toBeCloseTo(10.4, 5);
  });

  it('ends on the last depth', () => {
    expect(roomDepthFromProgress(1, depths)).toBeCloseTo(42.0, 5);
  });

  it('interpolates linearly inside a span', () => {
    // 5 profondeurs -> 4 segments egaux de 0.25 : 0.125 est a mi-chemin du
    // premier segment.
    expect(roomDepthFromProgress(0.125, depths)).toBeCloseTo((10.4 + 18.2) / 2, 5);
  });

  it('reaches each authored depth exactly at its keyframe', () => {
    expect(roomDepthFromProgress(0.5, depths)).toBeCloseTo(26.5, 5);
    expect(roomDepthFromProgress(0.75, depths)).toBeCloseTo(34.8, 5);
  });

  it('clamps outside the unit range', () => {
    expect(roomDepthFromProgress(-1, depths)).toBeCloseTo(10.4, 5);
    expect(roomDepthFromProgress(2, depths)).toBeCloseTo(42.0, 5);
  });

  it('returns the sole depth when only one is authored', () => {
    expect(roomDepthFromProgress(0.5, [7])).toBe(7);
  });

  it('returns zero when no depth is authored', () => {
    expect(roomDepthFromProgress(0.5, [])).toBe(0);
  });
});
