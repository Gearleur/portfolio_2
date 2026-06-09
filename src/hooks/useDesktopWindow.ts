import { useRef, useState } from 'react';
import type { WindowFrame } from '../types/window';
import { clampFrameToDesktop, getMaximizedFrame } from '../utils/windowFrame';

function getDesktopElement() {
  const desktop = document.querySelector('.desktop-surface');
  return desktop instanceof HTMLElement ? desktop : null;
}

export function useDesktopWindow(defaultFrame: WindowFrame) {
  const [isOpen, setOpen] = useState(false);
  const [isMaximized, setMaximized] = useState(false);
  const [frame, setFrame] = useState<WindowFrame>(defaultFrame);
  const previousFrame = useRef<WindowFrame>(defaultFrame);

  const open = () => {
    const desktop = getDesktopElement();
    if (desktop) {
      setFrame((currentFrame) => clampFrameToDesktop(currentFrame, desktop));
    }
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
  };

  const toggleMaximize = () => {
    const desktop = getDesktopElement();
    if (!desktop) {
      return;
    }

    if (isMaximized) {
      setFrame(clampFrameToDesktop(previousFrame.current, desktop));
      setMaximized(false);
      return;
    }

    previousFrame.current = frame;
    setFrame(getMaximizedFrame(desktop));
    setMaximized(true);
  };

  const updateFrame = (nextFrame: WindowFrame) => {
    setMaximized(false);
    setFrame(nextFrame);
  };

  return {
    close,
    frame,
    isMaximized,
    isOpen,
    minimize: close,
    open,
    toggleMaximize,
    updateFrame,
  };
}
