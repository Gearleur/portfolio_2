import { centre, COLONNES, LIGNE, TRAVAIL } from './feuille-geo';
import { IN_OUT, OUT, Piste } from './piste';
import { cles2D, ressort } from './ressorts';
import type { Ressort } from './ressorts';
import { QUESTION } from './texte';

/*
 * The choreography of the Whiteboard AMDEC thumbnail, from end to end
 * (journal n° 102). In order: the poster blurs and recedes; Mikky's chat
 * grows in like a jelly; the question is typed; it is sent; the chat becomes
 * a thread; the window then reshapes itself into the sheet; four agents fill
 * the sheet, each in its own order and pace; the sheet leaves and the poster
 * comes back sharp. 22 s in all, then again, the agents' moves drawn anew
 * each time.
 *
 * Principles: a spring for what has weight (windows, bubbles, tags, the
 * press of a button), a long ease-out for what is only revealed (text, bars,
 * rings), an ease-in-out for what leaves; opacity, blur and a short shift
 * together, never one alone; stagger of 40 to 90 ms inside a group; a window
 * that changes its content keeps its place and only changes shape. All
 * durations are here, in ms.
 */

/** The whole film lasts this long, and starts again: it is the loop's period. */
export const PERIODE = 22000;

export type Options = {
  /** The seed of the agents' moves. */
  graine?: number;
  /** Called at the end of the film, instead of playing it again as it is. */
  suite?: () => void;
};

const DOUX = ressort(150, 22);
const ELAN = ressort(260, 17);
const CRITIQUE = ressort(140, 24);
const MORPHE = ressort(120, 17);

/** The time, in ms, at which each character of the question is typed, from the first one. */
function cadence(texte: string): number[] {
  const temps: number[] = [];
  let t = 0;
  [...texte].forEach((lettre, i) => {
    temps.push(t);
    let pas = 40 + ((i * 37) % 5) * 7;
    if (lettre === ' ') pas += 45;
    if (texte.slice(0, i + 1) === 'Construisons') pas += 200;
    t += pas;
  });
  return temps;
}

