import type { ReactNode } from 'react';

export function Floor({ reflection }: { reflection?: ReactNode }) {
  return (
    <group>
      <mesh position={[0, -1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#0a0c10" roughness={0.62} metalness={0.18} transparent opacity={0.86} />
      </mesh>

      {/*
       * Reflet : copie miroir sous le sol, assombrie, puis masquee par le sol
       * lui-meme qui est legerement transparent. Pas de materiau reflectif.
       */}
      <group position={[0, -2.8, 0]} scale={[1, -1, 1]}>
        {reflection}
      </group>
    </group>
  );
}
