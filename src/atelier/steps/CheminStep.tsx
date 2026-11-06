import { useCallback, useEffect, useState } from 'react';
import { useCopyText } from '../../hooks/useCopyText';
import { Maquette } from '../Maquettes';
import type { Layout } from '../Maquettes';
import { Specimen, SpecimenPreview } from '../Specimen';
import { ESPACES, FOND } from '../tokens';
import { useWaveSignal } from '../useWave';
import './chemin.css';

type Group = 'colonnes' | 'laterale' | 'agence' | 'autres' | 'cote';

const GROUPS: { id: Group; name: string }[] = [
  { id: 'colonnes', name: 'Colonnes' },
  { id: 'laterale', name: 'Nav latérale' },
  { id: 'agence', name: 'Agence' },
  { id: 'autres', name: 'Autres pistes' },
  { id: 'cote', name: 'Mises de côté' },
];

/** `name` is the button inside its group, `title` names the layout on its own. */
const LAYOUTS: { id: Layout; group: Group; name: string; title: string; note: string }[] = [
  {
    id: 'colonnes',
    group: 'colonnes',
    name: 'Classique',
    title: 'Colonnes',
    note: 'À la Van Arnam : qui tu es à gauche, l’index des projets à droite, les visuels en bas. Tout l’essentiel tient dans le premier écran.',
  },
  {
    id: 'colonnes-index',
    group: 'colonnes',
    name: 'Index d’abord',
    title: 'Colonnes · index d’abord',
    note: 'Les projets d’abord : l’index à gauche, une vignette et un grand titre serif par ligne ; qui tu es à droite, en plus petit. Pour un recruteur qui veut voir le travail tout de suite.',
  },
  {
    id: 'colonnes-trois',
    group: 'colonnes',
    name: 'Trois colonnes',
    title: 'Colonnes · trois colonnes',
    note: 'La phrase en haut, puis trois colonnes titrées, Qui, Projets et Contact, chacune sous un filet. Très lisible, comme un sommaire.',
  },
  {
    id: 'laterale',
    group: 'laterale',
    name: 'Classique',
    title: 'Nav latérale',
    note: 'À la Rachel Chen : une colonne fixe pour le nom et la nav, puis la phrase-titre et les projets en cartes avec leurs visuels.',
  },
  {
    id: 'laterale-liste',
    group: 'laterale',
    name: 'Liste',
    title: 'Nav latérale · liste',
    note: 'Les projets en grands titres serif, un par ligne, l’étape et l’année à droite. Plus éditorial que les cartes.',
  },
  {
    id: 'laterale-droite',
    group: 'laterale',
    name: 'À droite',
    title: 'Nav latérale · à droite',
    note: 'La même page, mais la colonne du nom et de la nav ferme la page à droite : le contenu part du bord gauche. Inhabituel, donc remarqué.',
  },
  {
    id: 'agence',
    group: 'agence',
    name: 'Classique',
    title: 'Agence',
    note: 'Un cabinet d’architectes (Chipperfield, Herzog & de Meuron) : une image, la phrase, et les projets en fiche technique (programme, équipe, statut, année). Twist possible : chaque projet raconté comme un bâtiment, la mise en service comme une livraison.',
  },
  {
    id: 'agence-cadre',
    group: 'agence',
    name: 'Plein cadre',
    title: 'Agence · plein cadre',
    note: 'Une grande image sur toute la largeur, la phrase posée dessus en bas à gauche, la fiche technique en dessous sur toute la largeur.',
  },
  {
    id: 'agence-index',
    group: 'agence',
    name: 'Index seul',
    title: 'Agence · index seul',
    note: 'Pas d’image en grand : la phrase, puis la fiche technique sur toute la largeur. L’aperçu du projet survolé apparaît en petit à côté de la phrase.',
  },
  {
    id: 'affiche',
    group: 'autres',
    name: 'Affiche suisse',
    title: 'Affiche suisse',
    note: 'Une affiche de design suisse (Müller-Brockmann, Vignelli) : quatre colonnes d’infos, la phrase en très grand, les projets en gros chiffres. Twist possible : la rigueur suisse, mais en serif, avec l’onde qui traverse.',
  },
  {
    id: 'journal',
    group: 'autres',
    name: 'Journal',
    title: 'Journal',
    note: 'Un quotidien grand format (FT Weekend, Le Monde) : ton nom en titre de journal entre deux filets, la phrase en manchette, les infos en encadré, les projets en articles sur quatre colonnes séparées de filets. Twist possible : un journal qui ne parle que de toi, daté du jour.',
  },
  {
    id: 'cartel',
    group: 'autres',
    name: 'Cartel',
    title: 'Cartel',
    note: 'Une galerie d’art (White Cube, Fondation Cartier) : une seule œuvre à la fois, avec son cartel comme au musée (titre en italique, année, médium, statut). Twist possible : le médium, ce sont les modèles et le code.',
  },
  {
    id: 'plan',
    group: 'autres',
    name: 'Plan',
    title: 'Plan',
    note: 'Un plan d’architecte : les colonnes nommées de A à P et tracées sur toute la page, les projets en nomenclature, un cartouche en bas à droite (projet, auteur, échelle, date, planche). Twist possible : ta grille devient le décor.',
  },
  {
    id: 'manuel',
    group: 'autres',
    name: 'Manuel',
    title: 'Manuel',
    note: 'Un manuel de normes graphiques (Vignelli, NASA 1975) : un en-tête courant, un sommaire numéroté, des sections 1.0 et 2.0, les projets en sous-sections 2.1 à 2.4, un folio. Twist possible : ton portfolio lu comme le mode d’emploi de ton travail.',
  },
  {
    id: 'coins',
    group: 'cote',
    name: 'Quatre coins',
    title: 'Quatre coins',
    note: 'À la Kalkbrenner : la phrase-titre seule au milieu, le nom, la nav, les infos et le contact dans les coins. Les projets viennent en faisant défiler. Le plus épuré.',
  },
  {
    id: 'couverture',
    group: 'cote',
    name: 'Couverture',
    title: 'Couverture',
    note: 'Une couverture de magazine de mode (Vogue, The Gentlewoman) : ton nom en manchette sur toute la largeur, le numéro et la date, les projets en titres de une autour d’une grande image. Twist possible : l’image passe devant ton nom, comme le mannequin devant le titre.',
  },
  {
    id: 'lookbook',
    group: 'cote',
    name: 'Lookbook',
    title: 'Lookbook',
    note: 'Le lookbook d’une maison de mode (The Row, Jil Sander) : ton nom discret au centre, les projets comme des silhouettes numérotées, beaucoup de vide. Twist possible : chaque look s’ouvre sur une fiche, comme l’étiquette d’un vêtement.',
  },
];

