import { useEffect } from 'react';

export function usePreloadImages(sources: readonly string[]) {
  useEffect(() => {
    const uniqueSources = Array.from(new Set(sources));
    const images = uniqueSources.map((source) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = source;
      return image;
    });

    return () => {
      images.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, [sources]);
}
