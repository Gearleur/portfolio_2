export type OnboardingPhase = 'hidden' | 'readme' | 'readme-and-ghost' | 'done';

export const READ_ME_DELAY_MS = 800;
export const GHOST_DELAY_MS = 4000;
export const GHOST_MAX_LOOPS = 3;

export function nextOnboardingPhase(input: {
  hasSeenBefore: boolean;
  hasInteracted: boolean;
  elapsedMs: number;
  prefersReducedMotion: boolean;
  isPortalReady: boolean;
}): OnboardingPhase {
  if (input.hasSeenBefore || input.hasInteracted || input.isPortalReady) {
    return 'done';
  }

  if (input.elapsedMs < READ_ME_DELAY_MS) {
    return 'hidden';
  }

  if (input.prefersReducedMotion || input.elapsedMs < READ_ME_DELAY_MS + GHOST_DELAY_MS) {
    return 'readme';
  }

  return 'readme-and-ghost';
}
