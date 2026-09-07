/*
 * Ou se trouve le telephone, et ou se trouve sa dalle -- l'equivalent mobile
 * de monitorPlacement.ts. `RoomScene` monte le groupe avec ces valeurs pour
 * l'appareil reel et pour son reflet sous le sol, `PhoneDevice` y pose sa
 * geometrie : elles vivent ici, une seule fois, pour la meme raison que cote
 * moniteur.
 */

import type { Vector3Tuple } from './monitorPlacement';

export const PHONE_POSITION: Vector3Tuple = [-1.5, -0.35, 0];
export const PHONE_ROTATION: Vector3Tuple = [0, 0.48, 0.08];

/* Position de la dalle dans le repere du telephone, juste devant la coque. */
export const PHONE_SCREEN_LOCAL_POSITION: Vector3Tuple = [0, 0, 0.047];

/* Dimensions de la dalle, en unites monde. */
export const PHONE_SCREEN_PLANE = { width: 0.71, height: 1.5 } as const;
