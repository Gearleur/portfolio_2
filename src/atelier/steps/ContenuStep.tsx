import { useCallback, useState } from 'react';
import { Maquette, MaquetteMobile } from '../Maquettes';
import { Miniature, PlanArchitecture } from '../Miniature';
import { Specimen, SpecimenPreview } from '../Specimen';
import { FOND } from '../tokens';
import { useWaveSignal } from '../useWave';
import './chemin.css';
import './contenu.css';

const NOMENCLATURE: [string, string][] = [
  ['1 · Aiguille', 'L’agent ReAct, le cube accent : il choisit la voie.'],
  ['2 · Voie directe', 'Les incidents déjà résolus.'],
  ['3 · Voie déviée gauche', 'La documentation.'],
  ['4 · Voie déviée droite', 'Les outils DevOps.'],
  ['5 · Cœur', 'La recherche hybride, là où les voies se croisent.'],
  ['6 · Contre-rail', 'Le reranker, qui garde la réponse sur la bonne voie.'],
];

const PHONES = [
  { id: 'haut', name: 'En haut de la page', note: 'Le premier écran : la miniature commence en bas.', scrolled: false },
  {
    id: 'defile',
    name: 'En défilant',
    note: 'L’image passe sous la tranche ; « Menu » et ton nom restent dessus, en accent seulement là où l’image passe dessous.',
    scrolled: true,
  },
];

/** Scrolls a phone page so its first picture sits under the strip's words. */
function scrollToPicture(frame: HTMLDivElement | null) {
  const page = frame?.querySelector<HTMLElement>('.mobile');
  const picture = page?.querySelector<HTMLElement>('.m-img');
  if (page && picture) page.scrollTop = picture.offsetTop - page.clientHeight * 0.4;
}

/** Step 7: the words and pictures of each project, starting with SNCF GPT. */
export function ContenuStep() {
  const [preview, setPreview] = useState(false);
  const [waveSignal, playWave] = useWaveSignal();
  const close = useCallback(() => setPreview(false), []);
  const images = { '01': <Miniature /> };

  return (
    <section className="atelier-step" aria-labelledby="step-contenu">
      <header className="atelier-step__head">
        <span className="atelier-step__index">07</span>
        <h2 id="step-contenu">Le contenu</h2>
        <span className="atelier-status">En cours</span>
      </header>
      <p className="atelier-step__note">
        Chaque projet a sa page, construite comme celle de Rachel Chen, et sa miniature. Pour SNCF GPT : un aiguillage à
        trois voies dessiné comme un détail de planche d’ingénierie de la voie, dans un cercle, gravé dans l’alu irisé.
        Sur une carte, c’est une texture qui donne envie de cliquer ; en gros plan, tout se lit. Le texte est dans
        docs/atelier/contenu/01-sncf-gpt.md.
      </p>

      <div className="atelier-builder">
        <div className="atelier-panel">
          <fieldset>
            <legend>Miniature</legend>
            <p className="atelier-panel__note">
              Retenus : l’aiguillage en vue de détail, dans un cercle bordé de micro-texte, en alu irisé. Rails en
              filets, longues traverses, aiguilles, cœurs et contre-rails ; « SNCF GPT » en haut à gauche ; la
              référence et des marquages comme au coin d’une vitre de voiture en bas. La lumière suit la souris.
            </p>
          </fieldset>

          <fieldset>
            <legend>Nomenclature</legend>
            <dl className="nomenclature">
              {NOMENCLATURE.map(([part, role]) => (
                <div key={part}>
                  <dt>{part}</dt>
                  <dd>{role}</dd>
                </div>
              ))}
            </dl>
          </fieldset>
        </div>

        <div className="atelier-stage">
          <div className="atelier-stage__frame">
            <Specimen settings={FOND} waveSignal={waveSignal}>
              <Maquette blocks={false} images={images} />
            </Specimen>
          </div>
          <div className="atelier-stage__bar">
            <p>Deux projets par rangée, le troisième sous le deuxième : fais défiler la page</p>
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

      <div className="miniatures">
        <h3>
          En gros plan <span>La miniature d’ordinateur, pour voir les détails.</span>
        </h3>
        <span className="miniatures__plan">
          <Miniature />
        </span>
      </div>

      <div className="miniatures">
        <h3>
          Sur téléphone{' '}
          <span>
            Retenu : la vue de détail. Le titre en haut, la référence et les tampons sous le cercle. Fais défiler les
            écrans.
          </span>
        </h3>
        <ul className="phones">
          {PHONES.map((phone) => (
            <li key={phone.id}>
              <figure className="phone">
                <div className="phone__frame" ref={phone.scrolled ? scrollToPicture : undefined}>
                  <Specimen settings={FOND} waveSignal={waveSignal}>
                    <MaquetteMobile blocks={false} menuOpen={false} images={{ '01': <Miniature cadrage="portrait" /> }} />
                  </Specimen>
                </div>
                <figcaption>
                  <strong>{phone.name}</strong>
                  {phone.note}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>

      <div className="miniatures">
        <h3>
          Le plan détaillé <span>Ton architecture déployée en plan de voies, en grand sur la page projet.</span>
        </h3>
        <span className="miniatures__plan">
          <PlanArchitecture />
        </span>
      </div>

      {preview && (
        <SpecimenPreview settings={FOND} label="La Vitrine en plein écran" onClose={close}>
          <Maquette blocks={false} images={images} />
        </SpecimenPreview>
      )}
    </section>
  );
}
