import { describe, expect, it } from 'vitest';
import { clamp01, easeOutExpo, lerp } from './easing';

describe('easing helpers', () => {
  it('clamps outside the unit range', () => {
    expect(clamp01(-3)).toBe(0);
    expect(clamp01(0.42)).toBe(0.42);
    expect(clamp01(9)).toBe(1);
  });

  it('interpolates linearly', () => {
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 0.5)).toBe(15);
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('eases out from 0 to exactly 1', () => {
    expect(easeOutExpo(0)).toBe(0);
    expect(easeOutExpo(1)).toBe(1);
    expect(easeOutExpo(0.5)).toBeGreaterThan(0.9);
  });
});
