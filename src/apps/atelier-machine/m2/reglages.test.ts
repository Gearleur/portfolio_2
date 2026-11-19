import { describe, expect, it } from 'vitest';
import { plier } from './contenu';
import { BORNES, MANIERES, PROPOSITIONS, RETENU, etatDe, partieDe, resume, valider } from './reglages';
import type { Partie } from './reglages';

describe('the three propositions', () => {
  it('each bets on another manner of every part', () => {
    for (const partie of Object.keys(MANIERES) as Partie[]) {
      const manieres = PROPOSITIONS.map((p) => p.reglages[partie].maniere);
      expect([...manieres].sort()).toEqual(MANIERES[partie].map((choix) => choix.id).sort());
    }
  });

  it('sit inside the sliders’ bounds, on their steps', () => {
    for (const p of PROPOSITIONS) expect(valider({ depart: p.id, reglages: p.reglages })).toEqual({ depart: p.id, reglages: p.reglages });
  });
});

describe('the type retained at M2', () => {
  it('sits inside the sliders’ bounds', () => {
    expect(valider({ depart: 'origine', reglages: RETENU })?.reglages).toEqual(RETENU);
  });
});

describe('settings kept or pasted', () => {
  it('are refused when they are not settings', () => {
    expect(valider(null)).toBeNull();
    expect(valider({ depart: 'origine' })).toBeNull();
  });

  it('are brought back inside the bounds, and fall back on the manner’s own values', () => {
    const lu = valider({
      depart: 'lecture',
      reglages: { police: { maniere: 'embarquee', face: 'comic', corps: 40, graisse: 384 }, grille: { maniere: 'centree', colonnes: 12, interligne: Number.NaN, aeree: 'oui' }, curseur: { maniere: 'laser' } },
    });
    expect(lu?.reglages.police).toMatchObject({ face: partieDe('police', 'embarquee').face, corps: BORNES.police.corps.max, graisse: 380 });
    expect(lu?.reglages.grille).toMatchObject({ colonnes: BORNES.grille.colonnes.min, interligne: partieDe('grille', 'centree').interligne, aeree: true });
    expect(lu?.reglages.curseur).toEqual(etatDe('lecture').reglages.curseur);
    expect(lu?.reglages.gris).toEqual(etatDe('lecture').reglages.gris);
  });

  it('are read back from the summary’s last line', () => {
    const etat = etatDe('colonnes');
    const lignes = resume(etat).split('\n');
    expect(lignes[0]).toContain('proposition « 80 colonnes », telle quelle');
    expect(valider(JSON.parse(lignes[lignes.length - 1]))).toEqual(etat);
  });
});

describe('running text', () => {
  it('is folded at word spaces, never past the measure, and holds at no-break spaces', () => {
    const lignes = plier('Je travaille avec lui comme une équipe artistique\u00a0: il ouvre des pistes.', 20);
    expect(lignes.every((ligne) => ligne.length <= 20)).toBe(true);
    expect(lignes.join(' ')).toBe('Je travaille avec lui comme une équipe artistique\u00a0: il ouvre des pistes.');
    expect(lignes.some((ligne) => ligne.startsWith(':'))).toBe(false);
  });
});
