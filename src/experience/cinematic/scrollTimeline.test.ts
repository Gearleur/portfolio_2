import { describe, expect, it } from 'vitest';
import { actIndexFromProgress, actProgress } from './scrollTimeline';

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
