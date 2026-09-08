import { AdditiveBlending, CanvasTexture } from 'three';
import { useEffect, useMemo } from 'react';

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

  /*
   * `@react-three/fiber` ne libere que ce qu'il a lui-meme instancie depuis le
   * JSX : cette texture vient d'un `useMemo`, elle n'est donc a personne
   * d'autre qu'a nous. Quatre exemplaires de `ScreenGlow` sont montes par
   * canvas -- ils fuiraient a chaque montage, contre la promesse de la
   * section 13 de la specification.
   */
  useEffect(() => () => texture.dispose(), [texture]);

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
