import { useCallback, useState } from 'react';
import type { AnimationEvent } from 'react';

/**
 * Drives the curtain close transition shared by the projects surfaces:
 * a click flips `isExiting`, and `onExit` fires only once the curtain
 * animation on the surface element itself has finished.
 */
export function useCurtainExit(onExit: () => void) {
  const [isExiting, setIsExiting] = useState(false);

  const requestClose = useCallback(() => setIsExiting(true), []);

  const handleAnimationEnd = useCallback(
    (event: AnimationEvent) => {
      if (isExiting && event.target === event.currentTarget) {
        onExit();
      }
    },
    [isExiting, onExit],
  );

  return { isExiting, requestClose, handleAnimationEnd };
}
