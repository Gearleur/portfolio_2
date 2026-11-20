import { describe, expect, it } from 'vitest';
import type { Borne } from '../m1/reglages';
import { BORNES, OPTIONS, PROPOSITIONS, TEINTES, etatDe, fondMachine, intacte, resume, valider } from './reglages';
import type { Reglages } from './reglages';

const bornes = Object.entries(BORNES) as [keyof typeof BORNES, Borne][];
const options = Object.entries(OPTIONS) as [keyof typeof OPTIONS, readonly unknown[]][];

describe('les propositions de M4', () => {
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

  it('diffèrent sur l’endroit où naît la bulle et sur les teintes du liseré, et l’une n’est pas symétrique', () => {
    for (const cle of ['foyer', 'teintes'] as const) expect(new Set(PROPOSITIONS.map((p) => p.reglages[cle])).size, cle).toBe(3);
    expect(PROPOSITIONS.some((p) => p.reglages.foyer !== p.reglages.retrait)).toBe(true);
  });

  it('laissent le terminal lisible : sous son verre le nombre reste sombre', () => {
    // what is seen of the white number through the glass, as a share of white
    for (const p of PROPOSITIONS) expect(p.reglages.force * p.reglages.transparence, p.id).toBeLessThan(0.2);
  });

  it('se reconnaissent intactes, plus une fois réglées', () => {
    for (const p of PROPOSITIONS) expect(intacte(p.reglages)).toBe(p);
    expect(intacte({ ...PROPOSITIONS[0].reglages, largeur: 200 })).toBeUndefined();
  });
});

describe('les réglages gardés ou collés', () => {
  it('reviennent tels quels du résumé copié', () => {
    for (const p of PROPOSITIONS) {
      const etat = etatDe(p.id);
      const json = resume(etat).split('\n').at(-1) ?? '';
      expect(valider(JSON.parse(json))).toEqual(etat);
    }
  });

  it('sont ramenés dans les bornes, et ce qui manque revient à la proposition de départ', () => {
    const base = PROPOSITIONS[1];
    const lu = valider({ depart: base.id, reglages: { duree: 99999, force: -3, foyer: 'ailleurs', largeur: 173 } });
    expect(lu?.reglages.duree).toBe(BORNES.duree.max);
    expect(lu?.reglages.force).toBe(BORNES.force.min);
    expect(lu?.reglages.foyer).toBe(base.reglages.foyer);
    expect(lu?.reglages.largeur).toBe(170);
    expect(lu?.reglages.teintes).toBe(base.reglages.teintes);
    expect(valider(null)).toBeNull();
    expect(valider({ depart: 'x' })).toBeNull();
    expect(valider({ depart: 'inconnue', reglages: {} })?.depart).toBe(PROPOSITIONS[0].id);
  });
});

describe('la matière', () => {
  it('a cinq teintes par liseré, et un noir qui va du noir pur au bleu nuit', () => {
    for (const teintes of Object.values(TEINTES)) for (const t of teintes) expect(t).toMatch(/^#[0-9a-f]{6}$/i);
    expect(fondMachine(0)).toEqual([0, 0, 0]);
    expect(fondMachine(1)).toEqual([56, 61, 69]);
    const r: Reglages = PROPOSITIONS[0].reglages;
    expect(fondMachine(r.fond)).toEqual([0, 0, 0]);
  });
});
