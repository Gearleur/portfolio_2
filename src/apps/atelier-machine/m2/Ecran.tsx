import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { composer } from './contenu';
import { FACES, INVITES, PILES, famille } from './reglages';
import type { Police, Reglages, Vu } from './reglages';
import './m2.css';

/*
 * The terminal's screen (step M2), drawn inside M1's sheet of glass. It works as a terminal
 * does: it measures its cell (the face's advance, the line's height), counts the columns and
 * the rows that fit, and lays the lines on that grid. A still: nothing is typed.
 */

/** How many zeros the cell is measured on. */
const SONDE = 50;

/** The first face of a stack this computer has: a word set in it is not as wide as in the fallbacks. */
function premiere(pile: string[]) {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return undefined;
  const large = (police: string) => {
    ctx.font = `72px ${police}`;
    return ctx.measureText('mmmmmmmmmmlli10').width;
  };
  const [serif, sans] = [large('serif'), large('sans-serif')];
  const citee = (police: string) => (police === 'ui-monospace' ? police : `'${police}'`);
  return pile.find((police) => large(`${citee(police)}, serif`) !== serif || large(`${citee(police)}, sans-serif`) !== sans);
}

function nomPolice(maniere: Police['maniere'], face: Police['face']) {
  if (maniere === 'embarquee') return FACES.find((f) => f.id === face)?.nom ?? face;
  const trouvee = premiere(PILES[maniere]);
  return trouvee === 'ui-monospace' ? 'la mono du système (ui-monospace)' : (trouvee ?? 'la mono par défaut du navigateur');
}

type Mesure = { l: number; h: number; cw: number; u: number };

type Props = {
  reglages: Reglages;
  /** The cells drawn over the screen. */
  cellules: boolean;
  /** Told what the screen measured, whenever it changes. */
  onVu?: (vu: Vu) => void;
};

export function Ecran({ reglages, cellules, onVu }: Props) {
  const { police, grille, gris, curseur, habillage } = reglages;
  const racine = useRef<HTMLDivElement>(null);
  const [mesure, setMesure] = useState<Mesure | null>(null);

  // The glass's size, the cell's width and the page's scale, read again whenever one of them moves
  // (a slider, the face once loaded, the window).
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

  const nom = useMemo(() => nomPolice(police.maniere, police.face), [police.maniere, police.face]);

  // The grid: as many whole cells as fit between the margins, or just the measure.
  const ecran = useMemo(() => {
    if (!mesure) return null;
    const { l, h, cw, u } = mesure;
    const lh = police.corps * grille.interligne * u;
    const marge = grille.marge * u;
    const libres = Math.max(1, Math.floor((l - 2 * marge) / cw + 1e-6));
    const colonnes = grille.maniere === 'pleine' ? libres : Math.min(grille.colonnes, libres);
    const lignes = Math.max(1, Math.floor((h - 2 * marge) / lh + 1e-6));
    const x = grille.maniere === 'centree' ? Math.round((l - colonnes * cw) / 2) : marge;
    return { cw, lh, u, colonnes, lignes, x, y: marge, mesure: Math.min(colonnes, grille.colonnes) };
  }, [mesure, police.corps, grille]);

  const texte = useMemo(
    () => (ecran ? composer({ invite: habillage.invite, aeree: grille.aeree }, ecran.colonnes, ecran.mesure) : []),
    [ecran, habillage.invite, grille.aeree],
  );

  const [colonnes, lignes] = [ecran?.colonnes ?? 0, ecran?.lignes ?? 0];
  const largeur = ecran ? Math.round((ecran.cw / ecran.u) * 10) / 10 : 0;
  const hauteur = ecran ? Math.round((ecran.lh / ecran.u) * 10) / 10 : 0;
  useEffect(() => {
    if (colonnes) onVu?.({ police: nom, colonnes, lignes, cellule: [largeur, hauteur] });
  }, [onVu, nom, colonnes, lignes, largeur, hauteur]);

  const style = {
    '--corps': police.corps,
    '--graisse': police.graisse,
    '--chasse': police.chasse,
    '--g-commande': gris.commande,
    '--g-sortie': gris.sortie,
    '--g-meta': gris.meta,
    fontFamily: famille(police),
  } as CSSProperties;

  const cadre = ecran &&
    ({
      left: ecran.x,
      top: ecran.y,
      width: ecran.colonnes * ecran.cw,
      height: ecran.lignes * ecran.lh,
      '--cw': `${ecran.cw}px`,
      '--lh': `${ecran.lh}px`,
      '--mesure': ecran.mesure,
    } as CSSProperties);

  return (
    <div ref={racine} className="m2-ecran" data-habillage={habillage.maniere} style={style}>
      <span className="m2-sonde" aria-hidden="true">
        {'0'.repeat(SONDE)}
      </span>
      <span className="m2-etalon" aria-hidden="true" />
      {ecran && cadre && (
        <div className="m2-grille" style={cadre} aria-hidden="true">
          {habillage.maniere === 'cadre' && (
            <p className="m2-barre">
              <span>visiteur@alexandre-teixeira: ~</span>
            </p>
          )}
          <div className="m2-texte">
            <pre className="m2-lignes">
              {texte.map((ligne, i) => (
                <span key={i} className="m2-ligne">
                  {ligne.map(([sorte, mots], j) => (
                    <span key={j} data-sorte={sorte}>
                      {mots}
                    </span>
                  ))}
                </span>
              ))}
              <span className="m2-ligne">
                <span data-sorte="invite">{INVITES[habillage.invite]}</span>
                <span className="m2-curseur" data-forme={curseur.maniere} data-clignote={curseur.clignote ? '' : undefined}>
                  {' '}
                </span>
              </span>
            </pre>
          </div>
          {habillage.maniere !== 'nu' && (
            <p className="m2-barre">
              <span>fr · utf-8</span>
              <span>
                {ecran.colonnes}×{ecran.lignes}
              </span>
            </p>
          )}
          {cellules && <span className="m2-cellules" />}
        </div>
      )}
    </div>
  );
}
