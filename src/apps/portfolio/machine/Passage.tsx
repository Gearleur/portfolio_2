import { useLayoutEffect, useMemo, useRef } from 'react';
import type { CSSProperties, RefObject } from 'react';
import type { Langue } from '../../atelier/langue';
import { creerMeneur } from '../../atelier-machine/m4/meneur';
import type { Meneur } from '../../atelier-machine/m4/meneur';
import { RETENU, fondMachine } from '../../atelier-machine/m4/retenu';
import { Terminal } from '../../atelier-machine/m4/Terminal';
import { cheminProjet } from '../../atelier-machine/m5/fichiers';
import '../../atelier-machine/m4/m4.css';

/*
 * The passage and the terminal of the Machine mode on the Vitrine (journal n° 115), as retained
 * at M4: the canvas where the black bubble and the number are drawn, and the terminal that
 * works, in its sheet of glass. Fetched at the first gesture towards the switch (ModeMachine.tsx)
 * and mounted in its stage; the bench's own driver (meneur.ts) plays it.
 *
 * The human page is not a layer of this stage: it is the Vitrine's, beside it in the Specimen.
 * Once the screen is black, the Specimen is told (data-machine, machine.css): the page is taken
 * off the screen, so its films, its canvases and its cursor stop as they do for anything out of
 * view, and the wave is stopped. Everything starts again when the bubble draws back.
 */

export type PassageProps = {
  /** The stage: the switch is in it. */
  scene: RefObject<HTMLDivElement | null>;
  /** The mode: false is the human page, true the terminal. Changing it plays the passage. */
  machine: boolean;
  /** The human page's address: a mode that changes with it changes at once, without a passage. */
  adresse: string;
  /** Where the terminal opens: the language of the page the switch was thrown on, and its project if it is a project's. */
  langue: Langue;
  numero?: string;
};

// the black side's colour, for the ground that stands in for the shader's black without WebGL
const FOND = { '--m4-fond': `rgb(${fondMachine(RETENU.fond).join(' ')})` } as CSSProperties;

export function Passage({ scene, machine, adresse, langue, numero }: PassageProps) {
  const toile = useRef<HTMLCanvasElement>(null);
  const meneur = useRef<Meneur | null>(null);
  // The stage opens on the human side: mounted after the switch was thrown, it plays the passage at once.
  const avant = useRef({ machine: false, adresse });

  // The number's small label is in the terminal's language.
  const reglages = useMemo(() => ({ ...RETENU, langue }), [langue]);
  const depart = useMemo(() => ({ langue, fichier: (numero && cheminProjet(numero, langue)) || undefined }), [langue, numero]);

  useLayoutEffect(() => {
    const racine = scene.current;
    const specimen = racine?.parentElement;
    if (!racine || !specimen || !toile.current) return;
    const m = creerMeneur({
      racine,
      toile: toile.current,
      // the Vitrine's page and its ground, beside the stage; the cursor takes no key and no click
      humain: () => [...specimen.children].filter((enfant): enfant is HTMLElement => enfant instanceof HTMLElement && enfant !== racine && !enfant.classList.contains('curseur')),
      onCouvert: (couvert) => {
        specimen.toggleAttribute('data-machine', couvert);
        // a wave under way has nothing left to cross
        if (couvert) for (const onde of specimen.querySelector('.fond__wave')?.getAnimations?.() ?? []) onde.cancel();
      },
      // The keys go where one has arrived: to the terminal's line, or back to the switch.
      onFin: (versMachine) => racine.querySelector<HTMLElement>(versMachine ? '.m5-champ' : '[role="switch"]')?.focus({ preventScroll: true }),
    });
    meneur.current = m;
    m.mesurer();
    const taille = new ResizeObserver(() => m.mesurer());
    taille.observe(racine);
    // On the black side the page's cursor has nothing to follow: the pointer's moves stop here.
    const taire = (event: PointerEvent) => {
      if (specimen.hasAttribute('data-machine')) event.stopPropagation();
    };
    racine.addEventListener('pointermove', taire);
    return () => {
      taille.disconnect();
      racine.removeEventListener('pointermove', taire);
      m.liberer();
      meneur.current = null;
    };
  }, [scene]);

  useLayoutEffect(() => meneur.current?.regler(reglages), [reglages]);

  useLayoutEffect(() => {
    const m = meneur.current;
    if (!m) return;
    const a = avant.current;
    avant.current = { machine, adresse };
    if (machine === a.machine) return;
    // The address changed under the terminal: the human page is given back at once, without a bubble.
    if (adresse !== a.adresse) m.poser(machine);
    else m.jouer(machine ? 'aller' : 'retour', 'ici');
  }, [machine, adresse]);

  return (
    <>
      <canvas ref={toile} className="m4-bulle" aria-hidden="true" />
      <div className="m4-couche" data-cote="machine" style={FOND}>
        <Terminal transparence={RETENU.transparence} depart={depart} />
      </div>
      <span className="m4-etalon" aria-hidden="true" />
    </>
  );
}
