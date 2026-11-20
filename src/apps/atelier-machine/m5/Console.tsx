import { Fragment, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as Touche, MouseEvent, ReactNode } from 'react';
import { famille } from '../m2/retenu';
import type { Reglages as Type } from '../m2/reglages';
import { ecrire } from './fichiers';
import type { Langue } from './fichiers';
import type { Reglages } from './reglages';
import { commandeOuvrir, commandeRetour, completer, demarrer, invite, reduire } from './shell';
import type { Depart, Morceau, Options } from './shell';
import '../m2/m2.css';
import './m5.css';

/*
 * The terminal that works (step M5), on M2's grid of cells inside M1's sheet of glass. The
 * lines scroll inside the glass; the page behind stays still. One hidden field takes the keys,
 * wherever one clicks; a name clicked, an arrow pressed or a key of the bar writes its command
 * at the prompt, then runs it: the command is the trace of the move.
 */

/** How many zeros the cell is measured on (as M2's screen does). */
const SONDE = 50;

type Mesure = { l: number; h: number; cw: number; u: number };

const MOTS = {
  fr: { retour: 'retour', choisir: 'choisir', ouvrir: 'ouvrir', defiler: 'défiler', page: 'page suivante', completer: 'compléter', historique: 'historique', lancer: 'lancer', espace: 'espace', ligne: 'Ligne de commande', chemin: 'Chemin', sortie: 'Sortie du terminal' },
  en: { retour: 'back', choisir: 'choose', ouvrir: 'open', defiler: 'scroll', page: 'next page', completer: 'complete', historique: 'history', lancer: 'run', espace: 'space', ligne: 'Command line', chemin: 'Path', sortie: 'Terminal output' },
};

const reduit = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Where the last answer starts in the scrolling zone and how far it can be read, px. Under a
 * file, the folder's menu closes the reading (data-borne): once the file is longer than the
 * screen, the room kept under the last line is given up (data-butee, m5.css), so the scroll ends
 * with the menu. The stop is the browser's own end of scroll: a fling stops dead on it, where a
 * position put back at each scroll event let the momentum run on under it.
 */
function lecture(el: HTMLElement) {
  const debuts = el.querySelectorAll<HTMLElement>('[data-debut]');
  const haut = debuts.length ? debuts[debuts.length - 1].offsetTop : 0;
  const fin = el.querySelector<HTMLElement>('.m5-neuf')?.offsetTop ?? el.scrollHeight;
  const course = fin - el.clientHeight - haut;
  el.toggleAttribute('data-butee', el.hasAttribute('data-borne') && course > 1);
  return { haut, course };
}

/** What the last line has to say, for one who draws it otherwise: where one is, how far, and which keys work there. */
export type Pied = { langue: Langue; chemin: string; position: string; enListe: boolean; retour: boolean };

export type ConsoleProps = {
  /** The type and grid retained at M2. */
  type: Type;
  reglages: Reglages;
  /** Where the terminal opens, when not at the root in French; read once, as it mounts. */
  depart?: Depart;
  /**
   * A touch screen (the phone, M6): the field that takes the keys would bring the keyboard out,
   * so it is given them only by a touch on the line itself, and any other touch takes them back.
   */
  tactile?: boolean;
  /** More on the first line, after the way back. */
  entete?: ReactNode;
  /** The last line, drawn otherwise: its keys answer by `data-touche`, like the bar's. */
  pied?: (infos: Pied) => ReactNode;
};

