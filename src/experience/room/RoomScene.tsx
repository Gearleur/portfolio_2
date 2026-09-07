import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh } from 'three';
import { CameraRig } from './CameraRig';
import { PULLBACK_PATH } from './cameraPath';
import { CrtMonitor } from './CrtMonitor';
import { Floor } from './Floor';

// La camera part de la pose amarree de la trajectoire plutot que d'une valeur
// independante : `CameraRig` la recalcule des la premiere frame a partir de la
// dalle reelle, mais ce repli reste le cadrage le plus juste s'il ne tourne pas.
const INITIAL_CAMERA_POSITION: [number, number, number] = [...PULLBACK_PATH[0].position];

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
      camera={{ fov: 45, near: 0.1, far: 220, position: INITIAL_CAMERA_POSITION }}
    >
      <color attach="background" args={['#05060a']} />
      <fogExp2 attach="fog" args={['#05060a', 0.042]} />
      <ambientLight intensity={0.06} />
      <pointLight position={[-3.1, 0.2, 1.4]} intensity={9} distance={26} color="#9fd8c8" />
      <Floor reflection={<CrtMonitor position={[-3.1, 0, 0]} rotation={[0, 0.62, 0]} />} />
      <CrtMonitor position={[-3.1, 0, 0]} rotation={[0, 0.62, 0]} screenRef={screenRef} />
      <CameraRig screenRef={screenRef} />
    </Canvas>
  );
}
