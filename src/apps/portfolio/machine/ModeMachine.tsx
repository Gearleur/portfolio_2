import { useEffect, useRef, useState } from 'react';
import type { ComponentType, CSSProperties } from 'react';
import type { Langue } from '../../atelier/langue';
import { famille, RETENU as TYPO } from '../../atelier-machine/m2/retenu';
import { Interrupteur } from '../../atelier-machine/m3/Interrupteur';
import { RETENU as INTERRUPTEUR, geometrie } from '../../atelier-machine/m3/retenu';
import { lancer, versMachine } from './etat';
import type { Etat } from './etat';
import type { PassageProps } from './Passage';
import './machine.css';

/*
 * The Machine mode on the Vitrine (Atelier 2, journal n° 110 to 115), on a desktop: the switch
 * retained at M3, at the bottom in the middle, over the page. A chunk of its own, which the
 * Vitrine fetches once the page has loaded and is idle; nothing of it is in the copies rendered
 * at build time, where a switch could not answer.
 *
 * It is a stage laid over the page inside the Vitrine's Specimen, as on the bench of M4: the
 * page's own cursor goes on over the switch. The passage, the terminal, the shader and the
 * texts (Passage.tsx) are another chunk again, fetched at the first gesture towards the switch
 * (a pointer over it, the focus, a press): the passage is ready before the click ends, and a
 * click that comes first slides the knob at once, the bubble following as soon as it can.
 *
 * The mode is not in the address. It holds for the address it was thrown at: when that changes
 * (the browser's back button, a link), the human page is given back at once.
 */

type Props = {
  /** The page's language: the terminal opens in it. */
  langue: Langue;
  /** The address (#…) the human page shows. */
  adresse: string;
  /** The project being read, if the page is a project's: the terminal opens on its file. */
  numero?: string;
};

const MONO = famille(TYPO.police);
// what the terminal's screen gives up, so that its last line stands above the pill (M3)
const STYLE = { '--m3-reserve': geometrie(INTERRUPTEUR, TYPO.grille.marge).reserve } as CSSProperties;

const GESTES = ['pointerover', 'focusin', 'pointerdown', 'keydown'] as const;

let charge: Promise<ComponentType<PassageProps>> | null = null;
/** The passage and the terminal, fetched once; a fetch that failed is tried again at the next gesture. */
const charger = () =>
  (charge ??= import('./Passage').then(
    (module) => module.Passage,
    (erreur: unknown) => {
      charge = null;
      throw erreur;
    },
  ));

// The switch fades in the first time it appears, not each time a page change mounts its stage again.
let apparu = false;

export default function ModeMachine({ langue, adresse, numero }: Props) {
  const racine = useRef<HTMLDivElement>(null);
  const [etat, setEtat] = useState<Etat>({ machine: false, adresse, langue, numero });
  const [Passage, setPassage] = useState<ComponentType<PassageProps> | null>(null);
  const [arrive] = useState(() => !apparu);
  const machine = versMachine(etat, adresse);

  useEffect(() => {
    apparu = true;
  }, []);

  // The first gesture towards the switch fetches the passage.
  useEffect(() => {
    const scene = racine.current;
    if (!scene || Passage) return;
    let vivant = true;
    const armer = () =>
      void charger().then(
        (composant) => vivant && setPassage(() => composant),
        // it could not be fetched (offline, on a first visit): the switch falls back, the page stays
        () => vivant && setEtat((avant) => lancer(avant, false, avant)),
      );
    for (const geste of GESTES) scene.addEventListener(geste, armer);
    // thrown by other means (a script, an assistive tool), the switch fetches it too
    if (machine) armer();
    return () => {
      vivant = false;
      for (const geste of GESTES) scene.removeEventListener(geste, armer);
    };
  }, [Passage, machine]);

  // The wheel over the pill scrolls the page under it, as it does everywhere else on the page.
  useEffect(() => {
    const scene = racine.current;
    if (!scene || machine) return;
    const defiler = (event: WheelEvent) => {
      const ligne = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : 1;
      scene.previousElementSibling?.scrollBy(event.deltaX * ligne, event.deltaY * ligne);
    };
    scene.addEventListener('wheel', defiler, { passive: true });
    return () => scene.removeEventListener('wheel', defiler);
  }, [machine]);

  return (
    <div ref={racine} className="m3-scene m4-scene machine" data-mode={machine ? 'machine' : 'humain'} data-arrive={arrive ? '' : undefined} style={STYLE}>
      {Passage && <Passage scene={racine} machine={machine} adresse={adresse} langue={etat.langue} numero={etat.numero} />}
      <Interrupteur machine={machine} onChange={(vers) => setEtat((avant) => lancer(avant, vers, { adresse, langue, numero }))} reglages={INTERRUPTEUR} mono={MONO} />
    </div>
  );
}
