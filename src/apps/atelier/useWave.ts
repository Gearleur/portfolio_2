import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export type WaveSettings = {
  /** Colour composition, from the inner edge of the arc to the outer one. */
  colors: string[];
  /** Opacity of the first wave, as the page opens, 0–1. */
  first: number;
  /** Opacity of every later wave, 0–1. */
  echo: number;
  /** Share of the crossing after which a wave has faded out, 0–1. */
  fade: number;
  /** Seconds before the first wave. */
  firstDelay: number;
  /** Average pause between two later waves, in seconds (jittered so it never ticks). */
  every: number;
  /** Time for one wave to cross the page, in seconds. */
  duration: number;
};

export type WaveKind = 'first' | 'echo';
/** A new object plays one wave right away (Atelier preview buttons). */
export type WaveSignal = { id: number; kind: WaveKind };

/** Soft ring of colour; only an arc of it is ever inside the page. */
function ringGradient(colors: string[]) {
  const first = 62;
  const last = 84;
  const stops = colors.map((color, index) => {
    const at = colors.length === 1 ? (first + last) / 2 : first + ((last - first) * index) / (colors.length - 1);
    return `${color} ${at.toFixed(1)}%`;
  });
  return `radial-gradient(closest-side, transparent 54%, ${stops.join(', ')}, transparent 93%)`;
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The arc is fully in colour 5 % of the way in, and keeps its strength while it
// sweeps the top-right of the page (until HOLD of its fading span).
const ENTER = 0.05;
const HOLD = 0.45;

/**
 * Sends a ring of colour across its parent from the top-right to the bottom-left:
 * a strong first wave as the page opens, then fainter ones now and then. Each
 * wave is brightest as it comes in and fades out early. The ring is larger than
 * the page diagonal, so what passes is a gently curved band; a slight turn and
 * squash on the way keeps it organic.
 */
export function useWave(ref: RefObject<HTMLElement | null>, settings: WaveSettings, signal?: WaveSignal) {
  // Timers and replays read the latest settings without restarting the schedule.
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  });

  useEffect(() => {
    if (ref.current) ref.current.style.backgroundImage = ringGradient(settings.colors);
  }, [ref, settings.colors]);

  const play = useCallback(
    (kind: WaveKind) => {
      const wave = ref.current;
      const stage = wave?.parentElement;
      if (!wave || !stage) return;
      const { first, echo, fade, duration } = settingsRef.current;
      const peak = kind === 'first' ? first : echo;
      // An invisible wave (the project pages' stage) is not played: nothing to draw for 11 s.
      if (peak <= 0) return;

      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const diagonal = Math.hypot(width, height);
      const radius = 1.15 * diagonal;
      wave.style.width = wave.style.height = `${2 * radius}px`;
      wave.style.left = wave.style.top = `${-radius}px`;

      // Heading down-left along the diagonal, nudged so no two waves are identical.
      const heading = Math.atan2(height, -width) + ((Math.random() - 0.5) * Math.PI) / 10;
      const [ux, uy] = [Math.cos(heading), Math.sin(heading)];
      // Start: the ring's outer edge just touches the top-right corner, so the
      // wave shows at once. End: every corner sits inside its hollow centre.
      const from = 0.95 * radius + diagonal / 2;
      const to = diagonal * 0.1;
      const at = (distance: number) => `${width / 2 + ux * distance}px ${height / 2 + uy * distance}px`;
      const turn = (heading * 180) / Math.PI;

      const gone = Math.min(1, Math.max(ENTER + 0.1, fade));
      const span = gone - ENTER;
      const frames: Keyframe[] = [
        { offset: 0, translate: at(-from), rotate: `${turn}deg`, scale: '1 0.78', opacity: 0 },
        { offset: ENTER, opacity: peak },
        { offset: ENTER + span * HOLD, opacity: peak },
        { offset: ENTER + span * 0.75, opacity: peak * 0.3 },
        { offset: gone, opacity: 0 },
        { offset: 0.5, translate: at((to - from) / 2), rotate: `${turn - 9}deg`, scale: '1 0.86' },
        { offset: 1, translate: at(to), rotate: `${turn - 16}deg`, scale: '1 0.8', opacity: 0 },
      ];
      frames.sort((a, b) => (a.offset as number) - (b.offset as number));

      // Comes in quickly, then slows down as it fades.
      wave.animate(frames, { duration: duration * 1000, easing: 'cubic-bezier(0.3, 0.45, 0.5, 1)' });
    },
    [ref],
  );

  useEffect(() => {
    if (reducedMotion()) return;
    let timer = 0;
    const next = () => {
      timer = window.setTimeout(() => {
        if (!document.hidden) play('echo');
        next();
      }, settingsRef.current.every * 1000 * (0.7 + Math.random() * 0.6));
    };
    timer = window.setTimeout(() => {
      play('first');
      next();
    }, settingsRef.current.firstDelay * 1000);
    return () => window.clearTimeout(timer);
  }, [play]);

  useEffect(() => {
    if (signal) play(signal.kind);
  }, [signal, play]);
}

/** State for the preview buttons: each call plays one wave of that kind. */
export function useWaveSignal() {
  const [signal, setSignal] = useState<WaveSignal>();
  const play = useCallback((kind: WaveKind) => setSignal((current) => ({ id: (current?.id ?? 0) + 1, kind })), []);
  return [signal, play] as const;
}
