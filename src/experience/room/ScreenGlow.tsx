import { AdditiveBlending, CanvasTexture } from 'three';
import { useMemo } from 'react';

function createRadialTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, 'rgba(159, 216, 200, 0.85)');
    gradient.addColorStop(0.42, 'rgba(120, 176, 200, 0.28)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }

  return new CanvasTexture(canvas);
}

export function ScreenGlow({
  position,
  scale,
}: {
  position: [number, number, number];
  scale: number;
}) {
  const texture = useMemo(() => createRadialTexture(), []);

  return (
    <sprite position={position} scale={[scale, scale, 1]}>
      <spriteMaterial
        map={texture}
        blending={AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  );
}
