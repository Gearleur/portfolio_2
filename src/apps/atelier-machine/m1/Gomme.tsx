import { useEffect, useRef } from 'react';
import { peindre, tracer } from './gomme';
import type { Zone } from './gomme';
import type { Gomme as Reglages } from './reglages';

/** The page as the eraser sees it: its scale on screen, its whole size and where it had ink (px of a 1440 px page). */
export type Mesure = { u: number; largeur: number; hauteur: number; zones: Zone[] };

/**
 * The eraser's strokes over the whole page, not only its first screen: they lie on the paper
 * and scroll with it (m1.css moves the canvas by --defil). Drawn again when a setting or the
 * stage's size changes; the same settings always give the same strokes.
 */
export function Gomme({ gomme, mesure }: { gomme: Reglages; mesure: Mesure }) {
  const toile = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = toile.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    // Painted at the next frame, and only for the settings still in force: a slider dragged
    // fast skips the pictures in between.
    const attente = requestAnimationFrame(() => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const echelle = mesure.u * dpr;
      const largeur = Math.max(1, Math.round(mesure.largeur * echelle));
      const hauteur = Math.max(1, Math.round(mesure.hauteur * echelle));
      // sizing a canvas clears it
      canvas.width = largeur;
      canvas.height = hauteur;
      canvas.style.width = `${largeur / dpr}px`;
      canvas.style.height = `${hauteur / dpr}px`;
      ctx.setTransform(echelle, 0, 0, echelle, 0, 0);
      peindre(ctx, tracer(gomme, mesure.zones), gomme, echelle);
    });
    return () => cancelAnimationFrame(attente);
  }, [gomme, mesure]);

  return (
    <div className="m1__gomme" aria-hidden="true">
      <canvas ref={toile} />
    </div>
  );
}
