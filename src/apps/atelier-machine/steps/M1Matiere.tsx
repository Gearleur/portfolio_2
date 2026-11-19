import { useCallback, useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { Specimen } from '../../atelier/Specimen';
import { Apercu } from '../m1/Apercu';
import { fondDe } from '../m1/fond';
import { Machine } from '../m1/Machine';
import { Panneau } from '../m1/Panneau';
import { garder, lire, provenance } from '../m1/reglages';

/**
 * Atelier 2 · M1, la matière: what the screen looks like once the page has gone over to the
 * machine. A bench like the background's (Atelier 1, step 1): three propositions to start
 * from, bounded sliders for the eraser, the sunken thumbnails, the smoked glass and what is
 * left of the human page; the settings are kept in the browser and copied as text.
 * A still: no switch, no animation, nothing to click in the picture.
 */
export function M1Matiere(): JSX.Element {
  const [etat, setEtat] = useState(lire);
  const [ouvert, setOuvert] = useState(false);
  const fermer = useCallback(() => setOuvert(false), []);

  useEffect(() => garder(etat), [etat]);

  const { papier, grain } = etat.reglages.page;
  const fond = useMemo(() => fondDe({ papier, grain }), [papier, grain]);
  const { intacte, seule } = provenance(etat.reglages);

  return (
    <section className="atelier-step" aria-labelledby="etape-m1">
      <header className="atelier-step__head">
        <span className="atelier-step__index">M1</span>
        <h2 id="etape-m1">La matière</h2>
        <span className="atelier-status">À décider</span>
      </header>
      <p className="atelier-step__note">
        L’écran une fois la page passée côté machine, en image fixe : pas encore d’interrupteur ni d’animation. La page
        est la vraie Vitrine, effacée ; ses miniatures sont pressées dans le papier avec la recette du gaufrage de
        « Dessiner avec l’IA », et il leur reste quelques formes, lues dans les vraies miniatures. Trois propositions
        pour partir, puis tu règles : chaque partie (la page, la gomme, les miniatures, le verre) peut venir d’une autre
        proposition. « Copier mes réglages » me dit où tu t’es arrêté.
      </p>

      <div className="atelier-builder">
        <Panneau etat={etat} onChange={setEtat} />
        <div className="atelier-stage">
          <div className="atelier-stage__frame">
            {/* In full screen the picture is drawn there, not twice: the sliders stay light. */}
            {!ouvert && (
              <Specimen settings={fond}>
                <Machine reglages={etat.reglages} />
              </Specimen>
            )}
          </div>
          <div className="atelier-stage__bar">
            <p>
              {intacte ? `« ${intacte.nom} »` : seule ? `« ${seule.nom} », réglée` : 'Mélange'} · premier écran à 1440 × 900 · la molette fait défiler la
              page sous le terminal
            </p>
            <div>
              <button type="button" onClick={() => setOuvert(true)}>
                Plein écran <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {ouvert && <Apercu etat={etat} onChange={setEtat} onClose={fermer} />}
    </section>
  );
}
