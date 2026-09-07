import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { Mesh } from 'three';
import { CameraRig } from './CameraRig';
import { PULLBACK_FOV_DEG, PULLBACK_PATH } from './cameraPath';
import { CrtMonitor } from './CrtMonitor';
import { Floor } from './Floor';
import { CRT_MONITOR_POSITION, CRT_MONITOR_ROTATION } from './monitorPlacement';
import type { Vector3Tuple } from './monitorPlacement';
import { PhoneDevice } from './PhoneDevice';
import { PHONE_POSITION, PHONE_ROTATION } from './phonePlacement';

// La camera part de la pose amarree de la trajectoire plutot que d'une valeur
// independante : `CameraRig` la recalcule des la premiere frame a partir de la
// dalle reelle, mais ce repli reste le cadrage le plus juste s'il ne tourne pas.
const INITIAL_CAMERA_POSITION: Vector3Tuple = [...PULLBACK_PATH[0].position];

// Le mobile n'a pas de recul de camera (fondu de 400 ms a la place, gere par
// ExperienceStageContext) : ce repli n'a donc pas besoin de sortir de
// PULLBACK_PATH, qui est calibre pour le moniteur cathodique.
const PHONE_INITIAL_CAMERA_POSITION: Vector3Tuple = [-1.5, -0.35, 3.6];

/*
 * L'onglet en arriere-plan ne doit pas continuer a faire tourner la boucle de
 * rendu : `document.hidden` bascule `frameloop` sur `never`, ce que R3F
 * n'annule jamais tout seul, et le remet sur `always` au retour au premier
 * plan.
 */
function VisibilityGuard() {
  const setFrameloop = useThree((state) => state.setFrameloop);

  useEffect(() => {
    const onVisibilityChange = () => {
      setFrameloop(document.hidden ? 'never' : 'always');
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [setFrameloop]);

  return null;
}

export default function RoomScene({ device }: { device: 'crt' | 'phone' }) {
  // La dalle est la seule geometrie que le rig doit suivre : c'est sur sa
  // matrice monde que le bureau DOM vient se coller.
  const screenRef = useRef<Mesh | null>(null);
  const isPhone = device === 'phone';
  const dpr: [number, number] = isPhone ? [1, 1.5] : [1, 1.75];
  const cameraPosition = isPhone ? PHONE_INITIAL_CAMERA_POSITION : INITIAL_CAMERA_POSITION;

  // Un seul point d'instanciation pour l'appareil reel et pour son reflet :
  // `screenRef` ne doit aller qu'a l'appareil reel, jamais a la copie miroir
  // de `Floor` (voir le commentaire dans `Floor`), donc `ref` reste optionnel.
  const renderDevice = (ref?: RefObject<Mesh | null>) =>
    isPhone ? (
      <PhoneDevice position={PHONE_POSITION} rotation={PHONE_ROTATION} screenRef={ref} />
    ) : (
      <CrtMonitor position={CRT_MONITOR_POSITION} rotation={CRT_MONITOR_ROTATION} screenRef={ref} />
    );

  return (
    <Canvas
      className="room-canvas"
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: PULLBACK_FOV_DEG, near: 0.1, far: 220, position: cameraPosition }}
    >
      <color attach="background" args={['#05060a']} />
      <fogExp2 attach="fog" args={['#05060a', 0.042]} />
      <ambientLight intensity={0.06} />
      <pointLight position={[-3.1, 0.2, 1.4]} intensity={9} distance={26} color="#9fd8c8" />
      <Floor reflection={renderDevice()} />
      {renderDevice(screenRef)}
      <CameraRig screenRef={screenRef} />
      <VisibilityGuard />
    </Canvas>
  );
}
