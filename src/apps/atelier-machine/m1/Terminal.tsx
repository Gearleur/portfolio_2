import { useId, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { GRAIN_TILE, grainImage } from '../../atelier/grain';
import { FOND } from '../../atelier/tokens';
import { pleine } from './reglages';
import type { Verre } from './reglages';

/*
 * The terminal of the Machine state (step M1): a pane of dark smoked glass over the erased
 * page, showing the files at hand with a plain `ls`. A still: nothing is typed, nothing blinks.
 * The words are in the most common terminal face of each system (the type itself is step M2's).
 */

type Morceau = ['invite' | 'commande' | 'sourd' | 'nom' | 'dossier', string];

const INVITE: Morceau = ['invite', 'visiteur@alexandre-teixeira:~$ '];
const fichier = (droits: string, taille: string, date: string, nom: string, dossier = false): Morceau[] => [
  ['sourd', `${droits} alexandre  staff ${taille.padStart(5)}  ${date.padStart(13)}  `],
  [dossier ? 'dossier' : 'nom', nom],
];

// Plausible, not final: the folders and their words are step M5's.
const ECRAN: Morceau[][] = [
  [INVITE, ['commande', 'ls']],
  [['nom', 'README.md'], ['sourd', '  '], ['dossier', 'en/'], ['sourd', '  '], ['dossier', 'fr/']],
  [],
  [INVITE, ['commande', 'ls -lh fr/']],
  [['sourd', 'total 196K']],
  fichier('-rw-r--r--  1', '2,4K', '19 nov. 12:04', 'a-propos.md'),
  fichier('-rw-r--r--  1', '412', '19 nov. 12:04', 'contact.md'),
  fichier('-rw-r--r--  1', '186K', '9 nov. 18:30', 'cv.pdf'),
  fichier('drwxr-xr-x  6', '192', '19 nov. 11:23', 'projets/', true),
  [],
  [INVITE, ['commande', 'ls -lh fr/projets/']],
  [['sourd', 'total 92K']],
  fichier('-rw-r--r--  1', '21K', '6 nov. 16:20', '01-whiteboard-amdec.md'),
  fichier('-rw-r--r--  1', '24K', '6 nov. 14:02', '02-sncf-gpt.md'),
  fichier('-rw-r--r--  1', '15K', '9 nov. 17:45', '03-synthese-de-reunions.md'),
  fichier('-rw-r--r--  1', '17K', '19 nov. 10:12', '04-dessiner-avec-l-ia.md'),
  [],
];

/** The smoke's colour: night blue, neutral or bronze, always dark. */
function fumee({ teinte, opacite }: Pick<Verre, 'teinte' | 'opacite'>) {
  const chroma = (Math.abs(teinte) * 0.034).toFixed(3);
  return `oklch(0.19 ${chroma} ${teinte < 0 ? 262 : 62} / ${opacite})`;
}

// Chromium bends a backdrop with an SVG filter; elsewhere the slab keeps its tint and its blur.
const COURBE = typeof CSS !== 'undefined' && CSS.supports('backdrop-filter', 'url(#a)');

/** The slab's bevel, px of a 1440 px page, and how far it pushes the page. */
const BISEAU = 30;
const POUSSEE = 44;

/**
 * The slab's refraction, made like the phone notch's (FiltreVerre.tsx): a displacement map,
 * neutral grey in the middle, pushing the page inward along each edge. This one is drawn to
 * the window's size, so the bevel keeps its width whatever the window's.
 */
function Refraction({ id, largeur, hauteur, u }: { id: string; largeur: number; hauteur: number; u: number }) {
  const carte = useMemo(() => {
    const l = largeur;
    const h = hauteur;
    const b = BISEAU;
    return encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='${l}' height='${h}'>` +
        `<defs>` +
        `<linearGradient id='g' x1='0' x2='1' y1='0' y2='0'><stop offset='0' stop-color='rgb(255,128,128)'/><stop offset='1' stop-color='rgb(128,128,128)'/></linearGradient>` +
        `<linearGradient id='d' x1='0' x2='1' y1='0' y2='0'><stop offset='0' stop-color='rgb(128,128,128)'/><stop offset='1' stop-color='rgb(0,128,128)'/></linearGradient>` +
        `<linearGradient id='h' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='rgb(128,255,128)'/><stop offset='1' stop-color='rgb(128,128,128)'/></linearGradient>` +
        `<linearGradient id='b' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='rgb(128,128,128)'/><stop offset='1' stop-color='rgb(128,0,128)'/></linearGradient>` +
        `</defs>` +
        `<rect width='${l}' height='${h}' fill='rgb(128,128,128)'/>` +
        `<rect width='${b}' height='${h}' fill='url(#g)'/><rect x='${l - b}' width='${b}' height='${h}' fill='url(#d)'/>` +
        `<rect width='${l}' height='${b}' fill='url(#h)' opacity='.8'/><rect y='${h - b}' width='${l}' height='${b}' fill='url(#b)' opacity='.8'/>` +
        `</svg>`,
    );
  }, [largeur, hauteur]);
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <filter id={id} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
        <feImage href={`data:image/svg+xml;charset=utf-8,${carte}`} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="carte" />
        <feDisplacementMap in="SourceGraphic" in2="carte" scale={POUSSEE * u} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

// The frost of the glass: the paper's own grain recipe, in light specks.
const GIVRE = grainImage(FOND.grain);

export function Terminal({ verre, u }: { verre: Verre; u: number }) {
  const id = `${useId().replace(/[^\w-]/g, '')}-dalle`;
  const dalle = verre.maniere === 'dalle' && COURBE;
  const flou = 'blur(calc(var(--flou) * var(--u)))';
  // Its size is px of a 1440 × 900 screen, never more than the screen; at the end of its slider, the whole side.
  const cote = (nom: 'largeur' | 'hauteur', tout: string) => (pleine(nom, verre[nom]) ? tout : `min(${tout}, calc(${verre[nom]} * var(--u)))`);
  const style = {
    '--l': cote('largeur', '100cqw'),
    '--h': cote('hauteur', '100cqh'),
    '--x': verre.x,
    '--y': verre.y,
    '--flou': verre.flou,
    '--fumee': fumee(verre),
    '--givre': GIVRE,
    '--givre-taille': `${GRAIN_TILE}px`,
    WebkitBackdropFilter: flou,
    backdropFilter: dalle ? `url(#${id}) ${flou}` : flou,
  } as CSSProperties;

  return (
    <div className="m1-terminal" data-verre={verre.maniere} data-curseur={verre.curseur} style={style} role="img" aria-label="Terminal : la liste des fichiers à disposition">
      {dalle && <Refraction id={id} largeur={verre.largeur} hauteur={verre.hauteur} u={u} />}
      {verre.maniere === 'depoli' && <p className="m1-terminal__barre">visiteur@alexandre-teixeira: ~</p>}
      <div className="m1-terminal__ecran">
        <pre className="m1-terminal__texte" aria-hidden="true">
          {ECRAN.map((ligne, i) => (
            <span key={i} className="m1-terminal__ligne">
              {ligne.map(([sorte, texte], j) => (
                <span key={j} data-sorte={sorte}>
                  {texte}
                </span>
              ))}
              {'\n'}
            </span>
          ))}
          <span data-sorte="invite">{INVITE[1]}</span>
          <span className="m1-terminal__curseur" />
        </pre>
      </div>
    </div>
  );
}
