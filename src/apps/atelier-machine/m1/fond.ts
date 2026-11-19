import type { FondSettings } from '../../atelier/Fond';
import { FOND, FOND_LECTURE } from '../../atelier/tokens';
import type { Page } from './reglages';

/**
 * The Vitrine's paper in its Machine state: the same colour and grain recipe (step 1), a little
 * greyer or smoother as the bench asks, and no wave at all: the page no longer lives.
 */
export function fondDe({ papier, grain }: Pick<Page, 'papier' | 'grain'>): FondSettings {
  return {
    color: { ...FOND.color, lightness: papier },
    grain: { ...FOND.grain, strength: FOND.grain.strength * grain },
    wave: FOND_LECTURE.wave,
  };
}