export function Console({ type, reglages, depart, tactile, entete, pied }: ConsoleProps) {
  const { police, grille, gris, curseur } = type;
  const racine = useRef<HTMLDivElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const champ = useRef<HTMLInputElement>(null);
  const [mesure, setMesure] = useState<Mesure | null>(null);

  // The glass's size, the cell's width and the page's scale, read again whenever one of them moves.
  useEffect(() => {
    const el = racine.current;
    const sonde = el?.querySelector<HTMLElement>('.m2-sonde');
    const etalon = el?.querySelector<HTMLElement>('.m2-etalon');
    if (!el || !sonde || !etalon) return;
    const relever = () => {
      const lue = { l: el.clientWidth, h: el.clientHeight, cw: sonde.getBoundingClientRect().width / SONDE, u: etalon.getBoundingClientRect().width / 100 };
      if (!lue.cw || !lue.u) return;
      setMesure((avant) => (avant && avant.l === lue.l && avant.h === lue.h && avant.cw === lue.cw && avant.u === lue.u ? avant : lue));
    };
    const taille = new ResizeObserver(relever);
    for (const cible of [el, sonde, etalon]) taille.observe(cible);
    return () => taille.disconnect();
  }, []);

  // The grid: as many whole cells as fit between the margins.
  const g = useMemo(() => {
    if (!mesure) return null;
    const { l, h, cw, u } = mesure;
    const lh = police.corps * grille.interligne * u;
    const marge = grille.marge * u;
    return { cw, lh, marge, colonnes: Math.max(1, Math.floor((l - 2 * marge) / cw + 1e-6)), lignes: Math.max(1, Math.floor((h - 2 * marge) / lh + 1e-6)) };
  }, [mesure, police.corps, grille.interligne, grille.marge]);

  const colonnes = g?.colonnes ?? 120;
  const { pliage, numeros, liste, relister, invite: maniere } = reglages;
  const agence = reglages.markdown === 'agence';
  const parent = reglages.retour === 'entree';
  const options = useMemo<Options>(() => ({ colonnes, pliage, numeros, agence, liste, parent, relister, invite: maniere }), [colonnes, pliage, numeros, agence, liste, parent, relister, maniere]);

  const [ecran, dispatch] = useReducer(reduire, options, (premieres) => demarrer(premieres, depart));
  // When the settings change what is printed, the place one is at is printed again.
  const [imprime, setImprime] = useState(options);
  if (imprime !== options) {
    setImprime(options);
    dispatch({ type: 'rejouer', options });
  }

  const [saisie, setSaisie] = useState('');
  const [caret, setCaret] = useState(0);
  /** Where one is in the history, while recalling it. */
  const [rang, setRang] = useState<number | null>(null);
  /** A command typing itself. */
  const [frappe, setFrappe] = useState<{ texte: string; fait: number } | null>(null);
  const [actif, setActif] = useState(false);
  const [avance, setAvance] = useState<number | null>(null);

  const mots = MOTS[ecran.session.langue];
  const fleches = reglages.selection !== 'aucune';
  const occupe = frappe !== null || ecran.cache > 0;
  // Under a file read to its end, the folder's menu is there again: the arrows choose in it.
  const borne = ecran.vue === 'fichier' && ecran.listing !== null;
  const menuFin = borne && (avance === null || avance >= 100);
  const enListe = (ecran.vue === 'liste' && ecran.listing !== null) || menuFin;
  const elue = fleches && enListe ? ecran.listing?.entrees[ecran.choix] : undefined;
  const proposee = elue ? commandeOuvrir(ecran.session, elue, options) : null;
  const retour = commandeRetour(ecran.session, ecran.vue, options);
  const { vitesse, sortie } = reglages;

  const viser = () => {
    if (!tactile) champ.current?.focus({ preventScroll: true });
  };
  const ecrireSaisie = (texte: string) => {
    setSaisie(texte);
    setCaret(texte.length);
  };

  /** Runs a command; one that was not typed by hand types itself first. */
  const lancer = (commande: string | null, tape = true) => {
    viser();
    if (commande === null || occupe) return;
    ecrireSaisie('');
    setRang(null);
    if (tape && vitesse > 0 && !reduit()) setFrappe({ texte: commande, fait: 0 });
    else dispatch({ type: 'executer', commande, options, progressif: sortie === 'ligne' && !reduit() });
  };

  useEffect(() => {
    if (!frappe) return;
    const fini = frappe.fait >= frappe.texte.length;
    const attente = window.setTimeout(
      () => {
        if (!fini) return setFrappe({ ...frappe, fait: frappe.fait + 1 });
        setFrappe(null);
        dispatch({ type: 'executer', commande: frappe.texte, options, progressif: sortie === 'ligne' && !reduit() });
      },
      fini ? 140 : 1000 / vitesse,
    );
    return () => window.clearTimeout(attente);
  }, [frappe, options, vitesse, sortie]);

  // The answer, a few lines at each frame.
  useEffect(() => {
    if (ecran.cache <= 0) return;
    const image = requestAnimationFrame(() => dispatch({ type: 'reveler' }));
    return () => cancelAnimationFrame(image);
  }, [ecran.cache]);

  // A PDF is not shown: it opens beside.
  useEffect(() => {
    if (ecran.ouvre) window.open(ecran.ouvre.url, '_blank', 'noopener');
  }, [ecran.ouvre]);

  // A short answer leaves the prompt in view, as in any terminal; a long one is read from its command down.
  useLayoutEffect(() => {
    const el = zone.current;
    if (!el) return;
    const debuts = el.querySelectorAll<HTMLElement>('[data-debut]');
    // the room under the last line is what this answer has, not what the one before had
    lecture(el);
    const fond = el.scrollHeight - el.clientHeight;
    el.scrollTop = debuts.length ? Math.min(debuts[debuts.length - 1].offsetTop, fond) : fond;
  }, [ecran.lignes, ecran.cache, g, reglages.ecran]);

  // How far the last answer has been read, whenever it scrolls or grows.
  const pret = g !== null;
  useEffect(() => {
    const el = zone.current;
    if (!el || !pret) return;
    const relever = () => {
      const { haut, course } = lecture(el);
      setAvance(course > 1 ? Math.min(100, Math.max(0, Math.round(((el.scrollTop - haut) / course) * 100))) : null);
    };
    const taille = new ResizeObserver(relever);
    for (const enfant of el.children) taille.observe(enfant);
    el.addEventListener('scroll', relever, { passive: true });
    return () => {
      taille.disconnect();
      el.removeEventListener('scroll', relever);
    };
  }, [pret]);

  // What is being typed is in view; and on a touch screen the line that has the keys stays in
  // view when the keyboard comes out and takes half the screen from under it.
  const garde = tactile === true && actif;
  const cellules = garde ? g : null;
  useLayoutEffect(() => {
    const el = zone.current;
    const ligne = el?.querySelector<HTMLElement>('.m5-invite');
    if (!el || !ligne || !(saisie || frappe || garde)) return;
    const bas = ligne.offsetTop + ligne.offsetHeight;
    if (bas > el.scrollTop + el.clientHeight) el.scrollTop = bas - el.clientHeight;
    else if (ligne.offsetTop < el.scrollTop) el.scrollTop = ligne.offsetTop;
  }, [saisie, frappe, garde, cellules]);

  // Escape empties the line before it means anything else (in full screen, it closes it).
  useEffect(() => {
    const el = champ.current;
    if (!el) return;
    const vider = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !el.value) return;
      event.stopPropagation();
      event.preventDefault();
      setSaisie('');
      setCaret(0);
    };
    el.addEventListener('keydown', vider);
    return () => el.removeEventListener('keydown', vider);
  }, []);

  const rappeler = (pas: number) => {
    const h = ecran.historique;
    const suivant = rang === null ? (pas < 0 ? h.length - 1 : -1) : rang + pas;
    if (suivant < 0 && rang === null) return;
    if (suivant >= h.length) {
      setRang(null);
      return ecrireSaisie('');
    }
    setRang(Math.max(0, suivant));
    ecrireSaisie(h[Math.max(0, suivant)]);
  };

  const defiler = (lignes: number) => zone.current?.scrollBy({ top: lignes * (g?.lh ?? 18) });
  const page = (sens: number) => defiler(sens * Math.max(1, Math.floor((zone.current?.clientHeight ?? 0) / (g?.lh ?? 18)) - 2));
  const ouvrir = () => lancer(proposee, !reglages.suggestion);
  /** An arrow on an empty line: it chooses in the listing, and scrolls anything else. */
  const fleche = (pas: number, lignes = 3) => (enListe && !(menuFin && pas < 0 && ecran.choix === 0) ? dispatch({ type: 'choisir', pas }) : defiler(lignes * pas));

  const surTouche = (event: Touche<HTMLInputElement>) => {
    const { key } = event;
    const vide = saisie === '';
    const libre = fleches && vide && rang === null;
    const faire = (action: () => void) => {
      event.preventDefault();
      action();
    };
    if (occupe) {
      if (key !== 'Tab') event.preventDefault();
      return;
    }
    if (event.ctrlKey && !event.altKey && !event.metaKey) {
      const lettre = key.toLowerCase();
      if (lettre === 'l') faire(() => lancer('clear', false));
      if (lettre === 'c') faire(() => ecrireSaisie(''));
      if (lettre === 'p' || lettre === 'n') faire(() => rappeler(lettre === 'p' ? -1 : 1));
      return;
    }
    if (event.altKey || event.metaKey) return;
    if (key === 'Enter') faire(() => (vide && proposee ? ouvrir() : lancer(saisie, false)));
    // an empty line lets Tab go on to the next thing on the page
    else if (key === 'Tab' && !vide && !event.shiftKey) faire(() => ecrireSaisie(completer(ecran.session, saisie)));
    else if (key === 'ArrowUp' || key === 'ArrowDown') {
      const pas = key === 'ArrowUp' ? -1 : 1;
      faire(() => (!libre ? rappeler(pas) : fleche(pas)));
    } else if ((key === 'ArrowLeft' || key === 'Backspace') && libre) faire(() => lancer(retour));
    else if (key === 'ArrowRight' && libre && proposee) faire(ouvrir);
    else if (key === 'PageUp' || key === 'PageDown') faire(() => page(key === 'PageUp' ? -1 : 1));
    else if (key === ' ' && libre && !enListe) faire(() => page(1));
  };

  // One listener for the whole screen: a name carries its command, a key of the bar its action;
  // a click anywhere else gives the keys to the terminal, unless it was selecting text.
  const surClic = (event: MouseEvent) => {
    const touche = event.target instanceof Element ? event.target : null;
    const cible = touche?.closest<HTMLElement>('[data-commande], [data-touche], a') ?? null;
    if (tactile) {
      if (!cible && touche?.closest('.m5-invite')) champ.current?.focus({ preventScroll: true });
      else champ.current?.blur();
    }
    if (!cible) {
      if (window.getSelection()?.isCollapsed !== false) viser();
      return;
    }
    if (cible.dataset.commande !== undefined) return lancer(cible.dataset.commande);
    const actions: Record<string, () => void> = {
      retour: () => lancer(retour),
      choisir: () => dispatch({ type: 'choisir', pas: 1 }),
      haut: () => fleche(-1, 12),
      bas: () => fleche(1, 12),
      ouvrir,
      defiler: () => defiler(12),
      page: () => page(1),
      completer: () => ecrireSaisie(completer(ecran.session, saisie)),
      historique: () => rappeler(-1),
      lancer: () => lancer(saisie, false),
    };
    const action = cible.dataset.touche && actions[cible.dataset.touche];
    if (!action) return;
    action();
    viser();
  };

  const piece = (m: Morceau, i: number, vivante: boolean) => {
    if (m.cible) {
      const cible = m.cible;
      const choisie = vivante && fleches && enListe && m.rang === ecran.choix;
      return (
        <Fragment key={i}>
          {m.rang !== undefined && reglages.selection === 'chevron' && (
            <span className="m5-chevron" aria-hidden="true">
              {choisie ? '> ' : '  '}
            </span>
          )}
          <button
            type="button"
            className="m5-nom"
            data-sorte={m.sorte}
            data-elue={choisie ? '' : undefined}
            // only the names of the last listing are stops for Tab; the older ones still answer a click
            tabIndex={vivante || m.rang === undefined ? 0 : -1}
            data-commande={commandeOuvrir(ecran.session, cible, options) ?? undefined}
          >
            {m.texte}
          </button>
        </Fragment>
      );
    }
    if (m.href)
      return (
        <a key={i} className="m5-nom" data-sorte={m.sorte} href={m.href} target="_blank" rel="noreferrer">
          {m.texte}
        </a>
      );
    return (
      <span key={i} data-sorte={m.sorte}>
        {m.texte}
      </span>
    );
  };

  const tapee = frappe ? frappe.texte.slice(0, frappe.fait) : saisie;
  const place = frappe ? tapee.length : Math.min(caret, saisie.length);
  const visibles = ecran.cache > 0 ? ecran.lignes.slice(0, ecran.lignes.length - ecran.cache) : ecran.lignes;

  // The first line: the way back, and with the thread every folder of the path.
  const lu = ecran.vue === 'fichier' && ecran.fichier ? ecran.fichier : ecran.session.cwd;
  const fil = [[] as string[], ...lu.map((_, i) => lu.slice(0, i + 1))];

  // The last line: the keys that work here (each with the action a click on it does), or where one is.
  const touches: [string, keyof typeof mots, boolean?][] = !fleches
    ? [['⇥', 'completer'], ['↑↓', 'historique'], ['↵', 'lancer']]
    : enListe
      ? [['←', 'retour', !retour], ['↑↓', 'choisir'], ['↵', 'ouvrir']]
      : [['←', 'retour', !retour], ['↑↓', 'defiler'], [mots.espace, 'page']];
  const ailleurs = reglages.invite === 'chemin' || reglages.retour === 'fil';
  const etat = [ecran.session.langue, 'utf-8', ...(ailleurs ? [] : [ecrire(lu)])].join(' · ');
  const position = ecran.vue === 'fichier' && avance !== null ? `${avance} %` : g ? `${g.colonnes}×${g.lignes}` : '';

  const style = {
    '--corps': police.corps,
    '--graisse': police.graisse,
    '--chasse': police.chasse,
    '--g-commande': gris.commande,
    '--g-sortie': gris.sortie,
    '--g-meta': gris.meta,
    fontFamily: famille(police),
  } as CSSProperties;

  const cadre = g && ({ left: g.marge, top: g.marge, width: g.colonnes * g.cw, height: g.lignes * g.lh, '--cw': `${g.cw}px`, '--lh': `${g.lh}px`, '--marge': `${g.marge}px` } as CSSProperties);

  return (
    <div ref={racine} className="m2-ecran m5" data-habillage="etat" data-selection={reglages.selection} data-actif={actif ? '' : undefined} lang={ecran.session.langue} style={style} onClick={surClic}>
      <span className="m2-sonde" aria-hidden="true">
        {'0'.repeat(SONDE)}
      </span>
      <span className="m2-etalon" aria-hidden="true" />
      <input
        ref={champ}
        className="m5-champ"
        type="text"
        value={saisie}
        readOnly={occupe}
        aria-label={mots.ligne}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        onChange={(event) => {
          ecrireSaisie(event.target.value);
          setCaret(event.target.selectionStart ?? event.target.value.length);
          setRang(null);
        }}
        onSelect={(event) => setCaret(event.currentTarget.selectionStart ?? 0)}
        onKeyDown={surTouche}
        enterKeyHint={tactile ? 'go' : undefined}
        onFocus={() => setActif(true)}
        onBlur={() => setActif(false)}
      />
      {g && cadre && (
        <div className="m2-grille" style={cadre}>
          {(reglages.retour === 'fil' || reglages.retour === 'fleche') && (
            <nav className="m2-barre m5-fil" aria-label={mots.chemin}>
              <span>
              <button type="button" className="m5-nom" disabled={!retour} aria-label={mots.retour} data-touche="retour">
                ←{reglages.retour === 'fleche' && ` ${mots.retour}`}
              </button>
              {reglages.retour === 'fil' &&
                fil.map((chemin, i) => (
                  <Fragment key={i}>
                    {i === 0 ? '  ' : '/'}
                    {i === fil.length - 1 ? (
                      <span data-sorte="commande" aria-current="page">
                        {chemin[i - 1] ?? '~'}
                      </span>
                    ) : (
                      <button type="button" className="m5-nom" data-sorte="sortie" data-commande={commandeOuvrir(ecran.session, chemin, options) ?? undefined}>
                        {chemin[i - 1] ?? '~'}
                      </button>
                    )}
                  </Fragment>
                ))}
              </span>
              {entete}
            </nav>
          )}
          <div ref={zone} className="m5-defile" data-borne={borne ? '' : undefined}>
            <div role="log" aria-label={mots.sortie}>
              {visibles.map((ligne) => (
                <div key={ligne.id} className="m2-ligne" data-debut={ligne.debut ? '' : undefined} data-liste={ligne.liste === undefined ? undefined : ligne.liste === ecran.listing?.id ? 'vive' : ''}>
                  {ligne.morceaux.map((m, i) => piece(m, i, ligne.liste !== undefined && ligne.liste === ecran.listing?.id))}
                </div>
              ))}
            </div>
            {ecran.cache === 0 && (
              <div className="m2-ligne m5-invite" aria-hidden="true">
                <span data-sorte="invite">{invite(ecran.session, reglages.invite)}</span>
                <span data-sorte="commande">{tapee.slice(0, place)}</span>
                <span className="m2-curseur" data-forme={curseur.maniere} data-clignote={curseur.clignote && actif ? '' : undefined}>
                  {tapee[place] ?? ' '}
                </span>
                <span data-sorte="commande">{tapee.slice(place + 1)}</span>
                {reglages.suggestion && proposee && tapee === '' && <span className="m5-suggestion">{proposee}</span>}
              </div>
            )}
            {/* room under the last line, so that each command can start at the top of the screen */}
            {reglages.ecran === 'neuf' && <div className="m5-neuf" aria-hidden="true" />}
          </div>
          {pied ? (
            pied({ langue: ecran.session.langue, chemin: ecrire(lu), position, enListe, retour: retour !== null })
          ) : (
          <div className="m2-barre m5-bas">
            {reglages.touches ? (
              <span className="m5-touches">
                {touches.map(([touche, action, inactive]) => (
                  <button key={action} type="button" className="m5-touche" disabled={inactive} data-touche={action}>
                    <kbd>{touche}</kbd> {mots[action]}
                  </button>
                ))}
              </span>
            ) : (
              <span>{etat}</span>
            )}
            <span>{reglages.touches ? `${etat} · ${position}` : position}</span>
          </div>
          )}
        </div>
      )}
    </div>
  );
}
