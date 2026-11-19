import type { Gomme } from './reglages';

/*
 * The eraser's strokes (step M1). An eraser leaves grey where it dragged the graphite:
 * a soft band, finely streaked along its way, a little darker where the hand stopped.
 *
 * Nothing is placed by hand. The strokes fall where the page had ink (its zones, measured
 * on the real page), the heaviest zones first; the seed only decides where in a zone, and
 * the hand's small differences. Stroke n is the same whatever the count, so adding strokes
 * never reshuffles the ones already there.
 */

/** A place where the page had something to erase, in px of a 1440 px page. */
export type Zone = { x: number; y: number; w: number; h: number; poids: number };

/** One pass of the eraser: from a to b, bent by `fleche` (the bow's height), `largeur` wide. */
export type Passe = { ax: number; ay: number; bx: number; by: number; fleche: number; largeur: number; force: number };
export type Coup = { graine: number; passes: Passe[] };

/** A small seeded generator (mulberry32): the same seed, the same strokes. */
function alea(graine: number) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const melange = (graine: number, i: number) => (Math.imul(graine + 1, 0x9e3779b1) ^ Math.imul(i + 1, 0x85ebca77)) >>> 0;
const borne = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Which zone each stroke goes to: every zone in turn, as often as it weighs. The seed has no say. */
export function repartir(nombre: number, zones: Zone[]) {
  const total = zones.reduce((somme, zone) => somme + zone.poids, 0);
  const credit = zones.map(() => 0);
  const choix: number[] = [];
  if (!zones.length || total <= 0) return choix;
  for (let i = 0; i < nombre; i++) {
    let elu = 0;
    for (let z = 0; z < zones.length; z++) {
      credit[z] += zones[z].poids;
      if (credit[z] > credit[elu]) elu = z;
    }
    credit[elu] -= total;
    choix.push(elu);
  }
  return choix;
}

/** The strokes, as geometry only. */
export function tracer(gomme: Gomme, zones: Zone[]): Coup[] {
  const irr = gomme.irregularite;
  return repartir(gomme.nombre, zones).map((z, i) => {
    const zone = zones[z];
    const graine = melange(gomme.graine, i);
    const r = alea(graine);
    const centre = { x: zone.x + zone.w * (0.18 + 0.64 * r()), y: zone.y + zone.h * (0.3 + 0.4 * r()) };
    const base = (gomme.angle * Math.PI) / 180;
    const passes: Passe[] = [];

    const passe = (cx: number, cy: number, angle: number, longueur: number, fleche: number, largeur: number, force: number, retour = false) => {
      const dx = (Math.cos(angle) * longueur) / 2;
      const dy = (Math.sin(angle) * longueur) / 2;
      const [a, b] = retour ? [1, -1] : [-1, 1];
      passes.push({ ax: cx + a * dx, ay: cy + a * dy, bx: cx + b * dx, by: cy + b * dy, fleche, largeur, force });
    };

    if (gomme.maniere === 'frottis') {
      // Rubbed: a few passes back and forth, each half over the last, none quite parallel.
      const longueur = borne(zone.w * (0.34 + 0.36 * r()), 150, 600) * (1 + 0.3 * irr * (r() - 0.5));
      const n = 2 + Math.floor(r() * (1.6 + 1.6 * irr));
      for (let k = 0; k < n; k++) {
        const ecart = (k - (n - 1) / 2) * gomme.largeur * (0.3 + 0.25 * r());
        const angle = base + (r() - 0.5) * (0.02 + 0.14 * irr);
        const long = longueur * (0.8 + 0.4 * r());
        const glisse = (r() - 0.5) * longueur * 0.16;
        passe(
          centre.x - Math.sin(base) * ecart + Math.cos(base) * glisse,
          centre.y + Math.cos(base) * ecart + Math.sin(base) * glisse,
          angle,
          long,
          long * 0.03 * irr * (r() - 0.5),
          gomme.largeur * (1 + 0.25 * irr * (r() - 0.5)),
          0.6 + 0.45 * r(),
          k % 2 === 1,
        );
      }
    } else if (gomme.maniere === 'passes') {
      // One straight pass, from before the zone to after it.
      const longueur = zone.w * (1.05 + 0.3 * r()) + 80;
      const angle = base + (r() - 0.5) * (0.02 + 0.14 * irr);
      passe(zone.x + zone.w * (0.45 + 0.1 * r()), centre.y, angle, longueur, longueur * 0.02 * irr * (r() - 0.5), gomme.largeur * (1 + 0.3 * irr * (r() - 0.5)), 0.85 + 0.3 * r());
    } else {
      // Swept: a long arc of the arm, always bowed the same way.
      const longueur = Math.max(zone.w * 1.3, 620) + 320 * r();
      const angle = base + (r() - 0.5) * (0.04 + 0.2 * irr);
      passe(zone.x + zone.w * (0.4 + 0.2 * r()), centre.y, angle, longueur, -longueur * (0.06 + 0.08 * r()), gomme.largeur * (1.1 + 0.5 * r()), 0.75 + 0.3 * r());
    }
    return { graine, passes };
  });
}