function aleatoire(graine: number) {
  let a = graine | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function monter(racine: HTMLElement, u: number, { graine = 1, suite }: Options = {}): Piste {
  const p = new Piste(racine);
  const hasard = aleatoire(graine);
  const entre_ = (min: number, max: number) => min + hasard() * (max - min);
  const $ = (k: string) => racine.querySelector<HTMLElement>(`[data-k="${k}"]`);
  const $$ = (k: string) => [...racine.querySelectorAll<HTMLElement>(`[data-k="${k}"]`)];
  const $$r = (role: string) => [...racine.querySelectorAll<HTMLElement>(`[data-role="${role}"]`)];
  const px = (n: number) => `${(n * u).toFixed(2)}px`;
  const flou = (n: number) => `blur(${px(n)})`;
  const T = (x = 0, y = 0, s = 1) => `translate(${px(x)}, ${px(y)}) scale(${s})`;

  type Entree = { x?: number; y?: number; s?: number; f?: number; d?: number; r?: Ressort };

  /** Comes in: opacity and blur together on a long ease-out, the shift on a spring if given. */
  const entre = (el: Element | null | undefined, a: number, { x = 0, y = 0, s = 1, f = 0, d = 600, r }: Entree = {}) => {
    p.ajoute(el, [{ opacity: 0, filter: flou(f) }, { opacity: 1, filter: flou(0) }], { a, d: Math.min(d, 700) * 1.1, easing: OUT });
    if (x || y || s !== 1) {
      p.ajoute(el, [{ transform: T(x, y, s) }, { transform: T() }], { a, d: r?.duree ?? d, easing: r?.easing ?? OUT });
    }
  };

  /** Leaves: ease-in-out, a little faster than it came. */
  const sort = (el: Element | null | undefined, a: number, { x = 0, y = 0, s = 1, f = 0, d = 500 }: Entree = {}) => {
    p.ajoute(el, [{ opacity: 1, filter: flou(0), transform: T() }, { opacity: 0, filter: flou(f), transform: T(x, y, s) }], {
      a,
      d: d * 1.1,
      easing: IN_OUT,
      fill: 'forwards',
    });
  };

  /** Fades away in place: opacity and blur only, for what holds a shift of its own. */
  const efface = (el: Element | null | undefined, a: number, d: number, f = 3) =>
    p.ajoute(el, [{ opacity: 1, filter: flou(0) }, { opacity: 0, filter: flou(f) }], { a, d, easing: IN_OUT, fill: 'forwards' });

  // 1 · The poster, at rest; then it blurs and recedes. It comes back at the end.
  const affiche = $('affiche');
  const voile = $('voile');
  const A_FLOU = 1100;
  const A0 = 1700;
  p.ajoute(affiche, [{ filter: `${flou(0)} saturate(1)`, transform: 'scale(1)' }, { filter: `${flou(9)} saturate(1.1)`, transform: 'scale(1.06)' }], {
    a: A_FLOU,
    d: 1500,
    easing: OUT,
  });
  p.ajoute(voile, [{ opacity: 0 }, { opacity: 1 }], { a: A_FLOU, d: 1500, easing: OUT });

  // 2 · The chat grows in like a jelly: wide quicker than tall, both on under-damped springs, the
  // corners rounding as it settles; its parts come in while it is still settling.
  const chat = $('chat');
  const gelee = cles2D([115, 9.5], [80, 8], 140, (x, y) => ({ scale: `${0.1 + 0.9 * x} ${0.05 + 0.95 * y}` }));
  p.ajoute(chat, gelee.cles, { a: A0, d: gelee.duree });
  p.ajoute(chat, [{ opacity: 0, filter: flou(6) }, { opacity: 1, filter: flou(0) }], { a: A0, d: 300, easing: OUT });
  p.ajoute(chat, [{ borderRadius: px(80) }, { borderRadius: px(22) }], { a: A0, d: 900, easing: OUT });

  const T0 = A0 + 150;
  entre($('chevron'), T0, { y: 6, f: 3 });
  entre($('accueil'), T0 + 80, { y: 8, f: 4, d: 700 });
  entre($('pill'), T0 + 200, { y: 14, s: 0.98, f: 3, r: DOUX });
  $$('puce').forEach((puce, i) => entre(puce, T0 + 380 + i * 90, { y: 8, s: 0.9, r: ELAN }));

  // 3 · The question is typed, letter by letter, at a human pace.
  const DEBUT = T0 + 1200;
  const lettres = $$('ch');
  const curseurs = $$('car');
  const temps = cadence(QUESTION).map((t) => DEBUT + t);
  const ENVOI = temps[temps.length - 1] + 600;
  p.ajoute($('ph1'), [{ opacity: 1 }, { opacity: 0 }], { a: DEBUT - 60, d: 240, easing: OUT, fill: 'forwards' });
  p.ajoute(curseurs[0], [{ opacity: 0 }, { opacity: 1 }], { a: DEBUT - 500, d: 260, easing: OUT });
  p.ajoute(curseurs[0], [{ opacity: 1 }, { opacity: 0 }], { a: temps[0], d: 1, fill: 'forwards' });
  lettres.forEach((lettre, i) => {
    const t = temps[i];
    p.ajoute(
      lettre,
      [
        { opacity: 0, transform: `translateY(${px(3)})`, filter: flou(2) },
        { opacity: 1, transform: 'translateY(0px)', filter: flou(0) },
      ],
      { a: t, d: 150, easing: OUT },
    );
    const suivant = i + 1 < temps.length ? temps[i + 1] : ENVOI;
    p.ajoute(curseurs[i + 1], [{ opacity: 1 }, { opacity: 1, offset: 0.98 }, { opacity: 0 }], {
      a: t,
      d: Math.max(suivant - t, 40),
      fill: 'forwards',
    });
  });

  // 4 · It is sent: the button gives, rings, the text lifts away.
  p.ajoute($('envoi'), [{ transform: 'scale(1)' }, { transform: 'scale(0.86)' }], { a: ENVOI, d: 150, easing: IN_OUT, fill: 'forwards' });
  p.ajoute($('envoi'), [{ transform: 'scale(0.86)' }, { transform: 'scale(1)' }], { a: ENVOI + 150, d: ELAN.duree, easing: ELAN.easing, fill: 'forwards' });
  p.ajoute($('fleche'), [{ transform: 'translateY(0px)' }, { transform: `translateY(${px(-3)})`, offset: 0.4 }, { transform: 'translateY(0px)' }], {
    a: ENVOI + 60,
    d: 520,
    easing: OUT,
    fill: 'forwards',
  });
  p.ajoute($('onde'), [{ opacity: 0.28, transform: 'scale(0.9)' }, { opacity: 0, transform: 'scale(2.1)' }], { a: ENVOI, d: 720, easing: OUT, fill: 'forwards' });
  sort($('saisie'), ENVOI + 280, { y: -8, f: 3, d: 380 });

  // 5 · The chat becomes a thread: it grows, the bubble flies in, the agent answers.
  const FIL = ENVOI + 380;
  sort($('accueil'), ENVOI + 120, { y: -8, f: 4, d: 420 });
  $$('puce').forEach((puce, i) => sort(puce, FIL - 80 + i * 60, { y: 6, s: 0.92, d: 360 }));
  p.ajoute($('barre'), [{ transform: 'translateY(0px)' }, { transform: `translateY(${px(17)})` }], {
    a: FIL,
    d: CRITIQUE.duree,
    easing: CRITIQUE.easing,
    fill: 'forwards',
  });
  p.ajoute(chat, [{ height: px(212) }, { height: px(286) }], { a: FIL, d: CRITIQUE.duree, easing: CRITIQUE.easing, fill: 'forwards' });
  entre($('ph2'), FIL + 400, { y: 4, d: 420 });
  entre($('rail'), FIL + 200, { d: 500 });
  entre($('bulle'), FIL + 350, { y: 26, s: 0.9, r: ELAN });
  entre($('heure'), FIL + 950, { d: 400 });
  $$('mot').forEach((mot, i) => entre(mot, FIL + 1100 + i * 50, { y: 5, f: 4, d: 520 }));
  const outils = $$('outil');
  entre(outils[0], FIL + 2000, { x: -8, d: 550 });
  entre(outils[1], FIL + 2450, { x: -8, d: 550 });
  p.ajoute(
    outils[1]?.querySelector('.mk-icon'),
    [
      { transform: 'scale(0.3) rotate(-60deg)', opacity: 0 },
      { transform: 'scale(1) rotate(0deg)', opacity: 1 },
    ],
    { a: FIL + 2550, d: ELAN.duree, easing: ELAN.easing },
  );

  // 6 · The chat's window becomes the sheet's. It keeps its place and only changes shape: what it
  // held lets go first, the window then widens to the sheet's size on a spring, and the sheet, which
  // is the same white window to the pixel, takes over under it while its parts come in.
  const MORPHE_A = FIL + 3300;
  const FEUILLE = MORPHE_A + 420;
  efface($('rail'), MORPHE_A, 260);
  efface($('barre'), MORPHE_A, 260);
  efface($('chevron'), MORPHE_A, 260);
  p.ajoute(chat, [{ width: px(460) }, { width: px(560) }], { a: MORPHE_A + 80, d: MORPHE.duree, easing: MORPHE.easing, fill: 'forwards' });
  p.ajoute(chat, [{ height: px(286) }, { height: px(288) }], { a: MORPHE_A + 80, d: MORPHE.duree, easing: MORPHE.easing, fill: 'forwards' });
  p.ajoute(chat, [{ borderRadius: px(22) }, { borderRadius: px(20) }], { a: MORPHE_A + 80, d: 500, easing: OUT, fill: 'forwards' });
  p.ajoute(chat, [{ opacity: 1 }, { opacity: 0 }], { a: FEUILLE + 120, d: 380, easing: IN_OUT, fill: 'forwards' });

  const feuille = $('feuille');
  p.ajoute(feuille, [{ opacity: 0 }, { opacity: 1 }], { a: FEUILLE, d: 320, easing: OUT });
  p.ajoute($('pts'), [{ opacity: 0 }, { opacity: 1 }], { a: FEUILLE + 80, d: 900, easing: OUT });
  entre($('capsule'), FEUILLE + 140, { y: 22, s: 0.92, f: 3, r: ELAN });
  entre($('grille'), FEUILLE + 150, { y: 10, d: 700 });
  $$r('lettre').forEach((l, i) => entre(l, FEUILLE + 380 + i * 45, { y: -4, d: 420 }));
  $$r('num').forEach((n, i) => entre(n, FEUILLE + 430 + i * 45, { x: -4, d: 420 }));
  const cellule = (l: number, c: number) => racine.querySelector<HTMLElement>(`[data-l="${l}"][data-c="${c}"]`);
  const pieces = (l: number, c: number) => [...(cellule(l, c)?.querySelectorAll<HTMLElement>('[data-anim]') ?? [])];

  const grandit = (l: number, c: number, a: number, d = 460) => {
    for (const piece of pieces(l, c)) {
      if (piece.dataset.anim === 'barre') {
        p.ajoute(piece, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { a, d, easing: OUT });
      } else if (piece.dataset.anim === 'pop') {
        p.ajoute(piece, [{ opacity: 0 }, { opacity: 1 }], { a, d: 200, easing: OUT });
        p.ajoute(piece, [{ transform: 'scale(0.4)' }, { transform: 'scale(1)' }], { a, d: ELAN.duree, easing: ELAN.easing });
      }
    }
  };

  // The titles are written first, by the sheet itself, left to right.
  for (let c = 0; c < 5; c++) grandit(0, c, FEUILLE + 750 + c * 70);

  // 7 · The agents. The 30 cells are shared out at random, and each agent takes its own the way it
  // likes: mostly the next one near it, sometimes a leap. A pointer is not drawn along a path: it is
  // a mass on a spring, pulled toward the cell it means to reach; so it speeds up, bends, slows and
  // overshoots a little, and turns toward the next cell as it clicks, without ever stopping dead. It
  // lands off the middle of the cell, clicks, waits a moment (sometimes longer), and the cell fills.
  // The agents' whole story is worked out first, then spread over the time that is left of the 22 s.
  const POINTE = 1.8;
  const W1 = FEUILLE + 1100;
  const PAS_MS = 1000 / 30;
  const DT = 1 / 240;
  const tr = (x: number, y: number) => `translate(${px(x - POINTE)}, ${px(y - POINTE)})`;

  const cases: [number, number][] = [];
  for (let l = 1; l <= 6; l++) for (let c = 0; c < 5; c++) cases.push([l, c]);
  for (let i = cases.length - 1; i > 0; i--) {
    const j = Math.floor(hasard() * (i + 1));
    [cases[i], cases[j]] = [cases[j], cases[i]];
  }

  type Geste = { l: number; c: number; ta: number; clic: number; remplit: number; part: number };
  const planifie = (k: number) => {
    const { couleur, depart } = TRAVAIL[k];
    // the two axes do not answer alike (x quicker than y, or the reverse), which alone bends a path
    const omegaX = Math.sqrt(entre_(85, 130));
    const omegaY = omegaX * entre_(0.72, 1);
    const zeta = entre_(0.82, 1);
    const debut = k * 240 + hasard() * 140;

    // this agent's cells, in the order it goes: the nearest, with some noise
    const restantes = cases.filter((_, i) => i % TRAVAIL.length === k);
    const ordre: [number, number][] = [];
    let ici: [number, number] = depart;
    while (restantes.length) {
      let meilleure = 0;
      let score = Infinity;
      restantes.forEach(([l, c], i) => {
        const [x, y] = centre(l, c);
        const s = Math.hypot(x - ici[0], y - ici[1]) * entre_(0.6, 1.6);
        if (s < score) {
          score = s;
          meilleure = i;
        }
      });
      const [prise] = restantes.splice(meilleure, 1);
      ordre.push(prise);
      ici = centre(prise[0], prise[1]);
    }

    let x = depart[0];
    let y = depart[1];
    let vx = 0;
    let vy = 0;
    let temps = 0;
    let prochain = PAS_MS;
    const positions: [number, number][] = [[x, y]];
    const gestes: Geste[] = [];

    // the target itself is eased (a lag of about 110 ms) before the spring follows it, so that a move
    // starts with a rising force and not a jolt
    let fx = depart[0];
    let fy = depart[1];
    const lag = 1 - Math.exp(-DT / 0.11);
    const integre = (mx: number, my: number) => {
      fx += (mx - fx) * lag;
      fy += (my - fy) * lag;
      vx += (omegaX * omegaX * (fx - x) - 2 * zeta * omegaX * vx) * DT;
      vy += (omegaY * omegaY * (fy - y) - 2 * zeta * omegaY * vy) * DT;
      x += vx * DT;
      y += vy * DT;
      temps += DT * 1000;
      while (temps >= prochain) {
        positions.push([x, y]);
        prochain += PAS_MS;
      }
    };
    const rejoint = (mx: number, my: number) => {
      // it sets off a little to one side of the straight line, and swings round to the cell
      const dx = mx - x;
      const dy = my - y;
      const distance = Math.hypot(dx, dy) || 1;
      const lateral = distance * entre_(0.6, 2.2) * (hasard() < 0.5 ? -1 : 1);
      vx += (-dy / distance) * lateral;
      vy += (dx / distance) * lateral;
      const depuis = temps;
      while (temps - depuis < 1900) {
        integre(mx, my);
        if (Math.hypot(mx - x, my - y) < 7 && Math.hypot(vx, vy) < 90) break;
      }
    };
    // waiting, the hand is never quite still
    const attend = (mx: number, my: number, ms: number) => {
      const fin = temps + ms;
      let tremble: [number, number] = [0, 0];
      let renouvelle = temps;
      while (temps < fin) {
        if (temps >= renouvelle) {
          tremble = [(hasard() - 0.5) * 1.6, (hasard() - 0.5) * 1.6];
          renouvelle = temps + 120;
        }
        integre(mx + tremble[0], my + tremble[1]);
      }
    };

    ordre.forEach(([l, c]) => {
      const [cx, cy] = centre(l, c);
      const cible: [number, number] = [cx + (hasard() - 0.5) * COLONNES[c] * 0.35, cy + (hasard() - 0.5) * LIGNE * 0.4];
      rejoint(cible[0], cible[1]);
      const ta = temps;
      const clic = ta + entre_(40, 110);
      const remplit = clic + entre_(70, 150);
      const part = remplit + entre_(60, 170) + (hasard() < 0.2 ? entre_(150, 260) : 0);
      attend(cible[0], cible[1], part - temps);
      gestes.push({ l, c, ta, clic, remplit, part });
    });
    attend(depart[0], depart[1], 700);
    return { couleur, debut, positions, gestes, fin: temps };
  };

  const plans = TRAVAIL.map((_, k) => planifie(k));
  const AIR = 2900; // the sheet's exit, the poster's return, and a moment of rest after
  const echelle = Math.min(1.15, Math.max(0.7, (PERIODE - W1 - AIR) / Math.max(...plans.map((pl) => pl.debut + pl.fin))));
  let finAgents = 0;

  for (const { couleur, debut, positions, gestes, fin } of plans) {
    const pointeur = racine.querySelector<HTMLElement>(`[data-agent="${couleur}"]`);
    const fleche = pointeur?.querySelector('svg');
    const onde = pointeur?.querySelector('.fe-onde');
    const a0 = W1 + debut * echelle;
    const quand = (ms: number) => a0 + ms * echelle;

    p.ajoute(
      pointeur,
      positions.map(([x, y], i) => ({ offset: i / (positions.length - 1), transform: tr(x, y) })),
      { a: a0, d: (positions.length - 1) * PAS_MS * echelle, easing: 'linear' },
    );
    p.ajoute(pointeur, [{ opacity: 0 }, { opacity: 1 }], { a: a0, d: 350, easing: OUT, fill: 'forwards' });
    p.ajoute(pointeur, [{ opacity: 1 }, { opacity: 0 }], { a: quand(fin) - 360, d: 340, easing: IN_OUT, fill: 'forwards' });

    for (const { l, c, ta, clic, remplit, part } of gestes) {
      p.ajoute(fleche, [{ transform: 'scale(1)' }, { transform: 'scale(0.8)', offset: 0.35 }, { transform: 'scale(1)' }], { a: quand(clic), d: 280, easing: OUT, fill: 'forwards' });
      p.ajoute(onde, [{ opacity: 0.4, transform: 'scale(0.3)' }, { opacity: 0, transform: 'scale(2.6)' }], { a: quand(clic), d: 560, easing: OUT, fill: 'forwards' });
      const selection = cellule(l, c)?.querySelector('.fe-sel');
      p.ajoute(selection, [{ opacity: 0 }, { opacity: 1 }], { a: quand(ta) + 10, d: 180, easing: OUT, fill: 'forwards' });
      p.ajoute(selection, [{ opacity: 1 }, { opacity: 0 }], { a: quand(part) - 60, d: 260, easing: IN_OUT, fill: 'forwards' });
      grandit(l, c, quand(remplit), entre_(380, 540));
    }
    finAgents = Math.max(finAgents, quand(fin));
  }

  // 8 · The sheet leaves, and the poster comes back sharp; it rests there till the loop.
  const SORTIE_FEUILLE = finAgents + 350;
  const RETOUR = SORTIE_FEUILLE + 250;
  sort(feuille, SORTIE_FEUILLE, { y: -12, s: 0.97, f: 8, d: 900 });
  p.ajoute(affiche, [{ filter: `${flou(9)} saturate(1.1)`, transform: 'scale(1.06)' }, { filter: `${flou(0)} saturate(1)`, transform: 'scale(1)' }], {
    a: RETOUR,
    d: 1500,
    easing: IN_OUT,
    fill: 'forwards',
  });
  p.ajoute(voile, [{ opacity: 1 }, { opacity: 0 }], { a: RETOUR, d: 1500, easing: IN_OUT, fill: 'forwards' });
  p.termine(Math.max(PERIODE, RETOUR + 1500 + 500), suite);

  return p;
}
