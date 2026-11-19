import type { CSSProperties } from 'react';
import { Maquette } from '../../atelier/Maquettes';
import { Miniature } from '../../atelier/Miniature';
import { MiniatureAlpine } from '../../atelier/MiniatureAlpine';
import { MiniatureProcessus } from '../../atelier/MiniatureProcessus';
import { MiniatureReunions } from '../../atelier/MiniatureReunions';
import { Machine } from '../m1/Machine';
import { RETENU as MATIERE } from '../m1/reglages';
import { famille, RETENU as TYPO } from '../m2/reglages';
import { Console } from '../m5/Console';
import { RETENU as CONTENU } from '../m5/reglages';
import { Interrupteur } from './Interrupteur';
import { geometrie } from './reglages';
import type { Reglages } from './reglages';

/*
 * The two real states the switch goes between (step M3), one over the other in a Specimen: the
 * Vitrine as it is, and its Machine state as retained at M1, M2 and M5, with the terminal that
 * works. Both stay mounted, so the terminal keeps its place while one looks at the human page;
 * the one that is not shown is inert. Between them, a short fade: the passage is step M4's.
 */

// The Vitrine's own thumbnails, as its page mounts them.
const IMAGES = {
  '01': <MiniatureAlpine />,
  '02': <Miniature cadrage="paysage" />,
  '03': <MiniatureReunions />,
  '04': <MiniatureProcessus />,
};

const MONO = famille(TYPO.police);

type Props = { reglages: Reglages; machine: boolean; onMode: (machine: boolean) => void };

export function Scene({ reglages, machine, onMode }: Props) {
  // What the terminal's screen gives up, so that its last line stands above the pill.
  const style = { '--m3-reserve': geometrie(reglages, TYPO.grille.marge).reserve } as CSSProperties;

  return (
    <div className="m3-scene" data-mode={machine ? 'machine' : 'humain'} style={style}>
      <div className="m3-couche" data-cote="humain" inert={machine}>
        <Maquette blocks={false} images={IMAGES} />
      </div>
      <div className="m3-couche" data-cote="machine" inert={!machine}>
        <Machine reglages={MATIERE} vivant ecran={<Console type={TYPO} reglages={CONTENU} />} />
      </div>
      <Interrupteur machine={machine} onChange={onMode} reglages={reglages} mono={MONO} />
    </div>
  );
}
