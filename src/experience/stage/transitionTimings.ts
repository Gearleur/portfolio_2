import type { ExperienceStageName } from './experienceStageMachine';

export const PULLBACK_MS = 2500;
export const PUSHIN_MS = 1600;
export const REDUCED_MS = 400;

/*
 * Predicat pur partage par `transitionDurationMs` (duree de la transition) et
 * par `CameraRig` (choregraphie de la camera pendant cette transition) : les
 * deux doivent s'accorder sur ce qui compte comme "reduit" a partir des memes
 * entrees, sans dupliquer la condition ni la coder en dur dans la boucle de
 * frame.
 */
export function isReducedTransition(options: {
  prefersReducedMotion: boolean;
  isMobile: boolean;
}): boolean {
  return options.prefersReducedMotion || options.isMobile;
}

export function transitionDurationMs(
  stage: ExperienceStageName,
  options: { prefersReducedMotion: boolean; isMobile: boolean },
): number {
  if (stage !== 'pullback' && stage !== 'pushin') {
    return 0;
  }

  if (isReducedTransition(options)) {
    return REDUCED_MS;
  }

  return stage === 'pullback' ? PULLBACK_MS : PUSHIN_MS;
}
