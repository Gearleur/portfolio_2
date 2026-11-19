import { describe, expect, it } from 'vitest';
import { repartir, tracer } from './gomme';
import type { Zone } from './gomme';
import { PROPOSITIONS } from './reglages';

const ZONES: Zone[] = [
  { x: 16, y: 96, w: 730, h: 72, poids: 3 },
  { x: 16, y: 168, w: 300, h: 72, poids: 3 },
  { x: 16, y: 406, w: 518, h: 323, poids: 2 },
  { x: 1290, y: 108, w: 134, h: 140, poids: 0.7 },
];

describe('where the eraser goes', () => {
  it('starts with the heaviest zones, and visits each as often as it weighs', () => {
    expect(repartir(3, ZONES)).toEqual([0, 1, 2]);
    const visites = repartir(87, ZONES);
    const compte = ZONES.map((_, z) => visites.filter((v) => v === z).length);
    expect(compte).toEqual([30, 30, 20, 7]);
  });

  it('has nowhere to go on an empty page', () => {
    expect(repartir(5, [])).toEqual([]);
    expect(tracer(PROPOSITIONS[0].reglages.gomme, [])).toEqual([]);
  });
});

describe('the strokes', () => {
  const gomme = PROPOSITIONS[0].reglages.gomme;

  it('are the same for the same draw, and others for another', () => {
    expect(tracer(gomme, ZONES)).toEqual(tracer(gomme, ZONES));
    expect(tracer({ ...gomme, graine: gomme.graine + 1 }, ZONES)).not.toEqual(tracer(gomme, ZONES));
  });

  it('stay where they are when more are added', () => {
    const plus = tracer({ ...gomme, nombre: gomme.nombre + 6 }, ZONES);
    expect(plus).toHaveLength(gomme.nombre + 6);
    expect(plus.slice(0, gomme.nombre)).toEqual(tracer(gomme, ZONES));
  });

  it('are rubbed back and forth, passed once or swept once, by manner', () => {
    const passes = (maniere: typeof gomme.maniere) => tracer({ ...gomme, maniere }, ZONES).map((coup) => coup.passes.length);
    expect(Math.min(...passes('frottis'))).toBeGreaterThanOrEqual(2);
    expect(new Set(passes('passes'))).toEqual(new Set([1]));
    expect(new Set(passes('balayage'))).toEqual(new Set([1]));
    // a sweep is bowed, a straight pass with a steady hand is not
    expect(tracer({ ...gomme, maniere: 'balayage' }, ZONES).every((coup) => coup.passes[0].fleche < 0)).toBe(true);
    expect(tracer({ ...gomme, maniere: 'passes', irregularite: 0 }, ZONES).every((coup) => coup.passes[0].fleche === 0)).toBe(true);
  });
});
