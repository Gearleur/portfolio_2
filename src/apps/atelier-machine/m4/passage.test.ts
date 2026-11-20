import { describe, expect, it } from 'vitest';
import { COUVERT, durees, foyerDe, image, position, repos, reprise } from './passage';
import { allure } from './passage';
import type { Lieu, Sens } from './passage';
import { PROPOSITIONS } from './reglages';
import { decouper } from './rendu';

// A 1440 × 900 stage, the switch's knob on its Machine side.
const LIEU: Lieu = { l: 1440, h: 900, u: 1, bouton: { x: 795, y: 856, r: 23 } };
const COINS = [[0, 0], [1440, 0], [0, 900], [1440, 900]];
const SENS: Sens[] = ['aller', 'retour'];
const instants = Array.from({ length: 401 }, (_, i) => i / 400);

/** How far the screen's point nearest to the bubble's centre is from it. */
const pres = (cx: number, cy: number) => Math.hypot(Math.max(Math.abs(cx - 720) - 720, 0), Math.max(Math.abs(cy - 450) - 450, 0));
const loin = (cx: number, cy: number) => Math.max(...COINS.map(([x, y]) => Math.hypot(x - cx, y - cy)));

describe.each(PROPOSITIONS)('le passage de « $nom »', ({ reglages: r }) => {
  it('part de la page au repos et arrive au terminal posé, et inversement', () => {
    const depart = image(r, 'aller', 0, LIEU);
    expect(depart.couvert).toBe(false);
    expect(depart.terminal).toBe(0);
    // nothing of the bubble shows yet: under the knob, or beyond the edge with its glow
    if (r.foyer === 'bouton') expect(depart.rayon).toBeLessThan(LIEU.bouton.r);
    else if (r.foyer === 'centre') expect(depart.rayon).toBe(0);
    else expect(pres(depart.cx, depart.cy) - depart.rayon).toBeGreaterThan(2 * depart.lisere);

    const arrivee = image(r, 'aller', 1, LIEU);
    expect(arrivee.couvert).toBe(true);
    expect(arrivee.terminal).toBe(1);
    expect(arrivee.nombre).toBeCloseTo(r.force);
    expect(arrivee.rayon).toBeGreaterThan(loin(arrivee.cx, arrivee.cy));

    const retour = image(r, 'retour', 0, LIEU);
    expect([retour.couvert, retour.terminal]).toEqual([true, 1]);
    const fin = image(r, 'retour', 1, LIEU);
    expect([fin.couvert, fin.terminal]).toEqual([false, 0]);
    expect(pres(fin.cx, fin.cy) - fin.rayon).toBeGreaterThanOrEqual(-LIEU.bouton.r);
  });

  it.each(SENS)('ne joue qu’une bulle, dans un seul sens (%s)', (sens) => {
    const vues = instants.map((t) => image(r, sens, t, LIEU));
    const signe = sens === 'aller' ? 1 : -1;
    for (let i = 1; i < vues.length; i++) {
      // it only spreads on the way to the Machine, only draws back on the way to the page
      expect((vues[i].rayon - vues[i - 1].rayon) * signe).toBeGreaterThanOrEqual(-1e-6);
      // its centre does not travel: nothing crosses the screen (the knob aside, which this stage holds still)
      expect([vues[i].cx, vues[i].cy]).toEqual([vues[0].cx, vues[0].cy]);
    }
    for (const vue of vues) {
      // the terminal has no bubble of its own: while it comes or goes the black is whole and still
      if (vue.terminal > 0) {
        expect(vue.couvert).toBe(true);
        expect(vue.rayon).toBeGreaterThan(loin(vue.cx, vue.cy));
        expect(vue.rayon).toBeCloseTo(image(r, 'aller', 1, LIEU, foyerDe(r, sens)).rayon);
      }
      // the number is full while the bubble moves, and never weaker than its strength under the terminal
      if (vue.terminal === 0) expect(vue.nombre).toBe(1);
      expect(vue.nombre).toBeGreaterThanOrEqual(r.force - 1e-9);
      expect(vue.lisere).toBeGreaterThanOrEqual(0.5);
      expect(vue.lisere).toBeLessThanOrEqual(Math.max(0.5, Math.min(r.largeur, vue.rayon / 2)) + 1e-9);
    }
  });

  it.each(SENS)('est lent au début et rapide à la fin (%s)', (sens) => {
    const d = durees(r, sens);
    // the bubble's own time, within the passage
    const [debut, fin] = sens === 'aller' ? [0, d.bulle / d.totale] : [d.terminal / d.totale, 1];
    const rayon = (x: number) => image(r, sens, debut + (fin - debut) * x, LIEU).rayon;
    const course = Math.abs(rayon(1) - rayon(0.001));
    expect(Math.abs(rayon(0.5) - rayon(0.001)) / course).toBeLessThan(0.3);
    expect(Math.abs(rayon(1) - rayon(0.9)) / course).toBeGreaterThan(0.2);
  });

  it('compte le terminal dans sa durée : après la bulle à l’aller, avant elle au retour', () => {
    expect(durees(r, 'aller').totale).toBe(r.duree + r.delai + r.entree);
    // on the way back the terminal is gone quickly, in 220 ms at most
    expect(durees(r, 'retour').totale).toBeCloseTo(r.duree * r.retour + Math.min(220, r.entree * r.retour));
    const d = durees(r, 'aller');
    expect(image(r, 'aller', (d.bulle + r.delai * 0.9) / d.totale, LIEU).terminal).toBe(0);
    expect(image(r, 'aller', (d.bulle + r.delai + r.entree / 2) / d.totale, LIEU).terminal).toBeCloseTo(0.5);
    const retour = durees(r, 'retour');
    expect(image(r, 'retour', (retour.terminal * 1.001) / retour.totale, LIEU).terminal).toBe(0);
  });

  it('repart d’où il en est quand on le relance en route', () => {
    for (const t of [0.2, 0.45, 0.6, 0.9]) {
      const foyer = foyerDe(r, 'aller');
      const { s } = position(r, 'aller', t, LIEU);
      const ici = position(r, 'retour', reprise(r, 'retour', s, LIEU, foyer), LIEU, foyer).s;
      // the way back takes the same bubble up, unless it had not shown yet
      if (ici > 0.01 && s < COUVERT - 0.05) expect(ici).toBeCloseTo(s, 2);
      expect(ici).toBeLessThanOrEqual(Math.max(s, COUVERT) + 1e-6);
    }
  });
});

