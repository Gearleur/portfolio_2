import { useCallback, useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Specimen } from '../../atelier/Specimen';
import { PleinEcran } from '../m1/Apercu';
import { fondDe } from '../m1/fond';
import { RETENU as MATIERE } from '../m1/reglages';
import { Panneau } from '../m3/Panneau';
import { PROPOSITIONS, etatDe, garder, intacte, lire, proposition } from '../m3/reglages';
import { Scene } from '../m3/Scene';

// The paper of the Vitrine, which the Machine state keeps (M1); no wave on the bench.
const FOND = fondDe(MATIERE.page);

/**
 * Atelier 2 · M3, le curseur: the switch between the human page and the terminal, at the bottom
 * of the screen, in the middle, and large. One kind of button, after Alexandre's reference (a
 * light pill, a big domed round knob, a sunken window), and three propositions of it. It works
 * for real, on the two real states: the Vitrine, and its Machine state as retained so far. How
 * the page passes from one to the other is step M4's: here, a short fade.
 */
export function M3Curseur(): JSX.Element {
  const [etat, setEtat] = useState(lire);
  const [machine, setMachine] = useState(false);
  const [ouvert, setOuvert] = useState(false);
  const fermer = useCallback(() => setOuvert(false), []);

  useEffect(() => garder(etat), [etat]);

  const telle = intacte(etat.reglages);
  const image = <Scene reglages={etat.reglages} machine={machine} onMode={setMachine} />;
  const panneau = <Panneau etat={etat} onChange={setEtat} />;

  return (
    <section className="atelier-step m3-etabli" aria-labelledby="etape-m3">
      <header className="atelier-step__head">
        <span className="atelier-step__index">M3</span>
        <h2 id="etape-m3">Le curseur</h2>
        <span className="atelier-status">À décider</span>
      </header>
      <p className="atelier-step__note">
        L’interrupteur Humain / Machine, en bas au milieu, d’après ta référence : une pilule claire, un gros bouton rond bombé, une fenêtre en creux. Il
        marche pour de vrai, entre la vraie Vitrine et l’état Machine retenu (matière de M1, typo de M2, terminal de M5) : clique la pilule, fais glisser le
        bouton (il retombe du côté le plus proche) ou donne-lui le clavier (Espace, Entrée, ← →). Le passage entre les deux n’est qu’un fondu : son animation
        est l’étape M4. Trois propositions pour partir, puis tu règles ; le plein écran montre les vrais pixels.
      </p>

      <div className="atelier-builder">
        {panneau}
        <div className="atelier-stage">
          <div className="atelier-stage__frame">
            {/* In full screen the two states run there, not twice. */}
            {!ouvert && <Specimen settings={FOND}>{image}</Specimen>}
          </div>
          <div className="atelier-stage__bar">
            <p>
              {telle ? `« ${telle.nom} »` : `« ${proposition(etat.depart).nom} », réglée`} · côté {machine ? 'Machine' : 'Humain'} · aperçu réduit : le plein écran
              montre les vrais pixels
            </p>
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
