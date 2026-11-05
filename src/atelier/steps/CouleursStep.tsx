import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useCopyText } from '../../hooks/useCopyText';
import { contrastRatio, inkPalette, oklchToHex } from '../color';
import type { Inks } from '../color';
import { Range } from '../controls';
import { percent, ratio } from '../format';
import { Specimen, SpecimenPreview } from '../Specimen';
import { ACCENT, APPOINT, FOND, INKS } from '../tokens';
import { useWaveSignal } from '../useWave';

type Direction = { id: string; name: string; note: string; inks: Inks };

const DIRECTIONS: Direction[] = [
  { id: 'noir', name: 'Noir', note: 'Neutre et net. Le coquelicot reste la seule couleur de la page. Validé.', inks: INKS },
  { id: 'brun', name: 'Brun', note: 'Une encre chaude, brun très sombre. Plus douce avec le coquelicot.', inks: { hue: 40, chroma: 0.02, ink: 0.22, soft: 0.5, line: 0.89 } },
  { id: 'marine', name: 'Marine', note: 'Le bleu nuit de l’onde Neige vermillon. Un contraste froid et chaud.', inks: { hue: 258, chroma: 0.04, ink: 0.26, soft: 0.5, line: 0.9 } },
];

const STORAGE_KEY = 'atelier:couleurs:v1';

function loadInks(): Inks {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Inks | null;
    if (saved && ['hue', 'chroma', 'ink', 'soft', 'line'].every((key) => typeof saved[key as keyof Inks] === 'number')) return saved;
  } catch {
    // Storage can be unavailable; start from the validated inks.
  }
  return INKS;
}

const sameInks = (a: Inks, b: Inks) => (Object.keys(a) as (keyof Inks)[]).every((key) => a[key] === b[key]);

type Check = 'text' | 'ui' | 'none';
type Swatch = { id: string; name: string; role: string; hex: string; against: string; on: string; check: Check; validated?: boolean };

function verdict(check: Check, value: number) {
  if (check === 'none') return { label: 'Décoratif', ok: true };
  if (check === 'ui') return value >= 3 ? { label: 'Visible', ok: true } : { label: 'Trop pâle', ok: false };
  if (value >= 4.5) return { label: 'AA', ok: true };
  return value >= 3 ? { label: 'Grand texte seulement', ok: false } : { label: 'Illisible', ok: false };
}

const PROJETS = [
  ['01', 'Projet témoin A', 'En production', '2025'],
  ['02', 'Projet témoin B', 'Pilote', '2025'],
  ['03', 'Projet témoin C', 'Prototype', '2024'],
];

