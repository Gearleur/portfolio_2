import { useEffect, useMemo, useState } from 'react';
import { useExperienceStageContext } from '../stage/ExperienceStageContext';
import { hasSeenOnboarding, markOnboardingSeen } from './onboardingStorage';
import { nextOnboardingPhase } from './onboardingPhase';
import type { OnboardingPhase } from './onboardingPhase';

const TICK_MS = 200;

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
    const timer = window.setInterval(() => setElapsedMs(Date.now() - startedAt), TICK_MS);
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
