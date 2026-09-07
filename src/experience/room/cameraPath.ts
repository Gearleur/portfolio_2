import { clamp01, lerp } from '../stage/easing';
import { CRT_SCREEN_PLANE, crtScreenWorldPose } from './monitorPlacement';
import type { Vector3Tuple } from './monitorPlacement';
import { dockDistanceFor, fitScaleForScreen } from './screenProjection';

export type CameraKeyframe = {
  t: number;
  position: Vector3Tuple;
  lookAt: Vector3Tuple;
};

/* Cadre auquel les poses constantes de la trajectoire sont ecrites. */
export const REFERENCE_VIEWPORT = { width: 1440, height: 900 } as const;

export const PULLBACK_FOV_DEG = 45;

/*
 * Pose amarree : camera pile sur la normale de la dalle, a la distance exacte ou
 * le bureau inscrit dans la dalle remplit le cadre. `CameraRig` la recalcule a
 * chaque frame depuis la matrice monde reelle du maillage, pour que le raccord
 * soit juste sur n'importe quel ecran ; la version ci-dessous part des memes
 * constantes de placement et sert de premiere image a la trajectoire.
 */
export function dockKeyframe(
  viewportWidth: number,
  viewportHeight: number,
  fovDeg: number,
): CameraKeyframe {
  const { center, normal } = crtScreenWorldPose();
  const distance = dockDistanceFor(
    viewportHeight,
    fitScaleForScreen(
      viewportWidth,
      viewportHeight,
      CRT_SCREEN_PLANE.width,
      CRT_SCREEN_PLANE.height,
    ),
    fovDeg,
  );

  return {
    t: 0,
    position: [
      center[0] + normal[0] * distance,
      center[1] + normal[1] * distance,
      center[2] + normal[2] * distance,
    ],
    lookAt: [...center],
  };
}

/*
 * La camera ne suit pas une ligne droite : elle derive lateralement, ce qui
 * fait tourner l'angle du moniteur pendant le recul. Les poses suivantes sont
 * ecrites a la main, dans le repere de la piece.
 */
export const PULLBACK_PATH: CameraKeyframe[] = [
  dockKeyframe(REFERENCE_VIEWPORT.width, REFERENCE_VIEWPORT.height, PULLBACK_FOV_DEG),
  { t: 0.36, position: [-2.85, 0.12, 4.2], lookAt: [-3.05, 0.06, 0] },
  { t: 0.72, position: [-0.9, 0.35, 8.1], lookAt: [-2.6, 0.02, 0] },
  { t: 1, position: [0.85, 0.55, 10.4], lookAt: [-2.2, -0.05, 0] },
];

function lerpTuple(from: Vector3Tuple, to: Vector3Tuple, t: number): Vector3Tuple {
  return [lerp(from[0], to[0], t), lerp(from[1], to[1], t), lerp(from[2], to[2], t)];
}

export function sampleCameraPath(
  path: CameraKeyframe[],
  t: number,
): { position: Vector3Tuple; lookAt: Vector3Tuple } {
  const clamped = clamp01(t);

  for (let index = 0; index < path.length - 1; index += 1) {
    const current = path[index];
    const next = path[index + 1];

    if (clamped <= next.t) {
      const span = next.t - current.t;
      const local = span === 0 ? 0 : (clamped - current.t) / span;

      return {
        position: lerpTuple(current.position, next.position, local),
        lookAt: lerpTuple(current.lookAt, next.lookAt, local),
      };
    }
  }

  const last = path[path.length - 1];
  return { position: [...last.position], lookAt: [...last.lookAt] };
}
