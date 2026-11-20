import { famille, RETENU as TYPO } from '../m2/retenu';
import { composer } from './nombre';
import { COUVERT, durees, foyerDe, image, position, repos, reprise } from './passage';
import type { Image, Lieu, Sens } from './passage';
import { TEINTES, fondMachine } from './retenu';
import type { Foyer, Reglages } from './reglages';
import { creerRendu } from './rendu';

/*
 * What plays the passage on the stage (step M4): it reads the stage's size and the knob's place,
 * draws the bubble frame after frame, brings the terminal in once the screen is black, and keeps
 * both states out of reach while it lasts. Kept out of React: a passage renders nothing.
 *
 * The stage, from the bottom up: the human page; the canvas, on which the bubble's black and the
 * number are drawn; the terminal, a sheet of glass a little transparent, which only ever fades,
 * rises or prints its lines (no bubble, no round mask of its own); the switch.
 *
 * Without WebGL 2 or once its context is lost, and when the visitor asks for less motion, there
 * is no bubble: the state changes at once. Without the shader the black side is a plain ground,
 * and the number is laid on it as a picture (the same drawing, nombre.ts).
 */

export type Meneur = {
  regler(reglages: Reglages): void;
  /** The stage has changed size. */
  mesurer(): void;
  /** At rest on one side, no passage. */
  poser(machine: boolean): void;
  /** One picture of a passage, held: the moment `t` (0–1) on the way to the Machine or back. */
  figer(sens: Sens, t: number): void;
  /** Plays a passage, from its start or from where the stage is now. */
  jouer(sens: Sens, depuis: 'debut' | 'ici'): void;
  liberer(): void;
};

type Options = {
  /** The stage: the two states (.m4-couche), the terminal's glass and screen, the switch, and 100 px of the page to read its scale (.m4-etalon). */
  racine: HTMLElement;
  toile: HTMLCanvasElement;
  /** A passage has ended on this side. */
  onFin: (machine: boolean) => void;
  /**
   * The human page, where it is not a layer of the stage but lies beside it (the Vitrine): it is
   * kept out of reach when the stage's own layer would be. Read each time, the page can change.
   */
  humain?: () => Iterable<HTMLElement>;
  /** The whole screen has just turned black, or the page shows again: what runs under the black can stop, or start again. */
  onCouvert?: (couvert: boolean) => void;
  /**
   * The most px of the canvas per px of the page, 2 unless said otherwise: a phone's screen has
   * 3, and nothing of the bubble is that fine. Read each time the stage is measured.
   */
  densite?: () => number;
};

const MONO = { famille: famille(TYPO.police), graisse: TYPO.police.graisse };

const reduit = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const doux = (x: number) => x * x * (3 - 2 * x);

