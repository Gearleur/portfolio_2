import { useCallback, useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Specimen } from '../../atelier/Specimen';
import { PleinEcran } from '../m1/Apercu';
import { fondDe } from '../m1/fond';
import { Machine } from '../m1/Machine';
import { RETENU } from '../m1/reglages';
import { Ecran } from '../m2/Ecran';
import { Panneau } from '../m2/Panneau';
import { PROPOSITIONS, etatDe, garder, lire, provenance } from '../m2/reglages';
import type { Vu } from '../m2/reglages';

// The matter retained at M1: its paper, and no wave.
const FOND = fondDe(RETENU.page);

/**
 * Atelier 2 · M2, typo et grille: the most ordinary terminal there is, set with care on M1's
 * sheet of night-blue glass. A bench like M1's: three propositions to start from, bounded
 * sliders for the face, the grid of cells, the three greys, the cursor and what dresses the
 * screen; the settings are kept in the browser and copied as text. A still: nothing is typed.
 */
export function M2Typo(): JSX.Element {
  const [etat, setEtat] = useState(lire);
  const [ouvert, setOuvert] = useState(false);
  const [cellules, setCellules] = useState(false);
  const [vu, setVu] = useState<Vu | null>(null);
  const fermer = useCallback(() => setOuvert(false), []);

  useEffect(() => garder(etat), [etat]);

  // G shows or hides the cells, as it does the columns at Atelier 1's step 4.
  useEffect(() => {
    const basculer = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'g' || event.metaKey || event.ctrlKey || event.altKey || event.target instanceof HTMLInputElement) return;
      setCellules((visibles) => !visibles);
    };
    window.addEventListener('keydown', basculer);
    return () => window.removeEventListener('keydown', basculer);
  }, []);

  const { intacte, seule } = provenance(etat.reglages);
  const image = <Machine reglages={RETENU} ecran={<Ecran reglages={etat.reglages} cellules={cellules} onVu={setVu} />} />;
  const panneau = <Panneau etat={etat} onChange={setEtat} vu={vu} />;
  const bascule = (
    <button type="button" className="m1-choix" aria-pressed={cellules} onClick={() => setCellules(!cellules)}>
      Cellules <kbd>G</kbd>
    </button>
  );

  return (
    <section className="atelier-step m2-etabli" aria-labelledby="etape-m2">
      <header className="atelier-step__head">
        <span className="atelier-step__index">M2</span>
        <h2 id="etape-m2">Typo et grille</h2>
        <span className="atelier-status">À décider</span>
      </header>
      <p className="atelier-step__note">
        Le terminal dans la matière retenue en M1, en image fixe. La question n’est pas « quelle police originale »
        mais « à quoi ressemble un terminal de base bien composé sur cette lame ». Tu as dit « la plus classique, la
        plus courante » : sur chaque système ce sont deux polices différentes, d’où deux manières, plus une mono
        embarquée, la même partout. Trois propositions pour partir, puis tu règles : chaque partie (la police, la
        grille, les gris, le curseur, l’habillage) peut venir d’une autre proposition. La touche G montre les
        cellules. Le contenu est provisoire : il se décide à M5.
      </p>

      <div className="atelier-builder">
        {panneau}
        <div className="atelier-stage">
          <div className="atelier-stage__frame">
            {/* In full screen the picture is drawn there, not twice. */}
            {!ouvert && <Specimen settings={FOND}>{image}</Specimen>}
          </div>
          <div className="atelier-stage__bar">
            <p>
              {intacte ? `« ${intacte.nom} »` : seule ? `« ${seule.nom} », réglée` : 'Mélange'}
              {vu && ` · ${vu.police} · écran de ${vu.colonnes} × ${vu.lignes}`} · aperçu réduit : le plein écran montre les vrais pixels
            </p>
            <div>
              {bascule}
              <button type="button" onClick={() => setOuvert(true)}>
                Plein écran <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {ouvert && (
        <PleinEcran
          fond={FOND}
          choix={PROPOSITIONS.map((p) => ({ nom: p.nom, pari: p.pari, active: p === (intacte ?? seule), prendre: () => setEtat(etatDe(p.id)) }))}
          panneau={panneau}
          outils={bascule}
          barreEnBas
          onClose={fermer}
        >
          {image}
        </PleinEcran>
      )}
    </section>
  );
}
