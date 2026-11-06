import { useCallback, useState } from 'react';
import { Maquette, MaquetteMobile } from '../Maquettes';
import { Miniature } from '../Miniature';
import { ProjetMaquette, ProjetMobile } from '../Projet';
import { SNCF_GPT } from '../projets';
import { Specimen, SpecimenPreview } from '../Specimen';
import { FOND, FOND_LECTURE } from '../tokens';
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

/** The project page on a phone: at the top, then at a diagram, which scrolls sideways. */
const PHONES_PROJET = [
  {
    id: 'projet',
    name: 'La page projet',
    note: 'Le retour en haut, le titre, les chiffres empilés. « Menu » ouvre le sommaire au-dessus de la nav.',
    section: undefined,
  },
  {
    id: 'schema',
    name: 'Un schéma',
    note: 'Les schémas gardent une taille lisible : on les fait glisser de côté.',
    section: 'decisions',
  },
] as const;

/** Scrolls a phone's project page to a section. */
function scrollToSection(id: string) {
  return (frame: HTMLDivElement | null) => {
    const page = frame?.querySelector<HTMLElement>('.mobile');
    const section = page?.querySelector<HTMLElement>(`[data-section="${id}"]`);
    if (page && section) page.scrollTop = section.offsetTop + section.offsetHeight * 0.18;
  };
}

/** Scrolls a phone page so its first picture sits under the strip's words. */
function scrollToPicture(frame: HTMLDivElement | null) {
  const page = frame?.querySelector<HTMLElement>('.mobile');
  const picture = page?.querySelector<HTMLElement>('.m-img');
  if (page && picture) page.scrollTop = picture.offsetTop - page.clientHeight * 0.4;
}

/** Step 7: the words and pictures of each project, starting with SNCF GPT. */
export function ContenuStep() {
  const [preview, setPreview] = useState<'vitrine' | 'projet' | null>(null);
  const [menuProjet, setMenuProjet] = useState(false);
  // The first stage goes from the project page back to the Vitrine and in again.
  const [vue, setVue] = useState<'projet' | 'vitrine'>('projet');
  const [waveSignal, playWave] = useWaveSignal();
  const close = useCallback(() => setPreview(null), []);
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
            <legend>La page projet</legend>
            <p className="atelier-panel__note">
              Construite comme celle de Rachel Chen : le titre, l’accroche, le cartel et la miniature, puis dix parties
              aux titres en phrases, lues au milieu de la page. Le fond sans l’onde, pour lire tranquille. Huit schémas
              techniques à plat, tirés du rapport de stage, et l’écran de l’assistant redessiné dans les cartes.
            </p>
            <p className="atelier-panel__note">
              En haut à gauche, « ← Projets / SNCF GPT » ramène à la Vitrine ; plus bas, le sommaire suit la lecture
              (carré accent) et chaque ligne mène à sa partie.
            </p>
          </fieldset>

          <fieldset>
            <legend>Tailles</legend>
            <p className="atelier-panel__note">
              En taille réelle : le texte, le sommaire et la nav à 15 px comme chez Rachel Chen ; les titres de partie
              en serif à 29 px, l’accroche à 23 px, les chiffres clés à 58 px.
            </p>
          </fieldset>
        </div>

        <div className="atelier-stage">
          <div className="atelier-stage__frame">
            {vue === 'projet' ? (
              <Specimen settings={FOND_LECTURE}>
                <ProjetMaquette projet={SNCF_GPT} onRetour={() => setVue('vitrine')} />
              </Specimen>
            ) : (
              <Specimen settings={FOND} waveSignal={waveSignal}>
                <Maquette blocks={false} images={images} onOuvrir={() => setVue('projet')} />
              </Specimen>
            )}
          </div>
          <div className="atelier-stage__bar">
            <p>
              {vue === 'projet'
                ? 'La page SNCF GPT : fais défiler ; « ← Projets » ramène à la Vitrine'
                : 'La Vitrine : clique sur la carte SNCF GPT pour ouvrir sa page'}
            </p>
            <div>
              <button type="button" onClick={() => setPreview('projet')}>
                Plein écran <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="atelier-builder miniatures">
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
              <button type="button" onClick={() => setPreview('vitrine')}>
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
          {PHONES_PROJET.map((phone) => (
            <li key={phone.id}>
              <figure className="phone">
                <div className="phone__frame" ref={phone.section ? scrollToSection(phone.section) : undefined}>
                  <Specimen settings={FOND_LECTURE}>
                    <ProjetMobile
                      projet={SNCF_GPT}
                      menuOpen={phone.section ? false : menuProjet}
                      onMenu={phone.section ? undefined : setMenuProjet}
                    />
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

      {preview && (
        <SpecimenPreview
          settings={preview === 'projet' ? FOND_LECTURE : FOND}
          label={preview === 'projet' ? 'La page SNCF GPT en plein écran' : 'La Vitrine en plein écran'}
          onClose={close}
        >
          {preview === 'projet' ? <ProjetMaquette projet={SNCF_GPT} /> : <Maquette blocks={false} images={images} />}
        </SpecimenPreview>
      )}
    </section>
  );
}
