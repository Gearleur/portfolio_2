import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useCopyText } from '../../../shared/hooks/useCopyText';
import { Range } from '../controls';
import { Specimen, SpecimenPreview } from '../Specimen';
import { Temoin } from '../Temoin';
import { ESPACES, FOND } from '../tokens';
import { useWaveSignal } from '../useWave';
import './espaces.css';

type Progression = 'multiples' | 'or';

type Tuning = {
  /** Spacing unit, px at a 1440 px wide page. */
  base: number;
  /** How the spacing scale grows from the unit. */
  progression: Progression;
  columns: number;
  /** Space between two columns, px. */
  gutter: number;
  /** Space on each side of the page, px. */
  margin: number;
};

const PAGE = 1440;
const COLUMNS = [6, 8, 12, 16];

const PROGRESSIONS: { id: Progression; name: string; steps: number[]; note: string }[] = [
  { id: 'multiples', name: 'Multiples', steps: [1, 2, 3, 4, 6, 8, 12, 16], note: 'L’unité ×1, 2, 3, 4, 6, 8, 12, 16 : régulier, facile à retenir.' },
  { id: 'or', name: 'Nombre d’or', steps: [1, 2, 3, 5, 8, 13, 21, 34], note: 'L’unité suivant Fibonacci (1, 2, 3, 5, 8, 13…) : les grands vides grandissent plus vite.' },
];

type Composition = { id: string; name: string; note: string; tuning: Tuning };

const COMPOSITIONS: Composition[] = [
  {
    id: 'retenu',
    name: 'Retenu',
    note: 'Validé le 6 nov. : une unité de 4 px en multiples, 16 colonnes de 73 px, gouttières et marges de 16 px. La page va presque d’un bord à l’autre.',
    tuning: { base: ESPACES.base, progression: ESPACES.progression, columns: ESPACES.columns, gutter: ESPACES.gutter, margin: ESPACES.margin },
  },
  {
    id: 'reguliere',
    name: 'Régulière',
    note: 'La grille classique : une unité de 8 px, 12 colonnes, des marges de 72 px. Proche de la page témoin actuelle.',
    tuning: { base: 8, progression: 'multiples', columns: 12, gutter: 24, margin: 72 },
  },
  {
    id: 'ample',
    name: 'Ample',
    note: 'Comme les boutiques de mode : de grandes marges, des écarts en nombre d’or. La page respire.',
    tuning: { base: 8, progression: 'or', columns: 12, gutter: 32, margin: 128 },
  },
  {
    id: 'serree',
    name: 'Serrée',
    note: 'Comme un index (Van Arnam) : une unité de 4 px, 16 colonnes fines, des marges courtes. Beaucoup d’information, bien rangée.',
    tuning: { base: 4, progression: 'multiples', columns: 16, gutter: 16, margin: 40 },
  },
];

// Where the stand-in page uses each step of the scale (see .temoin[data-grid] in atelier.css).
const USES: Record<number, string> = {
  1: 'Entre une étiquette et sa valeur',
  3: 'Les lignes de l’index',
  5: 'Entre le titre et les infos, entre les liens du menu',
  6: 'Le haut et le bas de la page',
};

const STORAGE_KEY = 'atelier:espaces:v1';

function loadTuning(): Tuning {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Tuning | null;
    if (saved && COLUMNS.includes(saved.columns) && PROGRESSIONS.some((item) => item.id === saved.progression)) return saved;
  } catch {
    // Storage can be unavailable; start from the first composition.
  }
  return COMPOSITIONS[0].tuning;
}

const sameTuning = (a: Tuning, b: Tuning) => (Object.keys(a) as (keyof Tuning)[]).every((key) => a[key] === b[key]);
const px = (value: number) => `${String(Math.round(value * 10) / 10).replace('.', ',')} px`;

/** How many columns each block of the stand-in page covers, for any column count. */
function spans(columns: number) {
  const number = 1;
  const stage = Math.round(columns / 4);
  const year = Math.max(1, Math.round(columns / 6));
  return {
    title: Math.round((columns * 2) / 3),
    fact: Math.floor(columns / 4),
    number,
    name: columns - number - stage - year,
    stage,
    year,
  };
}

