import { describe, expect, it } from 'vitest';
import { BORNES, MANIERES, PROPOSITIONS, RETENU, etatDe, origine, partieDe, provenance, resume, valider } from './reglages';
import type { Partie } from './reglages';

const PARTIES = Object.keys(MANIERES) as Partie[];

describe('the three propositions', () => {
  it('each bets on another manner of every part', () => {
    for (const partie of PARTIES) {
      const manieres = PROPOSITIONS.map((p) => p.reglages[partie].maniere);
      expect(new Set(manieres).size).toBe(PROPOSITIONS.length);
      expect(manieres).toEqual(MANIERES[partie].map((choix) => choix.id));
    }
  });

  it('sit inside the sliders’ bounds, on their steps', () => {
    for (const p of PROPOSITIONS) expect(valider({ depart: p.id, reglages: p.reglages })).toEqual({ depart: p.id, reglages: p.reglages });
  });

  it('are recognised while untouched, and no longer once a slider moved', () => {
    const [premiere] = PROPOSITIONS;
    expect(provenance(premiere.reglages)).toMatchObject({ intacte: premiere, seule: premiere });
    const regle = { ...premiere.reglages, gomme: { ...premiere.reglages.gomme, nombre: premiere.reglages.gomme.nombre + 1 } };
    expect(provenance(regle)).toMatchObject({ intacte: undefined, seule: premiere });
    // and once a part comes from another proposition, it is a mix
    const melange = provenance({ ...regle, verre: partieDe('verre', 'lame') });
    expect(melange.seule).toBeUndefined();
    expect(melange.melange).toBe('la page de « Coup de gomme », la gomme de « Coup de gomme », les miniatures de « Coup de gomme », le verre de « À plat »');
    expect(origine('gomme', regle.gomme)).toEqual({ source: premiere, intacte: false });
    expect(origine('verre', regle.verre)).toEqual({ source: premiere, intacte: true });
  });

  it('give a part back as proposed, by its manner', () => {
    expect(partieDe('verre', 'dalle')).toBe(PROPOSITIONS[2].reglages.verre);
    expect(partieDe('gomme', 'passes')).toBe(PROPOSITIONS[1].reglages.gomme);
  });
});

describe('the matter retained at M1', () => {
  it('sits inside the sliders’ bounds, and is the bench’s start when nothing is kept', () => {
    expect(valider({ depart: 'gomme', reglages: RETENU })?.reglages).toEqual(RETENU);
  });
});

describe('settings kept or pasted', () => {
  it('are refused when they are not settings', () => {
    expect(valider(null)).toBeNull();
    expect(valider('gomme')).toBeNull();
    expect(valider({ depart: 'gomme' })).toBeNull();
  });

  it('are brought back inside the bounds', () => {
    const lu = valider({ depart: 'sec', reglages: { verre: { maniere: 'dalle', opacite: 0.1, flou: 400, largeur: 733 }, gomme: { maniere: 'frottis', nombre: 1e9, angle: Number.NaN } } });
    expect(lu?.reglages.verre.opacite).toBe(BORNES.verre.opacite.min);
    expect(lu?.reglages.verre.flou).toBe(BORNES.verre.flou.max);
    // on the slider's own steps
    expect(lu?.reglages.verre.largeur).toBe(730);
    expect(lu?.reglages.gomme.nombre).toBe(BORNES.gomme.nombre.max);
    // what cannot be read is the manner's own value
    expect(lu?.reglages.gomme.angle).toBe(partieDe('gomme', 'frottis').angle);
  });

  it('fall back on the starting proposition for what is missing or unknown', () => {
    const lu = valider({ depart: 'plat', reglages: { page: { maniere: 'aquarelle' }, verre: { curseur: 'vert' } } });
    expect(lu?.depart).toBe('plat');
    expect(lu?.reglages.page).toEqual(etatDe('plat').reglages.page);
    expect(lu?.reglages.miniatures).toEqual(etatDe('plat').reglages.miniatures);
    expect(lu?.reglages.verre.curseur).toBe('gris');
    expect(valider({ depart: 'inconnue', reglages: {} })?.depart).toBe(PROPOSITIONS[0].id);
  });
});

describe('the summary to paste', () => {
  it('names the proposition, or says it is a mix', () => {
    expect(resume(etatDe('plat'))).toContain('proposition « À plat », telle quelle');
    const melange = { depart: 'plat', reglages: { ...etatDe('plat').reglages, verre: partieDe('verre', 'dalle') } };
    expect(resume(melange)).toContain('mélange (la page de « À plat », la gomme de « À plat », les miniatures de « À plat », le verre de « À sec »), parti de « À plat »');
    const regle = { depart: 'plat', reglages: { ...etatDe('plat').reglages, gomme: { ...etatDe('plat').reglages.gomme, nombre: 9 } } };
    expect(resume(regle)).toContain('proposition « À plat », réglée à la main');
    expect(resume(melange)).toContain('Verre fumé : Dalle · teinte bronze 70 %');
  });

  it('ends with the same settings as JSON, which can be read back', () => {
    const etat = etatDe('sec');
    const lignes = resume(etat).split('\n');
    expect(lignes).toHaveLength(6);
    expect(valider(JSON.parse(lignes[5]))).toEqual(etat);
  });
});
