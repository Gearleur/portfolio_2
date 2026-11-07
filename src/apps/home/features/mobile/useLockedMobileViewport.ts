import { useEffect } from 'react';

const MOBILE_VIEWPORT_HEIGHT_PROPERTY = '--mobile-viewport-height';
const LOCKED_VIEWPORT_CLASS = 'mobile-viewport-lock';
const SCROLLABLE_MOBILE_CONTENT_SELECTOR = '.mobile-app__content';

function getViewportHeight() {
  return window.visualViewport?.height ?? window.innerHeight;
}

function setMobileViewportHeight() {
  document.documentElement.style.setProperty(
    MOBILE_VIEWPORT_HEIGHT_PROPERTY,
    `${getViewportHeight()}px`,
  );
}

function isInsideScrollableMobileContent(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(SCROLLABLE_MOBILE_CONTENT_SELECTOR));
}

export function useLockedMobileViewport() {
  useEffect(() => {
    const { body, documentElement } = document;
    const originalScrollX = window.scrollX;
    const originalScrollY = window.scrollY;
    const visualViewport = window.visualViewport;

    const preventPageScroll = (event: TouchEvent) => {
      if (isInsideScrollableMobileContent(event.target)) {
        return;
      }

      event.preventDefault();
    };

    setMobileViewportHeight();
    window.scrollTo(0, 0);
    documentElement.classList.add(LOCKED_VIEWPORT_CLASS);
    body.classList.add(LOCKED_VIEWPORT_CLASS);

    window.addEventListener('resize', setMobileViewportHeight);
    window.addEventListener('orientationchange', setMobileViewportHeight);
    visualViewport?.addEventListener('resize', setMobileViewportHeight);
    visualViewport?.addEventListener('scroll', setMobileViewportHeight);
    document.addEventListener('touchmove', preventPageScroll, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventPageScroll);
      visualViewport?.removeEventListener('scroll', setMobileViewportHeight);
      visualViewport?.removeEventListener('resize', setMobileViewportHeight);
      window.removeEventListener('orientationchange', setMobileViewportHeight);
      window.removeEventListener('resize', setMobileViewportHeight);
      body.classList.remove(LOCKED_VIEWPORT_CLASS);
      documentElement.classList.remove(LOCKED_VIEWPORT_CLASS);
      documentElement.style.removeProperty(MOBILE_VIEWPORT_HEIGHT_PROPERTY);
      window.scrollTo(originalScrollX, originalScrollY);
    };
  }, []);
}
