import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { Matrix4, PlaneGeometry, Vector3 } from 'three';
import type { Mesh } from 'three';
import { cinematicScript } from '../cinematic/cinematicScript';
import { roomDepthFromProgress } from '../cinematic/scrollTimeline';
import { clamp01, lerp, smootherstep } from '../stage/easing';
import { useExperienceStageContext } from '../stage/ExperienceStageContext';
import { isReducedTransition } from '../stage/transitionTimings';
import { PULLBACK_PATH, sampleCameraPath } from './cameraPath';
import type { CameraKeyframe } from './cameraPath';
import { CRT_SCREEN_PLANE } from './monitorPlacement';
import {
  cssPerspectiveFromFov,
  dockDistanceFor,
  fitScaleForScreen,
  getCameraCssMatrix,
  getObjectCssMatrix,
  projectedWidthRatio,
  shouldSwapToShader,
} from './screenProjection';

const DEFAULT_FOV = 45;

/* The camera retreats through the gallery while keeping its gaze behind it.
 * A forward-facing look target used to turn the camera away from the screen
 * halfway through the scroll. The authored depths still control travel. */
const ROOM_LATERAL_DRIFT = 2.2;
const ROOM_DEPTHS = cinematicScript.map((act) => act.cameraDepth);
const ROOM_LOOKAHEAD = 10;

// Objets de travail alloues une fois plutot qu'a chaque image. La boucle
// tourne a 60 Hz : ce qui peut sortir du chemin chaud en sort. Elle n'est pas
// pour autant sans allocation -- `sampleCameraPath` rend un objet neuf, comme
// les deux formateurs de matrices CSS -- mais ces objets-la sont les plus gros
// et les plus faciles a hisser.
const lookAtTarget = new Vector3();
const screenCenter = new Vector3();
const screenNormal = new Vector3();
const objectMatrix = new Matrix4();
const domScale = new Vector3();

/*
 * Sonde d'alignement, developpement uniquement : elle publie les matrices que la
 * chaine CSS vient de consommer, pour que le test bout en bout recalcule la
 * projection WebGL a la main et verifie que les deux tombent au meme endroit --
 * la promesse de la section 9.2 de la specification, sinon invisible depuis un
 * navigateur. `import.meta.env.DEV` vaut `false` a la compilation, le bloc
 * disparait donc du bundle de production.
 */
type CameraRigProbe = {
  view: number[];
  object: number[];
  fovDeg: number;
  width: number;
  height: number;
  roomProgress: number;
  frame: number;
  /*
   * Centre monde de la dalle reellement montee. Le bloc n'est publie que
   * lorsqu'un maillage de dalle existe, donc la simple presence de la sonde
   * prouve deja qu'un appareil a monte sa geometrie ; cette position dit
   * lequel -- le telephone et le moniteur ne sont pas au meme endroit dans
   * la piece. Sans elle, le parcours mobile resterait entierement vert meme
   * si `PhoneDevice` ne montait pas : la phase et l'acte actif sont pilotes
   * par la machine d'etat, sans rien demander a WebGL.
   */
  screenCenter: [number, number, number];
};

type DomTargets = {
  cameraLayer: HTMLElement | null;
  screen: HTMLElement | null;
};

/*
 * Remise a plat des trois calques que le rig pilote en style en ligne. Un
 * style en ligne bat la feuille de style quelle que soit la specificite : la
 * regle "phase desktop" d'`experience.css` ne peut pas reprendre la main
 * toute seule, il faut effacer les proprietes une a une. Une seule fonction
 * pour les deux appelants (retour en phase `desktop` et demontage) pour
 * qu'ils ne puissent pas diverger sur la liste des proprietes a effacer.
 */
function resetDomTargets({ cameraLayer, screen }: DomTargets): void {
  if (cameraLayer) {
    cameraLayer.style.transform = '';
    cameraLayer.style.width = '';
    cameraLayer.style.height = '';
  }

  if (screen) {
    screen.style.transform = '';
    screen.style.width = '';
    screen.style.height = '';
    screen.style.opacity = '';
  }
}

function planeSizeOf(mesh: Mesh): { width: number; height: number } {
  const geometry = mesh.geometry;
  return geometry instanceof PlaneGeometry
    ? { width: geometry.parameters.width, height: geometry.parameters.height }
    : CRT_SCREEN_PLANE;
}

