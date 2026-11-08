/*
 * A spring, simulated here (mass, stiffness, damping). Two uses: as a CSS
 * easing, sampled into a linear() curve that the browser plays on its own
 * thread; and as raw values, to give each axis of a shape its own spring (a
 * jelly that is quicker wide than tall). `duree` is when the spring is at rest.
 */

export type Ressort = { easing: string; duree: number };

type Simulation = { points: number[]; duree: number };

const simulations = new Map<string, Simulation>();
const cache = new Map<string, Ressort>();
const PAS = 1 / 240;

let prise: boolean | undefined;
const pris = () => (prise ??= typeof CSS !== 'undefined' && CSS.supports('animation-timing-function', 'linear(0, 1)'));

function simule(raideur: number, amortissement: number, masse: number): Simulation {
  const cle = `${raideur}/${amortissement}/${masse}`;
  const connue = simulations.get(cle);
  if (connue) return connue;

  const points = [0];
  let x = 0;
  let v = 0;
  let t = 0;
  let calme = 0;
  while (t < 4) {
    v += ((-raideur * (x - 1) - amortissement * v) / masse) * PAS;
    x += v * PAS;
    t += PAS;
    points.push(x);
    calme = Math.abs(x - 1) < 0.0006 && Math.abs(v) < 0.0006 ? calme + 1 : 0;
    if (calme > 8) break;
  }
  const resultat = { points, duree: Math.round(t * 1000) };
  simulations.set(cle, resultat);
  return resultat;
}

export function ressort(raideur: number, amortissement: number, masse = 1): Ressort {
  const cle = `${raideur}/${amortissement}/${masse}`;
  const connu = cache.get(cle);
  if (connu) return connu;

  const { points, duree } = simule(raideur, amortissement, masse);
  // linear() easings arrive with Safari 17.2: an older iPhone gets a close cubic curve instead
  // (an unknown easing would make the animation throw and stop the film)
  if (!pris()) {
    const repli = { easing: 'cubic-bezier(0.22, 1.25, 0.4, 1)', duree };
    cache.set(cle, repli);
    return repli;
  }
  const n = Math.min(points.length, 64);
  const echantillons = Array.from({ length: n }, (_, i) => points[Math.round((i * (points.length - 1)) / (n - 1))]);
  echantillons[n - 1] = 1;
  const resultat = { easing: `linear(${echantillons.map((p) => p.toFixed(4)).join(', ')})`, duree };
  cache.set(cle, resultat);
  return resultat;
}

/** A spring parameter set: [stiffness, damping]. */
export type Raideurs = [number, number];

/**
 * Keyframes for a shape moved by two springs, one per axis: `forme` receives
 * the progress of each (it overshoots 1 on an under-damped spring) and returns
 * the value to animate. `retardY` delays the second axis, in ms. The animation
 * runs `duree` ms, linear: the springs are in the keyframes.
 */
export function cles2D(
  [kx, cx]: Raideurs,
  [ky, cy]: Raideurs,
  retardY: number,
  forme: (x: number, y: number) => Keyframe,
  pas = 70,
): { cles: Keyframe[]; duree: number } {
  const sx = simule(kx, cx, 1);
  const sy = simule(ky, cy, 1);
  const duree = Math.max(sx.duree, sy.duree + retardY);
  const au = (s: Simulation, ms: number) => {
    if (ms <= 0) return 0;
    const i = (ms / 1000) / PAS;
    if (i >= s.points.length - 1) return 1;
    const bas = Math.floor(i);
    return s.points[bas] + (s.points[bas + 1] - s.points[bas]) * (i - bas);
  };
  const cles = Array.from({ length: pas + 1 }, (_, i) => {
    const ms = (duree * i) / pas;
    return { offset: i / pas, ...forme(au(sx, ms), au(sy, ms - retardY)) };
  });
  return { cles, duree };
}
