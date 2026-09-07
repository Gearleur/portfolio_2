import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { Matrix4, PlaneGeometry, Vector3 } from 'three';
import type { Mesh } from 'three';
import { cinematicScript } from '../cinematic/cinematicScript';
import { roomDepthFromProgress } from '../cinematic/scrollTimeline';
import { clamp01, lerp, smootherstep } from '../stage/easing';
import { useExperienceStageContext } from '../stage/ExperienceStageContext';
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

/*
 * Une fois en piece, le scroll de la cinematique pousse la camera plus loin
 * sur Z et la fait deriver lateralement : le moniteur, qu'elle regardait a la
 * fin du recul, finit par sortir du cadre et n'est plus qu'une lueur derriere
 * le visiteur.
 *
 * La profondeur Z suit les `cameraDepth` authores acte par acte dans
 * `cinematicScript.ts`, pas une simple avancee lineaire : `ROOM_DEPTHS[0]`
 * vaut 10.4, exactement la position Z ou `PULLBACK_PATH` termine son dernier
 * keyframe -- la continuite avec la fin du recul est deliberee, pas fortuite,
 * donc aucune remise a l'echelle n'est necessaire ici. `roomDepthFromProgress`
 * relie ces profondeurs par interpolation lineaire sur toute la progression.
 */
const ROOM_LATERAL_DRIFT = 2.2;
const ROOM_DEPTHS = cinematicScript.map((act) => act.cameraDepth);
const ROOM_LOOKAHEAD = ROOM_DEPTHS[ROOM_DEPTHS.length - 1] - ROOM_DEPTHS[0];

// Objets de travail alloues une fois : la boucle tourne a 60 Hz et ne doit
// produire aucun dechet.
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
};

type DomTargets = {
  cameraLayer: HTMLElement | null;
  screen: HTMLElement | null;
};

function planeSizeOf(mesh: Mesh): { width: number; height: number } {
  const geometry = mesh.geometry;
  return geometry instanceof PlaneGeometry
    ? { width: geometry.parameters.width, height: geometry.parameters.height }
    : CRT_SCREEN_PLANE;
}

export function CameraRig({ screenRef }: { screenRef: RefObject<Mesh | null> }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const { transitionProgressRef, roomProgressRef, stage } = useExperienceStageContext();

  const domRef = useRef<DomTargets>({ cameraLayer: null, screen: null });

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

    // Le bureau redevient une page ordinaire quand le rig disparait : sans ce
    // nettoyage, les styles en ligne survivraient a la phase et gagneraient
    // contre la feuille de style qui remet tout a plat.
    return () => {
      const { cameraLayer, screen } = targets;
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
    };
  }, []);

  useFrame(() => {
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

    // La courbe tient les quatre temps de la cinematique : elle retient la
    // camera pendant les 300 premieres ms, place le raccord DOM / shader dans le
    // troisieme temps et decelere fort sur le dernier.
    const sample = sampleCameraPath(path, smootherstep(transitionProgressRef.current));

    // Progression du scroll dans la piece : 0 hors de la phase `room`, quelle
    // que soit la valeur qui traine encore dans la ref -- la garde sur
    // `stage` evite tout sursaut si la piece est quittee avant que
    // `CinematicOverlay` ne l'ait remise a zero.
    const roomT = stage === 'room' ? clamp01(roomProgressRef.current) : 0;
    const roomX = sample.position[0] + roomT * ROOM_LATERAL_DRIFT;
    const roomZ = stage === 'room' ? roomDepthFromProgress(roomT, ROOM_DEPTHS) : sample.position[2];

    camera.position.set(roomX, sample.position[1], roomZ);
    // Le regard suit la meme derive laterale, et regarde plus loin que la
    // camera sur Z : plutot que de rester fixe sur le moniteur, elle regarde
    // de plus en plus loin devant elle, et le moniteur sort du cadre au lieu
    // d'y rester centre.
    lookAtTarget.set(
      lerp(sample.lookAt[0], roomX + ROOM_LATERAL_DRIFT, roomT),
      sample.lookAt[1],
      lerp(sample.lookAt[2], roomZ + ROOM_LOOKAHEAD, roomT),
    );
    camera.lookAt(lookAtTarget);
    // `Camera.updateMatrixWorld` rafraichit aussi `matrixWorldInverse`, la
    // matrice de vue que reclame la matrice CSS de la camera.
    camera.updateMatrixWorld();

    const { cameraLayer, screen } = domRef.current;
    if (!cameraLayer || !screen || !screenMesh) {
      return;
    }

    // Convention exacte de CSS3DRenderer : perspective et matrice de vue sur le
    // calque camera (origine de transformation au centre), matrice monde de
    // l'objet sur la dalle DOM, avec le translate(-50%,-50%) qui recentre son
    // propre bloc.
    const perspective = cssPerspectiveFromFov(fov, size.height);

    cameraLayer.style.width = `${size.width}px`;
    cameraLayer.style.height = `${size.height}px`;
    cameraLayer.style.transform =
      `perspective(${perspective}px) translateZ(${perspective}px) ` +
      `${getCameraCssMatrix(camera.matrixWorldInverse.elements)} ` +
      `translate(${size.width / 2}px,${size.height / 2}px)`;

    screen.style.width = `${size.width}px`;
    screen.style.height = `${size.height}px`;

    // CSS3DRenderer travaille a raison d'un pixel CSS par unite monde : la mise
    // a l'echelle ramene le bloc de `size` pixels aux dimensions de la dalle.
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

    if (import.meta.env.DEV) {
      (window as unknown as { __cameraRigProbe?: CameraRigProbe }).__cameraRigProbe = {
        view: Array.from(camera.matrixWorldInverse.elements),
        object: Array.from(objectMatrix.elements),
        fovDeg: fov,
        width: size.width,
        height: size.height,
        roomProgress: roomT,
      };
    }
  });

  return null;
}
