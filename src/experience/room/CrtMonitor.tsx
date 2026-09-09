import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { SRGBColorSpace, TextureLoader } from 'three';
import type { Mesh, Texture } from 'three';
import { CRT_SCREEN_LOCAL_POSITION, CRT_SCREEN_PLANE } from './monitorPlacement';

/** Architectural screen, with a real recess and a luminous inner frame. */
export function CrtMonitor({ position, rotation, screenRef }: {
  position: [number, number, number];
  rotation: [number, number, number];
  screenRef?: RefObject<Mesh | null>;
}) {
  const [wallpaper, setWallpaper] = useState<Texture | null>(null);
  useEffect(() => {
    let active = true;
    const texture = new TextureLoader().load('/assets/wallpapper_desktop.png', (loaded) => {
      loaded.colorSpace = SRGBColorSpace;
      if (active) setWallpaper(loaded);
    });
    return () => { active = false; texture.dispose(); };
  }, []);
  const { width, height } = CRT_SCREEN_PLANE;
  const [x, y, z] = CRT_SCREEN_LOCAL_POSITION;

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[x, y, z - 0.2]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.22, height + 0.22, 0.36]} />
        <meshStandardMaterial color="#e1e5e9" roughness={0.32} metalness={0.22} />
      </mesh>
      <mesh position={[x, y, z - 0.009]}>
        <planeGeometry args={[width + 0.065, height + 0.065]} />
        <meshBasicMaterial color="#b9e6ff" toneMapped={false} />
      </mesh>
      <mesh ref={screenRef} position={CRT_SCREEN_LOCAL_POSITION} name="crt-screen">
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial key={wallpaper?.uuid ?? 'loading'} map={wallpaper} color={wallpaper ? '#ffffff' : '#347bc3'} toneMapped={false} />
      </mesh>
      <pointLight position={[0, -0.8, 0.8]} color="#75bfff" intensity={7} distance={5} decay={2} />
      <mesh position={[0, y + height / 2 + 0.095, z + 0.02]}>
        <boxGeometry args={[width + 0.1, 0.035, 0.04]} />
        <meshBasicMaterial color="#e1f5ff" toneMapped={false} />
      </mesh>
    </group>
  );
}
