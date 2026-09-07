import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { RefObject } from 'react';
import type { Mesh, ShaderMaterial } from 'three';
import { PHONE_SCREEN_LOCAL_POSITION, PHONE_SCREEN_PLANE } from './phonePlacement';
import { createScreenMaterial } from './ScreenMaterial';
import { ScreenGlow } from './ScreenGlow';

export function PhoneDevice({
  position,
  rotation,
  screenRef,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  screenRef?: RefObject<Mesh | null>;
}) {
  // Meme raison que CrtMonitor : le materiau est mute chaque frame (uTime),
  // donc il vit dans un ref plutot qu'un useMemo dont la valeur est traitee
  // comme un rendu immuable.
  const materialRef = useRef<ShaderMaterial | null>(null);
  if (materialRef.current === null) {
    materialRef.current = createScreenMaterial();
  }

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  // Meme raison que CrtMonitor : attachement imperatif dans ce callback de ref
  // (execute au commit, pas au rendu) plutot que via la prop JSX `material`.
  const attachScreenMesh = (mesh: Mesh | null) => {
    if (mesh && materialRef.current) {
      mesh.material = materialRef.current;
    }
    if (screenRef) {
      screenRef.current = mesh;
    }
  };

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.78, 1.58, 0.09]} />
        <meshStandardMaterial color="#1b1d21" roughness={0.42} metalness={0.62} />
      </mesh>

      <mesh ref={attachScreenMesh} position={PHONE_SCREEN_LOCAL_POSITION} name="phone-screen">
        <planeGeometry args={[PHONE_SCREEN_PLANE.width, PHONE_SCREEN_PLANE.height]} />
      </mesh>

      <ScreenGlow position={[0, 0, 0.2]} scale={2.1} />
    </group>
  );
}
