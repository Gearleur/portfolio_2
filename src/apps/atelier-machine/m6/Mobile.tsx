import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, CSSProperties } from 'react';
import type { Langue } from '../../atelier/langue';
import { famille, RETENU as TYPO } from '../m2/retenu';
import { Interrupteur } from '../m3/Interrupteur';
import type { PassageProps } from './Passage';
import { interrupteurDe, peutPrecharger, placeEncoche } from './telephone';
import type { Connexion, Reglages } from './telephone';
import './m6.css';

/*
 * The Machine mode's stage on a phone (step M6): laid over the phone's page inside its Specimen,
 * as the desktop's is on the Vitrine (portfolio/machine/ModeMachine.tsx). It holds the switch,
 * the one retained at M3, and nothing else until the passage is there: the bubble, the terminal,
 * the shell and the texts are another chunk (Passage.tsx).
 *
 * A finger does not hover: nothing announces the first touch. So the passage is fetched either
 * at that touch (the knob slides at once, the bubble follows as soon as it can), or ahead, a
 * moment after the switch has come, unless the visitor saves data or is on a slow network. A
 * switch that lives in the menu is announced by the menu opening.
 */

const MONO = famille(TYPO.police);

const GESTES = ['pointerover', 'focusin', 'pointerdown', 'keydown'] as const;

/** How long after the switch has come the passage is fetched ahead, ms. */
const REPOS = 600;

/** When the passage was fetched: at a touch towards the switch, or ahead. */
export type Quand = 'toucher' | 'repos';

type Props = {
  reglages: Reglages;
  /** The mode: false is the human page, true the terminal. */
  machine: boolean;
  onMode: (machine: boolean) => void;
  /** The page's language, and the project it reads if any: the terminal opens there. */
  langue: Langue;
  numero?: string;
  /** The page's address: the notch is not the same on a project's page. */
  adresse?: string;
  /** The page's menu is open. */
  menu: boolean;
  /** Fetches the passage and the terminal; asked several times, it fetches once. */
  charger: () => Promise<ComponentType<PassageProps>>;
  /** The passage has come, so long after it was asked for. */
  onCharge?: (quand: Quand, ms: number) => void;
  /** The switch fades in as it comes. The Vitrine says no when a page change mounts the stage again: it was there already. */
  arrive?: boolean;
  /** The bench's: a moment of the passage to hold, and its count of passages played again. */
  fige?: number | null;
  tour?: number;
};

export function Mobile({ reglages, machine, onMode, langue, numero, adresse = '', menu, charger, onCharge, arrive = true, fige, tour }: Props) {
  const racine = useRef<HTMLDivElement>(null);
  const [Passage, setPassage] = useState<ComponentType<PassageProps> | null>(null);
  const { interrupteur: place, taille, chargement } = reglages;
  const geo = useMemo(() => interrupteurDe({ interrupteur: place, taille }), [place, taille]);
  // Thrown, the switch needs its passage; and one in the menu's sheet is about to be touched once the menu opens.
  const approche = machine || (place === 'menu' && menu);

  useEffect(() => {
    const scene = racine.current;
    if (!scene || Passage) return;
    let vivant = true;
    let parti = false;
    const armer = (quand: Quand) => {
      if (parti) return;
      parti = true;
      const debut = performance.now();
      void charger().then(
        (composant) => {
          if (!vivant) return;
          setPassage(() => composant);
          onCharge?.(quand, performance.now() - debut);
        },
        // it could not be fetched (offline, on a first visit): the switch falls back, the page stays
        () => {
          parti = false;
          if (vivant) onMode(false);
        },
      );
    };
    const geste = () => armer('toucher');
    for (const nom of GESTES) scene.addEventListener(nom, geste);
    if (approche) armer('toucher');
    const davance = chargement === 'repos' && peutPrecharger((navigator as Navigator & { connection?: Connexion }).connection);
    const attente = davance ? window.setTimeout(() => armer('repos'), REPOS) : 0;
    return () => {
      vivant = false;
      window.clearTimeout(attente);
      for (const nom of GESTES) scene.removeEventListener(nom, geste);
    };
  }, [Passage, approche, chargement, charger, onCharge, onMode]);

  // In the notch: the page makes room for the pill between its name and « Menu », and the pill goes there.
  useLayoutEffect(() => {
    const scene = racine.current;
    const specimen = scene?.parentElement;
    if (!scene || !specimen || place !== 'encoche') return;
    specimen.setAttribute('data-m6-encoche', '');
    specimen.style.setProperty('--m6-trou', (geo.largeur * geo.echelle).toFixed(1));
    const mesurer = () => {
      // under the black the page is off the screen: the notch is where it was
      if (specimen.hasAttribute('data-machine')) return;
      const pieces = [...(specimen.querySelector('.m-strip')?.children ?? [])].map((piece) => piece.getBoundingClientRect());
      const place = placeEncoche(pieces, scene.getBoundingClientRect());
      if (!place) return;
      scene.style.setProperty('--m6-ix', `${place.x.toFixed(1)}px`);
      scene.style.setProperty('--m6-iy', `${place.y.toFixed(1)}px`);
    };
    const suivi = new ResizeObserver(mesurer);
    const brancher = () => {
      suivi.disconnect();
      const encoche = specimen.querySelector('.m-strip');
      for (const piece of [specimen, ...(encoche ? [encoche, ...encoche.children] : [])]) suivi.observe(piece);
      mesurer();
    };
    brancher();
    // The page can come after the stage (a project's page still on its way), and it comes back
    // from under the black as the screen is now, not as it was when the black took it.
    const page = new MutationObserver(brancher);
    page.observe(specimen, { childList: true, attributes: true, attributeFilter: ['data-machine'] });
    return () => {
      page.disconnect();
      suivi.disconnect();
      specimen.removeAttribute('data-m6-encoche');
      specimen.style.removeProperty('--m6-trou');
      scene.style.removeProperty('--m6-ix');
      scene.style.removeProperty('--m6-iy');
    };
  }, [place, geo, adresse]);

  const style = { '--m6-taille': taille, '--m6-cible': `${reglages.cible}px`, '--m6-touche': `${reglages.touche}px` } as CSSProperties;
  // On the human side a switch in the notch gives way to the menu's sheet, and one in the menu shows only with it.
  const efface = place === 'encoche' ? menu : place === 'menu' ? !menu : false;

  const pieces = [
    <div key="inter" className="m6-inter">
      <Interrupteur machine={machine} onChange={onMode} reglages={geo} mono={MONO} />
    </div>,
    Passage && <Passage key="passage" scene={racine} machine={machine} reglages={reglages} langue={langue} numero={numero} adresse={adresse} fige={fige} tour={tour} />,
  ];

  return (
    <div ref={racine} className="m4-scene m6-scene" data-mode={machine ? 'machine' : 'humain'} data-inter={place} data-rangs={reglages.rangs} data-gestes={reglages.gestes ? '' : undefined} data-efface={efface && !machine ? '' : undefined} data-arrive={arrive ? '' : undefined} style={style}>
      {/* what is at the top of the screen comes first for one who reads it in order */}
      {place === 'bas' ? pieces.reverse() : pieces}
    </div>
  );
}