type Tuning = { layout: Layout; blocks: boolean };

const STORAGE_KEY = 'atelier:chemin:v1';
const DEFAULT_TUNING: Tuning = { layout: 'colonnes', blocks: false };

function loadTuning(): Tuning {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Tuning | null;
    if (saved && LAYOUTS.some((layout) => layout.id === saved.layout)) return saved;
  } catch {
    // Storage can be unavailable; start from the first layout.
  }
  return DEFAULT_TUNING;
}

/** Step 5: where each element of the Vitrine goes. */
export function CheminStep() {
  const [tuning, setTuning] = useState(loadTuning);
  const [showGrid, setShowGrid] = useState(false);
  const [open, setOpen] = useState(false);
  const [waveSignal, playWave] = useWaveSignal();
  const close = useCallback(() => setOpen(false), []);
  const { copy, state } = useCopyText();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tuning));
    } catch {
      // Keeping the choice across reloads is a convenience only.
    }
  }, [tuning]);

  // G shows or hides the columns, as at step 4.
  useEffect(() => {
    const toggle = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'g' || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
      setShowGrid((visible) => !visible);
    };
    window.addEventListener('keydown', toggle);
    return () => window.removeEventListener('keydown', toggle);
  }, []);

  const layout = LAYOUTS.find((item) => item.id === tuning.layout) ?? LAYOUTS[0];
  const summary = `Chemin de fer : ${layout.title}${tuning.blocks ? ' (vu en blocs)' : ''}`;

  const gridButton = (
    <button type="button" aria-pressed={showGrid} onClick={() => setShowGrid((visible) => !visible)}>
      Grille <kbd>G</kbd>
    </button>
  );
  const maquette = <Maquette layout={tuning.layout} blocks={tuning.blocks} columns={showGrid ? ESPACES.columns : undefined} />;

  return (
    <section className="atelier-step" aria-labelledby="step-chemin">
      <header className="atelier-step__head">
        <span className="atelier-step__index">05</span>
        <h2 id="step-chemin">Le chemin de fer</h2>
        <span className="atelier-status">En cours</span>
      </header>
      <p className="atelier-step__note">
        Où va chaque élément du premier écran de la Vitrine : le nom, la nav, la phrase-titre, les infos, les projets,
        le contact. Les trois placements utilisent la grille, la typo et les couleurs validées. « Blocs » remplace les
        mots par des pavés gris pour ne juger que la place. Les textes sont provisoires : ils viendront à l’étape 7.
      </p>

      <div className="atelier-builder">
        <div className="atelier-panel">
          <fieldset>
            <legend>Composition</legend>
            {GROUPS.map((group) => (
              <div key={group.id} className="chemin-round">
                <p className="atelier-panel__note">{group.name}</p>
                <div className="atelier-presets">
                  {LAYOUTS.filter((item) => item.group === group.id).map((item) => (
                    <button key={item.id} type="button" aria-pressed={item.id === tuning.layout} title={item.note} onClick={() => setTuning((current) => ({ ...current, layout: item.id }))}>
                      <LayoutGlyph layout={item.id} />
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="atelier-panel__note">{layout.note}</p>
          </fieldset>

          <fieldset>
            <legend>Affichage</legend>
            <div className="atelier-segment" role="group" aria-label="Contenu">
              <button type="button" aria-pressed={!tuning.blocks} onClick={() => setTuning((current) => ({ ...current, blocks: false }))}>
                Texte
              </button>
              <button type="button" aria-pressed={tuning.blocks} onClick={() => setTuning((current) => ({ ...current, blocks: true }))}>
                Blocs
              </button>
            </div>
            <p className="atelier-panel__note">La touche G affiche les 16 colonnes par-dessus.</p>
          </fieldset>

          <div className="atelier-panel__footer">
            <button type="button" onClick={() => setTuning(DEFAULT_TUNING)}>
              Réinitialiser
            </button>
            <button type="button" onClick={() => copy(summary)}>
              {state === 'copied' ? 'Copié' : state === 'error' ? 'Copie impossible' : 'Copier mes réglages'}
            </button>
          </div>
        </div>

        <div className="atelier-stage">
          <div className="atelier-stage__frame">
            <Specimen settings={FOND} waveSignal={waveSignal}>
              {maquette}
            </Specimen>
          </div>
          <div className="atelier-stage__bar">
            <p>{layout.title} · premier écran à 1440 × 900</p>
            <div>
              {gridButton}
              <button type="button" onClick={() => playWave('first')}>
                Rejouer l’arrivée
              </button>
              <button type="button" onClick={() => setOpen(true)}>
                Plein écran <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <SpecimenPreview settings={FOND} label="Chemin de fer en plein écran" tools={gridButton} onClose={close}>
          {maquette}
        </SpecimenPreview>
      )}
    </section>
  );
}

// Each layout drawn small: the headline in ink, runs of words in grey, visuals as boxes.
const GLYPHS: Record<Layout, { title: string; rest: string[] }> = {
  coins: { title: 'M3 15h24v4H3z', rest: ['M3 4h10v2H3z', 'M31 4h14v2H31z', 'M3 30h16v2H3z', 'M35 30h10v2H35z'] },
  colonnes: {
    title: 'M3 11h18v4H3z',
    rest: ['M3 4h10v2H3z', 'M26 4h19v2H26z', 'M3 18h14v2H3z', 'M26 11h19v1H26zM26 15h19v1H26zM26 19h19v1H26z', 'M3 28h9v8H3zM14 28h9v8h-9zM25 28h9v8h-9zM36 28h9v8h-9z'],
  },
  laterale: {
    title: 'M15 6h30v4H15z',
    rest: ['M3 4h8v2H3z', 'M3 10h6v1H3zM3 13h6v1H3zM3 16h6v1H3z', 'M3 30h7v1H3z', 'M15 13h16v2H15z', 'M15 21h9v15h-9zM26 21h9v15h-9zM37 21h8v15h-8z'],
  },
  'colonnes-index': {
    title: 'M37 11h8v3h-8z',
    rest: ['M3 4h10v2H3z', 'M26 4h19v2H26z', 'M3 11h4v3H3zM9 11.5h13v2H9zM3 17h4v3H3zM9 17.5h13v2H9zM3 23h4v3H3zM9 23.5h13v2H9zM3 29h4v3H3zM9 29.5h13v2H9z', 'M37 17h8v1h-8zM37 20h8v1h-8z'],
  },
  'colonnes-trois': {
    title: 'M3 10h30v4H3z',
    rest: ['M3 4h10v2H3z', 'M26 4h19v2H26z', 'M3 20h13v.5H3zM18 20h13v.5H18zM33 20h12v.5H33z', 'M3 23h12v1H3zM3 26h10v1H3zM18 23h13v1H18zM18 26h13v1H18zM18 29h13v1H18zM33 23h8v1h-8zM33 26h6v1h-6z'],
  },
  'laterale-liste': {
    title: 'M15 6h30v4H15z',
    rest: ['M3 4h8v2H3z', 'M3 10h6v1H3zM3 13h6v1H3zM3 16h6v1H3z', 'M3 30h7v1H3z', 'M15 13h16v2H15z', 'M15 20h22v2.5H15zM15 25h20v2.5H15zM15 30h24v2.5H15z'],
  },
  'laterale-droite': {
    title: 'M3 6h30v4H3z',
    rest: ['M37 4h8v2h-8z', 'M39 10h6v1h-6zM39 13h6v1h-6zM39 16h6v1h-6z', 'M38 30h7v1h-7z', 'M3 13h16v2H3z', 'M3 21h9v15H3zM14 21h9v15h-9zM25 21h8v15h-8z'],
  },
  'agence-cadre': {
    title: 'M6 18h20v3H6z',
    rest: ['M3 4h8v1.5H3zM16 4h12v1.5H16zM37 4h8v1.5h-8z', 'M3 8h42v16H3z', 'M3 27h42v1H3zM3 30h42v1H3zM3 33h42v1H3z'],
  },
  'agence-index': {
    title: 'M3 9h28v4H3z',
    rest: ['M3 4h8v1.5H3zM16 4h12v1.5H16zM37 4h8v1.5h-8z', 'M35 9h10v8H35z', 'M3 24h42v1H3zM3 27h42v1H3zM3 30h42v1H3zM3 33h42v1H3z'],
  },
  couverture: {
    title: 'M3 3h42v6H3z',
    rest: ['M3 11h42v1H3z', 'M15 14h18v18H15z', 'M3 16h9v2H3zM3 21h9v2H3zM3 26h9v2H3z', 'M36 18h9v3h-9zM36 23h9v1h-9z', 'M3 34h12v1H3z'],
  },
  lookbook: {
    title: 'M3 28h22v4H3z',
    rest: ['M20 4h8v1.5h-8z', 'M3 4h10v1.5H3zM37 4h8v1.5h-8z', 'M5 10h7v12H5zM16 10h7v12h-7zM27 10h7v12h-7zM38 10h7v12h-7z'],
  },
  agence: {
    title: 'M21 10h24v4H21z',
    rest: ['M3 4h8v1.5H3zM16 4h12v1.5H16zM37 4h8v1.5h-8z', 'M3 12h14v22H3z', 'M21 25h24v1H21zM21 28h24v1H21zM21 31h24v1H21z'],
  },
  journal: {
    title: 'M3 14h30v4H3z',
    rest: ['M3 3h12v1.5H3zM33 3h12v1.5H33z', 'M3 6h42v.5H3zM14 7h20v3H14zM3 11h42v.8H3z', 'M37 14h8v1h-8zM37 17h8v1h-8z', 'M3 24h9v1H3zM3 27h9v6H3zM14 24h9v1h-9zM14 27h9v6h-9zM25 24h9v1h-9zM25 27h9v6h-9zM36 24h9v1h-9zM36 27h9v6h-9z'],
  },
  cartel: {
    title: 'M3 9h24v3H3z',
    rest: ['M3 3h9v1.5H3zM33 3h12v1.5H33z', 'M15 16h18v16H15z', 'M36 26h9v1.5h-9zM36 29h7v1h-7zM36 31h8v1h-8z', 'M3 31h6v1H3z'],
  },
  plan: {
    title: 'M7 14h28v4H7z',
    rest: ['M8 4h.4v31H8zM16 4h.4v31h-.4zM24 4h.4v31h-.4zM32 4h.4v31h-.4zM40 4h.4v31h-.4z', 'M3 3h42v.5H3z', 'M3 27h22v1H3zM3 30h22v1H3zM3 33h22v1H3z', 'M30 25h15v10H30z'],
  },
  manuel: {
    title: 'M21 10h24v4H21z',
    rest: ['M3 3h42v.5H3z', 'M3 9h8v1H3zM3 12h8v1H3zM3 15h8v1H3zM3 18h8v1H3z', 'M15 10h4v4h-4z', 'M15 27h30v.5H15zM15 29h6v4h-6zM23 29h6v4h-6zM31 29h6v4h-6zM39 29h6v4h-6z', 'M3 33h5v1H3z'],
  },
  affiche: {
    title: 'M3 12h42v6H3zM3 19h30v6H3z',
    rest: ['M3 3h8v1.5H3zM14 3h8v1.5h-8zM25 3h8v1.5h-8zM36 3h8v1.5h-8z', 'M3 7h42v.5H3z', 'M3 29h6v4H3zM14 29h6v4h-6zM25 29h6v4h-6zM36 29h6v4h-6z'],
  },
};

function LayoutGlyph({ layout }: { layout: Layout }) {
  const { title, rest } = GLYPHS[layout];
  return (
    <span className="atelier-glyph layout-glyph" aria-hidden="true">
      <svg viewBox="0 0 48 36">
        {rest.map((d) => (
          <path key={d} d={d} style={{ fill: 'color-mix(in oklch, var(--ink) 30%, var(--fond))' }} />
        ))}
        <path d={title} style={{ fill: 'var(--ink)' }} />
      </svg>
    </span>
  );
}
