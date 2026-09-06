export function Floor() {
  return (
    <mesh position={[0, -1.4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={false}>
      <planeGeometry args={[220, 220]} />
      <meshStandardMaterial color="#0a0c10" roughness={0.62} metalness={0.18} />
    </mesh>
  );
}
