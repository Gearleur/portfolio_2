import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useCopyText } from '../../hooks/useCopyText';
import { Range } from '../controls';
import { Specimen, SpecimenPreview } from '../Specimen';
import { Temoin } from '../Temoin';
import { FOND, TYPO } from '../tokens';
import { Typotheque } from '../Typotheque';
import { CATEGORIES, FONTS, ROLES, ensureFont, findFont, fontStack } from '../typotheque';
import type { FontChoice, Role } from '../typotheque';
import { useWaveSignal } from '../useWave';
import './typo.css';

type Tuning = {
  fonts: FontChoice;
  /** Body text size, px at a 1440 px wide page. */
  base: number;
  /** Labels (nav, dates, stages) size, px. */
  label: number;
  /** Modular scale ratio from the body text up to the subheadings. */
  ratio: number;
  /** The one big moment (the headline), px. */
  display: number;
  /** Headline letter-spacing, em. */
  tracking: number;
  /** Headline weight, when its face has a weight axis. */
  weight: number;
  /** Headline width, %, when its face has a width axis. */
  width: number;
  /** Labels (nav, dates, stages) in capitals or lower case. */
  caps: boolean;
};

type Composition = { id: string; name: string; note: string; tuning: Tuning };

const COMPOSITIONS: Composition[] = [
  {
    id: 'retenu',
    name: 'Retenu',
    note: 'Validé le 5 nov. : Instrument Serif à 58 px pour le titre, Inter à 13 px pour le texte, à 10,5 px en minuscules pour les étiquettes.',
    tuning: {
      fonts: { display: TYPO.display.font, text: TYPO.text.font, label: TYPO.label.font },
      base: TYPO.text.size,
      label: TYPO.label.size,
      ratio: TYPO.ratio,
      display: TYPO.display.size,
      tracking: TYPO.display.tracking,
      weight: TYPO.display.weight,
      width: 100,
      caps: TYPO.label.caps,
    },
  },
  {
    id: 'frieden',
    name: 'Frieden',
    note: 'Playfair, serif à fort contraste un peu resserrée, en titre ; Inter, plus simple, pour le texte et les étiquettes.',
    tuning: { fonts: { display: 'playfair', text: 'inter', label: 'inter' }, base: 13, label: 10.5, ratio: 1.25, display: 58, tracking: 0, weight: 500, width: 87.5, caps: false },
  },
  {
    id: 'terminal',
    name: 'Terminal',
    note: 'Glass TTY VT220, les lettres du terminal DEC, pour le titre et les étiquettes ; Inter pour le texte.',
    tuning: { fonts: { display: 'glass-tty-vt220', text: 'inter', label: 'glass-tty-vt220' }, base: 13, label: 12, ratio: 1.25, display: 64, tracking: 0, weight: 400, width: 100, caps: true },
  },
  {
    id: 'pixel',
    name: 'Pixel',
    note: 'Departure Mono pour le titre et les étiquettes, Inter pour le texte. Le côté machine.',
    tuning: { fonts: { display: 'departure-mono', text: 'inter', label: 'departure-mono' }, base: 15, label: 12, ratio: 1.25, display: 88, tracking: 0, weight: 400, width: 100, caps: true },
  },
  {
    id: 'grotesque',
    name: 'Grotesque',
    note: 'Inter seule : grasse et serrée pour le titre, régulière ailleurs. À la Kalkbrenner.',
    tuning: { fonts: { display: 'inter', text: 'inter', label: 'inter' }, base: 15, label: 12, ratio: 1.25, display: 112, tracking: -0.045, weight: 700, width: 100, caps: false },
  },
  {
    id: 'editoriale',
    name: 'Éditoriale',
    note: 'Instrument Serif pour la phrase-titre, Inter pour l’information. À la Rachel Chen.',
    tuning: { fonts: { display: 'instrument-serif', text: 'inter', label: 'inter' }, base: 15, label: 12, ratio: 1.25, display: 104, tracking: -0.01, weight: 400, width: 100, caps: false },
  },
];

const STORAGE_KEY = 'atelier:typo:v2';
const OLD_DIRECTIONS: Record<string, FontChoice> = {
  pixel: { display: 'departure-mono', text: 'inter', label: 'departure-mono' },
  grotesque: { display: 'inter', text: 'inter', label: 'inter' },
  editoriale: { display: 'instrument-serif', text: 'inter', label: 'inter' },
};

const round = (value: number) => Math.round(value * 2) / 2;
const px = (value: number) => `${String(round(value)).replace('.', ',')} px`;
const sameTuning = (a: Tuning, b: Tuning) =>
  (Object.keys(a) as (keyof Tuning)[]).every((key) => JSON.stringify(a[key]) === JSON.stringify(b[key]));

