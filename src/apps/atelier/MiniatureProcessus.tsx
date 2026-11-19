import { useEffect, useRef } from 'react';
import type { PointerEvent } from 'react';
import carte from './medias/processus-carte.webp';
import carteDroite from './medias/processus-carte-droite.webp';
import planche from './medias/processus-planche.webp';
import plancheDroite from './medias/processus-planche-droite.webp';
import { useVisible } from './useVisible';
import './miniature-processus.css';

/*
 * The thumbnail of « Comment je dessine un produit avec l'IA » (journal n° 109): the
 * layouts explored for this portfolio at step 5, blind-embossed in a sheet of paper, the
 * one retained printed in the accent.
 *
 * The sheet is printed beforehand from the layouts' real blocks, twice: lit from the top
 * left, and from the top right (scripts/tirerGaufrage.mjs). The second print fades in over
 * the first, and the light turns around the sheet: every shadow slides to the other side
 * of its block. It crosses in LENT, back and forth; under a pointer, the light is where
 * the pointer is, and goes on from there when it leaves. Two pictures and an opacity:
 * nothing is drawn again, and it stops out of view.
 *
 * On a card, nine layouts seen close; `entiere` shows all seventeen, for the article.
 */

/** One crossing of the sheet by the light, ms. */
const LENT = 26_000;

export function MiniatureProcessus({ entiere = false }: { entiere?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const jour = useRef<HTMLImageElement>(null);
  const ombre = useRef<HTMLSpanElement>(null);
  const actif = useVisible(ref);
  // The light: the second print's opacity and the shade's place, on one clock.
  const lampe = useRef<{ aller: (part: number) => void; lacher: () => void; jouer: (oui: boolean) => void } | null>(null);

  useEffect(() => {
    const second = jour.current;
    const voile = ombre.current;
    // an old browser without element.animate() keeps the first print, still
    if (!second || !voile || !second.animate) return;
    const immobile = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tempo = { duration: LENT, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out', fill: 'both' } as const;
    const horloges = [second.animate({ opacity: [0, 1] }, tempo), voile.animate({ translate: ['0% 0', '22% 0'] }, tempo)];

    /** The clock's time brought back to a first crossing showing the same light. */
    const temps = () => {
      const t = Number(horloges[0].currentTime ?? 0) / LENT;
      const tour = Math.floor(t);
      return (tour % 2 ? 1 - (t - tour) : t - tour) * LENT;
    };
    const regler = (t: number) => {
      for (const horloge of horloges) horloge.currentTime = t;
    };

    let enVue = false;
    let tenue = false;
    let cible = 0;
    let raf = 0;
    const marche = () => {
      const tourne = enVue && !tenue && !immobile;
      for (const horloge of horloges) {
        if (tourne) horloge.play();
        else horloge.pause();
      }
    };
    // Under the pointer the light glides to it, a part of the way each frame.
    const glisse = () => {
      raf = 0;
      const t = temps();
      if (Math.abs(cible - t) < 30) return regler(cible);
      regler(t + (cible - t) * 0.14);
      raf = requestAnimationFrame(glisse);
    };

    // The page opens on the first print alone (the still picture, with reduced motion); the second
    // fades in from nothing, so it never pops in if it loads late.
    for (const horloge of horloges) horloge.pause();
    regler(0);
    lampe.current = {
      aller: (part) => {
        tenue = true;
        marche();
        cible = Math.min(1, Math.max(0, part)) * LENT;
        if (!raf) raf = requestAnimationFrame(glisse);
      },
      lacher: () => {
        tenue = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        // back on a first crossing: the light goes on from where the pointer left it
        regler(temps());
        marche();
      },
      jouer: (oui) => {
        enVue = oui;
        marche();
      },
    };
    return () => {
      lampe.current = null;
      if (raf) cancelAnimationFrame(raf);
      for (const horloge of horloges) horloge.cancel();
    };
  }, []);

  useEffect(() => {
    lampe.current?.jouer(actif);
  }, [actif]);

  const suit = (event: PointerEvent) => {
    // a finger scrolls the page: only a mouse or a pen holds the light
    if (event.pointerType === 'touch') return;
    const box = event.currentTarget.getBoundingClientRect();
    lampe.current?.aller((event.clientX - box.left) / box.width);
  };

  const [gauche, droite, largeur, hauteur] = entiere ? [planche, plancheDroite, 2000, 1125] : [carte, carteDroite, 1280, 720];
  // On the home, the card is the last one, under the first screen: fetched when it comes near.
  const charge = entiere ? undefined : 'lazy';

  return (
    <span ref={ref} className="gaufrage" onPointerMove={suit} onPointerLeave={() => lampe.current?.lacher()}>
      <img src={gauche} alt="" width={largeur} height={hauteur} loading={charge} decoding="async" />
      <img ref={jour} className="gaufrage__jour" src={droite} alt="" width={largeur} height={hauteur} loading={charge} decoding="async" />
      <span ref={ombre} className="gaufrage__ombre" />
    </span>
  );
}
