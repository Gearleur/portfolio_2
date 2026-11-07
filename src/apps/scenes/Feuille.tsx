import type { CSSProperties } from 'react';
import { Icon } from '../../shared/mikky-ui/Icon';

/*
 * The whiteboard of the Whiteboard AMDEC scenes: a spreadsheet, AMDEC.xlsx,
 * lettered columns and numbered rows. Empty first, then filled, then agents
 * writing in it, over a ground of fine dots. What the cells say is never
 * readable: grey bars, coloured tags and dots. Sizes are in u, on a 560 × 288
 * window; the sheet sits 24 from the sides and the bottom, on the 12 u lattice
 * of the dots.
 */

type Couleur = 'blue' | 'purple' | 'amber' | 'green' | 'red';

const COLONNES = [126, 112, 94, 82, 70];
const NUM = 28;
const TETE = 22;
const LIGNE = 26;
const LIGNES = 7;
const GX = 24;
const GY = 60;
const DEBUTS = COLONNES.map((_, i) => COLONNES.slice(0, i).reduce((a, b) => a + b, 0));

const GRAVITE: Couleur[] = ['green', 'amber', 'red', 'amber', 'green', 'red'];
const BARRES = [
  [96, 70, 28],
  [84, 82, 24],
  [100, 56, 32],
  [76, 74, 26],
  [90, 62, 30],
  [82, 68, 22],
];

const u = (n: number) => `calc(${n} * var(--u))`;
const place = (x: number, y: number, w?: number, h?: number): CSSProperties => ({
  left: u(x),
  top: u(y),
  ...(w === undefined ? {} : { width: u(w) }),
  ...(h === undefined ? {} : { height: u(h) }),
});

const Barre = ({ w, fort = false }: { w: number; fort?: boolean }) => (
  <span className={fort ? 'fe-barre fe-barre--fort' : 'fe-barre'} style={{ width: u(w) }} />
);

/** What a cell holds, by column; the first row holds the titles. */
function Contenu({ ligne, colonne }: { ligne: number; colonne: number }) {
  if (ligne === 0) return <Barre w={[58, 44, 50, 38, 30][colonne]} fort />;
  const [a, b, d] = BARRES[ligne - 1];
  const couleur = GRAVITE[ligne - 1];
  const style = { '--c': `var(--${couleur})` } as CSSProperties;
  switch (colonne) {
    case 0:
      return <Barre w={a} />;
    case 1:
      return <Barre w={b} />;
    case 2:
      return (
        <span className="fe-etiquette" style={style}>
          <Barre w={20} />
        </span>
      );
    case 3:
      return <Barre w={d} />;
    default:
      return <span className="fe-etat" style={style} />;
  }
}

/** The agents: the cell each writes in, in its colour, and its pointer. */
const AGENTS: { ligne: number; colonne: number; couleur: Couleur }[] = [
  { ligne: 2, colonne: 1, couleur: 'blue' },
  { ligne: 3, colonne: 0, couleur: 'purple' },
  { ligne: 4, colonne: 2, couleur: 'amber' },
  { ligne: 5, colonne: 3, couleur: 'green' },
];

function Agent({ ligne, colonne, couleur }: { ligne: number; colonne: number; couleur: Couleur }) {
  const x = GX + NUM + DEBUTS[colonne];
  const y = GY + TETE + LIGNE * ligne;
  const w = COLONNES[colonne];
  return (
    <div style={{ '--c': `var(--${couleur})` } as CSSProperties}>
      <span className="fe-cible" style={place(x, y, w, LIGNE)} />
      <span className="fe-pointeur" style={place(x + w * 0.52, y + LIGNE * 0.55)}>
        <svg viewBox="0 0 20 24" aria-hidden="true">
          <path d="M2 2v17l4.6-4.3 3.1 7 3-1.3-3.1-6.9H16z" />
        </svg>
        <span className="fe-nom">
          <span />
        </span>
      </span>
    </div>
  );
}

export function Feuille({ contenu = false, curseurs = false }: { contenu?: boolean; curseurs?: boolean }) {
  return (
    <div className="fe mk-island">
      <div className="fe-titre">
        <span className="mk-bar">
          <Icon name="table" />
          <span className="mk-bar__title">AMDEC.xlsx</span>
        </span>
      </div>
      <div className="fe-grille" style={place(GX, GY, NUM + COLONNES.reduce((a, b) => a + b, 0))}>
        <div className="fe-ligne fe-ligne--lettres" style={{ height: u(TETE) }}>
          <span className="fe-num" style={{ width: u(NUM) }} />
          {COLONNES.map((w, c) => (
            <span key={c} className="fe-lettre" style={{ width: u(w) }}>
              {'ABCDE'[c]}
            </span>
          ))}
        </div>
        {Array.from({ length: LIGNES }, (_, r) => (
          <div key={r} className={r === 0 && contenu ? 'fe-ligne fe-ligne--titres' : 'fe-ligne'} style={{ height: u(LIGNE) }}>
            <span className="fe-num" style={{ width: u(NUM) }}>
              {r + 1}
            </span>
            {COLONNES.map((w, c) => (
              <span key={c} className="fe-case" style={{ width: u(w) }}>
                {contenu && r <= BARRES.length && <Contenu ligne={r} colonne={c} />}
              </span>
            ))}
          </div>
        ))}
      </div>
      {curseurs && AGENTS.map((agent) => <Agent key={agent.couleur} {...agent} />)}
    </div>
  );
}
