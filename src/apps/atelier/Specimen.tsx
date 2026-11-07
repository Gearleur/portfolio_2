import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { useFullscreenDialog } from '../../shared/hooks/useFullscreenDialog';
import { Fond } from './Fond';
import type { FondSettings } from './Fond';
import { useWaveSignal } from './useWave';
import type { WaveSignal } from './useWave';

type SpecimenProps = {
  settings: FondSettings;
  waveSignal?: WaveSignal;
  style?: CSSProperties;
  /** Draws the page at its real px sizes instead of scaling a 1440 px page to the stage. */
  reelle?: boolean;
  children: ReactNode;
};

type Shape = 'cube' | 'texte' | 'fleche';

/**
 * A background dressed with sample content and the cursor. The cursor is a cube
 * at rest and over the menu ([data-cursor="cube"]), a short bar over words (.m-t)
 * and a small agent's pointer over what can be clicked (links, buttons,
 * [data-cursor]); data-cursor-label names the action beside it.
 */
export function Specimen({ settings, waveSignal, style, reelle, children }: SpecimenProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const cursor = cursorRef.current;
    const label = labelRef.current;
    if (!stage || !cursor || !label) return;

    let shape: Shape = 'cube';
    const setShape = (next: Shape, action = '') => {
      if (next !== shape) cursor.dataset.shape = shape = next;
      if (label.textContent !== action) label.textContent = action;
      cursor.toggleAttribute('data-labelled', action !== '');
    };

    const move = (event: PointerEvent) => {
      const bounds = stage.getBoundingClientRect();
      cursor.style.translate = `${event.clientX - bounds.left}px ${event.clientY - bounds.top}px`;
      const target = event.target instanceof Element ? event.target : null;
      const action = target?.closest<HTMLElement>('a, button, [data-cursor]');
      const words = target?.closest('.m-t');
      if (action?.dataset.cursor === 'cube') return setShape('cube');
      if (action) return setShape('fleche', action.dataset.cursorLabel);
      if (words) {
        // A discreet bar: about the height of the letters, never more than 20 px.
        const size = parseFloat(getComputedStyle(words).fontSize) * 0.8;
        cursor.style.setProperty('--caret', `${Math.min(20, Math.max(10, Math.round(size)))}px`);
        return setShape('texte');
      }
      setShape('cube');
    };
    const rest = () => {
      cursor.style.translate = '';
      setShape('cube');
    };

    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerleave', rest);
    return () => {
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerleave', rest);
    };
  }, []);

  return (
    <div ref={stageRef} className="specimen" style={style} data-echelle={reelle ? 'reelle' : undefined}>
      <Fond settings={settings} waveSignal={waveSignal} />
      {children}
      <span ref={cursorRef} className="curseur" data-shape="cube" aria-hidden="true">
        <span className="curseur__forme" />
        <span ref={labelRef} className="curseur__label" />
      </span>
    </div>
  );
}

type SpecimenPreviewProps = SpecimenProps & {
  label: string;
  /** Extra controls shown first in the floating bar. */
  tools?: ReactNode;
  onClose: () => void;
};

/** How much the 1440 px page is enlarged or reduced to fill the window. */
function useScale() {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const resize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  return { width, scale: width / 1440 };
}

export function SpecimenPreview({ settings, style, label, tools, onClose, children }: SpecimenPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [waveSignal, playWave] = useWaveSignal();
  // Full screen shows the real px by default, as the deployed site does.
  const [reelle, setReelle] = useState(true);
  const { width, scale } = useScale();
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
      <Specimen settings={settings} waveSignal={waveSignal} style={style} reelle={reelle}>
        {children}
      </Specimen>
      <div className="atelier-preview__bar">
        {tools}
        <button type="button" aria-pressed={reelle} onClick={() => setReelle(!reelle)}>
          {reelle ? 'Taille réelle' : `Mise à l’échelle ×${scale.toFixed(2).replace('.', ',')}`}
          <span className="atelier-preview__info">{width} px</span>
        </button>
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
