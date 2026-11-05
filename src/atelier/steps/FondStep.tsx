import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCopyText } from '../../hooks/useCopyText';
import { contrastRatio, oklchCss, oklchToHex } from '../color';
import type { Oklch } from '../color';
import { Range } from '../controls';
import type { FondSettings } from '../Fond';
import { percent, ratio } from '../format';
import type { GrainSettings } from '../grain';
import { Specimen, SpecimenPreview } from '../Specimen';
import { ACCENT, FOND, WAVE_COMPOSITIONS } from '../tokens';
import type { WaveCompositionId } from '../tokens';
import { useWaveSignal } from '../useWave';
import type { WaveSettings } from '../useWave';

type BackgroundPreset = { id: string; name: string; note: string; color: Oklch };
type WavePreset = { id: WaveCompositionId; name: string; colors: string[] };
type Accent = { id: string; name: string; hex: string; note?: string };

const BACKGROUNDS: BackgroundPreset[] = [
  { id: 'retenu', name: 'Retenu', note: 'Ton réglage : un blanc presque pur, à peine vert-gris.', color: FOND.color },
  { id: 'brume', name: 'Brume', note: 'Gris bleuté froid. L’accent ressort par contraste.', color: { lightness: 0.93, chroma: 0.008, hue: 250 } },
  { id: 'craie', name: 'Craie', note: 'Presque blanc, à peine chaud. Le plus neutre.', color: { lightness: 0.955, chroma: 0.004, hue: 85 } },
  { id: 'lin-rose', name: 'Lin rosé', note: 'Blanc rosé. L’accent reste dans la même famille.', color: { lightness: 0.935, chroma: 0.012, hue: 35 } },
];

const WAVES: WavePreset[] = [
  { id: 'aube', name: 'Aube', colors: WAVE_COMPOSITIONS.aube },
  { id: 'neige-vermillon', name: 'Neige vermillon', colors: WAVE_COMPOSITIONS['neige-vermillon'] },
  { id: 'crepuscule', name: 'Crépuscule', colors: WAVE_COMPOSITIONS.crepuscule },
];

// From the darkest red to the orange tried first.
const ACCENTS: Accent[] = [
  { id: 'cramoisi', name: 'Cramoisi', hex: '#8E0F24' },
  { id: 'carmin', name: 'Carmin', hex: '#B0172F' },
  { id: 'cerise', name: 'Cerise', hex: '#C81E32' },
  { id: 'rouge-vif', name: 'Rouge vif', hex: '#D7262B' },
  { id: 'coquelicot', name: ACCENT.name, hex: ACCENT.hex, note: 'retenu' },
  { id: 'vermillon', name: 'Vermillon', hex: '#EA3F1C' },
];

type Tuning = {
  accent: string;
  color: Oklch;
  grain: GrainSettings;
  wave: Omit<WaveSettings, 'colors' | 'firstDelay'> & { id: WaveCompositionId };
};

const DEFAULT_TUNING: Tuning = {
  accent: 'coquelicot',
  color: FOND.color,
  grain: FOND.grain,
  wave: {
    id: FOND.waveId,
    first: FOND.wave.first,
    echo: FOND.wave.echo,
    fade: FOND.wave.fade,
    every: FOND.wave.every,
    duration: FOND.wave.duration,
  },
};

const STORAGE_KEY = 'atelier:fond:v2';

function loadTuning(): Tuning {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<Tuning> | null;
    if (saved?.color && saved.grain && saved.wave && WAVES.some((wave) => wave.id === saved.wave?.id)) {
      const accent = ACCENTS.find((option) => option.id === saved.accent)?.id ?? DEFAULT_TUNING.accent;
      return { accent, color: saved.color, grain: saved.grain, wave: saved.wave };
    }
  } catch {
    // Storage can be unavailable or hold an older shape; start from the defaults.
  }
  return DEFAULT_TUNING;
}

const sameColor = (a: Oklch, b: Oklch) => a.lightness === b.lightness && a.chroma === b.chroma && a.hue === b.hue;
const findAccent = (id: string) => ACCENTS.find((option) => option.id === id) ?? ACCENTS[0];

