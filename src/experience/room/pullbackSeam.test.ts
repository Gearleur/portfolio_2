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
 * The white-gallery portal stays large enough to read after the reveal.
 * Preserve the live desktop until it is genuinely distant, then use wallpaper.
 * Timing assertions for the former small CRT no longer describe this scene.
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

  it('keeps the enlarged portal live throughout the reveal', () => {
    expect(projectedRatioAt(PULLBACK_MS)).toBeGreaterThan(0.2);
    expect(shouldSwapToShader(projectedRatioAt(PULLBACK_MS))).toBe(false);
  });

  it('only swaps to the wallpaper once the screen is distant', () => {
    const ratio = projectedWidthRatio(
      VIEWPORT.width * WORLD_PER_PIXEL, 30, FOV_DEG, VIEWPORT.width / VIEWPORT.height,
    );
    expect(shouldSwapToShader(ratio)).toBe(true);
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
