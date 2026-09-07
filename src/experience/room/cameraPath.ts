import { clamp01, lerp } from '../stage/easing';

export type Vector3Tuple = [number, number, number];

export type CameraKeyframe = {
  t: number;
  position: Vector3Tuple;
  lookAt: Vector3Tuple;
};

/*
 * La camera ne suit pas une ligne droite : elle derive lateralement, ce qui
 * fait tourner l'angle du moniteur pendant le recul.
 *
 * La premiere image est la pose "amarree" : camera pile sur la normale de la
 * dalle, a la distance exacte ou le bureau remplit le cadre. Les valeurs
 * ci-dessous correspondent a un cadre 1440x900 ; `CameraRig` les recalcule a
 * chaque frame a partir de la matrice monde reelle de la dalle et de la taille
 * du canvas, pour que le raccord soit exact quel que soit l'ecran.
 */
export const PULLBACK_PATH: CameraKeyframe[] = [
  { t: 0, position: [-1.7184, 0.08, 1.9354], lookAt: [-2.4986, 0.08, 0.8424] },
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
