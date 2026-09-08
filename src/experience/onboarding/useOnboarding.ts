import { useEffect, useMemo, useState } from 'react';
import { useExperienceStageContext } from '../stage/ExperienceStageContext';
import { hasSeenOnboarding, markOnboardingSeen } from './onboardingStorage';
import { GHOST_DELAY_MS, READ_ME_DELAY_MS, nextOnboardingPhase } from './onboardingPhase';
import type { OnboardingPhase } from './onboardingPhase';

const TICK_MS = 200;

/*
 * Derniere milliseconde ou le temps ecoule change encore quelque chose :
 * au-dela, `nextOnboardingPhase` rend `readme-and-ghost` quoi qu'il arrive.
 */
const LAST_USEFUL_TICK_MS = READ_ME_DELAY_MS + GHOST_DELAY_MS;

function readStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function useOnboarding(): { phase: OnboardingPhase; dismiss: () => void } {
  const { isPortalReady, prefersReducedMotion } = useExperienceStageContext();
  const [elapsedMs, setElapsedMs] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  // Lazy initializer: computed once on mount, stable across re-renders,
  // without touching a ref during render (react-hooks/refs forbids that).
  const [hasSeenBefore] = useState(() => hasSeenOnboarding(readStorage()));

  useEffect(() => {
    if (hasSeenBefore || hasInteracted) {
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setElapsedMs(elapsed);

      /*
       * Le minuteur s'arrete de lui-meme une fois le curseur fantome sorti :
       * un visiteur qui n'a jamais clique -- exactement celui pour qui le
       * tutoriel existe -- gardait sinon un re-rendu de tout `DesktopShell`
       * cinq fois par seconde pour la vie de la page, y compris sous la
       * cinematique 3D, contre la section 13 de la specification. La borne ne
       * peut pas vivre dans les dependances de l'effet : `elapsedMs` y
       * relancerait l'intervalle a chaque tic et remettrait `startedAt` a
       * zero avec lui.
       */
      if (elapsed >= LAST_USEFUL_TICK_MS) {
        window.clearInterval(timer);
      }
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [hasInteracted, hasSeenBefore]);

  const phase = useMemo(
    () =>
      nextOnboardingPhase({
        hasSeenBefore,
        hasInteracted,
        elapsedMs,
        prefersReducedMotion,
        isPortalReady,
      }),
    [elapsedMs, hasInteracted, hasSeenBefore, isPortalReady, prefersReducedMotion],
  );

  const dismiss = () => {
    if (hasInteracted) {
      return;
    }

    setHasInteracted(true);
    markOnboardingSeen(readStorage());
  };

  return { phase, dismiss };
}
