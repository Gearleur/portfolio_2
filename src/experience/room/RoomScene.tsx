import { Canvas } from '@react-three/fiber';
import { CrtMonitor } from './CrtMonitor';
import { Floor } from './Floor';

export default function RoomScene({ device }: { device: 'crt' | 'phone' }) {
  const dpr: [number, number] = device === 'phone' ? [1, 1.5] : [1, 1.75];

  return (
    <Canvas
      className="room-canvas"
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 45, near: 0.1, far: 220, position: [0, 0, 3.4] }}
    >
      <color attach="background" args={['#05060a']} />
      <fogExp2 attach="fog" args={['#05060a', 0.042]} />
      <ambientLight intensity={0.06} />
      <pointLight position={[-3.1, 0.2, 1.4]} intensity={9} distance={26} color="#9fd8c8" />
      <Floor />
      <CrtMonitor position={[-3.1, 0, 0]} rotation={[0, 0.62, 0]} />
    </Canvas>
  );
}
