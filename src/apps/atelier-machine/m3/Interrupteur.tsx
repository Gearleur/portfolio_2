import { useRef } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent, ReactNode } from 'react';
import { grainImage, GRAIN_TILE } from '../../atelier/grain';
import { FOND } from '../../atelier/tokens';
import { elan, geometrie, retombe } from './retenu';
import type { Reglages } from './reglages';
import './m3.css';

/*
 * The Human / Machine switch (step M3): a pill, a big round knob, a sunken window. One control,
 * a real one: a button with the role of a switch, which a click, Space or Enter toggles, the
 * arrows set, and whose knob can be dragged and falls to the nearest side when let go.
 *
 * The knob's place is one number, --p (0 Human, 1 Machine), registered in m3.css so that the
 * browser can animate it: everything that moves or changes colour is computed from it. While the
 * knob is dragged the number is written straight to the element, no render in between.
 */

/** Px a pointer must travel before a press is a drag and no longer a click. */
const SEUIL = 4;

type Geste = { id: number; x: number; depart: number; course: number; p: number; glisse: boolean };

// The paper's own grain (step 1 of the Atelier), for the matt pill and the petal.
const GRAIN = grainImage(FOND.grain);

/** What the knob carries on each side. */
const PORTE: Record<Reglages['porte'], [string, string] | null> = {
  mot: ['Humain', 'Machine'],
  signe: ['Aa', '>_'],
  chiffre: ['0', '1'],
  rien: null,
};

/** The other side as the Machine shows it: the Vitrine's headline, printed by a terminal. */
function Terminal({ nom }: { nom: boolean }) {
  return (
    <span className="m3-fragment m3-terminal">
      {nom ? (
        <span className="m3-ligne">
          <i>$ </i>machine <b className="m3-bloc" />
        </span>
      ) : (
        <>
          <span className="m3-ligne">
            <i>$ </i>cat a-propos.md
          </span>
          <span className="m3-ligne">AI engineer, du prototype</span>
          <span className="m3-ligne">
            à la production <b className="m3-bloc" />
          </span>
        </>
      )}
    </span>
  );
}

/** The other side as the human page sets it: the same headline in its serif, highlighted. */
function Papier({ nom }: { nom: boolean }) {
  return (
    <span className="m3-fragment m3-papier">
      {nom ? (
        <span className="m3-titre">
          <mark>Humain</mark>
          <b className="m3-point" />
        </span>
      ) : (
        <span className="m3-titre">
          du prototype
          <br />à la <mark>production</mark>
          <b className="m3-point" />
        </span>
      )}
    </span>
  );
}

type Props = {
  /** The mode: false is the human page, true the terminal. */
  machine: boolean;
  onChange: (machine: boolean) => void;
  reglages: Reglages;
  /** The terminal's own face (M2), for what the switch writes in the machine's hand. */
  mono: string;
};

