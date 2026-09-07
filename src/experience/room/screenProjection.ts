/*
 * Ces fonctions reprennent trait pour trait la convention de `CSS3DRenderer`
 * de three.js (three/examples/jsm/renderers/CSS3DRenderer.js) : c'est elle qui
 * garantit qu'un element DOM se superpose exactement a une geometrie WebGL.
 */

export const SHADER_SWAP_RATIO = 0.2;

export function cssPerspectiveFromFov(fovDeg: number, viewportHeight: number): number {
  return (0.5 * viewportHeight) / Math.tan(((fovDeg * Math.PI) / 180) / 2);
}

export function shouldSwapToShader(projectedWidthRatio: number): boolean {
  return projectedWidthRatio < SHADER_SWAP_RATIO;
}

/*
 * Facteur unites-monde par pixel CSS. Le bureau garde son rapport d'aspect :
 * on l'inscrit dans la dalle plutot que de l'etirer dessus, sinon l'image se
 * deforme des la premiere frame de la transition.
 */
export function fitScaleForScreen(
  viewportWidth: number,
  viewportHeight: number,
  planeWidth: number,
  planeHeight: number,
): number {
  const safeWidth = viewportWidth > 0 ? viewportWidth : 1;
  const safeHeight = viewportHeight > 0 ? viewportHeight : 1;

  return Math.min(planeWidth / safeWidth, planeHeight / safeHeight);
}

/*
 * Distance a laquelle poser la camera, sur la normale de la dalle, pour qu'un
 * bureau de `viewportHeight` pixels remplisse exactement le cadre. C'est la pose
 * amarree : celle ou le raccord entre le DOM et le maillage est invisible.
 */
export function dockDistanceFor(
  viewportHeight: number,
  worldPerPixel: number,
  fovDeg: number,
): number {
  return (viewportHeight * worldPerPixel) / 2 / Math.tan(((fovDeg * Math.PI) / 180) / 2);
}

/*
 * Part de la largeur du cadre occupee par un objet de `worldWidth` unites vu a
 * `distance` unites : c'est la grandeur que `shouldSwapToShader` compare au
 * seuil de lisibilite.
 */
export function projectedWidthRatio(
  worldWidth: number,
  distance: number,
  fovDeg: number,
  aspect: number,
): number {
  const visibleWidth = 2 * Math.tan(((fovDeg * Math.PI) / 180) / 2) * distance * aspect;

  return visibleWidth > 0 ? worldWidth / visibleWidth : 0;
}

function epsilon(value: number): number {
  return Math.abs(value) < 1e-10 ? 0 : value;
}

export function getCameraCssMatrix(e: ArrayLike<number>): string {
  return `matrix3d(${[
    epsilon(e[0]),
    epsilon(-e[1]),
    epsilon(e[2]),
    epsilon(e[3]),
    epsilon(e[4]),
    epsilon(-e[5]),
    epsilon(e[6]),
    epsilon(e[7]),
    epsilon(e[8]),
    epsilon(-e[9]),
    epsilon(e[10]),
    epsilon(e[11]),
    epsilon(e[12]),
    epsilon(-e[13]),
    epsilon(e[14]),
    epsilon(e[15]),
  ].join(',')})`;
}

export function getObjectCssMatrix(e: ArrayLike<number>): string {
  return `translate(-50%,-50%) matrix3d(${[
    epsilon(e[0]),
    epsilon(e[1]),
    epsilon(e[2]),
    epsilon(e[3]),
    epsilon(-e[4]),
    epsilon(-e[5]),
    epsilon(-e[6]),
    epsilon(-e[7]),
    epsilon(e[8]),
    epsilon(e[9]),
    epsilon(e[10]),
    epsilon(e[11]),
    epsilon(e[12]),
    epsilon(e[13]),
    epsilon(e[14]),
    epsilon(e[15]),
  ].join(',')})`;
}
