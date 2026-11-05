import { useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { oklchCss } from './color';
import type { Oklch } from './color';
import { GRAIN_TILE, grainImage } from './grain';
import type { GrainSettings } from './grain';
import { useWave } from './useWave';
import type { WaveSettings, WaveSignal } from './useWave';
import './fond.css';

export type FondSettings = {
  color: Oklch;
  grain: GrainSettings;
  wave: WaveSettings;
};

/**
 * Page background: a plain light colour, a film grain on top, and a wave of
 * colour that crosses it now and then (docs/atelier/README.md, step 1).
 */
export function Fond({ settings, waveSignal }: { settings: FondSettings; waveSignal?: WaveSignal }) {
  const waveRef = useRef<HTMLDivElement>(null);
  useWave(waveRef, settings.wave, waveSignal);

  const { size, irregularity } = settings.grain;
  const grain = useMemo(() => grainImage({ size, irregularity }), [size, irregularity]);
  const style = {
    '--fond': oklchCss(settings.color),
    '--grain': grain,
    '--grain-size': `${GRAIN_TILE}px`,
    '--grain-strength': settings.grain.strength,
  } as CSSProperties;

  return (
    <div className="fond" style={style} aria-hidden="true">
      <div ref={waveRef} className="fond__wave" />
    </div>
  );
}
