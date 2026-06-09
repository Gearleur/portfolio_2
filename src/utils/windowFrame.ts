import type { Size, WindowFrame } from '../types/window';

const WINDOW_MARGIN = 12;

export const MIN_WINDOW_SIZE: Size = {
  width: 280,
  height: 250,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function getDesktopBounds(element: HTMLElement) {
  const rect = element.getBoundingClientRect();

  return {
    left: rect.left,
    top: rect.top,
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop,
    width: element.clientWidth,
    height: element.clientHeight,
  };
}

export function clampFrameToDesktop(frame: WindowFrame, desktop: HTMLElement): WindowFrame {
  const bounds = getDesktopBounds(desktop);
  const width = clamp(
    frame.width,
    MIN_WINDOW_SIZE.width,
    Math.max(MIN_WINDOW_SIZE.width, bounds.width - WINDOW_MARGIN * 2),
  );
  const height = clamp(
    frame.height,
    MIN_WINDOW_SIZE.height,
    Math.max(MIN_WINDOW_SIZE.height, bounds.height - WINDOW_MARGIN * 2),
  );

  return {
    x: clamp(frame.x, WINDOW_MARGIN, Math.max(WINDOW_MARGIN, bounds.width - width - WINDOW_MARGIN)),
    y: clamp(
      frame.y,
      WINDOW_MARGIN,
      Math.max(WINDOW_MARGIN, bounds.height - height - WINDOW_MARGIN),
    ),
    width,
    height,
  };
}

export function getMaximizedFrame(desktop: HTMLElement): WindowFrame {
  return {
    x: WINDOW_MARGIN,
    y: WINDOW_MARGIN,
    width: Math.max(MIN_WINDOW_SIZE.width, desktop.clientWidth - WINDOW_MARGIN * 2),
    height: Math.max(MIN_WINDOW_SIZE.height, desktop.clientHeight - WINDOW_MARGIN * 2),
  };
}
