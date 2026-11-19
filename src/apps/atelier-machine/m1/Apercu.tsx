import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { KeyboardEvent, ReactNode } from 'react';
import { useFullscreenDialog } from '../../../shared/hooks/useFullscreenDialog';
import type { FondSettings } from '../../atelier/Fond';
import { Specimen } from '../../atelier/Specimen';
import { fondDe } from './fond';
import { Machine } from './Machine';
import { Panneau } from './Panneau';
import { PROPOSITIONS, etatDe, provenance } from './reglages';
import type { Etat } from './reglages';

/** The window's width: how much a 1440 px page would be enlarged or reduced to fill it. */
function useLargeur() {
  const [largeur, setLargeur] = useState(() => window.innerWidth);
  useEffect(() => {
    const suivre = () => setLargeur(window.innerWidth);
    window.addEventListener('resize', suivre);
    return () => window.removeEventListener('resize', suivre);
  }, []);
  return largeur;
}

/** A proposition in the bar: its name, its bet, whether it is the one shown, and how to take it. */
type Choix = { nom: string; pari: string; active: boolean; prendre: () => void };

type PleinEcranProps = {
  fond: FondSettings;
  /** The bench's propositions (keys 1 to 3). */
  choix: Choix[];
  /** The bench's own panel, which floats over the picture and hides (R). */
  panneau: ReactNode;
  /** More buttons for the bar, a bench's own. */
  outils?: ReactNode;
  /** The bar at the bottom, for a bench that judges the top of the picture. */
  barreEnBas?: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * The Machine state in full screen, at its real size, as the Atelier's SpecimenPreview shows
 * a page: the same dialog and the same bar, without the wave's buttons (the Machine state has
 * no wave) and with a bench's propositions and panel. Shared by the benches of Atelier 2.
 */
export function PleinEcran({ fond, choix, panneau, outils, barreEnBas, onClose, children }: PleinEcranProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Full screen shows the real px by default, as the deployed site does.
  const [reelle, setReelle] = useState(true);
  const [reglages, setReglages] = useState(false);
  const largeur = useLargeur();
  useFullscreenDialog({ backgroundSelector: '.atelier-canvas', onClose, ref });

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // The arrows and digits of a slider stay the slider's.
    if (event.target instanceof HTMLInputElement || event.metaKey || event.ctrlKey || event.altKey) return;
    choix[Number(event.key) - 1]?.prendre();
    if (event.key.toLowerCase() === 'r') setReglages((ouvert) => !ouvert);
  };

  // Portalled out of the canvas, which the dialog makes inert while open.
  return createPortal(
    <div
      ref={ref}
      className="atelier-preview"
      data-barre={barreEnBas ? 'bas' : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Le mode Machine en plein écran"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <Specimen settings={fond} reelle={reelle}>
        {children}
      </Specimen>
      {reglages && <div className="m1-flottant">{panneau}</div>}
      <div className="atelier-preview__bar">
        {choix.map((c, i) => (
          <button key={c.nom} type="button" className="m1-choix" aria-pressed={c.active} title={c.pari} onClick={c.prendre}>
            {c.nom} <kbd>{i + 1}</kbd>
          </button>
        ))}
        <button type="button" className="m1-choix" aria-pressed={reglages} onClick={() => setReglages(!reglages)}>
          Réglages <kbd>R</kbd>
        </button>
        {outils}
        <button type="button" aria-pressed={reelle} onClick={() => setReelle(!reelle)}>
          {reelle ? 'Taille réelle' : `Mise à l’échelle ×${(largeur / 1440).toFixed(2).replace('.', ',')}`}
          <span className="atelier-preview__info">{largeur} px</span>
        </button>
        <button type="button" className="atelier-preview__close" onClick={onClose}>
          Fermer <kbd>Échap</kbd>
        </button>
      </div>
    </div>,
    document.body,
  );
}

type Props = { etat: Etat; onChange: (maj: (etat: Etat) => Etat) => void; onClose: () => void };

/** M1's bench in full screen: its three propositions and its panel. */
export function Apercu({ etat, onChange, onClose }: Props) {
  const { intacte, seule } = provenance(etat.reglages);
  const { papier, grain } = etat.reglages.page;
  const fond = useMemo(() => fondDe({ papier, grain }), [papier, grain]);

  return (
    <PleinEcran
      fond={fond}
      choix={PROPOSITIONS.map((p) => ({ nom: p.nom, pari: p.pari, active: p === (intacte ?? seule), prendre: () => onChange(() => etatDe(p.id)) }))}
      panneau={<Panneau etat={etat} onChange={onChange} />}
      onClose={onClose}
    >
      <Machine reglages={etat.reglages} />
    </PleinEcran>
  );
}