/** Step 4: the spacing scale and the column grid. */
export function EspacesStep() {
  const [tuning, setTuning] = useState(loadTuning);
  const [showGrid, setShowGrid] = useState(true);
  const [open, setOpen] = useState(false);
  const [waveSignal, playWave] = useWaveSignal();
  const close = useCallback(() => setOpen(false), []);
  const { copy, state } = useCopyText();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tuning));
    } catch {
      // Keeping the tuning across reloads is a convenience only.
    }
  }, [tuning]);

  // G shows or hides the columns, as in Figma.
  useEffect(() => {
    const toggle = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'g' || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
      setShowGrid((visible) => !visible);
    };
    window.addEventListener('keydown', toggle);
    return () => window.removeEventListener('keydown', toggle);
  }, []);

  const set = (patch: Partial<Tuning>) => setTuning((current) => ({ ...current, ...patch }));
  const composition = COMPOSITIONS.find((preset) => sameTuning(preset.tuning, tuning));
  const progression = PROGRESSIONS.find((item) => item.id === tuning.progression) ?? PROGRESSIONS[0];
  const scale = progression.steps.map((step) => step * tuning.base);
  const column = (PAGE - 2 * tuning.margin - (tuning.columns - 1) * tuning.gutter) / tuning.columns;
  const span = spans(tuning.columns);

  const style = {
    '--cols': tuning.columns,
    '--gutter': tuning.gutter,
    '--margin': tuning.margin,
    ...Object.fromEntries(scale.map((value, index) => [`--space-${index + 1}`, value])),
    ...Object.fromEntries(Object.entries(span).map(([name, value]) => [`--span-${name}`, value])),
  } as CSSProperties;

  const gridLine = `${tuning.columns} colonnes de ${px(column)} · gouttière ${px(tuning.gutter)} · marges ${px(tuning.margin)}`;
  const summary = [
    `Espaces : unité ${px(tuning.base)} · ${progression.name.toLowerCase()} · ${scale.join(' · ')} px`,
    `Grille : ${gridLine} (page de ${PAGE} px)`,
  ].join('\n');

  const gridButton = (
    <button type="button" aria-pressed={showGrid} onClick={() => setShowGrid((visible) => !visible)}>
      Grille <kbd>G</kbd>
    </button>
  );
  const temoin = <Temoin grid={{ columns: tuning.columns, visible: showGrid }} />;

  return (
    <section className="atelier-step" aria-labelledby="step-espaces">
      <header className="atelier-step__head">
        <span className="atelier-step__index">04</span>
        <h2 id="step-espaces">Espaces et grille</h2>
        <span className="atelier-status" data-status="valide">
          Validé le 6 nov.
        </span>
      </header>
      <p className="atelier-step__note">
        Le rythme de la page : une unité d’espacement qui donne tous les écarts, et une grille de colonnes sur laquelle
        tout s’aligne. Retenu : 4 px en multiples, 16 colonnes, gouttières et marges de 16 px. La place des éléments se
        décide à l’étape 5. La touche G affiche ou masque les colonnes.
      </p>

      <div className="atelier-builder">
        <div className="atelier-panel">
          <fieldset>
            <legend>Composition</legend>
            <div className="atelier-presets">
              {COMPOSITIONS.map((preset) => (
                <button key={preset.id} type="button" aria-pressed={preset === composition} title={preset.note} onClick={() => setTuning(preset.tuning)}>
                  <GridGlyph tuning={preset.tuning} />
                  {preset.name}
                </button>
              ))}
            </div>
            <p className="atelier-panel__note">{composition?.note ?? 'Composition ajustée à la main.'}</p>
          </fieldset>

          <fieldset>
            <legend>Rythme</legend>
            <Range label="Unité" min={4} max={12} step={1} value={tuning.base} format={px} onChange={(base) => set({ base })} />
            <div className="atelier-segment" role="group" aria-label="Progression">
              {PROGRESSIONS.map((item) => (
                <button key={item.id} type="button" aria-pressed={tuning.progression === item.id} onClick={() => set({ progression: item.id })}>
                  {item.name}
                </button>
              ))}
            </div>
            <p className="atelier-panel__note">{progression.note}</p>
          </fieldset>

          <fieldset>
            <legend>Grille</legend>
            <div className="atelier-segment" role="group" aria-label="Colonnes">
              <span className="atelier-segment__legend">Colonnes</span>
              {COLUMNS.map((count) => (
                <button key={count} type="button" aria-pressed={tuning.columns === count} onClick={() => set({ columns: count })}>
                  {count}
                </button>
              ))}
            </div>
            <Range label="Gouttière" min={8} max={48} step={4} value={tuning.gutter} format={px} onChange={(gutter) => set({ gutter })} />
            <Range label="Marges" min={16} max={160} step={4} value={tuning.margin} format={px} onChange={(margin) => set({ margin })} />
            <p className="atelier-panel__note">Chaque colonne fait {px(column)} sur une page de {PAGE} px.</p>
          </fieldset>

          <div className="atelier-panel__footer">
            <button type="button" onClick={() => setTuning(COMPOSITIONS[0].tuning)}>
              Réinitialiser
            </button>
            <button type="button" onClick={() => copy(summary)}>
              {state === 'copied' ? 'Copié' : state === 'error' ? 'Copie impossible' : 'Copier mes réglages'}
            </button>
          </div>
        </div>

        <div className="atelier-stage">
          <div className="atelier-stage__frame">
            <Specimen settings={FOND} waveSignal={waveSignal} style={style}>
              {temoin}
            </Specimen>
          </div>
          <div className="atelier-stage__bar">
            <p>{gridLine}</p>
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

      <div className="espaces">
        <h3>
          Espaces <span>En px pour une page de {PAGE} px. Du plus fin (entre une étiquette et sa valeur) au plus grand (entre deux sections).</span>
        </h3>
        <ol>
          {scale.map((value, index) => (
            <li key={index}>
              <span className="espaces__name">
                Espace {index + 1} <code>{px(value)}</code>
              </span>
              <span className="espaces__bar" style={{ width: value }} />
              <span className="espaces__use">{USES[index + 1]}</span>
            </li>
          ))}
        </ol>
      </div>

      {open && (
        <SpecimenPreview settings={FOND} style={style} label="Page témoin en plein écran" tools={gridButton} onClose={close}>
          {temoin}
        </SpecimenPreview>
      )}
    </section>
  );
}

/** A tiny page with its margins and columns, in place of a colour dot. */
function GridGlyph({ tuning }: { tuning: Tuning }) {
  const scale = 36 / PAGE;
  return (
    <span
      className="atelier-glyph grid-glyph"
      aria-hidden="true"
      style={{ '--cols': tuning.columns, gap: Math.max(1, tuning.gutter * scale), padding: `0 ${tuning.margin * scale}px` } as CSSProperties}
    >
      {Array.from({ length: tuning.columns }, (_, index) => (
        <span key={index} />
      ))}
    </span>
  );
}