/** Step 1: the background tuning bench, kept to come back to (journal n° 15). */
export function FondStep() {
  const [tuning, setTuning] = useState(loadTuning);
  const [open, setOpen] = useState(false);
  const [waveSignal, playWave] = useWaveSignal();
  const close = useCallback(() => setOpen(false), []);
  const setAccent = (accent: string) => setTuning((current) => ({ ...current, accent }));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tuning));
    } catch {
      // Keeping the tuning across reloads is a convenience only.
    }
  }, [tuning]);

  // Text selection is styled from :root: try the accent there, and hand back to
  // tokens.css when leaving the step.
  const accentHex = findAccent(tuning.accent).hex;
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--accent', accentHex);
    return () => {
      root.removeProperty('--accent');
    };
  }, [accentHex]);

  const wavePreset = WAVES.find((wave) => wave.id === tuning.wave.id) ?? WAVES[0];
  const settings = useMemo<FondSettings>(
    () => ({ ...tuning, wave: { ...tuning.wave, colors: wavePreset.colors, firstDelay: FOND.wave.firstDelay } }),
    [tuning, wavePreset],
  );
  const ink = { color: oklchCss({ lightness: 0.24, chroma: 0.01, hue: tuning.color.hue }) };
  const sample = (
    <div className="specimen__text">
      <p className="specimen__name">Alexandre Teixeira</p>
      <p className="specimen__line">
        AI engineer, du prototype à la <mark>production</mark>.
      </p>
    </div>
  );

  return (
    <section className="atelier-step" aria-labelledby="step-fond">
      <header className="atelier-step__head">
        <span className="atelier-step__index">01</span>
        <h2 id="step-fond">Le fond</h2>
        <span className="atelier-status" data-status="valide">
          Validé le 5 nov.
        </span>
      </header>
      <p className="atelier-step__note">
        Un fond clair et uni, un grain irrégulier, une onde qui part du coin haut droit, forte à l’arrivée puis
        discrète, et l’accent Coquelicot. L’établi reste là : tu peux encore jouer avec, ça ne change pas la charte,
        et « Réinitialiser » ramène aux valeurs validées.
      </p>

      <div className="atelier-builder">
        <FondPanel tuning={tuning} wavePreset={wavePreset} onChange={setTuning} />
        <div className="atelier-stage">
          <div className="atelier-stage__frame">
            <Specimen settings={settings} waveSignal={waveSignal} style={ink}>
              {sample}
            </Specimen>
          </div>
          <div className="atelier-stage__bar">
            <p>
              {oklchCss(tuning.color)} · <code>{oklchToHex(tuning.color)}</code>
            </p>
            <div>
              <button type="button" onClick={() => playWave('first')}>
                Rejouer l’arrivée
              </button>
              <button type="button" onClick={() => playWave('echo')}>
                Onde suivante
              </button>
              <button type="button" onClick={() => setOpen(true)}>
                Plein écran <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <SpecimenPreview
          settings={settings}
          style={ink}
          label="Fond en plein écran"
          tools={<AccentSelect value={tuning.accent} onChange={setAccent} />}
          onClose={close}
        >
          {sample}
        </SpecimenPreview>
      )}
    </section>
  );
}

type FondPanelProps = {
  tuning: Tuning;
  wavePreset: WavePreset;
  onChange: (update: (tuning: Tuning) => Tuning) => void;
};

