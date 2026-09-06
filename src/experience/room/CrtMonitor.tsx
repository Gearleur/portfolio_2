export function CrtMonitor({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[2.32, 1.92, 2.05]} />
        <meshStandardMaterial color="#c9c3b2" roughness={0.78} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0.08, 1.035]} name="crt-screen">
        <planeGeometry args={[1.78, 1.34]} />
        <meshBasicMaterial color="#8fb2a8" toneMapped={false} />
      </mesh>
    </group>
  );
}
