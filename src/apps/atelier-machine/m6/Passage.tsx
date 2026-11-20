import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { CSSProperties, RefObject } from 'react';
import type { Langue } from '../../atelier/langue';
import { creerMeneur } from '../m4/meneur';
import type { Meneur } from '../m4/meneur';
import { ETIQUETTES, fondMachine } from '../m4/retenu';
import { Terminal } from '../m4/Terminal';
import type { Pied } from '../m5/Console';
import { cheminProjet } from '../m5/fichiers';
import { suivreClavier } from './clavier';
import { GRAND, contenuDe, passageDe, typeDe } from './derives';
import { glisser } from './glisser';
import { ranger } from './ranger';
import type { Reglages } from './telephone';
import '../m4/m4.css';

/*
 * The passage and the terminal on a phone (step M6): the desktop's own (the driver and the
 * shader of M4, the console, the shell and the texts of M5), fetched apart from the switch. What
 * is the phone's is small: the terminal takes the whole screen; its field never takes the keys
 * by itself, which would bring the keyboard out; its last line is drawn here, with the number
 * and, if asked, a pad of big keys under the thumb; and a swipe to the right goes back.
 *
 * As on the Vitrine, the human page is not a layer of the stage: it lies beside it in the
 * Specimen, which is told once the screen is black (data-machine, m6.css).
 */

export type PassageProps = {
  /** The stage: the switch is in it. */
  scene: RefObject<HTMLDivElement | null>;
  /** The mode: false is the human page, true the terminal. Changing it plays the passage. */
  machine: boolean;
  reglages: Reglages;
  /** Where the terminal opens: the page's language, and its project if it is a project's. */
  langue: Langue;
  numero?: string;
  /** The human page's address: a mode that changes with it changes at once, without a passage. */
  adresse?: string;
  /** The bench's: a moment of the passage (0–1) to hold, and its count of passages played again from their start. */
  fige?: number | null;
  tour?: number;
};

const MOTS = {
  fr: { court: 'n°', retour: 'retour', ouvrir: 'ouvrir', page: 'page', haut: 'Monter', bas: 'Descendre', pave: 'Touches' },
  en: { court: 'no.', retour: 'back', ouvrir: 'open', page: 'page', haut: 'Up', bas: 'Down', pave: 'Keys' },
};

type BasProps = Pied & { pave: boolean; glisse: boolean; numero: string };

