import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { KeyboardEvent } from 'react';
import { useFullscreenDialog } from '../../../shared/hooks/useFullscreenDialog';
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

type Props = { etat: Etat; onChange: (maj: (etat: Etat) => Etat) => void; onClose: () => void };

/**
 * The Machine state in full screen, at its real size, as the Atelier's SpecimenPreview shows
 * a page: the same dialog and the same bar, without the wave's buttons (the Machine state has
 * no wave) and with the propositions (keys 1 to 3) and the bench's own panel, which floats
 * over the picture and hides (R).
 */
export function Apercu({ etat, onChange, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // Full screen shows the real px by default, as the deployed site does.
  const [reelle, setReelle] = useState(true);
  const [reglages, setReglages] = useState(false);
  const largeur = useLargeur();
  useFullscreenDialog({ backgroundSelector: '.atelier-canvas', onClose, ref });
  const { intacte, seule } = provenance(etat.reglages);
  const { papier, grain } = etat.reglages.page;
  const fond = useMemo(() => fondDe({ papier, grain }), [papier, grain]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // The arrows and digits of a slider stay the slider's.
    if (event.target instanceof HTMLInputElement || event.metaKey || event.ctrlKey || event.altKey) return;
    const choisie = PROPOSITIONS[Number(event.key) - 1];
    if (choisie) onChange(() => etatDe(choisie.id));
    if (event.key.toLowerCase() === 'r') setReglages((ouvert) => !ouvert);
  };

  // Portalled out of the canvas, which the dialog makes inert while open.
  return createPortal(
    <div ref={ref} className="atelier-preview" role="dialog" aria-modal="true" aria-label="Le mode Machine en plein écran" tabIndex={-1} onKeyDown={handleKeyDown}>
      <Specimen settings={fond} reelle={reelle}>
        <Machine reglages={etat.reglages} />
      </Specimen>
      {reglages && (
        <div className="m1-flottant">
          <Panneau etat={etat} onChange={onChange} />
        </div>
      )}
      <div className="atelier-preview__bar">
        {PROPOSITIONS.map((p, i) => (
          <button key={p.id} type="button" className="m1-choix" aria-pressed={p === (intacte ?? seule)} title={p.pari} onClick={() => onChange(() => etatDe(p.id))}>
            {p.nom} <kbd>{i + 1}</kbd>
          </button>
        ))}
        <button type="button" className="m1-choix" aria-pressed={reglages} onClick={() => setReglages(!reglages)}>
          Réglages <kbd>R</kbd>
        </button>
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
