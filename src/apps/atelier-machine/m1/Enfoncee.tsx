import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Aiguillage } from '../../atelier/Aiguillage';
import { useVisible } from '../../atelier/useVisible';
import { formesDe } from './formes';
import type { Numero } from './formes';
import { CARTE, tirer } from './relief';
import type { Formes } from './relief';
import type { Miniatures } from './reglages';

/*
 * A project's thumbnail in the Machine state (step M1): gone, pressed into the paper, a few
 * of its shapes left. It takes the picture's place in the Vitrine's own card; the print is a
 * little larger than the card, for what spills over its edges.
 */

const { W, H, MARGE } = CARTE;

// The print's place over the card, whatever the card's size on screen.
const PLACE: CSSProperties = {
  left: `${(-MARGE / W) * 100}%`,
  top: `${(-MARGE / H) * 100}%`,
  width: `${((W + 2 * MARGE) / W) * 100}%`,
  height: `${((H + 2 * MARGE) / H) * 100}%`,
};

export function Enfoncee({ numero, miniatures }: { numero: Numero; miniatures: Miniatures }) {
  const racine = useRef<HTMLSpanElement>(null);
  const toile = useRef<HTMLCanvasElement>(null);
  const plan = useRef<HTMLSpanElement>(null);
  const [formes, setFormes] = useState<Formes | null>(null);
  // A card further down the page is printed when it comes near the screen, not at every move of a slider.
  const visible = useVisible(racine);

  // What is left of the picture, read once from the Vitrine's own piece.
  useEffect(() => {
    let parti = false;
    formesDe(numero, plan.current?.querySelector('svg'))
      ?.then((lues) => {
        if (!parti) setFormes(lues);
      })
      // a picture that cannot be read leaves the bare well
      .catch(() => {});
    return () => {
      parti = true;
    };
  }, [numero]);

  const { maniere, profondeur, formes: quantite } = miniatures;
  useEffect(() => {
    const g = toile.current?.getContext('2d');
    if (!g || !visible) return;
    // Printed once the browser is free, and only for the settings still in force: a slider
    // dragged fast skips the prints in between and stays under the hand.
    const attente = window.setTimeout(() => {
      const { image, w, h } = tirer(formes, { maniere, profondeur, formes: quantite });
      g.putImageData(new ImageData(image, w, h), 0, 0);
    }, 0);
    return () => window.clearTimeout(attente);
  }, [formes, maniere, profondeur, quantite, visible]);

  return (
    <span ref={racine} className="m1-creux" data-maniere={maniere}>
      <canvas ref={toile} width={W + 2 * MARGE} height={H + 2 * MARGE} style={PLACE} aria-hidden="true" />
      {/* SNCF GPT's shapes are read from the drawing itself, kept out of sight. */}
      {numero === '02' && (
        <span ref={plan} hidden>
          <Aiguillage cadrage="paysage" />
        </span>
      )}
    </span>
  );
}
