import { describe, expect, it } from 'vitest';
import { clamp01, easeOutExpo, lerp, smootherstep } from './easing';

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

describe('smootherstep', () => {
  it('pins both ends and the middle', () => {
    expect(smootherstep(0)).toBe(0);
    expect(smootherstep(1)).toBe(1);
    expect(smootherstep(0.5)).toBeCloseTo(0.5, 10);
  });

  it('clamps outside the unit range', () => {
    expect(smootherstep(-4)).toBe(0);
    expect(smootherstep(4)).toBe(1);
  });

  // Premier temps de la cinematique : le bureau se fige. Sur 2,5 s, 300 ms
  // valent 12 % de la course, et la camera ne doit quasiment pas avoir bouge.
  it('barely moves through the opening twelfth', () => {
    expect(smootherstep(0.12)).toBeLessThan(0.02);
  });

  // Le retour fait descendre la progression de 1 vers 0 : la courbe doit se
  // lire aussi bien a l'envers, donc etre symetrique autour de (0.5, 0.5).
  it('reads the same reversed', () => {
    for (const t of [0.1, 0.25, 0.4, 0.62, 0.87]) {
      expect(smootherstep(1 - t)).toBeCloseTo(1 - smootherstep(t), 10);
    }
  });

  // Dernier temps : deceleration forte. Il reste moins de 5 % de la course a
  // couvrir quand s'ouvre le dernier sixieme.
  it('decelerates hard on the closing sixth', () => {
    expect(smootherstep(0.84)).toBeGreaterThan(0.95);
  });
});
