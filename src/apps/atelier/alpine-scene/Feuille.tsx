import type { CSSProperties } from 'react';
import { Icon } from '../../../shared/mikky-ui/Icon';
import { AGENTS_FIXES, BARRES, COLONNES, COULEUR_LIGNE, DEBUTS, GRAVITE, GX, GY, LIGNE, LIGNES, NUM, TETE, TRAVAIL } from './feuille-geo';
import './feuille.css';

/*
 * The whiteboard of the Whiteboard AMDEC scene: a spreadsheet, AMDEC.xlsx,
 * lettered columns and numbered rows, over a ground of fine dots. Empty
 * first, then filled, then agents writing in it. What the cells say is never
 * readable: grey bars, coloured tags and dots. Sizes are in u, on a 560 × 288
 * window; the sheet sits 24 from the sides and the bottom, on the 12 u lattice
 * of the dots. With `anime`, the parts carry the hooks the choreography moves.
 */

const u = (n: number) => `calc(${n} * var(--u))`;
const place = (x: number, y: number, w?: number, h?: number): CSSProperties => ({
  left: u(x),
  top: u(y),
  ...(w === undefined ? {} : { width: u(w) }),
  ...(h === undefined ? {} : { height: u(h) }),
});

const Barre = ({ w, fort = false }: { w: number; fort?: boolean }) => (
  <span className={fort ? 'fe-barre fe-barre--fort' : 'fe-barre'} data-anim="barre" style={{ width: u(w) }} />
);

/** What a cell holds, by column; the first row holds the titles. */
function Contenu({ ligne, colonne }: { ligne: number; colonne: number }) {
  if (ligne === 0) return <Barre w={[58, 44, 50, 38, 30][colonne]} fort />;
  const [a, b, d] = BARRES[ligne - 1];
  const style = { '--c': `var(--${GRAVITE[ligne - 1]})` } as CSSProperties;
  switch (colonne) {
    case 0:
      return <Barre w={a} />;
    case 1:
      return <Barre w={b} />;
    case 2:
      return (
        <span className="fe-etiquette" data-anim="pop" style={style}>
          <Barre w={20} />
        </span>
      );
    case 3:
      return <Barre w={d} />;
    default:
      return <span className="fe-etat" data-anim="pop" style={style} />;
  }
}

/** A pointer, in an agent's colour, with its name tag. */
function Pointeur({ couleur, style, anime = false }: { couleur: string; style?: CSSProperties; anime?: boolean }) {
  return (
    <span
      className={anime ? 'fe-pointeur fe-pointeur--anime' : 'fe-pointeur'}
      data-agent={anime ? couleur : undefined}
      style={{ '--c': `var(--${couleur})`, ...style } as CSSProperties}
    >
      {anime && <span className="fe-onde" />}
      <svg viewBox="0 0 10 14" aria-hidden="true">
        <path d="M0 0V14L1.75 12.25L3.5 10.5L6.75 10.25L10 10L5 5Z" />
      </svg>
      <span className="fe-nom">
        <span />
      </span>
    </span>
  );
}

export function Feuille({
  contenu = false,
  curseurs = false,
  anime = false,
}: {
  contenu?: boolean;
  curseurs?: boolean;
  anime?: boolean;
}) {
  return (
    <div className="fe mk-island" data-k="feuille">
      <div className="fe-pts" data-k="pts" />
      <div className="fe-titre">
        <span className="mk-bar" data-k="capsule">
          <Icon name="table" />
          <span className="mk-bar__title">AMDEC.xlsx</span>
        </span>
      </div>
      <div className="fe-grille" data-k="grille" style={place(GX, GY, NUM + COLONNES.reduce((a, b) => a + b, 0))}>
        <div className="fe-ligne fe-ligne--lettres" style={{ height: u(TETE) }}>
          <span className="fe-num" style={{ width: u(NUM) }} />
          {COLONNES.map((w, c) => (
            <span key={c} className="fe-lettre" data-role="lettre" style={{ width: u(w) }}>
              {'ABCDE'[c]}
            </span>
          ))}
        </div>
        {Array.from({ length: LIGNES }, (_, r) => (
          <div key={r} className={r === 0 && contenu ? 'fe-ligne fe-ligne--titres' : 'fe-ligne'} style={{ height: u(LIGNE) }}>
            <span className="fe-num" data-role="num" style={{ width: u(NUM) }}>
              {r + 1}
            </span>
            {COLONNES.map((w, c) => (
              <span key={c} className="fe-case" data-l={r} data-c={c} style={{ width: u(w) }}>
                {contenu && r <= BARRES.length && <Contenu ligne={r} colonne={c} />}
                {anime && COULEUR_LIGNE.has(r) && (
                  <span className="fe-sel" style={{ '--c': `var(--${COULEUR_LIGNE.get(r)})` } as CSSProperties} />
                )}
              </span>
            ))}
          </div>
        ))}
      </div>
      {curseurs &&
        !anime &&
        AGENTS_FIXES.map(({ ligne, colonne, couleur }) => {
          const x = GX + NUM + DEBUTS[colonne];
          const y = GY + TETE + LIGNE * ligne;
          const w = COLONNES[colonne];
          return (
            <div key={couleur} style={{ '--c': `var(--${couleur})` } as CSSProperties}>
              <span className="fe-cible" style={place(x, y, w, LIGNE)} />
              <Pointeur couleur={couleur} style={place(x + w * 0.52, y + LIGNE * 0.55)} />
            </div>
          );
        })}
      {anime && TRAVAIL.map(({ couleur }) => <Pointeur key={couleur} couleur={couleur} anime />)}
    </div>
  );
}
