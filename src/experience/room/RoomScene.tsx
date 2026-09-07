import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh } from 'three';
import { CameraRig } from './CameraRig';
import { PULLBACK_FOV_DEG, PULLBACK_PATH } from './cameraPath';
import { CrtMonitor } from './CrtMonitor';
import { Floor } from './Floor';
import { CRT_MONITOR_POSITION, CRT_MONITOR_ROTATION } from './monitorPlacement';
import type { Vector3Tuple } from './monitorPlacement';

// La camera part de la pose amarree de la trajectoire plutot que d'une valeur
// independante : `CameraRig` la recalcule des la premiere frame a partir de la
// dalle reelle, mais ce repli reste le cadrage le plus juste s'il ne tourne pas.
const INITIAL_CAMERA_POSITION: Vector3Tuple = [...PULLBACK_PATH[0].position];

export default function RoomScene({ device }: { device: 'crt' | 'phone' }) {
  // La dalle est la seule geometrie que le rig doit suivre : c'est sur sa
  // matrice monde que le bureau DOM vient se coller.
  const screenRef = useRef<Mesh | null>(null);
  const dpr: [number, number] = device === 'phone' ? [1, 1.5] : [1, 1.75];

  return (
    <Canvas
      className="room-canvas"
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: PULLBACK_FOV_DEG, near: 0.1, far: 220, position: INITIAL_CAMERA_POSITION }}
    >
      <color attach="background" args={['#05060a']} />
      <fogExp2 attach="fog" args={['#05060a', 0.042]} />
      <ambientLight intensity={0.06} />
      <pointLight position={[-3.1, 0.2, 1.4]} intensity={9} distance={26} color="#9fd8c8" />
      <Floor
        reflection={
          <CrtMonitor position={CRT_MONITOR_POSITION} rotation={CRT_MONITOR_ROTATION} />
        }
      />
      <CrtMonitor
        position={CRT_MONITOR_POSITION}
        rotation={CRT_MONITOR_ROTATION}
        screenRef={screenRef}
      />
      <CameraRig screenRef={screenRef} />
    </Canvas>
  );
}
