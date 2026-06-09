import { useCallback, useRef, useState } from 'react';

const BASE_WINDOW_Z_INDEX = 5;

function createInitialLayers<WindowId extends string>(windowIds: readonly WindowId[]) {
  return windowIds.reduce(
    (layers, windowId, index) => ({
      ...layers,
      [windowId]: index,
    }),
    {} as Record<WindowId, number>,
  );
}

export function useWindowStack<WindowId extends string>(windowIds: readonly WindowId[]) {
  const [windowLayers, setWindowLayers] = useState(() => createInitialLayers(windowIds));
  const nextLayer = useRef(windowIds.length);

  const bringToFront = useCallback((windowId: WindowId) => {
    setWindowLayers((currentLayers) => {
      nextLayer.current += 1;

      return {
        ...currentLayers,
        [windowId]: nextLayer.current,
      };
    });
  }, []);

  const getZIndex = useCallback(
    (windowId: WindowId) => BASE_WINDOW_Z_INDEX + (windowLayers[windowId] ?? 0),
    [windowLayers],
  );

  return {
    bringToFront,
    getZIndex,
  };
}
