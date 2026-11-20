import { describe, expect, it } from 'vitest';
import { boiteVisible } from './clavier';

const ECRAN = { haut: 0, hauteur: 844 };
const vue = (hauteur: number, haut = 0, echelle = 1, fenetre = 844) => ({ hauteur, haut, echelle, fenetre });

describe('le clavier du téléphone', () => {
  it('ne voit pas de clavier tant que toute la fenêtre se voit', () => {
    expect(boiteVisible(ECRAN, vue(844))).toBeNull();
    // an address bar that folds or comes back takes less than a keyboard
    expect(boiteVisible(ECRAN, vue(760))).toBeNull();
  });

  it('rend au terminal ce que le clavier laisse en vue', () => {
    expect(boiteVisible(ECRAN, vue(508))).toEqual({ haut: 0, hauteur: 508 });
    // the page slid up under the keyboard (iOS): the box follows what is seen
    expect(boiteVisible(ECRAN, vue(508, 120))).toEqual({ haut: 120, hauteur: 508 });
    // a stage that does not start at the window's top
    expect(boiteVisible({ haut: 24, hauteur: 820 }, vue(508, 120))).toEqual({ haut: 96, hauteur: 508 });
  });

  it('ne sort jamais de la scène', () => {
    expect(boiteVisible(ECRAN, vue(508, 500))).toEqual({ haut: 500, hauteur: 344 });
    expect(boiteVisible(ECRAN, vue(300, 900))).toEqual({ haut: 844, hauteur: 0 });
  });

  it('ne prend pas un zoom à deux doigts pour un clavier', () => {
    expect(boiteVisible(ECRAN, vue(422, 100, 2))).toBeNull();
  });

  it('ne prend pas pour un clavier le bas d’une page qui défile : le téléphone de l’établi, bas dans une fenêtre d’ordinateur', () => {
    expect(boiteVisible({ haut: 700, hauteur: 844 }, vue(1000, 0, 1, 1000))).toBeNull();
    expect(boiteVisible({ haut: -300, hauteur: 844 }, vue(1000, 0, 1, 1000))).toBeNull();
  });
});
