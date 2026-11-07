import { useEffect, useState } from 'react';

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

type LegacyMediaQueryList = MediaQueryList & {
  addListener(listener: () => void): void;
  removeListener(listener: () => void): void;
};

const STANDALONE_QUERY = '(display-mode: standalone)';
const FULLSCREEN_QUERY = '(display-mode: fullscreen)';

function isStandaloneDisplayMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  const isStandaloneMedia = window.matchMedia(STANDALONE_QUERY).matches;
  const isFullscreenMedia = window.matchMedia(FULLSCREEN_QUERY).matches;
  const isAppleStandalone = Boolean((window.navigator as NavigatorWithStandalone).standalone);

  return isStandaloneMedia || isFullscreenMedia || isAppleStandalone;
}

function subscribeToDisplayMode(media: MediaQueryList, listener: () => void) {
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }

  const legacyMedia = media as LegacyMediaQueryList;
  legacyMedia.addListener(listener);
  return () => legacyMedia.removeListener(listener);
}

export function useStandaloneDisplayMode() {
  const [isStandalone, setIsStandalone] = useState(() => isStandaloneDisplayMode());

  useEffect(() => {
    const standaloneMedia = window.matchMedia(STANDALONE_QUERY);
    const fullscreenMedia = window.matchMedia(FULLSCREEN_QUERY);
    const updateStandaloneMode = () => setIsStandalone(isStandaloneDisplayMode());
    const unsubscribeStandalone = subscribeToDisplayMode(standaloneMedia, updateStandaloneMode);
    const unsubscribeFullscreen = subscribeToDisplayMode(fullscreenMedia, updateStandaloneMode);

    updateStandaloneMode();

    return () => {
      unsubscribeStandalone();
      unsubscribeFullscreen();
    };
  }, []);

  return isStandalone;
}
