/** Opaque gallery floor: real shadows, fine joints, no mirrored duplicate scene. */
export function Floor() {
  return (
    <group>
      <mesh position={[0, -1.5, 24]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[160, 180]} />
        <meshStandardMaterial color="#e7e9ec" roughness={0.48} metalness={0.08} />
      </mesh>
      <gridHelper args={[120, 80, '#c1c8d0', '#d4d9df']} position={[0, -1.495, 24]} />
      <mesh position={[0, 4, -1.2]} receiveShadow>
        <boxGeometry args={[30, 11, 0.3]} />
        <meshStandardMaterial color="#f1f2f4" roughness={0.85} />
      </mesh>
      <gridHelper args={[30, 20, '#d3d8df', '#dce0e5']} position={[0, 4, -1.045]} rotation={[Math.PI / 2, 0, 0]} />
      {/* Repeated architectural bays make camera travel visible through parallax. */}
      {[5, 13, 21, 29, 37, 45].map((z) => (
        <group key={z}>
          {[-7.5, 7.5].map((x) => (
            <mesh key={x} position={[x, 2.5, z]} castShadow receiveShadow>
              <boxGeometry args={[0.42, 8, 0.65]} />
              <meshStandardMaterial color="#e4e8ed" roughness={0.6} />
            </mesh>
          ))}
          <mesh position={[0, 6.35, z]} castShadow>
            <boxGeometry args={[15.4, 0.3, 0.65]} />
            <meshStandardMaterial color="#e4e8ed" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