export function CameraRig({ screenRef }: { screenRef: RefObject<Mesh | null> }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const { transitionProgressRef, roomProgressRef, stage, prefersReducedMotion, isMobile } =
    useExperienceStageContext();

  const domRef = useRef<DomTargets>({ cameraLayer: null, screen: null });
  // Compteur d'images, developpement uniquement : seul moyen pour un test
  // bout en bout de distinguer "la boucle tourne mais les valeurs sont
  // stables" de "la boucle est reellement a l'arret" -- roomT et la matrice
  // de vue sont constantes pendant le delai de grace meme si `useFrame`
  // continue de s'executer, puisque rien n'anime alors dans la piece.
  const frameCountRef = useRef(0);
  const lastLookAt = useRef(new Vector3());
  const returnPose = useRef({ position: new Vector3(), target: new Vector3() });

  // Start the return from the actual scrolled camera pose, not the entry pose.
  useLayoutEffect(() => {
    if (stage === 'pushin') {
      returnPose.current.position.copy(camera.position);
      returnPose.current.target.copy(lastLookAt.current);
    }
  }, [camera, stage]);

  // La trajectoire est copiee pour que sa premiere image -- la pose amarree sur
  // la dalle -- soit recalculee a chaque frame sans reallouer le tableau ni
  // toucher a la constante exportee.
  const pathRef = useRef<CameraKeyframe[] | null>(null);
  if (pathRef.current === null) {
    pathRef.current = PULLBACK_PATH.map((keyframe) => ({
      t: keyframe.t,
      position: [...keyframe.position] as CameraKeyframe['position'],
      lookAt: [...keyframe.lookAt] as CameraKeyframe['lookAt'],
    }));
  }

  useEffect(() => {
    const targets: DomTargets = {
      cameraLayer: document.querySelector<HTMLElement>('.experience-camera'),
      screen: document.querySelector<HTMLElement>('.experience-screen'),
    };
    domRef.current = targets;

    // Filet de securite pour le demontage reel : la remise a plat qui compte
    // pour le visiteur est celle de l'effet suivant, pas celle-ci.
    return () => resetDomTargets(targets);
  }, []);

  /*
   * Le bureau redevient une page ordinaire des que la phase repasse a
   * `desktop`, pas au demontage du rig : `useKeepAlive` garde le canvas monte
   * dix secondes apres la sortie de la piece, le nettoyage de demontage
   * arriverait donc dix secondes trop tard. Pendant tout ce temps la derniere
   * `matrix3d` ecrite ici survivrait, gagnerait contre `experience.css` et
   * laisserait le bureau en parallelogramme, a moitie hors cadre et hors
   * d'atteinte du curseur. Ce nettoyage ne peut pas vivre dans `useFrame` :
   * `resolveFrameloop` a deja gele la boucle quand la phase revient a
   * `desktop`, aucune frame supplementaire n'est garantie.
   */
  useLayoutEffect(() => {
    if (stage !== 'desktop') {
      return;
    }

    resetDomTargets(domRef.current);
  }, [stage]);

  useFrame(() => {
    // A final queued frame must never restore CSS3D after desktop cleanup.
    if (stage === 'desktop') return;
    const path = pathRef.current;
    if (!path) {
      return;
    }

    const fov = 'fov' in camera ? (camera.fov as number) : DEFAULT_FOV;
    const screenMesh = screenRef.current;

    // Unites-monde par pixel CSS, et pose amarree correspondante.
    let worldPerPixel = fitScaleForScreen(
      size.width,
      size.height,
      CRT_SCREEN_PLANE.width,
      CRT_SCREEN_PLANE.height,
    );

    if (screenMesh) {
      screenMesh.updateWorldMatrix(true, false);
      screenCenter.setFromMatrixPosition(screenMesh.matrixWorld);
      // `transformDirection` renormalise deja le resultat.
      screenNormal.set(0, 0, 1).transformDirection(screenMesh.matrixWorld);

      const plane = planeSizeOf(screenMesh);
      worldPerPixel = fitScaleForScreen(size.width, size.height, plane.width, plane.height);

      const dockDistance = dockDistanceFor(size.height, worldPerPixel, fov);
      const dock = path[0];
      dock.position[0] = screenCenter.x + screenNormal.x * dockDistance;
      dock.position[1] = screenCenter.y + screenNormal.y * dockDistance;
      dock.position[2] = screenCenter.z + screenNormal.z * dockDistance;
      dock.lookAt[0] = screenCenter.x;
      dock.lookAt[1] = screenCenter.y;
      dock.lookAt[2] = screenCenter.z;
    }

    // Section 12/14 de la specification : "pas de dezoom" -- sur mobile et
    // sous prefers-reduced-motion, la transition compressee a 400 ms ne doit
    // pas rejouer PULLBACK_PATH en accelere. La camera se cale directement sur
    // sa derniere image (le plan "deja installe"), et seul le bureau DOM
    // s'estompe plus bas -- au lieu de suivre les quatre temps de la
    // cinematique complete, qui retient la camera pendant les 300 premieres
    // ms, place le raccord DOM / shader dans le troisieme temps et decelere
    // fort sur le dernier.
    const reduced = isReducedTransition({ prefersReducedMotion, isMobile });
    const pathProgress = reduced ? 1 : smootherstep(transitionProgressRef.current);
    const sample = sampleCameraPath(path, pathProgress);
    if (stage === 'pushin' && !reduced) {
      const t = 1 - pathProgress;
      const from = returnPose.current;
      sample.position = [
        lerp(from.position.x, path[0].position[0], t),
        lerp(from.position.y, path[0].position[1], t),
        lerp(from.position.z, path[0].position[2], t),
      ];
      sample.lookAt = [
        lerp(from.target.x, path[0].lookAt[0], t),
        lerp(from.target.y, path[0].lookAt[1], t),
        lerp(from.target.z, path[0].lookAt[2], t),
      ];
    }

    // Progression du scroll dans la piece : 0 hors de la phase `room`, quelle
    // que soit la valeur qui traine encore dans la ref -- la garde sur
    // `stage` evite tout sursaut si la piece est quittee avant que
    // `CinematicOverlay` ne l'ait remise a zero.
    const roomT = stage === 'room' ? clamp01(roomProgressRef.current) : 0;
    const roomX = sample.position[0] + roomT * ROOM_LATERAL_DRIFT;
    const roomZ = stage === 'room' ? roomDepthFromProgress(roomT, ROOM_DEPTHS) : sample.position[2];

    camera.position.set(roomX, sample.position[1], roomZ);
    // Keep a stable viewing direction as the architectural bays pass by.
    lookAtTarget.set(
      lerp(sample.lookAt[0], roomX + ROOM_LATERAL_DRIFT, roomT),
      sample.lookAt[1],
      lerp(sample.lookAt[2], roomZ - ROOM_LOOKAHEAD, roomT),
    );
    lastLookAt.current.copy(lookAtTarget);
    camera.lookAt(lookAtTarget);
    // `Camera.updateMatrixWorld` rafraichit aussi `matrixWorldInverse`, la
    // matrice de vue que reclame la matrice CSS de la camera.
    camera.updateMatrixWorld();

    const { cameraLayer, screen } = domRef.current;
    if (!cameraLayer || !screen || !screenMesh) {
      return;
    }

    if (reduced) {
      // Pas de raccord CSS3D a batir puisqu'il n'y a pas de camera qui bouge :
      // le bureau garde sa mise en page normale (aucune transform) et
      // s'estompe seulement, au meme rythme que `transitionProgressRef` --
      // 1 au depart (bureau plein cadre), 0 une fois la piece installee, dans
      // les deux sens (recul comme retour).
      cameraLayer.style.transform = '';
      cameraLayer.style.width = '';
      cameraLayer.style.height = '';
      screen.style.transform = '';
      screen.style.width = '';
      screen.style.height = '';
      screen.style.opacity = `${1 - clamp01(transitionProgressRef.current)}`;
    } else {
      // Convention exacte de CSS3DRenderer : perspective et matrice de vue sur
      // le calque camera (origine de transformation au centre), matrice monde
      // de l'objet sur la dalle DOM, avec le translate(-50%,-50%) qui recentre
      // son propre bloc.
      const perspective = cssPerspectiveFromFov(fov, size.height);

      cameraLayer.style.width = `${size.width}px`;
      cameraLayer.style.height = `${size.height}px`;
      cameraLayer.style.transform =
        `perspective(${perspective}px) translateZ(${perspective}px) ` +
        `${getCameraCssMatrix(camera.matrixWorldInverse.elements)} ` +
        `translate(${size.width / 2}px,${size.height / 2}px)`;

      screen.style.width = `${size.width}px`;
      screen.style.height = `${size.height}px`;

      // CSS3DRenderer travaille a raison d'un pixel CSS par unite monde : la
      // mise a l'echelle ramene le bloc de `size` pixels aux dimensions de la
      // dalle.
      domScale.set(worldPerPixel, worldPerPixel, 1);
      objectMatrix.copy(screenMesh.matrixWorld).scale(domScale);
      screen.style.transform = getObjectCssMatrix(objectMatrix.elements);

      // Le rapport de largeur projetee decide du raccord DOM vers shader.
      const ratio = projectedWidthRatio(
        size.width * worldPerPixel,
        camera.position.distanceTo(screenCenter),
        fov,
        size.width / size.height,
      );

      screen.style.opacity = shouldSwapToShader(ratio) ? '0' : '1';
    }

    if (import.meta.env.DEV) {
      frameCountRef.current += 1;
      (window as unknown as { __cameraRigProbe?: CameraRigProbe }).__cameraRigProbe = {
        view: Array.from(camera.matrixWorldInverse.elements),
        object: Array.from(objectMatrix.elements),
        fovDeg: fov,
        width: size.width,
        height: size.height,
        roomProgress: roomT,
        frame: frameCountRef.current,
        screenCenter: [screenCenter.x, screenCenter.y, screenCenter.z],
      };
    }
  });

  return null;
}
