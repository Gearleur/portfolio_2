/*
 * Ou se trouve le moniteur, et ou se trouve sa dalle. `RoomScene` monte le
 * groupe avec ces valeurs, `CrtMonitor` y pose sa geometrie et la trajectoire de
 * camera en derive sa pose amarree : elles vivent ici, une seule fois, pour
 * qu'un deplacement du moniteur se propage partout au lieu de laisser la camera
 * viser une piece qui a bouge sans elle.
 */

export type Vector3Tuple = [number, number, number];

export const CRT_MONITOR_POSITION: Vector3Tuple = [-3.1, 0, 0];

/*
 * Le moniteur ne pivote qu'autour de Y -- c'est ce qui le fait partir en biais
 * pendant le recul. La constante est un scalaire plutot qu'un triplet pour que
 * `crtScreenWorldPose` n'ait pas a pretendre gerer une rotation quelconque.
 */
export const CRT_MONITOR_ROTATION_Y = -0.3;

export const CRT_MONITOR_ROTATION: Vector3Tuple = [0, CRT_MONITOR_ROTATION_Y, 0];

/* Position de la dalle dans le repere du moniteur, juste devant le bezel. */
export const CRT_SCREEN_LOCAL_POSITION: Vector3Tuple = [0, 0.12, 0.15];

/* Dimensions de la dalle, en unites monde. */
export const CRT_SCREEN_PLANE = { width: 4.8, height: 3 } as const;

/*
 * Centre et normale sortante de la dalle, en coordonnees monde. `CameraRig` lit
 * ces deux valeurs sur la matrice monde reelle du maillage ; cette version en
 * arithmetique pure sert a la trajectoire et aux tests, qui n'ont pas de scene
 * a interroger.
 */
export function crtScreenWorldPose(): { center: Vector3Tuple; normal: Vector3Tuple } {
  const cos = Math.cos(CRT_MONITOR_ROTATION_Y);
  const sin = Math.sin(CRT_MONITOR_ROTATION_Y);
  const [localX, localY, localZ] = CRT_SCREEN_LOCAL_POSITION;
  const [monitorX, monitorY, monitorZ] = CRT_MONITOR_POSITION;

  return {
    center: [
      monitorX + localX * cos + localZ * sin,
      monitorY + localY,
      monitorZ - localX * sin + localZ * cos,
    ],
    normal: [sin, 0, cos],
  };
}
