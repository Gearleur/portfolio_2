import { useCallback, useState } from 'react';
import type { CSSProperties } from 'react';
import { Maquette, MaquetteMobile } from '../Maquettes';
import { Specimen, SpecimenPreview } from '../Specimen';
import { FOND } from '../tokens';
import { useWaveSignal } from '../useWave';
import './chemin.css';
import './composants.css';

// `at` places the pointer in its tile so the whole shape shows.
const SHAPES = [
  { shape: 'cube', name: 'Au repos et sur le menu', note: 'Le petit cube, en couleur accent : il ne change pas sur la nav.', at: '24px 32px' },
  { shape: 'texte', name: 'Sur le texte', note: 'Une barre de 2,5 px, 20 px de haut au plus, même sur le grand titre.', at: '24px 32px' },
  {
    shape: 'fleche',
    name: 'Sur un projet',
    note: 'Une petite pointe d’agent de 10 × 14 px, « Voir le projet » à côté ; sur un lien @, la pointe seule.',
    at: '16px 14px',
    label: 'Voir le projet',
  },
];

/** Step 6: the components, one by one, with their states. */
export function ComposantsStep() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [waveSignal, playWave] = useWaveSignal();
  const close = useCallback(() => setPreview(false), []);

  return (
    <section className="atelier-step" aria-labelledby="step-composants">
      <header className="atelier-step__head">
        <span className="atelier-step__index">06</span>
        <h2 id="step-composants">Les composants</h2>
        <span className="atelier-status" data-status="valide">
          Validé le 6 nov.
        </span>
      </header>
      <p className="atelier-step__note">
        Retenu : un curseur qui se déforme, cube au repos et sur la nav, barre fine sur le texte, petite pointe d’agent
        sur un projet. Les liens @ et la nav se soulignent en accent au survol. Sur téléphone, sans curseur, le menu
        glisse depuis le bord droit.
      </p>

      <div className="atelier-builder">
        <div className="atelier-panel">
          <fieldset>
            <legend>Curseur</legend>
            <ul className="curseur-etats">
              {SHAPES.map((item) => (
                <li key={item.shape}>
                  <span className="curseur-tuile" aria-hidden="true">
                    <span
                      className="curseur"
                      data-shape={item.shape}
                      data-labelled={item.label ? '' : undefined}
                      style={{ translate: item.at } as CSSProperties}
                    >
                      <span className="curseur__forme" />
                      {item.label && <span className="curseur__label">{item.label}</span>}
                    </span>
                  </span>
                  <span>
                    <strong>{item.name}</strong>
                    {item.note}
                  </span>
                </li>
              ))}
            </ul>
            <p className="atelier-panel__note">Il passe d’une forme à l’autre en se déformant, avec un léger rebond.</p>
          </fieldset>

          <fieldset>
            <legend>Liens et nav</legend>
            <p className="atelier-panel__note">
              Lien @ : souligné d’un filet clair qui passe à l’accent au survol. Nav : un soulignement accent de 1 px au
              survol, comme les liens, rien d’autre ; la page en cours garde son carré accent.
            </p>
          </fieldset>

          <fieldset>
            <legend>Menu sur téléphone</legend>
            <p className="atelier-panel__note">
              Glisse : le panneau arrive du bord droit en 0,5 s et repart de même. Pas de curseur sur téléphone.
            </p>
          </fieldset>
        </div>

        <div className="atelier-stage">
          <div className="atelier-stage__frame">
            <Specimen settings={FOND} waveSignal={waveSignal}>
              <Maquette blocks={false} />
            </Specimen>
          </div>
          <div className="atelier-stage__bar">
            <p>Passe la souris sur la phrase, un projet, la nav ou un lien @</p>
            <div>
              <button type="button" onClick={() => playWave('first')}>
                Rejouer l’arrivée
              </button>
              <button type="button" onClick={() => setPreview(true)}>
                Plein écran <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="telephone">
        <h3>
          Le menu sur téléphone <span>Retenu : Glisse, 0,5 s. Touche « Menu » puis « Fermer » sur l’écran.</span>
        </h3>
        <ul className="phones">
          <li>
            <figure className="phone">
              <div className="phone__frame">
                <Specimen settings={FOND} waveSignal={waveSignal}>
                  <MaquetteMobile blocks={false} glisse menuOpen={menuOpen} onMenu={setMenuOpen} />
                </Specimen>
              </div>
              <figcaption>
                <strong>Glisse · 0,5 s</strong>
                Le panneau glisse depuis le bord droit, là où est la tranche.
              </figcaption>
            </figure>
          </li>
        </ul>
      </div>

      {preview && (
        <SpecimenPreview settings={FOND} label="La Vitrine en plein écran" onClose={close}>
          <Maquette blocks={false} />
        </SpecimenPreview>
      )}
    </section>
  );
}
