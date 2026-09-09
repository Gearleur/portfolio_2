import { useMemo } from 'react';
import { CatmullRomCurve3, Vector3 } from 'three';

/** Simple local geometry for the composition; detailed GLB props can replace it later. */
export function RoomObjects() {
  const cable = useMemo(() => new CatmullRomCurve3([
    new Vector3(-1.2, -1.46, 0.4), new Vector3(-0.5, -1.46, 1.8),
    new Vector3(-1.8, -1.46, 2.5), new Vector3(-3, -1.46, 2.1),
  ]), []);
  return (
    <group>
      <group position={[-5, -0.98, 1.8]} rotation={[0, 0.3, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.86, 0.74, 0.72]} />
          <meshStandardMaterial color="#d2d1c5" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.03, 0.368]}>
          <planeGeometry args={[0.67, 0.49]} />
          <meshBasicMaterial color="#174b91" />
        </mesh>
        <mesh position={[0, -0.44, 0]} castShadow>
          <boxGeometry args={[0.55, 0.14, 0.5]} />
          <meshStandardMaterial color="#bdbeb6" roughness={0.7} />
        </mesh>
        <mesh position={[0.27, -0.29, 0.37]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color="#75ffc5" />
        </mesh>
      </group>
      <mesh position={[-3, -1.43, 2.1]} castShadow>
        <boxGeometry args={[1.1, 0.1, 0.42]} />
        <meshStandardMaterial color="#d8dad8" roughness={0.55} />
      </mesh>
      {Array.from({ length: 4 }, (_, row) => Array.from({ length: 12 }, (_, col) => (
        <mesh key={`${row}-${col}`} position={[-3.46 + col * 0.078, -1.364, 1.96 + row * 0.087]}>
          <boxGeometry args={[0.06, 0.025, 0.06]} />
          <meshStandardMaterial color="#eff0e9" roughness={0.65} />
        </mesh>
      )))}
      <mesh>
        <tubeGeometry args={[cable, 32, 0.017, 6, false]} />
        <meshStandardMaterial color="#657180" roughness={0.8} />
      </mesh>
    </group>
  );
}
