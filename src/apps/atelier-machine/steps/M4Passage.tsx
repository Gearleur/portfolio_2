import { useCallback, useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Specimen } from '../../atelier/Specimen';
import { PleinEcran } from '../m1/Apercu';
import { fondDe } from '../m1/fond';
import { RETENU as MATIERE } from '../m1/reglages';
import { Panneau } from '../m4/Panneau';
import { durees } from '../m4/passage';
import type { Sens } from '../m4/passage';
import { PROPOSITIONS, etatDe, garder, intacte, lire, proposition, secondes } from '../m4/reglages';
import { Scene } from '../m4/Scene';

// The Vitrine's paper under the human page; no wave on the bench.
const FOND = fondDe(MATIERE.page);

/** What the stage is asked: the side to be on, a moment of the passage to hold, a passage to play again. */
type Lecture = { machine: boolean; fige: number | null; tour: number };

/**
 * Atelier 2 · M4, le passage: how the page goes from the human state to the terminal and back.
 * Another strategy than M1's erased page, after Alexandre's reference and his words: a white side
 * and a black side. One black bubble with a blurred, iridescent edge spreads like an eclipse and
 * uncovers the black ground and his human number, 1130, which stays; the terminal then comes
 * over it, a little transparent, with no bubble of its own. On the way back the terminal leaves
 * first, then the bubble draws back and gives the paper again. Three propositions of it, set off
 * by the switch retained at M3.
 */
export function M4Passage(): JSX.Element {
  const [etat, setEtat] = useState(lire);
  const [lecture, setLecture] = useState<Lecture>({ machine: false, fige: null, tour: 0 });
  const [ouvert, setOuvert] = useState(false);
  const fermer = useCallback(() => setOuvert(false), []);

  useEffect(() => garder(etat), [etat]);

  // The switch: the passage leaves from where the stage is.
  const basculer = useCallback((machine: boolean) => setLecture((l) => ({ ...l, machine, fige: null })), []);
  // The bench: the passage again, from its start.
  const jouer = useCallback((sens: Sens) => setLecture((l) => ({ machine: sens === 'aller', fige: null, tour: l.tour + 1 })), []);
  const figer = useCallback((fige: number) => setLecture((l) => ({ ...l, fige })), []);

  const { machine, fige, tour } = lecture;
  const r = etat.reglages;
  const telle = intacte(r);
  const image = <Scene reglages={r} machine={machine} onMode={basculer} fige={fige} tour={tour} />;
  const panneau = <Panneau etat={etat} onChange={setEtat} machine={machine} fige={fige} onJouer={jouer} onFiger={figer} />;
  const rejouer = (
    <button type="button" onClick={() => jouer(machine ? 'aller' : 'retour')}>
      Rejouer <span aria-hidden="true">↻</span>
    </button>
  );

  return (
    <section className="atelier-step m4-etabli" aria-labelledby="etape-m4">
      <header className="atelier-step__head">
        <span className="atelier-step__index">M4</span>
        <h2 id="etape-m4">Le passage</h2>
        <span className="atelier-status">À décider</span>
      </header>
      <p className="atelier-step__note">
        Une autre stratégie que la page gommée, d’après ta vidéo : un côté blanc, le portfolio, et un côté noir, le terminal. Une seule bulle noire, au bord
        flou et irisé, s’étend comme une éclipse jusqu’à couvrir l’écran : c’est elle qui découvre le fond noir et ton numéro d’humain, 1130, qui reste. Le
        terminal n’a pas de bulle à lui : il se pose ensuite dessus, en douceur, dans sa lame de verre un peu transparente. Au retour il s’efface d’abord, le
        nombre reste seul sur le noir, puis la bulle se rétracte et rend le blanc. Le passage part quand tu cliques l’interrupteur de M3 ou quand tu lâches
        son bouton (jamais pendant que tu le traînes) ; au clavier, Espace, Entrée, ← →. Relancé en cours de route, il repart de là où il en est. Trois
        propositions pour partir, puis tu règles ; « Temps » fige une image pour la juger. Le plein écran montre les vrais pixels.
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
              {telle ? `« ${telle.nom} »` : `« ${proposition(etat.depart).nom} », réglée`} · côté {machine ? 'Machine' : 'Humain'}
              {fige === null ? '' : ', figé'} · {secondes(durees(r, 'aller').totale)} à l’aller, {secondes(durees(r, 'retour').totale)} au retour, terminal compris ·
              aperçu réduit : le plein écran montre les vrais pixels
            </p>
            <div>
              {rejouer}
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
          choix={PROPOSITIONS.map((p) => ({
            nom: p.nom,
            pari: p.pari,
            active: p === telle,
            prendre: () => {
              setEtat(etatDe(p.id));
              jouer(machine ? 'aller' : 'retour');
            },
          }))}
          panneau={panneau}
          outils={rejouer}
          onClose={fermer}
        >
          {image}
        </PleinEcran>
      )}
    </section>
  );
}