function FondPanel({ tuning, wavePreset, onChange }: FondPanelProps) {
  const { copy, state } = useCopyText();
  const setColor = (patch: Partial<Oklch>) => onChange((current) => ({ ...current, color: { ...current.color, ...patch } }));
  const setGrain = (patch: Partial<GrainSettings>) => onChange((current) => ({ ...current, grain: { ...current.grain, ...patch } }));
  const setWave = (patch: Partial<Tuning['wave']>) => onChange((current) => ({ ...current, wave: { ...current.wave, ...patch } }));
  const background = BACKGROUNDS.find((preset) => sameColor(preset.color, tuning.color));
  const accent = findAccent(tuning.accent);
  const onFond = contrastRatio(accent.hex, oklchToHex(tuning.color));
  const onAccent = contrastRatio('#ffffff', accent.hex);

  const summary = [
    `Accent : ${accent.name} · ${accent.hex}`,
    `Fond : ${background?.name ?? 'ajusté'} · ${oklchCss(tuning.color)} · ${oklchToHex(tuning.color)}`,
    `Grain : intensité ${percent(tuning.grain.strength)} · taille ${percent(tuning.grain.size)} · irrégularité ${percent(tuning.grain.irregularity)}`,
    `Onde : ${wavePreset.name} · arrivée ${percent(tuning.wave.first)} · suivantes ${percent(tuning.wave.echo)} · effacée à ${percent(tuning.wave.fade)} du trajet · toutes les ${tuning.wave.every} s · traversée ${tuning.wave.duration} s`,
  ].join('\n');

  return (
    <div className="atelier-panel">
      <fieldset>
        <legend>Accent</legend>
        <AccentSelect value={tuning.accent} onChange={(id) => onChange((current) => ({ ...current, accent: id }))} />
        <p className="atelier-panel__note">
          {ratio(onFond)} sur le fond · {ratio(onAccent)} pour le texte blanc sélectionné
          {onAccent < 4.5 && ', un peu juste pour du petit texte'}.
        </p>
      </fieldset>

      <fieldset>
        <legend>Fond</legend>
        <div className="atelier-presets">
          {BACKGROUNDS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={preset === background}
              title={preset.note}
              onClick={() => setColor(preset.color)}
            >
              <span className="atelier-dot" style={{ background: oklchCss(preset.color) }} />
              {preset.name}
            </button>
          ))}
        </div>
        <p className="atelier-panel__note">{background?.note ?? 'Teinte ajustée à la main.'}</p>
        <Range label="Teinte" min={0} max={360} step={1} value={tuning.color.hue} format={(v) => `${v}°`} onChange={(hue) => setColor({ hue })} />
        <Range label="Saturation" min={0} max={0.03} step={0.001} value={tuning.color.chroma} format={(v) => v.toFixed(3)} onChange={(chroma) => setColor({ chroma })} />
        <Range label="Clarté" min={0.88} max={0.98} step={0.005} value={tuning.color.lightness} format={percent} onChange={(lightness) => setColor({ lightness })} />
      </fieldset>

      <fieldset>
        <legend>Grain</legend>
        <Range label="Intensité" min={0} max={0.4} step={0.01} value={tuning.grain.strength} format={percent} onChange={(strength) => setGrain({ strength })} />
        <Range label="Taille" min={0.7} max={1.6} step={0.05} value={tuning.grain.size} format={percent} onChange={(size) => setGrain({ size })} />
        <Range label="Irrégularité" min={0} max={1} step={0.05} value={tuning.grain.irregularity} format={percent} onChange={(irregularity) => setGrain({ irregularity })} />
      </fieldset>

      <fieldset>
        <legend>Onde</legend>
        <div className="atelier-presets">
          {WAVES.map((wave) => (
            <button key={wave.id} type="button" aria-pressed={wave === wavePreset} onClick={() => setWave({ id: wave.id })}>
              <span className="atelier-dot" style={{ background: `conic-gradient(${wave.colors.join(', ')})` }} />
              {wave.name}
            </button>
          ))}
        </div>
        <Range label="Arrivée" min={0.2} max={0.95} step={0.05} value={tuning.wave.first} format={percent} onChange={(first) => setWave({ first })} />
        <Range label="Suivantes" min={0.05} max={0.6} step={0.05} value={tuning.wave.echo} format={percent} onChange={(echo) => setWave({ echo })} />
        <Range label="Effacée à" min={0.3} max={1} step={0.05} value={tuning.wave.fade} format={(v) => `${percent(v)} du trajet`} onChange={(fade) => setWave({ fade })} />
        <Range label="Fréquence" min={10} max={120} step={5} value={tuning.wave.every} format={(v) => `toutes les ${v} s`} onChange={(every) => setWave({ every })} />
        <Range label="Traversée" min={6} max={20} step={1} value={tuning.wave.duration} format={(v) => `${v} s`} onChange={(duration) => setWave({ duration })} />
      </fieldset>

      <div className="atelier-panel__footer">
        <button type="button" onClick={() => onChange(() => DEFAULT_TUNING)}>
          Réinitialiser
        </button>
        <button type="button" onClick={() => copy(summary)}>
          {state === 'copied' ? 'Copié' : state === 'error' ? 'Copie impossible' : 'Copier mes réglages'}
        </button>
      </div>
    </div>
  );
}

function AccentSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <span className="atelier-select">
      <span className="atelier-swatch" style={{ background: findAccent(value).hex }} />
      <select aria-label="Accent" value={value} onChange={(event) => onChange(event.target.value)}>
        {ACCENTS.map((option) => (
          <option key={option.id} value={option.id}>
            {`${option.name} · ${option.hex}${option.note ? ` (${option.note})` : ''}`}
          </option>
        ))}
      </select>
    </span>
  );
}
