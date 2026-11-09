import { useState } from 'react';
import { FiltreVerre } from './FiltreVerre';
import { MaquetteMobile } from './Maquettes';
import { MiniatureAlpine } from './MiniatureAlpine';
import { Miniature } from './Miniature';
import { MiniatureReunions } from './MiniatureReunions';
import { ProjetMobile } from './Projet';
import { PROJETS } from './projets';
import { Specimen } from './Specimen';
import { FOND, FOND_LECTURE } from './tokens';

/*
 * The phone's navigation retained at step 7: the notch of refracting glass, at the top of the
 * home and of every article. The two phones below are the Vitrine's own pages; « Menu » works.
 */

function Accueil() {
  const [ouvert, setOuvert] = useState(false);
  return (
    <li>
      <figure className="phone">
        <div className="phone__frame">
          <Specimen settings={FOND}>
            <MaquetteMobile
              blocks={false}
              glisse
              variante="notch"
              menuOpen={ouvert}
              onMenu={setOuvert}
              images={{ '01': <MiniatureAlpine />, '02': <Miniature cadrage="paysage" />, '03': <MiniatureReunions /> }}
            />
          </Specimen>
        </div>
        <figcaption>
          <strong>L’accueil</strong>
          Le nom et « Menu » dans la notch. Le menu descend dessous : la nav et le contact.
        </figcaption>
      </figure>
    </li>
  );
}

function Article() {
  const [ouvert, setOuvert] = useState(false);
  const projet = PROJETS['03'];
  if (!projet) return null;
  return (
    <li>
      <figure className="phone">
        <div className="phone__frame">
          <Specimen settings={FOND_LECTURE}>
            <ProjetMobile projet={projet} variante="notch" menuOpen={ouvert} onMenu={setOuvert} />
          </Specimen>
        </div>
        <figcaption>
          <strong>Un article</strong>
          « ‹ Projets » et « Menu » dans la notch. Le même menu que l’accueil, sans le sommaire.
        </figcaption>
      </figure>
    </li>
  );
}

export function MenuMobile() {
  return (
    <div className="miniatures">
      <FiltreVerre />
      <h3>
        Navigation sur téléphone{' '}
        <span>
          Retenue : une notch de verre réfractant, en haut de l’accueil et de chaque article. Fais défiler : le texte se
          courbe sous elle (Chrome et Android ; ailleurs, un verre dépoli).
        </span>
      </h3>
      <ul className="phones" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 320px))' }}>
        <Accueil />
        <Article />
      </ul>
    </div>
  );
}
