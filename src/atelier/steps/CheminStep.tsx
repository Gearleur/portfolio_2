import { useCallback, useEffect, useState } from 'react';
import { useCopyText } from '../../hooks/useCopyText';
import { Maquette } from '../Maquettes';
import { Specimen, SpecimenPreview } from '../Specimen';
import { ESPACES, FOND } from '../tokens';
import { useWaveSignal } from '../useWave';
import './chemin.css';

const STORAGE_KEY = 'atelier:chemin:v2';

function loadBlocks() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'blocs';
  } catch {
    // Storage can be unavailable; show the words.
    return false;
  }
}

/** Step 5: where each element of the Vitrine goes. Retained: the side column on the right. */
export function CheminStep() {
  const [blocks, setBlocks] = useState(loadBlocks);
  const [showGrid, setShowGrid] = useState(false);
  const [open, setOpen] = useState(false);
  const [waveSignal, playWave] = useWaveSignal();
  const close = useCallback(() => setOpen(false), []);
  const { copy, state } = useCopyText();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, blocks ? 'blocs' : 'texte');
    } catch {
      // Keeping the view across reloads is a convenience only.
    }
  }, [blocks]);

  // G shows or hides the columns, as at step 4.
  useEffect(() => {
    const toggle = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'g' || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
      setShowGrid((visible) => !visible);
    };
    window.addEventListener('keydown', toggle);
    return () => window.removeEventListener('keydown', toggle);
  }, []);

  const gridButton = (
    <button type="button" aria-pressed={showGrid} onClick={() => setShowGrid((visible) => !visible)}>
      Grille <kbd>G</kbd>
    </button>
  );
  const maquette = <Maquette blocks={blocks} columns={showGrid ? ESPACES.columns : undefined} />;

  return (
    <section className="atelier-step" aria-labelledby="step-chemin">
      <header className="atelier-step__head">
        <span className="atelier-step__index">05</span>
        <h2 id="step-chemin">Le chemin de fer</h2>
        <span className="atelier-status" data-status="valide">
          Validé le 6 nov.
        </span>
      </header>
      <p className="atelier-step__note">
        Retenu : la nav latérale à droite. Le contenu part du bord gauche sur 12 colonnes (la phrase-titre, la bio, les
        infos, puis les projets en cartes) ; le nom, la nav et le contact ferment la page à droite sur 3 colonnes. Les
        textes sont provisoires : ils viendront à l’étape 7.
      </p>

      <div className="atelier-builder">
        <div className="atelier-panel">
          <fieldset>
            <legend>Composition</legend>
            <p className="atelier-panel__note">
              Nav latérale à droite, choisie parmi dix-sept pistes (tes références, la mode, l’architecture, la presse, le
              design suisse). Elles restent dans l’historique Git.
            </p>
          </fieldset>

          <fieldset>
            <legend>Affichage</legend>
            <div className="atelier-segment" role="group" aria-label="Contenu">
              <button type="button" aria-pressed={!blocks} onClick={() => setBlocks(false)}>
                Texte
              </button>
              <button type="button" aria-pressed={blocks} onClick={() => setBlocks(true)}>
                Blocs
              </button>
            </div>
            <p className="atelier-panel__note">« Blocs » remplace les mots par des pavés gris. La touche G affiche les 16 colonnes.</p>
          </fieldset>

          <div className="atelier-panel__footer">
            <button type="button" onClick={() => copy('Chemin de fer : nav latérale à droite')}>
              {state === 'copied' ? 'Copié' : state === 'error' ? 'Copie impossible' : 'Copier mes réglages'}
            </button>
          </div>
        </div>

        <div className="atelier-stage">
          <div className="atelier-stage__frame">
            <Specimen settings={FOND} waveSignal={waveSignal}>
              {maquette}
            </Specimen>
          </div>
          <div className="atelier-stage__bar">
            <p>Nav latérale à droite · premier écran à 1440 × 900</p>
            <div>
              {gridButton}
              <button type="button" onClick={() => playWave('first')}>
                Rejouer l’arrivée
              </button>
              <button type="button" onClick={() => setOpen(true)}>
                Plein écran <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <SpecimenPreview settings={FOND} label="Chemin de fer en plein écran" tools={gridButton} onClose={close}>
          {maquette}
        </SpecimenPreview>
      )}
    </section>
  );
}
