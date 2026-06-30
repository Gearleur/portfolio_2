import { useCallback, useEffect, useState } from 'react';
import type { TransitionEvent } from 'react';

type Phase = 'enter' | 'open' | 'closing';

/**
 * Drives the slide transition shared by the fullscreen projects surfaces.
 *
 * The surface mounts off-screen ('enter'), then a deferred rAF flips it to
 * 'open' on a later frame — so the expensive first mount/paint happens BEFORE
 * the transition starts, keeping the slide jank-free even the first time.
 * `onExit` fires once the closing transition (or a safety timeout) completes.
 */
export function useCurtainExit(onExit: () => void) {
  const [phase, setPhase] = useState<Phase>('enter');

  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setPhase('open'));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  const requestClose = useCallback(() => setPhase('closing'), []);

  // Safety net in case the transitionend event never lands (e.g. reduced motion).
  useEffect(() => {
    if (phase !== 'closing') {
      return;
    }
    const fallback = setTimeout(onExit, 700);
    return () => clearTimeout(fallback);
  }, [phase, onExit]);

  const handleTransitionEnd = useCallback(
    (event: TransitionEvent) => {
      if (phase === 'closing' && event.target === event.currentTarget) {
        onExit();
      }
    },
    [phase, onExit],
  );

  const phaseClass = phase === 'open' ? 'is-open' : phase === 'closing' ? 'is-closing' : '';

  return { phaseClass, requestClose, handleTransitionEnd };
}
