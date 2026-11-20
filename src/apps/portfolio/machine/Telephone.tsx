import { useCallback, useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import type { Langue } from '../../atelier/langue';
import { Mobile } from '../../atelier-machine/m6/Mobile';
import type { PassageProps } from '../../atelier-machine/m6/Passage';
import { RETENU } from '../../atelier-machine/m6/retenu';
import { lancer, versMachine } from './etat';
import type { Etat } from './etat';

/*
 * The Machine mode on the Vitrine, on a phone (below 721 px; Atelier 2, step M6): the stage
 * retained on the bench (m6/Mobile.tsx) with what was retained there (m6/retenu.ts), and nothing
 * of the bench. The switch lives in the notch of glass, between the name and « Menu ». A chunk
 * of its own, which the Vitrine fetches once the page has loaded and is idle, on a phone only;
 * a desktop fetches ModeMachine.tsx instead, and neither fetches the other's.
 *
 * The passage, the terminal, the shell and the texts are another chunk again (m6/Passage.tsx).
 * A finger does not hover, so nothing announces the first touch: that chunk is fetched ahead, a
 * moment after the switch has come, unless the visitor saves data or is on a slow network; there
 * it waits for the first touch, the knob sliding at once and the bubble following.
 *
 * As on a desktop, the mode is not in the address: it holds for the address it was thrown at
 * (etat.ts). When that changes under the terminal (the browser's back button, another #), the
 * human page is given back at once. And a window that grows past 720 px unmounts this stage:
 * the page is the human one again, with the desktop's switch.
 */

type Props = {
  /** The page's language: the terminal opens in it. */
  langue: Langue;
  /** The address (#…) the human page shows. */
  adresse: string;
  /** The project being read, if the page is a project's: the terminal opens on its file. */
  numero?: string;
  /** The page's menu is open: its sheet drops over the notch, and the switch gives way. */
  menu: boolean;
};

let charge: Promise<ComponentType<PassageProps>> | null = null;
/** The passage and the terminal, fetched once; a fetch that failed is tried again at the next touch. */
const charger = () =>
  (charge ??= import('../../atelier-machine/m6/Passage').then(
    (module) => module.Passage,
    (erreur: unknown) => {
      charge = null;
      throw erreur;
    },
  ));

// The switch fades in the first time it appears, not each time a page change mounts its stage again.
let apparu = false;

export default function Telephone({ langue, adresse, numero, menu }: Props) {
  const [etat, setEtat] = useState<Etat>({ machine: false, adresse, langue, numero });
  const [arrive] = useState(() => !apparu);
  const machine = versMachine(etat, adresse);

  useEffect(() => {
    apparu = true;
  }, []);

  const basculer = useCallback((vers: boolean) => setEtat((avant) => lancer(avant, vers, { adresse, langue, numero })), [adresse, langue, numero]);

  return <Mobile reglages={RETENU} machine={machine} onMode={basculer} langue={etat.langue} numero={etat.numero} adresse={adresse} menu={menu} charger={charger} arrive={arrive} />;
}
