import { memo, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Maquette } from '../../atelier/Maquettes';
import { Miniature } from '../../atelier/Miniature';
import { MiniatureAlpine } from '../../atelier/MiniatureAlpine';
import { MiniatureProcessus } from '../../atelier/MiniatureProcessus';
import { MiniatureReunions } from '../../atelier/MiniatureReunions';
import { famille, RETENU as TYPO } from '../m2/reglages';
import { Interrupteur } from '../m3/Interrupteur';
import { RETENU as INTERRUPTEUR, geometrie } from '../m3/reglages';
import { creerMeneur } from './meneur';
import type { Meneur } from './meneur';
import { fondMachine } from './reglages';
import type { Reglages } from './reglages';
import { Terminal } from './Terminal';
import './m4.css';

/*
 * The two states and the passage between them (step M4), in a Specimen. From the bottom up: the
 * Vitrine as it is; the canvas on which the bubble's black and the number are drawn; the terminal
 * of M5 in M1's sheet of glass, a little transparent, with nothing of the page behind it
 * (Terminal.tsx); and the switch retained at M3, which sets the passage off. Both states stay mounted, as at M3; nothing
 * is rendered again while the passage lasts (meneur.ts).
 */

// The Vitrine's own thumbnails, as its page mounts them.
const IMAGES = {
  '01': <MiniatureAlpine />,
  '02': <Miniature cadrage="paysage" />,
  '03': <MiniatureReunions />,
  '04': <MiniatureProcessus />,
};

const MONO = famille(TYPO.police);

// Neither state depends on the passage: they are not rendered again when it starts.
const Humain = memo(function Humain() {
  return <Maquette blocks={false} images={IMAGES} />;
});

type Props = {
  reglages: Reglages;
  /** The mode: false is the human page, true the terminal. Changing it plays the passage. */
  machine: boolean;
  onMode: (machine: boolean) => void;
  /** A moment of the passage towards that mode (0–1) to hold on the stage, or null. */
  fige: number | null;
  /** Counts the times the bench asked to see the passage again, from its start. */
  tour: number;
};

export function Scene({ reglages, machine, onMode, fige, tour }: Props) {
  const racine = useRef<HTMLDivElement>(null);
  const toile = useRef<HTMLCanvasElement>(null);
  const meneur = useRef<Meneur | null>(null);
  const avant = useRef({ machine, tour, fige });

  useEffect(() => {
    const scene = racine.current;
    if (!scene || !toile.current) return;
    const m = creerMeneur({
      racine: scene,
      toile: toile.current,
      // The keys go where one has arrived: to the terminal's line, or back to the switch.
      onFin: (versMachine) => {
        const actif = document.activeElement;
        // someone working the bench's panel keeps the keys there
        if (actif instanceof HTMLElement && !scene.contains(actif) && actif.matches('button, input, select, textarea, a[href]')) return;
        const cible = versMachine ? '.m5-champ' : scene.contains(actif) ? null : '[role="switch"]';
        if (cible) scene.querySelector<HTMLElement>(cible)?.focus({ preventScroll: true });
      },
    });
    meneur.current = m;
    const taille = new ResizeObserver(() => m.mesurer());
    taille.observe(scene);
    return () => {
      taille.disconnect();
      m.liberer();
      meneur.current = null;
    };
  }, []);

  useEffect(() => meneur.current?.regler(reglages), [reglages]);

  useEffect(() => {
    const m = meneur.current;
    if (!m) return;
    const a = avant.current;
    avant.current = { machine, tour, fige };
    const sens = machine ? 'aller' : 'retour';
    if (fige !== null) m.figer(sens, fige);
    else if (tour !== a.tour) m.jouer(sens, 'debut');
    else if (machine !== a.machine || a.fige !== null) m.jouer(sens, 'ici');
    else m.poser(machine);
  }, [machine, tour, fige]);

  const style = {
    // what the terminal's screen gives up, so that its last line stands above the pill (M3)
    '--m3-reserve': geometrie(INTERRUPTEUR, TYPO.grille.marge).reserve,
    '--m4-fond': `rgb(${fondMachine(reglages.fond).join(' ')})`,
  } as CSSProperties;

  return (
    <div ref={racine} className="m3-scene m4-scene" data-mode={machine ? 'machine' : 'humain'} style={style}>
      <div className="m4-couche" data-cote="humain">
        <Humain />
      </div>
      <canvas ref={toile} className="m4-bulle" aria-hidden="true" />
      <div className="m4-couche" data-cote="machine">
        <Terminal transparence={reglages.transparence} />
      </div>
      <span className="m4-etalon" aria-hidden="true" />
      <Interrupteur machine={machine} onChange={onMode} reglages={INTERRUPTEUR} mono={MONO} />
    </div>
  );
}
