import { useEffect, useRef, useState } from 'react';
import { Maquette, MaquetteMobile } from '../atelier/Maquettes';
import whiteboardAmdec from '../atelier/medias/whiteboard-amdec.webp';
import { Miniature } from '../atelier/Miniature';
import { ProjetMaquette, ProjetMobile } from '../atelier/Projet';
import { PROJETS } from '../atelier/projets';
import { Specimen } from '../atelier/Specimen';
import { FOND, FOND_LECTURE } from '../atelier/tokens';

/*
 * The Vitrine at /portfolio/ (step 8, a first version put online early,
 * journal n° 99): the pieces validated in the Atelier, at real size on a
 * desktop and on the phone layout below 720 px. Each project page has its
 * own address, #sncf-gpt or #whiteboard-amdec, so it can be shared and the
 * back button works.
 */

const ADRESSES: Record<string, string> = { '01': 'sncf-gpt', '02': 'whiteboard-amdec' };

const lireAdresse = () => window.location.hash.replace(/^#/, '');

function useTelephone() {
  const query = '(max-width: 720px)';
  const [telephone, setTelephone] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const change = () => setTelephone(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  return telephone;
}

export function Vitrine() {
  const telephone = useTelephone();
  const [adresse, setAdresse] = useState(lireAdresse);
  const [menu, setMenu] = useState(false);
  // Whether the project page was opened from the Vitrine, in this visit.
  const depuisVitrine = useRef(false);

  useEffect(() => {
    const change = () => {
      setAdresse(lireAdresse());
      setMenu(false);
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);

  const numero = Object.keys(ADRESSES).find((n) => ADRESSES[n] === adresse);
  const projet = numero ? PROJETS[numero] : undefined;

  useEffect(() => {
    document.title = projet ? `${projet.nom} — Alexandre Teixeira` : 'Alexandre Teixeira — Portfolio';
  }, [projet]);

  const ouvrir = (n: string) => {
    if (!PROJETS[n] || !ADRESSES[n]) return;
    depuisVitrine.current = true;
    window.location.hash = ADRESSES[n];
  };
  const retour = () => {
    // Back to the projects: one step back if we came from the Vitrine, so its
    // scroll is where it was; from a shared link, the Vitrine's own address.
    if (depuisVitrine.current) window.history.back();
    else window.history.pushState(null, '', window.location.pathname);
    if (!depuisVitrine.current) setAdresse('');
    depuisVitrine.current = false;
  };

  const images = {
    '01': <Miniature cadrage={telephone ? 'portrait' : 'paysage'} />,
    '02': <img src={whiteboardAmdec} alt="" />,
  };

  let page;
  if (projet) {
    page = telephone ? (
      <ProjetMobile key={adresse} projet={projet} onRetour={retour} menuOpen={menu} onMenu={setMenu} />
    ) : (
      <ProjetMaquette key={adresse} projet={projet} onRetour={retour} />
    );
  } else {
    page = telephone ? (
      <MaquetteMobile blocks={false} glisse menuOpen={menu} onMenu={setMenu} images={images} onOuvrir={ouvrir} />
    ) : (
      <Maquette blocks={false} images={images} onOuvrir={ouvrir} />
    );
  }

  return (
    <main className="vitrine">
      {/* A new stage for each kind of page: a wave under way on the Vitrine stops at a project page. */}
      <Specimen key={projet ? 'lecture' : 'vitrine'} settings={projet ? FOND_LECTURE : FOND} reelle={!telephone}>
        {page}
      </Specimen>
    </main>
  );
}
