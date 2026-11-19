import { describe, expect, it } from 'vitest';
import type { Borne } from '../m1/reglages';
import { BORNES, ECART, OPTIONS, PROPOSITIONS, RETENU, elan, etatDe, geometrie, intacte, resume, retombe, valider } from './reglages';
import type { Reglages } from './reglages';

const bornes = Object.entries(BORNES) as [keyof typeof BORNES, Borne][];
const options = Object.entries(OPTIONS) as [keyof typeof OPTIONS, readonly unknown[]][];

describe('les propositions de M3', () => {
  it('sont trois, chacune dans les bornes et sur un cran du curseur', () => {
    expect(PROPOSITIONS).toHaveLength(3);
    for (const p of PROPOSITIONS) {
      for (const [cle, { min, max, step }] of bornes) {
        const v = p.reglages[cle];
        expect(v, `${p.id}.${cle}`).toBeGreaterThanOrEqual(min);
        expect(v, `${p.id}.${cle}`).toBeLessThanOrEqual(max);
        expect(Math.abs((v - min) / step - Math.round((v - min) / step)), `${p.id}.${cle}`).toBeLessThan(1e-6);
      }
      for (const [cle, permis] of options) expect(permis, `${p.id}.${cle}`).toContain(p.reglages[cle]);
    }
  });

  it('diffèrent sur la fenêtre, la matière et ce que porte le bouton', () => {
    for (const cle of ['fenetre', 'matiere', 'porte', 'libelles'] as const) {
      expect(new Set(PROPOSITIONS.map((p) => p.reglages[cle])).size, cle).toBe(3);
    }
  });

  it('se reconnaissent intactes, plus une fois réglées', () => {
    for (const p of PROPOSITIONS) expect(intacte(p.reglages)).toBe(p);
    expect(intacte({ ...PROPOSITIONS[0].reglages, bas: 32 })).toBeUndefined();
  });
});

describe('la géométrie de la pilule', () => {
  it('garde un bouton rond qui tient dans la pilule et une cible d’au moins 44 px', () => {
    for (const largeur of [BORNES.largeur.min, BORNES.largeur.max]) {
      for (const hauteur of [BORNES.hauteur.min, BORNES.hauteur.max]) {
        const g = geometrie({ largeur, hauteur, bas: 28, terminal: 'arret' });
        expect(g.bouton).toBeGreaterThanOrEqual(44);
        expect(g.bouton + 2 * g.retrait).toBe(hauteur);
        expect(g.course).toBe(largeur - hauteur);
        // the window keeps room for something to be read in it
        expect(g.course - g.joint).toBeGreaterThan(hauteur * 1.5);
      }
    }
  });

  it('fait s’arrêter le terminal au-dessus de la pilule, ou le laisse tel quel', () => {
    const r = PROPOSITIONS[0].reglages;
    expect(geometrie(r, 32).reserve).toBe(r.bas + r.hauteur + ECART - 32);
    expect(geometrie({ ...r, terminal: 'dessous' }).reserve).toBe(0);
  });
});

describe('le geste', () => {
  it('retombe du côté le plus proche', () => {
    expect(retombe(0)).toBe(false);
    expect(retombe(0.49)).toBe(false);
    expect(retombe(0.5)).toBe(false);
    expect(retombe(0.51)).toBe(true);
    expect(retombe(1)).toBe(true);
  });

  it('n’a aucun rebond sans élasticité, et un rebond borné à son maximum', () => {
    expect(elan(0)).toBe(1);
    expect(elan(BORNES.elasticite.max)).toBe(1.6);
  });
});

describe('les réglages gardés ou collés', () => {
  it('refuse ce qui n’est pas un état', () => {
    expect(valider(null)).toBeNull();
    expect(valider('pétale')).toBeNull();
    expect(valider({ depart: 'petale' })).toBeNull();
  });

  it('borne les nombres, les pose sur un cran, et rattrape le reste par la proposition de départ', () => {
    const lu = valider({ depart: 'cube', reglages: { largeur: 9999, hauteur: 1, rayon: 0.731, relief: 'fort', matiere: 'or', vibration: 'oui', elasticite: 0.15 } });
    const base = etatDe('cube').reglages;
    expect(lu?.depart).toBe('cube');
    expect(lu?.reglages).toEqual({ ...base, largeur: BORNES.largeur.max, hauteur: BORNES.hauteur.min, rayon: 0.75, elasticite: 0.15 } satisfies Reglages);
  });

  it('part de la première proposition quand le départ est inconnu', () => {
    expect(valider({ depart: 'inconnue', reglages: {} })).toEqual(etatDe(PROPOSITIONS[0].id));
  });

  it('se relit depuis le résumé copié', () => {
    for (const p of PROPOSITIONS) {
      const etat = { depart: p.id, reglages: { ...p.reglages, relief: 1.15, vibration: false } };
      const texte = resume(etat);
      expect(texte).toContain(`partie de « ${p.nom} »`);
      expect(valider(JSON.parse(texte.split('\n').at(-1) ?? ''))).toEqual(etat);
    }
    expect(resume(etatDe('judas'))).toContain('proposition « Judas », telle quelle');
  });
});

describe('the switch retained at M3', () => {
  it('is settings the bench accepts; the terminal gives up for it what it takes', () => {
    expect(valider({ depart: 'petale', reglages: RETENU })?.reglages).toEqual(RETENU);
    expect(RETENU.hauteur * RETENU.echelle).toBe(56);
    expect(geometrie(RETENU, 32).reserve).toBe(16 + 56 + ECART - 32);
  });
});