// Settings added after a tuning may have been saved: labels used to follow the
// text one step down the scale, and the headline had no width.
type SavedTuning = Omit<Tuning, 'label' | 'width'> & Partial<Pick<Tuning, 'label' | 'width'>>;
const complete = (saved: SavedTuning): Tuning => ({
  ...saved,
  label: saved.label ?? round(saved.base / saved.ratio),
  width: saved.width ?? 100,
});

type Relief = 'plat' | 'incruste' | 'sec';
type ReliefTuning = { kind: Relief; depth: number };

const RELIEFS: { id: Relief; name: string; note: string }[] = [
  { id: 'plat', name: 'À plat', note: 'Les valeurs sont imprimées comme le reste du texte.' },
  { id: 'incruste', name: 'Incrusté', note: 'Lettres grises cernées d’un contour sombre, le bord du haut dans l’ombre : comme posées dans un creux.' },
  { id: 'sec', name: 'À sec', note: 'Sans encre, comme un gaufrage : seul le bord du creux dessine les lettres. Moins lisible, à réserver au court.' },
];

const RELIEF_KEY = 'atelier:relief:v1';
const DEFAULT_RELIEF: ReliefTuning = { kind: 'plat', depth: 0.6 };

function loadRelief(): ReliefTuning {
  try {
    const saved = JSON.parse(localStorage.getItem(RELIEF_KEY) ?? 'null') as ReliefTuning | null;
    if (saved && RELIEFS.some((relief) => relief.id === saved.kind)) return saved;
  } catch {
    // Storage can be unavailable; start flat.
  }
  return DEFAULT_RELIEF;
}

function loadTuning(): Tuning {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as SavedTuning | null;
    if (saved && ROLES.every((role) => FONTS.some((font) => font.id === saved.fonts?.[role.id]))) return complete(saved);
    // First version stored a direction instead of three fonts.
    const old = JSON.parse(localStorage.getItem('atelier:typo:v1') ?? 'null') as (Omit<SavedTuning, 'fonts'> & { direction: string }) | null;
    if (old && old.direction in OLD_DIRECTIONS) {
      const { direction, ...sizes } = old;
      return complete({ ...sizes, fonts: OLD_DIRECTIONS[direction] });
    }
  } catch {
    // Storage can be unavailable; start from the retained composition.
  }
  return COMPOSITIONS[0].tuning;
}

/** The one big moment, the subheadings stepping up from the body text, and the labels. */
function typeScale({ base, label, ratio, display }: Tuning) {
  return [
    { id: 'display', role: 'display' as Role, name: 'Moment fort', size: display, sample: 'Du prototype à la production' },
    { id: 'h1', role: 'text' as Role, name: 'Titre 1', size: base * ratio ** 3, sample: 'Projets sélectionnés' },
    { id: 'h2', role: 'text' as Role, name: 'Titre 2', size: base * ratio ** 2, sample: 'Agent de support en production' },
    { id: 'h3', role: 'text' as Role, name: 'Titre 3', size: base * ratio, sample: 'Ce que j’ai appris' },
    { id: 'text', role: 'text' as Role, name: 'Texte', size: base, sample: 'Alexandre Teixeira, AI engineer : des prototypes mis en service.' },
    { id: 'label', role: 'label' as Role, name: 'Étiquette', size: label, sample: 'Rôle · Prototype · 2025' },
  ];
}

