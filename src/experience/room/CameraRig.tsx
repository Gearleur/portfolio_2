import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { Matrix4, PlaneGeometry, Vector3 } from 'three';
import type { Mesh } from 'three';
import { clamp01, easeOutExpo } from '../stage/easing';
import { useExperienceStageContext } from '../stage/ExperienceStageContext';
import { PULLBACK_PATH, sampleCameraPath } from './cameraPath';
import type { CameraKeyframe } from './cameraPath';
import {
  cssPerspectiveFromFov,
  fitScaleForScreen,
  getCameraCssMatrix,
  getObjectCssMatrix,
  shouldSwapToShader,
} from './screenProjection';

const DEFAULT_FOV = 45;
const FALLBACK_PLANE = { width: 1.78, height: 1.34 };

// Objets de travail alloues une fois : la boucle tourne a 60 Hz et ne doit
// produire aucun dechet.
const lookAtTarget = new Vector3();
const screenCenter = new Vector3();
const screenNormal = new Vector3();
const objectMatrix = new Matrix4();
const domScale = new Vector3();

type DomTargets = {
  cameraLayer: HTMLElement | null;
  screen: HTMLElement | null;
};

function planeSizeOf(mesh: Mesh): { width: number; height: number } {
  const geometry = mesh.geometry;
  return geometry instanceof PlaneGeometry
    ? { width: geometry.parameters.width, height: geometry.parameters.height }
    : FALLBACK_PLANE;
}

export function CameraRig({ screenRef }: { screenRef: RefObject<Mesh | null> }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const { transitionProgressRef } = useExperienceStageContext();

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
    const halfFovTan = Math.tan(((fov * Math.PI) / 180) / 2);
    const screenMesh = screenRef.current;

    // Unites-monde par pixel CSS, et pose amarree correspondante.
    let worldPerPixel = fitScaleForScreen(
      size.width,
      size.height,
      FALLBACK_PLANE.width,
      FALLBACK_PLANE.height,
    );

    if (screenMesh) {
      screenMesh.updateWorldMatrix(true, false);
      screenCenter.setFromMatrixPosition(screenMesh.matrixWorld);
      // `transformDirection` renormalise deja le resultat.
      screenNormal.set(0, 0, 1).transformDirection(screenMesh.matrixWorld);

      const plane = planeSizeOf(screenMesh);
      worldPerPixel = fitScaleForScreen(size.width, size.height, plane.width, plane.height);

      // Distance a laquelle le bureau, une fois inscrit dans la dalle, remplit
      // pile le cadre : c'est la pose ou le raccord DOM / WebGL est invisible.
      const dockDistance = (size.height * worldPerPixel) / 2 / halfFovTan;
      const dock = path[0];
      dock.position[0] = screenCenter.x + screenNormal.x * dockDistance;
      dock.position[1] = screenCenter.y + screenNormal.y * dockDistance;
      dock.position[2] = screenCenter.z + screenNormal.z * dockDistance;
      dock.lookAt[0] = screenCenter.x;
      dock.lookAt[1] = screenCenter.y;
      dock.lookAt[2] = screenCenter.z;
    }

    const eased = easeOutExpo(clamp01(transitionProgressRef.current));
    const sample = sampleCameraPath(path, eased);

    camera.position.set(sample.position[0], sample.position[1], sample.position[2]);
    lookAtTarget.set(sample.lookAt[0], sample.lookAt[1], sample.lookAt[2]);
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
    const distance = camera.position.distanceTo(screenCenter);
    const visibleWidth = 2 * halfFovTan * distance * (size.width / size.height);
    const ratio = visibleWidth > 0 ? (size.width * worldPerPixel) / visibleWidth : 0;

    screen.style.opacity = shouldSwapToShader(ratio) ? '0' : '1';
  });

  return null;
}