/** The terminal's last line: the number or the session, where one is, how far; under it, the pad. Its keys answer as the console's own (data-touche). */
function Bas({ langue, chemin, position, enListe, retour, pave, glisse, numero }: BasProps) {
  const ref = useRef<HTMLDivElement>(null);
  const niveau = chemin.split('/').length;
  const avant = useRef(niveau);
  const m = MOTS[langue];

  // As in a native list, the screen one enters comes from the right, and the one gone back to from the left.
  useLayoutEffect(() => {
    const sens = Math.sign(niveau - avant.current);
    avant.current = niveau;
    if (!glisse || !sens || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    ref.current?.parentElement
      ?.querySelector('.m5-defile')
      ?.animate?.([{ translate: `${sens * 28}px 0`, opacity: 0 }, { translate: '0 0', opacity: 1 }], { duration: 240, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' });
  }, [niveau, glisse]);

  return (
    <div ref={ref} className="m6-bas">
      <div className="m2-barre m6-etat">
        {numero ? (
          <span className="m6-pose">
            {ETIQUETTES[langue].toLowerCase()} <span className="m6-chiffres">{numero}</span>
          </span>
        ) : (
          <span>{`${langue} · utf-8`}</span>
        )}
        {/* a long path loses its start, not the file's name */}
        <span className="m6-chemin">
          <bdi>{chemin}</bdi>
        </span>
        <span>{position}</span>
      </div>
      {pave && (
        <div className="m6-pave" role="group" aria-label={m.pave}>
          <button type="button" data-touche="retour" disabled={!retour} aria-label={m.retour}>
            ← <small>{m.retour}</small>
          </button>
          <button type="button" data-touche="haut" aria-label={m.haut}>
            ↑
          </button>
          <button type="button" data-touche="bas" aria-label={m.bas}>
            ↓
          </button>
          <button type="button" data-touche={enListe ? 'ouvrir' : 'page'} aria-label={enListe ? m.ouvrir : m.page}>
            ↵ <small>{enListe ? m.ouvrir : m.page}</small>
          </button>
        </div>
      )}
    </div>
  );
}

export function Passage({ scene, machine, reglages, langue, numero, adresse = '', fige = null, tour = 0 }: PassageProps) {
  const toile = useRef<HTMLCanvasElement>(null);
  const couche = useRef<HTMLDivElement>(null);
  const meneur = useRef<Meneur | null>(null);
  // The stage opens on the human side: mounted after the switch was thrown, it plays the passage at once.
  const avant = useRef<{ machine: boolean; adresse: string; fige: number | null; tour: number }>({ machine: false, adresse, fige: null, tour });
  const plafond = useRef(reglages.densite);
  // The terminal's own delay and entrance, for the number that is put away meanwhile; and what ends that at once.
  const temps = useRef({ delai: 0, entree: 0 });
  const range = useRef<(() => void) | null>(null);

  const { duree, largeur, numero: place, corps, gestes, pave, rangs, liste, densite } = reglages;
  const passage = useMemo(() => passageDe({ duree, largeur, numero: place }, langue), [duree, largeur, place, langue]);
  const type = useMemo(() => typeDe(corps), [corps]);
  const contenu = useMemo(() => contenuDe({ pave, rangs, liste }), [pave, rangs, liste]);
  const depart = useMemo(() => ({ langue, fichier: (numero && cheminProjet(numero, langue)) || undefined }), [langue, numero]);
  const fond = useMemo(() => ({ '--m4-fond': `rgb(${fondMachine(passage.fond).join(' ')})` }) as CSSProperties, [passage.fond]);

  useLayoutEffect(() => {
    const racine = scene.current;
    const specimen = racine?.parentElement;
    if (!racine || !specimen || !toile.current) return;
    const m = creerMeneur({
      racine,
      toile: toile.current,
      humain: () => [...specimen.children].filter((enfant): enfant is HTMLElement => enfant instanceof HTMLElement && enfant !== racine && !enfant.classList.contains('curseur')),
      onCouvert: (couvert) => {
        specimen.toggleAttribute('data-machine', couvert);
        // a wave under way has nothing left to cross
        if (couvert) for (const onde of specimen.querySelector('.fond__wave')?.getAnimations?.() ?? []) onde.cancel();
        // The screen has just turned black in a passage that plays: the number is put away as the terminal comes.
        range.current?.();
        range.current = couvert && couche.current && racine.hasAttribute('data-passage') && avant.current.fige === null ? ranger(couche.current, GRAND, temps.current.delai, temps.current.entree) : null;
      },
      // The keys stay on the switch, which was just touched and is still there: the terminal's field would bring the keyboard out.
      onFin: () => undefined,
      densite: () => plafond.current,
    });
    meneur.current = m;
    m.mesurer();
    const taille = new ResizeObserver(() => m.mesurer());
    taille.observe(racine);
    return () => {
      taille.disconnect();
      m.liberer();
      meneur.current = null;
      range.current?.();
      range.current = null;
    };
  }, [scene]);

  useLayoutEffect(() => {
    if (plafond.current === densite) return;
    plafond.current = densite;
    meneur.current?.mesurer();
  }, [densite]);

  useLayoutEffect(() => {
    temps.current = { delai: passage.delai, entree: passage.entree };
    meneur.current?.regler(passage);
  }, [passage]);

  useLayoutEffect(() => {
    const m = meneur.current;
    if (!m) return;
    const a = avant.current;
    avant.current = { machine, adresse, fige, tour };
    const sens = machine ? 'aller' : 'retour';
    // Back to the page: the line gives the keys back, and the keyboard goes with the terminal (a touch on the switch does not take them on iOS).
    if (!machine && a.machine) scene.current?.querySelector<HTMLElement>('.m5-champ')?.blur();
    if (fige !== null) m.figer(sens, fige);
    else if (tour !== a.tour) m.jouer(sens, 'debut');
    // The address changed under the terminal: the human page is given back at once, without a bubble.
    else if (machine !== a.machine && adresse !== a.adresse) m.poser(machine);
    else if (machine !== a.machine || a.fige !== null) m.jouer(sens, 'ici');
  }, [scene, machine, adresse, fige, tour]);

  useEffect(() => (gestes && couche.current ? glisser(couche.current) : undefined), [gestes]);

  // The keyboard, when the line is touched: the terminal keeps to what it leaves in view.
  useEffect(() => (scene.current ? suivreClavier(scene.current) : undefined), [scene]);

  const entete = useMemo(
    () =>
      place === 'haut' ? (
        <span className="m6-numero m6-pose">
          {MOTS[langue].court} <span className="m6-chiffres">{passage.numero}</span>
        </span>
      ) : undefined,
    [place, langue, passage.numero],
  );
  const ecrit = place === 'etat' ? passage.numero : '';
  const pied = useCallback((infos: Pied) => <Bas {...infos} pave={pave} glisse={gestes} numero={ecrit} />, [pave, gestes, ecrit]);

  return (
    <>
      <canvas ref={toile} className="m4-bulle" aria-hidden="true" />
      <div ref={couche} className="m4-couche" data-cote="machine" style={fond}>
        <Terminal transparence={passage.transparence} depart={depart} bande={0} type={type} contenu={contenu} tactile entete={entete} pied={pied} />
        <span className="m6-vol" aria-hidden="true" />
      </div>
      <span className="m4-etalon" aria-hidden="true" />
    </>
  );
}
