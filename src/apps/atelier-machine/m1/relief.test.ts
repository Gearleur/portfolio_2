import { describe, expect, it } from 'vitest';
import { CARTE, flou, tirer } from './relief';

const { W, H, MARGE } = CARTE;
const w = W + 2 * MARGE;

/** The print's pixel at (i, j) of the card: its grey and its alpha. */
const pixel = (image: Uint8ClampedArray, i: number, j: number) => {
  const k = ((j + MARGE) * w + i + MARGE) * 4;
  return { gris: image[k], alpha: image[k + 3] };
};

// Each print is a few hundred thousand pixels: quick on most machines, not on a loaded one.
describe('a sunken card', { timeout: 60_000 }, () => {
  it('is printed a margin larger than the card', () => {
    const { image, w: largeur, h } = tirer(null, { maniere: 'cuvette', profondeur: 0.5, formes: 0.5 });
    expect([largeur, h]).toEqual([W + 2 * MARGE, H + 2 * MARGE]);
    expect(image).toHaveLength(largeur * h * 4);
  });

  it('leaves the paper untouched when it is not pressed', () => {
    for (const maniere of ['cuvette', 'empreinte'] as const) {
      const { image } = tirer(null, { maniere, profondeur: 0, formes: 0 });
      expect(image.every((v, k) => k % 4 !== 3 || v === 0)).toBe(true);
    }
  });

  it('is lit from the top left: its top and left walls in shade, its bottom and right ones in light', () => {
    const { image } = tirer(null, { maniere: 'cuvette', profondeur: 1, formes: 0 });
    const milieu = { x: Math.round(W / 2), y: Math.round(H / 2) };
    const haut = pixel(image, milieu.x, 0);
    const gauche = pixel(image, 0, milieu.y);
    const bas = pixel(image, milieu.x, H - 1);
    const droite = pixel(image, W - 1, milieu.y);
    // black with an alpha in the shade, white with an alpha in the light
    for (const ombre of [haut, gauche]) expect(ombre.gris < 128 && ombre.alpha > 40).toBe(true);
    for (const eclat of [bas, droite]) expect(eclat.gris === 255 && eclat.alpha > 20).toBe(true);
    // and the floor, flat, only a little darker than the sheet
    const fond = pixel(image, milieu.x, milieu.y);
    expect(fond.gris < 128 && fond.alpha > 0 && fond.alpha < 20).toBe(true);
  });

  it('keeps more of its shapes as « formes » rises', () => {
    // one square standing in the middle of the card
    const masse = new Float32Array(W * H);
    for (let j = 100; j < 190; j++) masse.fill(1, j * W + 200, j * W + 320);
    const encre = (formes: number) => {
      const { image } = tirer({ masse }, { maniere: 'cuvette', profondeur: 0.6, formes });
      let somme = 0;
      // the square's far side from the light, where its shadow falls
      for (let j = 185; j < 200; j++) for (let i = 200; i < 330; i++) somme += pixel(image, i, j).alpha;
      return somme;
    };
    expect(encre(0)).toBeLessThan(encre(0.3));
    expect(encre(0.3)).toBeLessThan(encre(0.6));
  });

  it('is a frame and an outline, without shade, when flat', () => {
    const masse = new Float32Array(W * H);
    for (let j = 100; j < 190; j++) masse.fill(1, j * W + 200, j * W + 320);
    const { image } = tirer({ masse }, { maniere: 'contour', profondeur: 0.35, formes: 0.6 });
    const cadre = pixel(image, 0, 150).alpha;
    const dedans = pixel(image, 260, 145).alpha;
    const bord = pixel(image, 200, 145).alpha;
    expect(cadre).toBeGreaterThan(dedans);
    expect(bord).toBeGreaterThan(dedans);
    // nothing spills over the card
    expect(image[(MARGE - 3) * w * 4 + (MARGE + 100) * 4 + 3]).toBe(0);
  });
});

describe('the press', () => {
  it('rounds an edge without adding or losing height', () => {
    const champ = new Float32Array(40 * 30);
    for (let j = 10; j < 20; j++) champ.fill(1, j * 40 + 15, j * 40 + 25);
    const somme = (c: Float32Array) => c.reduce((s, v) => s + v, 0);
    const avant = somme(champ);
    flou(champ, 40, 30, 2);
    expect(somme(champ)).toBeCloseTo(avant, 2);
    expect(champ[15 * 40 + 20]).toBeLessThan(1);
    expect(champ[15 * 40 + 13]).toBeGreaterThan(0);
  });
});
