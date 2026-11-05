import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { useFullscreenDialog } from '../hooks/useFullscreenDialog';
import { Fond } from './Fond';
import type { FondSettings } from './Fond';
import { useWaveSignal } from './useWave';
import type { WaveSignal } from './useWave';

type SpecimenProps = {
  settings: FondSettings;
  waveSignal?: WaveSignal;
  style?: CSSProperties;
  children: ReactNode;
};

/** A background dressed with sample content and the cube cursor. */
export function Specimen({ settings, waveSignal, style, children }: SpecimenProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const cube = cubeRef.current;
    if (!stage || !cube) return;

    const move = (event: PointerEvent) => {
      const bounds = stage.getBoundingClientRect();
      cube.style.translate = `${event.clientX - bounds.left}px ${event.clientY - bounds.top}px`;
    };
    const rest = () => {
      cube.style.translate = '';
    };

    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerleave', rest);
    return () => {
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerleave', rest);
    };
  }, []);

  return (
    <div ref={stageRef} className="specimen" style={style}>
      <Fond settings={settings} waveSignal={waveSignal} />
      {children}
      <span ref={cubeRef} className="specimen__cube" aria-hidden="true" />
    </div>
  );
}

type SpecimenPreviewProps = SpecimenProps & {
  label: string;
  /** Extra controls shown first in the floating bar. */
  tools?: ReactNode;
  onClose: () => void;
};

export function SpecimenPreview({ settings, style, label, tools, onClose, children }: SpecimenPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [waveSignal, playWave] = useWaveSignal();
  useFullscreenDialog({ backgroundSelector: '.atelier-canvas', onClose, ref });

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Letters typed in a menu jump between its options.
    if (event.target instanceof HTMLSelectElement) return;
    const key = event.key.toLowerCase();
    if (key === 'a') playWave('first');
    if (key === 'o') playWave('echo');
  };

  // Portalled out of the canvas, which the dialog makes inert while open.
  return createPortal(
    <div
      ref={ref}
      className="atelier-preview"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <Specimen settings={settings} waveSignal={waveSignal} style={style}>
        {children}
      </Specimen>
      <div className="atelier-preview__bar">
        {tools}
        <button type="button" onClick={() => playWave('first')}>
          Arrivée <kbd>A</kbd>
        </button>
        <button type="button" onClick={() => playWave('echo')}>
          Onde suivante <kbd>O</kbd>
        </button>
        <button type="button" className="atelier-preview__close" onClick={onClose}>
          Fermer <kbd>Échap</kbd>
        </button>
      </div>
    </div>,
    document.body,
  );
}
