import type { ExperienceStageName } from './experienceStageMachine';

export const PULLBACK_MS = 2500;
export const PUSHIN_MS = 1600;
export const REDUCED_MS = 400;

export function transitionDurationMs(
  stage: ExperienceStageName,
  options: { prefersReducedMotion: boolean; isMobile: boolean },
): number {
  if (stage !== 'pullback' && stage !== 'pushin') {
    return 0;
  }

  if (options.prefersReducedMotion || options.isMobile) {
    return REDUCED_MS;
  }

  return stage === 'pullback' ? PULLBACK_MS : PUSHIN_MS;
}
