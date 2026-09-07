import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { RefObject } from 'react';
import type { Mesh, ShaderMaterial } from 'three';
import { CRT_SCREEN_LOCAL_POSITION, CRT_SCREEN_PLANE } from './monitorPlacement';
import { createScreenMaterial } from './ScreenMaterial';
import { ScreenGlow } from './ScreenGlow';

export function CrtMonitor({
  position,
  rotation,
  screenRef,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  screenRef?: RefObject<Mesh | null>;
}) {
  // The shader material is mutated every frame (uTime), so it lives in a ref
  // rather than useMemo: useMemo's value is treated as render output and must
  // stay immutable, while a ref is the sanctioned home for values that get
  // updated imperatively across frames outside of React's render cycle.
  const materialRef = useRef<ShaderMaterial | null>(null);
  if (materialRef.current === null) {
    materialRef.current = createScreenMaterial();
  }

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  // The material instance is attached imperatively in this ref callback
  // (which runs during commit, not render) instead of via the `material`
  // JSX prop, so the mutable ref is never read during the render itself.
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
        <boxGeometry args={[2.32, 1.92, 2.05]} />
        <meshStandardMaterial color="#c9c3b2" roughness={0.78} metalness={0.04} />
      </mesh>

      <mesh ref={attachScreenMesh} position={CRT_SCREEN_LOCAL_POSITION} name="crt-screen">
        <planeGeometry args={[CRT_SCREEN_PLANE.width, CRT_SCREEN_PLANE.height]} />
      </mesh>

      <ScreenGlow position={[0, 0.08, 1.16]} scale={3.4} />
    </group>
  );
}
