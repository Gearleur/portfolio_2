import { describe, expect, it } from 'vitest';
import { smootherstep } from '../stage/easing';
import { PULLBACK_MS } from '../stage/transitionTimings';
import {
  PULLBACK_FOV_DEG,
  PULLBACK_PATH,
  REFERENCE_VIEWPORT,
  dockKeyframe,
  sampleCameraPath,
} from './cameraPath';
import { CRT_SCREEN_PLANE, crtScreenWorldPose } from './monitorPlacement';
import { fitScaleForScreen, projectedWidthRatio, shouldSwapToShader } from './screenProjection';

/*
 * La specification decoupe le dezoom en quatre temps (section 9.1) et place le
 * raccord DOM vers shader dans le troisieme, entre 1200 et 2100 ms. Ce fichier
 * rejoue la chaine complete -- courbe, trajectoire, projection, seuil -- en
 * arithmetique pure, sans navigateur, pour tenir cette fenetre.
 */

const VIEWPORT = REFERENCE_VIEWPORT;
const FOV_DEG = PULLBACK_FOV_DEG;

/*
 * Le centre de la dalle vient du placement du moniteur, pas de la trajectoire :
 * si quelqu'un deplace le moniteur dans `RoomScene`, la distance mesuree ici
 * bouge avec lui et la fenetre du raccord est reevaluee pour de vrai.
 */
const SCREEN_CENTER = crtScreenWorldPose().center;

const WORLD_PER_PIXEL = fitScaleForScreen(
  VIEWPORT.width,
  VIEWPORT.height,
  CRT_SCREEN_PLANE.width,
  CRT_SCREEN_PLANE.height,
);

function projectedRatioAt(elapsedMs: number): number {
  const { position } = sampleCameraPath(PULLBACK_PATH, smootherstep(elapsedMs / PULLBACK_MS));
  const distance = Math.hypot(
    position[0] - SCREEN_CENTER[0],
    position[1] - SCREEN_CENTER[1],
    position[2] - SCREEN_CENTER[2],
  );

  return projectedWidthRatio(
    VIEWPORT.width * WORLD_PER_PIXEL,
    distance,
    FOV_DEG,
    VIEWPORT.width / VIEWPORT.height,
  );
}

function seamMs(): number {
  for (let elapsed = 0; elapsed <= PULLBACK_MS; elapsed += 5) {
    if (shouldSwapToShader(projectedRatioAt(elapsed))) {
      return elapsed;
    }
  }

  return Number.POSITIVE_INFINITY;
}

describe('pullback beats at 1440x900', () => {
  it('opens on the docked pose the rig recomputes every frame', () => {
    expect(PULLBACK_PATH[0]).toEqual(dockKeyframe(VIEWPORT.width, VIEWPORT.height, FOV_DEG));
  });

  it('starts with the desktop filling the frame exactly', () => {
    expect(projectedRatioAt(0)).toBeCloseTo(1, 3);
  });

  // Premier temps, 0-300 ms : le bureau se fige, la camera a peine bouge.
  it('still shows a near full frame desktop at 300 ms', () => {
    expect(projectedRatioAt(300)).toBeGreaterThan(0.9);
  });

  // Le raccord appartient au troisieme temps, pas plus tot, pas plus tard.
  it('keeps the DOM readable until the third beat opens', () => {
    expect(shouldSwapToShader(projectedRatioAt(1200))).toBe(false);
  });

  it('has dissolved into the shader before the third beat closes', () => {
    expect(shouldSwapToShader(projectedRatioAt(2100))).toBe(true);
  });

  it('crosses the readability threshold inside the third beat', () => {
    const seam = seamMs();
    expect(seam).toBeGreaterThanOrEqual(1200);
    expect(seam).toBeLessThanOrEqual(2100);
  });

  // Le recul doit rester monotone : un aller-retour ferait clignoter le raccord.
  it('shrinks monotonically', () => {
    let previous = Number.POSITIVE_INFINITY;
    for (let elapsed = 0; elapsed <= PULLBACK_MS; elapsed += 25) {
      const ratio = projectedRatioAt(elapsed);
      expect(ratio).toBeLessThanOrEqual(previous);
      previous = ratio;
    }
  });
});