export function creerMeneur({ racine, toile, onFin, humain, onCouvert, densite }: Options): Meneur {
  const rendu = creerRendu(toile);
  const couches = [...racine.querySelectorAll<HTMLElement>('.m4-couche')];
  const etalon = racine.querySelector<HTMLElement>('.m4-etalon');
  const verre = racine.querySelector<HTMLElement>('.m4-terminal');
  const ecran = racine.querySelector<HTMLElement>('.m4-ecran');
  // no bubble to draw: the black side is then a plain ground
  racine.toggleAttribute('data-nu', !rendu);

  let r: Reglages | null = null;
  let lieu: (Lieu & { dpr: number }) | null = null;
  /** The side one is on at rest, or going to. */
  let cote = false;
  let jeu: { sens: Sens; debut: number; duree: number; depart: number; foyer: Foyer } | null = null;
  let fige: { sens: Sens; t: number } | null = null;
  let trame = 0;
  let ecrit = '';
  let polices = 0;
  let libere = false;
  let couvert = false;
  /** Without the shader: the number as a picture on the black side. */
  let secours: HTMLCanvasElement | null = null;

  const couvrir = (oui: boolean) => {
    racine.toggleAttribute('data-couvert', oui);
    if (oui === couvert) return;
    couvert = oui;
    onCouvert?.(oui);
  };

  /** The number under the terminal when no shader can draw it: the drawing that stays there, as strong as it stays. */
  const secourir = (montre: boolean) => {
    secours?.remove();
    secours = null;
    const sous = couches.find((couche) => couche.dataset.cote === 'machine');
    const bloc = montre && r && lieu && sous ? composer(r.lettre === 'serif' ? 'serif' : 'mono', r.trace === 'contour', r, lieu, lieu.dpr, MONO) : null;
    if (!bloc || !r || !sous) return;
    secours = bloc.toile;
    secours.className = 'm4-secours';
    secours.setAttribute('aria-hidden', 'true');
    Object.assign(secours.style, { left: `${bloc.x}px`, top: `${bloc.y}px`, width: `${bloc.l}px`, height: `${bloc.h}px`, opacity: String(r.force) });
    sous.prepend(secours);
  };

  /** The knob's centre on the stage: a bubble born there follows it while it slides. */
  const bouton = (cadre: DOMRect) => {
    const b = racine.querySelector('.m3-bouton')?.getBoundingClientRect();
    return b ? { x: b.left + b.width / 2 - cadre.left, y: b.top + b.height / 2 - cadre.top, r: b.height / 2 } : { x: cadre.width / 2, y: cadre.height, r: 0 };
  };

  const relever = () => {
    const cadre = racine.getBoundingClientRect();
    const u = (etalon?.getBoundingClientRect().width ?? 0) / 100;
    if (cadre.width < 1 || cadre.height < 1 || !u) return null;
    return { l: cadre.width, h: cadre.height, u, bouton: bouton(cadre), dpr: Math.min(densite?.() ?? 2, window.devicePixelRatio || 1) };
  };

  /** The number's two drawings, made again when what sets them has changed. */
  const ecrire = () => {
    if (!rendu || !r || !lieu) return;
    const cle = JSON.stringify([r.numero, r.corps, r.place, r.etiquette, r.langue, r.flou, r.lettre, r.trace, lieu.l, lieu.h, lieu.u, lieu.dpr, polices]);
    if (cle === ecrit) return;
    ecrit = cle;
    // the one the bubble uncovers; and, if it differs, the one that stays under the terminal
    rendu.ecrire('avant', composer(r.lettre === 'mono' ? 'mono' : 'serif', false, r, lieu, lieu.dpr, MONO));
    const autre = r.lettre === 'bascule' || r.trace === 'contour';
    rendu.ecrire('apres', autre ? composer(r.lettre === 'serif' ? 'serif' : 'mono', r.trace === 'contour', r, lieu, lieu.dpr, MONO) : null);
  };

  /** The terminal, `p` of the way in (0–1): it fades, rises a little, or shows its glass then prints its lines. */
  const entrer = (p: number) => {
    racine.toggleAttribute('data-terminal', p > 0);
    if (!verre || !ecran || !r) return;
    const enCours = p > 0 && p < 1;
    const lignes = enCours && r.genre === 'lignes';
    verre.style.opacity = enCours ? String(lignes ? Math.min(1, p / 0.3) : doux(p)) : '';
    verre.style.translate = enCours && r.genre === 'montee' ? `0 ${((1 - doux(p)) * 16 * (lieu?.u ?? 1)).toFixed(2)}px` : '';
    // twenty lines' worth of steps, from the top down
    ecran.style.clipPath = lignes ? `inset(0 0 ${(100 - Math.floor(Math.max(0, (p - 0.3) / 0.7) * 20) * 5).toFixed(0)}% 0)` : '';
  };

  const montrer = (vue: Image, graine = 0) => {
    couvrir(vue.couvert);
    entrer(vue.terminal);
    if (!rendu || rendu.perdu() || !r) return;
    rendu.dessiner(vue, { teintes: TEINTES[r.teintes], saturation: r.saturation, intensite: r.intensite, flou: r.flou * (lieu?.u ?? 1), fond: fondMachine(r.fond) }, graine);
    toile.style.visibility = 'visible';
  };

  /** While a passage lasts neither state can be reached; at rest, the one that shows can. */
  const atteindre = (visible: 'humain' | 'machine' | null) => {
    for (const couche of couches) couche.inert = couche.dataset.cote !== visible;
    for (const page of humain?.() ?? []) page.inert = visible !== 'humain';
    racine.toggleAttribute('data-passage', visible === null);
  };

  const tracer = (sens: Sens, t: number, foyer: Foyer) => {
    if (!r || !lieu) return;
    // the knob slides while a bubble grows from it
    if (foyer === 'bouton') lieu.bouton = bouton(racine.getBoundingClientRect());
    montrer(image(r, sens, t, lieu, foyer), t * 61.8);
  };

  const arreter = () => {
    cancelAnimationFrame(trame);
    jeu = null;
  };

  const poser = (machine: boolean) => {
    arreter();
    fige = null;
    cote = machine;
    atteindre(machine ? 'machine' : 'humain');
    // on the human side nothing is drawn: the shader, still being built, is not waited for
    const nu = !rendu || rendu.perdu(machine);
    racine.toggleAttribute('data-nu', nu);
    secourir(machine && nu);
    // The black side at rest: the whole screen black, the number under the terminal.
    if (machine && r && lieu && !nu) return montrer(repos(r, lieu));
    couvrir(machine);
    entrer(machine ? 1 : 0);
    toile.style.visibility = 'hidden';
    rendu?.effacer();
  };

  /** The moment a running passage is at. */
  const moment = (maintenant: number) => (jeu ? jeu.depart + (maintenant - jeu.debut) / jeu.duree : 0);

  const pas = (maintenant: number) => {
    if (!jeu) return;
    const { sens, foyer } = jeu;
    const t = moment(maintenant);
    if (t >= 1) {
      poser(sens === 'aller');
      onFin(sens === 'aller');
      return;
    }
    tracer(sens, t, foyer);
    trame = requestAnimationFrame(pas);
  };

  /** Draws again what is shown, after a setting or the stage's size has changed. */
  const redessiner = () => {
    ecrire();
    if (fige && r) tracer(fige.sens, fige.t, foyerDe(r, fige.sens));
    else if (!jeu) poser(cote);
  };

  // The context can be lost (a driver reset, too many of them on the machine): a passage under
  // way ends at once, and the black side goes on without the shader.
  const perte = () => {
    if (libere) return;
    if (!jeu) return redessiner();
    const machine = jeu.sens === 'aller';
    poser(machine);
    onFin(machine);
  };
  toile.addEventListener('webglcontextlost', perte);

  // The number's serif may still be on its way: write it again once it is there.
  void document.fonts
    ?.load("400 100px 'Instrument Serif'", '1130')
    .then(() => {
      if (libere) return;
      polices += 1;
      redessiner();
    })
    .catch(() => undefined);

  return {
    regler(reglages) {
      r = reglages;
      redessiner();
    },
    mesurer() {
      lieu = relever();
      if (lieu) rendu?.dimensionner(lieu.l, lieu.h, lieu.dpr);
      redessiner();
    },
    poser,
    figer(sens, t) {
      arreter();
      fige = { sens, t };
      cote = sens === 'aller';
      atteindre(null);
      if (r) tracer(sens, t, foyerDe(r, sens));
    },
    jouer(sens, depuis) {
      const machine = sens === 'aller';
      if (!r || !lieu || !rendu || rendu.perdu() || reduit()) {
        poser(machine);
        onFin(machine);
        return;
      }
      const maintenant = performance.now();
      const ou = jeu ? { sens: jeu.sens, t: Math.min(1, moment(maintenant)), foyer: jeu.foyer } : fige ? { ...fige, foyer: foyerDe(r, fige.sens) } : null;
      let depart = 0;
      let foyer = foyerDe(r, sens);
      if (depuis === 'ici') {
        if (ou) {
          // Thrown again in mid-course, the passage goes on from where it is: a bubble that is
          // on its way goes back to where it came from.
          const { s } = position(r, ou.sens, ou.t, lieu, ou.foyer);
          if (s < COUVERT) foyer = ou.foyer;
          depart = ou.sens === sens ? ou.t : reprise(r, sens, s, lieu, foyer);
        } else if (cote === machine) return;
      }
      arreter();
      fige = null;
      cote = machine;
      atteindre(null);
      jeu = { sens, debut: maintenant, duree: durees(r, sens).totale, depart, foyer };
      tracer(sens, depart, foyer);
      trame = requestAnimationFrame(pas);
    },
    liberer() {
      libere = true;
      arreter();
      toile.removeEventListener('webglcontextlost', perte);
      rendu?.liberer();
      secourir(false);
      couvrir(false);
      for (const nom of ['data-couvert', 'data-terminal', 'data-passage', 'data-nu']) racine.removeAttribute(nom);
      for (const couche of couches) couche.inert = false;
      for (const page of humain?.() ?? []) page.inert = false;
    },
  };
}
