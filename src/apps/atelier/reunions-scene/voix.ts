import { BASE, placeVitre } from './vitre';

/*
 * The voices of Synthèse de réunions' thumbnail, drawn on a 2D canvas over the
 * glass: one colour per speaker, so the diarization reads in the picture
 * (journal n° 103). Each voice is always there: when it speaks it is in front,
 * wide and vivid; otherwise it stays behind, small and paler. Turns fade into
 * one another and overlap a little, and the conversation scrolls slowly from
 * right to left. A thin mint halo lifts the speaking voice off the fingerprint.
 */

const TAU = Math.PI * 2;
const borne = (x: number) => Math.min(1, Math.max(0, x));
const lisse = (t: number) => t * t * (3 - 2 * t);

/** Night blue, coquelicot, plum: frank against the mint. */
const COULEURS = ['22,35,63', '224,48,31', '122,46,106'];
const HALO = '242,253,249'; // Willow Mist

/** Each voice's turns, [start, end] over one period of the conversation. */
const VOIX = [
  { graine: 3, tours: [[0.0, 0.44], [1.04, 1.4]] },
  { graine: 11, tours: [[0.34, 0.82], [1.56, 2.08]] },
  { graine: 23, tours: [[0.72, 1.14], [1.3, 1.64]] },
] as const;
type Voix = (typeof VOIX)[number];

const PERIODE = 2;
const FONDU = 0.12;
const VITESSE = 0.035;
const ETENDUE = 0.9; // the share of the conversation in view at once
const N = 180; // points per strand
const PAS = 36; // colour stops per strand

/** [waves along the length, speed, phase, opacity, width]: one frank strand and two echoes. */
const BRINS = [
  [6.5, 1.0, 0, 1, 1.8],
  [8.2, 1.35, 1.9, 0.55, 1.1],
  [5.1, 0.8, 3.1, 0.3, 0.8],
] as const;

/** The strands' rounded ends, worked out once. */
const BOUTS = Float32Array.from({ length: N + 1 }, (_, i) => Math.pow(Math.sin((Math.PI * i) / N), 0.5));

const h1 = (i: number) => {
  const s = Math.sin(i * 127.1 + 31.7) * 43758.5453;
  return s - Math.floor(s);
};
const bruit1 = (x: number) => {
  const i = Math.floor(x);
  return h1(i) + (h1(i + 1) - h1(i)) * lisse(x - i);
};

/** How much a voice is speaking at z (0 to 1), its turns fading in and out. */
function presence(voix: Voix, z: number) {
  const zm = ((z % PERIODE) + PERIODE) % PERIODE;
  let m = 0;
  for (const [a, b] of voix.tours) {
    for (const k of [-1, 0, 1]) {
      const entree = lisse(borne((zm - (a + k * PERIODE)) / FONDU + 0.5));
      const sortie = 1 - lisse(borne((zm - (b + k * PERIODE)) / FONDU + 0.5));
      m = Math.max(m, entree * sortie);
    }
  }
  return m;
}

/** The voice's loudness at z: syllables within phrases. */
function enveloppe(voix: Voix, z: number) {
  const syllabes = Math.pow(bruit1(z * 11 + voix.graine), 1.4);
  const phrase = 0.55 + 0.45 * bruit1(z * 2.5 + voix.graine * 3.1);
  return 0.2 + 0.8 * syllabes * phrase;
}

function degrade(g: CanvasRenderingContext2D, x0: number, w: number, pres: number[], rgb: string, alpha: (p: number) => number) {
  const d = g.createLinearGradient(x0, 0, x0 + w, 0);
  for (let j = 0; j < pres.length; j++) d.addColorStop(j / (pres.length - 1), `rgba(${rgb},${alpha(pres[j]).toFixed(3)})`);
  return d;
}

/** Draws the voices at t seconds on a context already scaled to css px, for a W × H picture. */
export function dessinerVoix(g: CanvasRenderingContext2D, W: number, H: number, t: number) {
  const v = placeVitre(W, H);
  const x0 = v.x + v.w * 0.1;
  const w = v.w * 0.8;
  const cy = v.y + v.h / 2;
  const h = v.h * 0.42;
  const decalage = t * VITESSE;
  const echelle = W / BASE;

  const calcul = VOIX.map((voix) => {
    const amp = new Float32Array(N + 1);
    for (let i = 0; i <= N; i++) {
      const z = (i / N) * ETENDUE + decalage;
      amp[i] = h * enveloppe(voix, z) * (0.16 + 0.84 * presence(voix, z)) * BOUTS[i];
    }
    const pres: number[] = [];
    for (let j = 0; j <= PAS; j++) pres.push(presence(voix, (j / PAS) * ETENDUE + decalage));
    return { amp, pres };
  });

  const trace = (idx: number, k: number, om: number, ph: number) => {
    const { amp } = calcul[idx];
    const phase = -om * t * 1.6 + ph + idx * 1.3;
    g.beginPath();
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const y = cy + amp[i] * Math.sin(TAU * k * u + phase);
      if (i) g.lineTo(x0 + u * w, y);
      else g.moveTo(x0 + u * w, y);
    }
  };

  g.lineCap = 'round';
  g.lineJoin = 'round';
  // every voice first, pale; then, on top, each one vivid where it speaks, with its halo
  for (const devant of [false, true]) {
    VOIX.forEach((_, idx) => {
      const { pres } = calcul[idx];
      for (const [k, om, ph, a, ep] of BRINS) {
        trace(idx, k, om, ph);
        if (devant && a === 1) {
          g.strokeStyle = degrade(g, x0, w, pres, HALO, (p) => 0.55 * Math.pow(p, 1.2));
          g.lineWidth = (ep + 3) * echelle;
          g.stroke();
        }
        g.strokeStyle = degrade(g, x0, w, pres, COULEURS[idx], (p) => (devant ? a * Math.pow(p, 1.2) : a * 0.28));
        g.lineWidth = ep * echelle;
        g.stroke();
      }
    });
  }
}
