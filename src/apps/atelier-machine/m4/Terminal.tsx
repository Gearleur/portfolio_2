import { memo } from 'react';
import type { CSSProperties } from 'react';
import { RETENU as MATIERE, pleine } from '../m1/retenu';
import { RETENU as TYPO } from '../m2/retenu';
import type { Reglages as Type } from '../m2/reglages';
import { Console } from '../m5/Console';
import type { ConsoleProps } from '../m5/Console';
import { RETENU as CONTENU } from '../m5/retenu';
import type { Reglages as Contenu } from '../m5/reglages';
import { BANDE } from './retenu';
import type { Depart } from '../m5/shell';
import '../m1/verre.css';
import './m4.css';

/*
 * The terminal of the passage (step M4): the console that works (M5), in the type retained at
 * M2, inside M1's sheet of smoked glass, without the page that sheet was laid on at M1: the
 * black and the number show through. Shared by the bench's stage (Scene.tsx) and by the
 * Vitrine's Machine mode (portfolio/machine), which opens it in the page's language and on the
 * project being read.
 */

const VERRE = MATIERE.verre;

type Props = {
  /** How much the glass lets through of what is under it, 0–1. */
  transparence: number;
  /** Where the console opens; another place starts another console, in the same glass. */
  depart?: Depart;
  /** The strip of black left bare beside the glass, px of a 1440 px page: the number's on a desktop; a phone has no room for one. */
  bande?: number;
  /** The type and the aids, when they are not the ones retained at M2 and M5 (the phone's, M6). */
  type?: Type;
  contenu?: Contenu;
} & Pick<ConsoleProps, 'tactile' | 'entete' | 'pied'>;

// It does not depend on the passage: it is not rendered again when one starts.
export const Terminal = memo(function Terminal({ transparence, depart, bande = BANDE, type = TYPO, contenu = CONTENU, ...tactile }: Props) {
  const style = {
    // all the screen but the number's strip, on the right
    '--l': bande ? `calc(100cqw - ${bande} * var(--u))` : '100cqw',
    '--h': pleine('hauteur', VERRE.hauteur) ? '100cqh' : `min(100cqh, calc(${VERRE.hauteur} * var(--u)))`,
    '--x': 1,
    '--y': VERRE.y,
    '--fumee': `oklch(0.19 ${(Math.abs(VERRE.teinte) * 0.034).toFixed(3)} 262 / ${(1 - transparence).toFixed(2)})`,
  } as CSSProperties;
  return (
    <div className="m1-terminal m4-terminal" data-verre="lame" data-curseur={VERRE.curseur} role="region" aria-label="Terminal" style={style}>
      <div className="m4-ecran">
        <Console key={depart ? [depart.langue, ...(depart.fichier ?? [])].join('/') : ''} type={type} reglages={contenu} depart={depart} {...tactile} />
      </div>
    </div>
  );
});