/** Graphite dragged over paper. */
const GRIS = '84, 84, 82';
const ton = (a: number) => `rgba(${GRIS}, ${borne(a, 0, 1).toFixed(4)})`;
/** Points along a pass. */
const PAS = 16;

/**
 * Paints the strokes on a context whose units are the page's px (a 1440 px page); `echelle`
 * is how many of the canvas's own px make one of them.
 *
 * With no irregularity, a pass is a flat band with clean edges. The more there is, the
 * softer its edges and its ends, the more it shows the streaks of what it dragged, and
 * the darker the deposit it leaves where it stopped.
 *
 * Only flat greys are laid, never a gradient: at these faint alphas the browser dithers a
 * gradient, and the dots show once passes overlap. A band is soft because what is painted
 * is its shadow, blurred: the band itself is drawn off the canvas, and only its shadow lands.
 */
export function peindre(ctx: CanvasRenderingContext2D, coups: Coup[], gomme: Gomme, echelle: number) {
  const irr = gomme.irregularite;
  if (gomme.opacite <= 0) return;
  ctx.lineJoin = 'round';
  // how much of the grey is in the streaks, the rest in the band under them
  const part = 0.4 * Math.min(1, irr * 2.5);
  // far enough for the band itself to miss the canvas, whatever its size
  const loin = ctx.canvas.width + ctx.canvas.height + 4000;

  for (const coup of coups) {
    // its own generator, apart from the geometry's: the look can change without moving the strokes
    const r = alea(coup.graine ^ 0x5bd1e995);
    for (const p of coup.passes) {
      const longueur = Math.hypot(p.bx - p.ax, p.by - p.ay) || 1;
      const tx = (p.bx - p.ax) / longueur;
      const ty = (p.by - p.ay) / longueur;
      const [nx, ny] = [-ty, tx];
      // the bow: a quadratic curve whose middle is `fleche` off the chord
      const mx = (p.ax + p.bx) / 2 + nx * p.fleche * 2;
      const my = (p.ay + p.by) / 2 + ny * p.fleche * 2;
      const point = (t: number, cote: number): [number, number] => {
        const v = 1 - t;
        return [v * v * p.ax + 2 * v * t * mx + t * t * p.bx + nx * cote, v * v * p.ay + 2 * v * t * my + t * t * p.by + ny * cote];
      };
      const ligne = (t0: number, t1: number, cote: number, decalage = 0) => {
        ctx.beginPath();
        for (let i = 0; i <= PAS; i++) {
          const [x, y] = point(t0 + ((t1 - t0) * i) / PAS, cote);
          if (i) ctx.lineTo(x - decalage, y);
          else ctx.moveTo(x - decalage, y);
        }
      };
      /** A band from t0 to t1, as the blurred shadow of a stroke drawn off the canvas. */
      const bande = (t0: number, t1: number, largeur: number, alpha: number) => {
        if (alpha < 0.002) return;
        ctx.save();
        // square ends: the blur alone rounds them, as much as the hand is loose
        ctx.lineCap = 'butt';
        ctx.lineWidth = largeur;
        ctx.strokeStyle = '#000';
        ctx.shadowColor = ton(alpha);
        ctx.shadowBlur = irr * largeur * 0.42 * echelle;
        ctx.shadowOffsetX = loin;
        ligne(t0, t1, 0, loin / echelle);
        ctx.stroke();
        ctx.restore();
      };

      // The band, then what the eraser pushed ahead of it and left where it stopped.
      const corps = gomme.opacite * p.force * (1 - part);
      // a soft band is narrower where it is full: it keeps the width asked at half its strength
      bande(0, 1, p.largeur * (1 - 0.3 * irr), corps);
      bande(0.86, 0.96, p.largeur * (0.9 - 0.3 * irr), corps * 0.55 * irr);
      if (part <= 0) continue;

      // The streaks: each its own place across the band, its own width, load and ends.
      const brins = Math.round(borne(p.largeur / 3.2, 4, 60));
      ctx.lineCap = 'round';
      for (let j = 0; j < brins; j++) {
        const u = (j + 0.5 + (r() - 0.5) * 1.6) / brins - 0.5;
        // the band's edges hold less than its middle
        const bord = 1 - 0.9 * Math.pow(Math.min(1, Math.abs(u) * 2), 2);
        const charge = Math.exp((r() - 0.5) * 2.4 * irr);
        const alpha = gomme.opacite * p.force * part * bord * charge * 1.5;
        const t0 = 0.04 + r() * 0.34 * irr;
        const t1 = 0.97 - r() * 0.3 * irr;
        const epaisseur = 0.8 + 2.4 * r();
        if (alpha < 0.004) continue;
        ctx.lineWidth = epaisseur;
        ctx.strokeStyle = ton(alpha);
        ligne(t0, t1, u * p.largeur);
        ctx.stroke();
      }
    }
  }
}
