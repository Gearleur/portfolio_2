import { lazy, Suspense, useEffect, useState } from 'react';
import type { ComponentType } from 'react';

/*
 * Atelier 2: the workshop of the Vitrine's Machine mode, one step per decision
 * (M1 to M7). Each step is a bench in ./steps/, named by `fichier` and exporting
 * a component of the same name; a step whose file is not written yet shows as
 * « à venir ». The brief below is what Alexandre settled on 2026-11-19.
 */

type Etape = { id: string; nom: string; fichier: string; decide: string; statut: 'valide' | 'en-cours' | 'a-venir' };

const ETAPES: Etape[] = [
  { id: 'm1', nom: 'La matière', fichier: 'M1Matiere', decide: 'La page effacée, les miniatures enfoncées, le terminal en verre fumé.', statut: 'en-cours' },
  { id: 'm2', nom: 'Typo et grille', fichier: 'M2Typo', decide: 'La mono de base du terminal et sa grille de cellules.', statut: 'a-venir' },
  { id: 'm3', nom: 'Le curseur', fichier: 'M3Curseur', decide: 'L’interrupteur Humain / Machine en bas de page.', statut: 'a-venir' },
  { id: 'm4', nom: 'Le passage', fichier: 'M4Passage', decide: 'L’animation de 0 à 1 : on doit sentir qu’on perd de l’âme.', statut: 'a-venir' },
  { id: 'm5', nom: 'Le contenu', fichier: 'M5Contenu', decide: 'Les dossiers et les fichiers, les langues, les images en [image].', statut: 'a-venir' },
  { id: 'm6', nom: 'Se déplacer', fichier: 'M6Deplacer', decide: 'Clavier et souris ; le téléphone ensuite.', statut: 'a-venir' },
  { id: 'm7', nom: 'Finitions', fichier: 'M7Finitions', decide: 'Mouvement réduit, accessibilité, poids, tests.', statut: 'a-venir' },
];

const BRIEF: [string, string][] = [
  ['Le passage', '0 ou 1, pas d’entre-deux. L’animation montre qu’on perd de l’âme et de la profondeur.'],
  ['La page effacée', 'Des traits gris de coups de gomme. Les miniatures ont disparu, juste enfoncées dans le papier, avec quelques formes qui restent.'],
  ['Le terminal', 'En verre fumé foncé, qui se détache du fond. Il montre les fichiers à disposition : le CV, les articles.'],
  ['La typo', 'La mono la plus courante d’un terminal de base.'],
  ['Le curseur', 'Classique.'],
  ['Le contenu', 'Un vrai terminal : ls, des dossiers. Entrer dans le dossier d’une langue redémarre le terminal dans cette langue. Une image s’écrit [image] avec sa référence, comme en Markdown.'],
  ['Se déplacer', 'Au clavier et à la souris. Le téléphone, on verra.'],
  ['Pour plus tard', 'Un faux ChatGPT côté page humaine, aux réponses écrites d’avance : idée gardée de côté.'],
];

const modules = import.meta.glob<Record<string, ComponentType>>('./steps/*.tsx');
const VUES = Object.fromEntries(
  ETAPES.filter((etape) => `./steps/${etape.fichier}.tsx` in modules).map((etape) => [
    etape.id,
    lazy(() => modules[`./steps/${etape.fichier}.tsx`]().then((module) => ({ default: module[etape.fichier] }))),
  ]),
);

const etapeLue = () => {
  const id = window.location.hash.replace(/^#/, '');
  return id in VUES ? id : (ETAPES.find((etape) => etape.statut === 'en-cours' && etape.id in VUES)?.id ?? '');
};

export function AtelierMachine() {
  const [active, setActive] = useState(etapeLue);

  useEffect(() => {
    const sync = () => setActive(etapeLue());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const Vue = VUES[active];
  const etape = ETAPES.find((e) => e.id === active);

  return (
    <main className="atelier-canvas">
      <header className="atelier-head">
        <h1>Atelier 2</h1>
        <p>
          Mode Machine · <a href="/atelier/">Atelier 1</a> · <a href="/">Vitrine</a>
        </p>
      </header>

      <section className="am-brief" aria-labelledby="am-brief-titre">
        <h2 id="am-brief-titre">Le brief</h2>
        <dl>
          {BRIEF.map(([terme, texte]) => (
            <div key={terme}>
              <dt>{terme}</dt>
              <dd>{texte}</dd>
            </div>
          ))}
        </dl>
      </section>

      <nav className="atelier-steps" aria-label="Étapes">
        <ol>
          {ETAPES.map((e) => (
            <li key={e.id}>
              {e.id in VUES ? (
                <a className="atelier-steps__item" href={`#${e.id}`} data-status={e.statut} aria-current={e.id === active ? 'step' : undefined}>
                  <span>{e.id.toUpperCase()}</span> {e.nom}
                </a>
              ) : (
                <span className="atelier-steps__item" data-status={e.statut} aria-disabled="true" title={e.decide}>
                  <span>{e.id.toUpperCase()}</span> {e.nom}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {etape && <p className="am-decide">{etape.decide}</p>}
      {Vue ? (
        <Suspense fallback={null}>
          <Vue key={active} />
        </Suspense>
      ) : (
        <p className="am-decide">L’établi de la première étape arrive.</p>
      )}
    </main>
  );
}
