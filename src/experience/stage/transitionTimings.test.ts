import { describe, expect, it } from 'vitest';
import { PULLBACK_MS, PUSHIN_MS, REDUCED_MS, transitionDurationMs } from './transitionTimings';

describe('transitionDurationMs', () => {
  const full = { prefersReducedMotion: false, isMobile: false };

  it('uses the full durations on desktop', () => {
    expect(transitionDurationMs('pullback', full)).toBe(PULLBACK_MS);
    expect(transitionDurationMs('pushin', full)).toBe(PUSHIN_MS);
  });

  it('collapses to a fade on mobile', () => {
    expect(transitionDurationMs('pullback', { ...full, isMobile: true })).toBe(REDUCED_MS);
  });

  it('collapses to a fade with reduced motion', () => {
    expect(transitionDurationMs('pushin', { ...full, prefersReducedMotion: true })).toBe(REDUCED_MS);
  });

  it('returns zero for stable stages', () => {
    expect(transitionDurationMs('desktop', full)).toBe(0);
    expect(transitionDurationMs('room', full)).toBe(0);
  });
});
