import { useEffect, useRef, useState } from 'react';
import type { WindowFrame } from '../types/window';
import {
  clampFrameToDesktop,
  getCenteredFrame,
  getInitialWindowFrame,
  getMaximizedFrame,
} from '../utils/windowFrame';

function getDesktopElement() {
  const desktop = document.querySelector('.desktop-surface');
  return desktop instanceof HTMLElement ? desktop : null;
}

export function useDesktopWindow(defaultFrame: WindowFrame, initiallyOpen = false) {
  const [isOpen, setOpen] = useState(false);
  const [isMaximized, setMaximized] = useState(false);
  const [frame, setFrame] = useState<WindowFrame>(defaultFrame);
  const previousFrame = useRef<WindowFrame>(defaultFrame);
  const hasOpened = useRef(false);

  useEffect(() => {
    if (!initiallyOpen) return;
    const request = requestAnimationFrame(() => {
      const desktop = getDesktopElement();
      if (desktop) {
        const availableHeight = Math.min(desktop.clientHeight, window.innerHeight - desktop.getBoundingClientRect().top);
        const initialFrame = getInitialWindowFrame(defaultFrame, desktop);
        initialFrame.height = Math.min(initialFrame.height, availableHeight - 32);
        initialFrame.y = Math.max(12, (availableHeight - initialFrame.height) / 2);
        setFrame(initialFrame);
      }
      hasOpened.current = true;
      setOpen(true);
    });
    return () => cancelAnimationFrame(request);
  }, [defaultFrame, initiallyOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const desktop = getDesktopElement();
    if (!desktop) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      setFrame((currentFrame) =>
        isMaximized ? getMaximizedFrame(desktop) : clampFrameToDesktop(currentFrame, desktop),
      );
    });

    resizeObserver.observe(desktop);
    return () => resizeObserver.disconnect();
  }, [isMaximized, isOpen]);

  const open = () => {
    const desktop = getDesktopElement();
    if (desktop) {
      setFrame((currentFrame) =>
        hasOpened.current
          ? getCenteredFrame(currentFrame, desktop)
          : getInitialWindowFrame(defaultFrame, desktop),
      );
    }
    hasOpened.current = true;
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
