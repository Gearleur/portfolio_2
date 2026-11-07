import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ChoixLangueContext, LangueContext } from '../atelier/langue';
import type { Langue } from '../atelier/langue';
import { Maquette, MaquetteMobile } from '../atelier/Maquettes';
import { MiniatureAlpine } from '../atelier/MiniatureAlpine';
import { Miniature } from '../atelier/Miniature';
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
const NOMS: Record<string, string> = { '01': 'SNCF GPT', '02': 'Whiteboard AMDEC' };

// The project pages (texts, diagrams, logos) are a chunk of their own, fetched when the home is idle.
const chargerProjet = () => import('./PageProjet');
const PageProjet = lazy(chargerProjet);

const lireAdresse = () => window.location.hash.replace(/^#/, '');

/** The page's language: the one chosen before, else the browser's (French for French, English otherwise). */
function useLangueChoisie() {
  const [langue, setLangue] = useState<Langue>(() => {
    try {
      const gardee = window.localStorage.getItem('langue');
      if (gardee === 'fr' || gardee === 'en') return gardee;
    } catch {
      /* storage blocked: the browser's language will do */
    }
    return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  });
  useEffect(() => {
    document.documentElement.lang = langue;
    try {
      window.localStorage.setItem('langue', langue);
    } catch {
      /* not kept, still works */
    }
  }, [langue]);
  return [langue, setLangue] as const;
}

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
  const [langue, setLangue] = useLangueChoisie();
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
  const projet = numero !== undefined;

  useEffect(() => {
    document.title = numero ? `${NOMS[numero]} — Alexandre Teixeira` : 'Alexandre Teixeira — Portfolio';
  }, [numero]);

  useEffect(() => {
    const repos = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 2500));
    repos(() => void chargerProjet());
  }, []);

  const ouvrir = (n: string) => {
    if (!ADRESSES[n]) return;
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
    '01': <Miniature cadrage="paysage" />,
    '02': <MiniatureAlpine />,
  };

  let page;
  if (numero) {
    page = (
      <Suspense fallback={null}>
        <PageProjet key={adresse} numero={numero} telephone={telephone} onRetour={retour} menuOpen={menu} onMenu={setMenu} />
      </Suspense>
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
      <LangueContext.Provider value={langue}>
        <ChoixLangueContext.Provider value={setLangue}>
          {/* A new stage for each kind of page: a wave under way on the Vitrine stops at a project page. */}
          <Specimen key={projet ? 'lecture' : 'vitrine'} settings={projet ? FOND_LECTURE : FOND} reelle={!telephone}>
            {page}
          </Specimen>
        </ChoixLangueContext.Provider>
      </LangueContext.Provider>
    </main>
  );
}