describe('le côté noir au repos', () => {
  it('est tout noir, le nombre à sa force sous le terminal', () => {
    for (const { reglages: r } of PROPOSITIONS) {
      const vue = repos(r, LIEU);
      expect([vue.couvert, vue.terminal]).toEqual([true, 1]);
      expect(vue.nombre).toBeCloseTo(r.force);
      expect(vue.rayon).toBeGreaterThan(loin(vue.cx, vue.cy));
    }
  });
});

describe('le découpage de la toile', () => {
  const boite = [16, 250, 700, 380];

  it('ne laisse le shader que là où passe le liseré ou le nombre', () => {
    for (const bulle of [{ cx: 2115, cy: 450, rayon: 1500, lisere: 60 }, { cx: 720, cy: 450, rayon: 300, lisere: 12 }, { cx: 795, cy: 856, rayon: 2400, lisere: 1 }]) {
      const bandes = decouper(bulle, 1440, 900, [boite]);
      const calcul = bandes.filter((b) => b.calcul).reduce((aire, b) => aire + b.l * b.h, 0);
      expect(calcul).toBeLessThan(1440 * 900 * 0.75);
      for (let y = 5; y < 900; y += 45) {
        for (let x = 5; x < 1440; x += 45) {
          const dehors = Math.hypot(x - bulle.cx, y - bulle.cy) - bulle.rayon;
          const bande = bandes.find((b) => x >= b.x && x < b.x + b.l && y >= b.y && y < b.y + b.h);
          const ecrit = x >= boite[0] && x < boite[0] + boite[2] && y >= boite[1] && y < boite[1] + boite[3];
          // left clear: beyond the glow; filled plain: in the black, off the number
          if (!bande) expect(dehors).toBeGreaterThan(4 * bulle.lisere);
          else if (!bande.calcul) expect(dehors < -bulle.lisere && !ecrit).toBe(true);
        }
      }
    }
  });

  it('remplit tout de noir quand la bulle couvre l’écran et qu’aucun nombre n’est écrit', () => {
    const bandes = decouper({ cx: 720, cy: 450, rayon: 4000, lisere: 1 }, 1440, 900, []);
    expect(bandes.every((b) => !b.calcul)).toBe(true);
    expect(bandes.reduce((aire, b) => aire + b.l * b.h, 0)).toBe(1440 * 900);
  });
});

describe('the bubble moves from the click on', () => {
  it('has walked a visible way after a quarter of its time, both ways, and is still far slower at its start than at its end', () => {
    expect(allure(0, 4, 0.18)).toBe(0);
    expect(allure(1, 4, 0.18)).toBe(1);
    expect(allure(0.25, 4, 0.18)).toBeGreaterThan(0.04);
    expect(allure(0.5, 4, 0.18)).toBeLessThan(0.16);
    expect(allure(1, 4, 0.18) - allure(0.9, 4, 0.18)).toBeGreaterThan(10 * (allure(0.1, 4, 0.18) - allure(0, 4, 0.18)));
  });
});