/** Step 3: the typefaces and the type scale. */
export function TypoStep() {
  const [tuning, setTuning] = useState(loadTuning);
  const [relief, setRelief] = useState(loadRelief);
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

  useEffect(() => {
    try {
      localStorage.setItem(RELIEF_KEY, JSON.stringify(relief));
    } catch {
      // Same: a convenience only.
    }
  }, [relief]);

  const displayFont = findFont(tuning.fonts.display);
  const textFont = findFont(tuning.fonts.text);
  const labelFont = findFont(tuning.fonts.label);
  const fontOf: Record<Role, typeof displayFont> = { display: displayFont, text: textFont, label: labelFont };

  // The page uses the chosen faces right away, wherever they sit in the catalogue.
  useEffect(() => {
    [displayFont, textFont, labelFont].forEach((font) => void ensureFont(font));
  }, [displayFont, textFont, labelFont]);

  // So does each composition's « Aa ».
  useEffect(() => {
    COMPOSITIONS.forEach((preset) => void ensureFont(findFont(preset.tuning.fonts.display)));
  }, []);

  const set = (patch: Partial<Tuning>) => setTuning((current) => ({ ...current, ...patch }));
  const assign = (role: Role, id: string) => {
    setTuning((current) => {
      const next = { ...current, fonts: { ...current.fonts, [role]: id } };
      const grid = findFont(id).grid;
      // A pixel face drawn on a grid snaps the headline to its multiples.
      if (role === 'display' && grid) next.display = Math.max(grid * 3, Math.round(current.display / grid) * grid);
      return next;
    });
  };

  const composition = COMPOSITIONS.find((preset) => sameTuning(preset.tuning, tuning));
  const scale = typeScale(tuning);
  const weightAxis = displayFont.axes?.wght;
  const widthAxis = displayFont.axes?.wdth;
  const width = widthAxis ? Math.min(widthAxis[1], Math.max(widthAxis[0], tuning.width)) : 100;
  const grid = displayFont.grid;

  const style = {
    '--font-display': fontStack(displayFont),
    '--font-text': fontStack(textFont),
    '--font-label': fontStack(labelFont),
    '--size-display': tuning.display,
    '--size-text': tuning.base,
    '--size-label': tuning.label,
    '--display-weight': weightAxis ? Math.min(weightAxis[1], Math.max(weightAxis[0], tuning.weight)) : (displayFont.weight ?? 400),
    '--display-tracking': `${tuning.tracking}em`,
    '--display-stretch': `${width}%`,
    '--display-leading': displayFont.category === 'pixel' ? 1.1 : 1,
    '--label-case': tuning.caps ? 'uppercase' : 'none',
    '--label-tracking': tuning.caps ? '0.06em' : '0',
    '--relief-depth': relief.depth,
  } as CSSProperties;
  const reliefChoice = RELIEFS.find((item) => item.id === relief.kind) ?? RELIEFS[0];

  const summary = [
    `Typo : titre ${displayFont.family} · texte ${textFont.family} · étiquettes ${labelFont.family}`,
    `Titre ${px(tuning.display)} · interlettrage ${tuning.tracking.toFixed(3)} em${weightAxis ? ` · graisse ${tuning.weight}` : ''}${widthAxis ? ` · largeur ${width} %` : ''}`,
    `Texte ${px(tuning.base)} · sous-titres ×${tuning.ratio.toFixed(3)}`,
    `Étiquettes ${px(tuning.label)} en ${tuning.caps ? 'capitales' : 'minuscules'}`,
    `Valeurs sous les étiquettes : ${reliefChoice.name.toLowerCase()}${relief.kind === 'plat' ? '' : `, profondeur ${Math.round(relief.depth * 100)} %`}`,
    `Échelle : ${scale.map((size) => `${size.name} ${px(size.size)}`).join(' · ')}`,
  ].join('\n');

  return (
    <section className="atelier-step" aria-labelledby="step-typo">
      <header className="atelier-step__head">
        <span className="atelier-step__index">03</span>
        <h2 id="step-typo">La typo</h2>
        <span className="atelier-status" data-status="valide">
          Validé le 5 nov.
        </span>
      </header>
      <p className="atelier-step__note">
        Retenu : Instrument Serif pour le titre, Inter pour le texte et les étiquettes. Le banc reste ouvert : la
        typothèque, plus bas, propose des polices gluantes, pixel, éditoriales, innovantes et institutionnelles à
        essayer sur la page témoin, avec un rôle chacune.
      </p>

      <div className="atelier-builder">
        <div className="atelier-panel">
          <fieldset>
            <legend>Composition</legend>
            <div className="atelier-presets">
              {COMPOSITIONS.map((preset) => {
                const font = findFont(preset.tuning.fonts.display);
                return (
                  <button key={preset.id} type="button" aria-pressed={preset === composition} title={preset.note} onClick={() => setTuning(preset.tuning)}>
                    <span className="atelier-glyph" aria-hidden="true" style={{ fontFamily: fontStack(font), fontWeight: preset.tuning.weight }}>
                      Aa
                    </span>
                    {preset.name}
                  </button>
                );
              })}
            </div>
            <p className="atelier-panel__note">{composition?.note ?? 'Composition ajustée à la main.'}</p>
          </fieldset>

          <fieldset>
            <legend>Titre</legend>
            <FontSelect value={tuning.fonts.display} onChange={(id) => assign('display', id)} />
            <Range
              label="Taille"
              min={grid ? grid * 3 : 24}
              max={grid ? grid * 15 : 160}
              step={grid ?? 1}
              value={tuning.display}
              format={px}
              onChange={(display) => set({ display })}
            />
            <Range label="Interlettrage" min={-0.06} max={0.04} step={0.005} value={tuning.tracking} format={(v) => `${v.toFixed(3)} em`} onChange={(tracking) => set({ tracking })} />
            {weightAxis ? (
              <Range label="Graisse" min={weightAxis[0]} max={weightAxis[1]} step={50} value={Math.min(weightAxis[1], Math.max(weightAxis[0], tuning.weight))} format={String} onChange={(weight) => set({ weight })} />
            ) : (
              <p className="atelier-panel__note">
                {displayFont.family} n’a qu’une graisse.
                {grid && ` Elle est nette aux multiples de ${grid} px : la taille avance de ${grid} en ${grid}.`}
              </p>
            )}
            {widthAxis && (
              <Range label="Largeur" min={widthAxis[0]} max={widthAxis[1]} step={0.5} value={width} format={(v) => `${String(v).replace('.', ',')} %`} onChange={(value) => set({ width: value })} />
            )}
          </fieldset>

          <fieldset>
            <legend>Texte</legend>
            <FontSelect value={tuning.fonts.text} onChange={(id) => assign('text', id)} />
            <Range label="Taille" min={11} max={20} step={0.5} value={tuning.base} format={px} onChange={(base) => set({ base })} />
            <Range label="Sous-titres" min={1.125} max={1.5} step={0.005} value={tuning.ratio} format={(v) => `×${v.toFixed(3)}`} onChange={(ratio) => set({ ratio })} />
            <p className="atelier-panel__note">Les sous-titres montent du texte par paliers de cet écart (voir l’échelle).</p>
          </fieldset>

          <fieldset>
            <legend>Étiquettes</legend>
            <FontSelect value={tuning.fonts.label} onChange={(id) => assign('label', id)} />
            <Range label="Taille" min={9} max={16} step={0.5} value={tuning.label} format={px} onChange={(label) => set({ label })} />
            <div className="atelier-segment" role="group" aria-label="Casse des étiquettes">
              <span className="atelier-segment__legend">Casse</span>
              <button type="button" aria-pressed={tuning.caps} onClick={() => set({ caps: true })}>
                Capitales
              </button>
              <button type="button" aria-pressed={!tuning.caps} onClick={() => set({ caps: false })}>
                Minuscules
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend>Relief</legend>
            <p className="atelier-panel__note">Les valeurs sous les étiquettes : « AI engineer » sous « Rôle ».</p>
            <div className="atelier-segment" role="group" aria-label="Relief des valeurs">
              {RELIEFS.map((item) => (
                <button key={item.id} type="button" aria-pressed={relief.kind === item.id} onClick={() => setRelief((current) => ({ ...current, kind: item.id }))}>
                  {item.name}
                </button>
              ))}
            </div>
            {relief.kind !== 'plat' && (
              <Range label="Profondeur" min={0.2} max={1} step={0.05} value={relief.depth} format={(v) => `${Math.round(v * 100)} %`} onChange={(depth) => setRelief((current) => ({ ...current, depth }))} />
            )}
            <p className="atelier-panel__note">{reliefChoice.note}</p>
          </fieldset>

          <div className="atelier-panel__footer">
            <button
              type="button"
              onClick={() => {
                setTuning(COMPOSITIONS[0].tuning);
                setRelief(DEFAULT_RELIEF);
              }}
            >
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
              <Temoin relief={relief.kind} />
            </Specimen>
          </div>
          <div className="atelier-stage__bar">
            <p>
              Titre {displayFont.family} {px(tuning.display)} · texte {textFont.family} {px(tuning.base)} · étiquettes{' '}
              {labelFont.family} {px(tuning.label)}
            </p>
            <div>
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

      <div className="echelle" style={style}>
        <h3>
          Échelle <span>Tailles en px pour une page de 1440 px de large.</span>
        </h3>
        <ol>
          {scale.map((size) => (
            <li key={size.id}>
              <span className="echelle__meta">
                {size.name}
                <code>
                  {px(size.size)} · {fontOf[size.role].family}
                </code>
              </span>
              <span className={`echelle__sample echelle__sample--${size.id}`} style={{ fontSize: `${round(size.size)}px` }}>
                {size.sample}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <Typotheque choice={tuning.fonts} onAssign={assign} />

      {open && (
        <SpecimenPreview settings={FOND} style={style} label="Page témoin en plein écran" onClose={close}>
          <Temoin relief={relief.kind} />
        </SpecimenPreview>
      )}
    </section>
  );
}

/** Any face of the typothèque, grouped by category. */
function FontSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <label className="atelier-field">
      <span>Police</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {CATEGORIES.map((category) => (
          <optgroup key={category.id} label={category.name}>
            {FONTS.filter((font) => font.category === category.id).map((font) => (
              <option key={font.id} value={font.id}>
                {font.family}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