/** Step 2: the ink family that goes with the background and the accent. */
export function CouleursStep() {
  const [inks, setInks] = useState(loadInks);
  const [open, setOpen] = useState(false);
  const [waveSignal, playWave] = useWaveSignal();
  const close = useCallback(() => setOpen(false), []);
  const { copy, state } = useCopyText();
  const [copied, setCopied] = useState<string>();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inks));
    } catch {
      // Keeping the tuning across reloads is a convenience only.
    }
  }, [inks]);

  const colors = inkPalette(inks);
  const validated = sameInks(inks, INKS);
  const fond = oklchToHex(FOND.color);
  const direction = DIRECTIONS.find((preset) => sameInks(preset.inks, inks));
  const set = (patch: Partial<Inks>) => setInks((current) => ({ ...current, ...patch }));

  const swatches: Swatch[] = [
    { id: 'fond', name: 'Fond', role: 'La page', hex: fond, against: colors.ink, on: 'Avec l’encre', check: 'text', validated: true },
    { id: 'encre', name: 'Encre', role: 'Titres et texte courant', hex: colors.ink, against: fond, on: 'Sur le fond', check: 'text', validated },
    { id: 'encre-douce', name: 'Encre douce', role: 'Étiquettes, dates, métadonnées', hex: colors.soft, against: fond, on: 'Sur le fond', check: 'text', validated },
    { id: 'filet', name: 'Filet', role: 'Séparateurs, bordures fines', hex: colors.line, against: fond, on: 'Sur le fond', check: 'none', validated },
    { id: 'accent', name: 'Accent', role: 'Curseur, sélection, surbrillance', hex: ACCENT.hex, against: fond, on: 'Sur le fond', check: 'ui', validated: true },
    { id: 'sur-accent', name: 'Sur accent', role: 'Texte posé sur l’accent', hex: ACCENT.onAccent, against: ACCENT.hex, on: 'Sur l’accent', check: 'text', validated: true },
  ];

  // A light support colour reads as a surface under the ink, a deep one as ink or a block on the page.
  const appoint: Swatch[] = APPOINT.map(({ name, hex }) => {
    const surface = contrastRatio(hex, fond) < 1.5;
    return {
      id: `appoint-${hex}`,
      name,
      role: surface ? 'Clair : une surface sous l’encre' : 'Profond : texte ou bloc sur le fond',
      hex,
      against: surface ? colors.ink : fond,
      on: surface ? 'Encre dessus' : 'Sur le fond',
      check: 'text',
      validated: true,
    };
  });

  const summary = [
    `Encres : ${direction?.name ?? 'ajustées'} · teinte ${inks.hue}° · saturation ${inks.chroma.toFixed(3)}`,
    `Encre ${colors.ink} · ${ratio(contrastRatio(colors.ink, fond))}`,
    `Encre douce ${colors.soft} · ${ratio(contrastRatio(colors.soft, fond))}`,
    `Filet ${colors.line}`,
  ].join('\n');

  const style = { '--ink': colors.ink, '--ink-soft': colors.soft, '--line': colors.line, color: colors.ink } as CSSProperties;
  const temoin = (
    <div className="temoin">
      <header className="temoin__top">
        <p className="temoin__brand">Alexandre Teixeira</p>
        <p className="temoin__nav">
          <span aria-current="page">Projets</span>
          <span>À propos</span>
          <span>CV</span>
          <span>Contact</span>
        </p>
      </header>
      <div className="temoin__intro">
        <p className="temoin__title">
          AI engineer, du prototype à la <mark>production</mark>.
        </p>
        <dl className="temoin__facts">
          <div>
            <dt>Rôle</dt>
            <dd>AI engineer</dd>
          </div>
          <div>
            <dt>Approche</dt>
            <dd>Du prototype à la production</dd>
          </div>
          <div>
            <dt>Langues</dt>
            <dd>Français · English</dd>
          </div>
        </dl>
      </div>
      <ol className="temoin__index">
        {PROJETS.map(([number, name, stage, year]) => (
          <li key={number}>
            <span>{number}</span>
            <span>{name}</span>
            <span>{stage}</span>
            <span>{year}</span>
          </li>
        ))}
      </ol>
    </div>
  );

  return (
    <section className="atelier-step" aria-labelledby="step-couleurs">
      <header className="atelier-step__head">
        <span className="atelier-step__index">02</span>
        <h2 id="step-couleurs">Les couleurs</h2>
        <span className="atelier-status" data-status="valide">
          Validé le 5 nov.
        </span>
      </header>
      <p className="atelier-step__note">
        Les encres Noir : l’encre du texte, l’encre douce des étiquettes et le filet des séparateurs. La palette
        Snow crimson est gardée en plus, comme couleurs d’appoint ; leurs rôles viendront avec les composants.
        L’établi reste là : Brun et Marine pour comparer, « Réinitialiser » ramène aux encres validées.
      </p>

      <div className="atelier-builder">
        <div className="atelier-panel">
          <fieldset>
            <legend>Direction</legend>
            <div className="atelier-presets">
              {DIRECTIONS.map((preset) => {
                const p = inkPalette(preset.inks);
                return (
                  <button key={preset.id} type="button" aria-pressed={preset === direction} title={preset.note} onClick={() => setInks(preset.inks)}>
                    <span className="atelier-dot" style={{ background: `conic-gradient(${p.ink} 0 50%, ${p.soft} 0 80%, ${p.line} 0)` }} />
                    {preset.name}
                  </button>
                );
              })}
            </div>
            <p className="atelier-panel__note">{direction?.note ?? 'Encres ajustées à la main.'}</p>
          </fieldset>

          <fieldset>
            <legend>Encres</legend>
            <Range label="Teinte" min={0} max={360} step={1} value={inks.hue} format={(v) => `${v}°`} onChange={(hue) => set({ hue })} />
            <Range label="Saturation" min={0} max={0.05} step={0.001} value={inks.chroma} format={(v) => v.toFixed(3)} onChange={(chroma) => set({ chroma })} />
            <Range label="Encre" min={0.12} max={0.34} step={0.005} value={inks.ink} format={percent} onChange={(ink) => set({ ink })} />
            <Range label="Encre douce" min={0.38} max={0.62} step={0.005} value={inks.soft} format={percent} onChange={(soft) => set({ soft })} />
            <Range label="Filet" min={0.78} max={0.95} step={0.005} value={inks.line} format={percent} onChange={(line) => set({ line })} />
          </fieldset>

          <div className="atelier-panel__footer">
            <button type="button" onClick={() => setInks(INKS)}>
              Réinitialiser
            </button>
            <button
              type="button"
              onClick={() => {
                setCopied(undefined);
                void copy(summary);
              }}
            >
              {state === 'copied' && !copied ? 'Copié' : 'Copier mes réglages'}
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
            <p>Page témoin : les textes de projets sont factices.</p>
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

      {[
        { id: 'principale', title: 'Palette principale', note: 'Le fond, les encres et l’accent.', items: swatches },
        {
          id: 'appoint',
          title: 'Palette d’appoint',
          note: 'Snow crimson, gardée en plus. Les rôles viendront avec les composants.',
          items: appoint,
        },
      ].map((group) => (
        <div key={group.id} className="nuancier-group">
          <h3>
            {group.title} <span>{group.note}</span>
          </h3>
          <ul className="nuancier">
            {group.items.map((swatch) => {
              const value = contrastRatio(swatch.hex, swatch.against);
              const { label, ok } = verdict(swatch.check, value);
              return (
                <li key={swatch.id}>
                  <button
                    type="button"
                    className="nuancier__card"
                    onClick={() => {
                      setCopied(swatch.id);
                      void copy(swatch.hex);
                    }}
                  >
                    <span className="nuancier__chip" style={{ background: swatch.hex }} />
                    <span className="nuancier__name">
                      {swatch.name}
                      {swatch.validated && <span className="nuancier__tag">validé</span>}
                    </span>
                    <span className="nuancier__role">{swatch.role}</span>
                    <code>{state === 'copied' && copied === swatch.id ? 'Copié' : swatch.hex.toUpperCase()}</code>
                    <span className="nuancier__contrast" data-ok={ok}>
                      {swatch.on} · {ratio(value)} · {label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {open && (
        <SpecimenPreview settings={FOND} style={style} label="Page témoin en plein écran" onClose={close}>
          {temoin}
        </SpecimenPreview>
      )}
    </section>
  );
}
