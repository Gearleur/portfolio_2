import { useCallback, useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Specimen } from '../../atelier/Specimen';
import { PleinEcran } from '../m1/Apercu';
import { fondDe } from '../m1/fond';
import { Machine } from '../m1/Machine';
import { RETENU as MATIERE } from '../m1/reglages';
import { RETENU as TYPO } from '../m2/reglages';
import { Console } from '../m5/Console';
import { Panneau } from '../m5/Panneau';
import { PROPOSITIONS, etatDe, garder, intacte, lire, proposition } from '../m5/reglages';

// The matter retained at M1: its paper, and no wave.
const FOND = fondDe(MATIERE.page);

/**
 * Atelier 2 · M5, le contenu: a terminal that works, in the matter of M1 and the type of M2. Its
 * files are the Vitrine's own words, as raw Markdown; entering `fr/` or `en/` restarts it in that
 * language. The bench asks one question: how much the terminal helps one move about, between a
 * bare shell and a menu. Three propositions to start from, then every aid is a switch.
 */
export function M5Contenu(): JSX.Element {
  const [etat, setEtat] = useState(lire);
  const [ouvert, setOuvert] = useState(false);
  const fermer = useCallback(() => setOuvert(false), []);

  useEffect(() => garder(etat), [etat]);

  const telle = intacte(etat.reglages);
  const image = <Machine reglages={MATIERE} vivant ecran={<Console type={TYPO} reglages={etat.reglages} />} />;
  const panneau = <Panneau etat={etat} onChange={setEtat} />;

  return (
    <section className="atelier-step m5-etabli" aria-labelledby="etape-m5">
      <header className="atelier-step__head">
        <span className="atelier-step__index">M5</span>
        <h2 id="etape-m5">Le contenu</h2>
        <span className="atelier-status">À décider</span>
      </header>
      <p className="atelier-step__note">
        Un terminal qui marche, dans la matière de M1 et la typo de M2. Ses fichiers sont les vrais textes de la Vitrine, en Markdown brut ; les images
        s’écrivent [image: légende](référence) ; entrer dans fr/ ou en/ redémarre le terminal dans cette langue. Tout se parcourt en cliquant les noms, et
        la commande s’écrit toute seule : elle est la trace du déplacement. La question de l’étape est le degré d’aide, entre « vrai terminal » et « user
        friendly ». Trois propositions pour partir, puis chaque aide est une bascule. Clique dans le terminal pour lui donner le clavier ; le plein écran
        montre les vrais pixels.
      </p>

      <div className="atelier-builder">
        {panneau}
        <div className="atelier-stage">
          <div className="atelier-stage__frame">
            {/* In full screen the terminal runs there, not twice. */}
            {!ouvert && <Specimen settings={FOND}>{image}</Specimen>}
          </div>
          <div className="atelier-stage__bar">
            <p>{telle ? `« ${telle.nom} »` : `« ${proposition(etat.depart).nom} », réglée`} · aperçu réduit : le plein écran montre les vrais pixels</p>
            <div>
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
          choix={PROPOSITIONS.map((p) => ({ nom: p.nom, pari: p.pari, active: p === telle, prendre: () => setEtat(etatDe(p.id)) }))}
          panneau={panneau}
          onClose={fermer}
        >
          {image}
        </PleinEcran>
      )}
    </section>
  );
}