export function Interrupteur({ machine, onChange, reglages: r, mono }: Props) {
  const racine = useRef<HTMLDivElement>(null);
  const geste = useRef<Geste | null>(null);
  // The click a browser sends after a drag is not a click.
  const avale = useRef(false);
  const g = geometrie(r);

  const basculer = (vers: boolean) => {
    if (vers === machine) return;
    if (r.vibration) {
      try {
        navigator.vibrate?.(10);
      } catch {
        // A browser may refuse it; the switch works the same.
      }
    }
    onChange(vers);
  };

  const debut = (event: PointerEvent<HTMLButtonElement>) => {
    const el = racine.current;
    if (!el || (event.pointerType === 'mouse' && event.button !== 0)) return;
    avale.current = false;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Without capture the drag still works while the pointer stays over the pill.
    }
    // The pill's px on screen: the bench scales the page, full screen does not.
    const u = el.getBoundingClientRect().width / r.largeur; // the scale of the page times the object's own
    const depart = machine ? 1 : 0;
    geste.current = { id: event.pointerId, x: event.clientX, depart, course: g.course * u, p: depart, glisse: false };
    el.setAttribute('data-presse', '');
  };

  const suite = (event: PointerEvent<HTMLButtonElement>) => {
    const en = geste.current;
    const el = racine.current;
    if (!en || !el || en.id !== event.pointerId) return;
    const dx = event.clientX - en.x;
    if (!en.glisse && Math.abs(dx) < SEUIL) return;
    en.glisse = true;
    en.p = Math.min(1, Math.max(0, en.depart + dx / en.course));
    el.setAttribute('data-glisse', '');
    el.style.setProperty('--p', en.p.toFixed(4));
  };

  const fin = (event: PointerEvent<HTMLButtonElement>, annule: boolean) => {
    const en = geste.current;
    const el = racine.current;
    if (!en || !el || en.id !== event.pointerId) return;
    geste.current = null;
    el.removeAttribute('data-presse');
    // A press that did not travel is a click: the click event toggles.
    if (!en.glisse) return;
    avale.current = !annule;
    const vers = annule ? machine : retombe(en.p);
    // The slide comes back before the number lands: the knob glides from where it was let go.
    el.removeAttribute('data-glisse');
    el.style.setProperty('--p', vers ? '1' : '0');
    basculer(vers);
  };

  const clic = () => {
    if (avale.current) {
      avale.current = false;
      return;
    }
    basculer(!machine);
  };

  const touche = (event: KeyboardEvent<HTMLButtonElement>) => {
    // Space and Enter are the button's own click; the arrows say which side.
    avale.current = false;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    basculer(event.key === 'ArrowRight');
  };

  const style = {
    '--p': machine ? 1 : 0,
    '--L': r.largeur,
    '--H': r.hauteur,
    '--echelle': r.echelle,
    '--retrait': g.retrait,
    '--D': g.bouton,
    '--course': g.course,
    '--joint': g.joint,
    '--rayon': r.rayon,
    '--relief': r.relief,
    '--k': r.coquelicot,
    '--bas': r.bas,
    '--duree': r.duree,
    '--elan': elan(r.elasticite),
    '--mono': mono,
    '--grain': GRAIN,
    '--grain-taille': `${GRAIN_TILE}px`,
  } as CSSProperties;

  const porte = PORTE[r.porte];
  const nom = r.libelles === 'fenetre';
  // The judas shows the other side; the other windows can name the side one is on.
  const vues: [ReactNode, ReactNode] =
    r.fenetre === 'judas'
      ? [<Papier key="h" nom={nom} />, <Terminal key="m" nom={nom} />]
      : nom
        ? [
            <span key="m" className="m3-fragment m3-nom">
              machine
            </span>,
            <span key="h" className="m3-fragment m3-nom">
              humain
            </span>,
          ]
        : [null, null];

  return (
    <div ref={racine} className="m3-inter" data-matiere={r.matiere} data-fenetre={r.fenetre} data-forme={r.forme} data-porte={r.porte} style={style}>
      {r.libelles === 'cotes' && (
        <>
          <span className="m3-cote" data-cote="humain" data-cursor="" aria-hidden="true" onClick={() => basculer(false)}>
            Humain
          </span>
          <span className="m3-cote" data-cote="machine" data-cursor="" aria-hidden="true" onClick={() => basculer(true)}>
            Machine
          </span>
        </>
      )}
      <button
        type="button"
        className="m3-pilule"
        role="switch"
        aria-checked={machine}
        aria-label="Mode Machine"
        onPointerDown={debut}
        onPointerMove={suite}
        onPointerUp={(event) => fin(event, false)}
        onPointerCancel={(event) => fin(event, true)}
        onClick={clic}
        onKeyDown={touche}
      >
        {/* Left of the knob once it has crossed: seen on the Machine side. */}
        <span className="m3-fenetre" data-cote="gauche" aria-hidden="true">
          <span className="m3-vue">{vues[0]}</span>
        </span>
        {/* Right of the knob at rest: seen on the Human side. */}
        <span className="m3-fenetre" data-cote="droite" aria-hidden="true">
          <span className="m3-vue">{vues[1]}</span>
        </span>
        <span className="m3-bouton" aria-hidden="true">
          {porte && (
            <>
              <span className="m3-porte" data-cote="humain">
                {porte[0]}
              </span>
              <span className="m3-porte" data-cote="machine">
                {porte[1]}
              </span>
            </>
          )}
        </span>
      </button>
    </div>
  );
}
