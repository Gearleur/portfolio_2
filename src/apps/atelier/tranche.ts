import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * On a phone page, the name and « Menu » stay over the pictures that run over
 * the strip; where one passes under them, and only there, they take an accent
 * background (journal n° 70): an accent copy of the word (<Accent>) shows
 * through a mask (--over). `pictures` selects what runs over the strip.
 */
export function useTranche(ref: RefObject<HTMLElement | null>, pictures: string) {
  useEffect(() => {
    const page = ref.current;
    if (!page) return;
    const words = [...page.querySelectorAll<HTMLElement>('.m-strip > *')];
    const update = () => {
      const boxes = [...page.querySelectorAll(pictures)].map((picture) => picture.getBoundingClientRect());
      for (const word of words) {
        const box = word.getBoundingClientRect();
        const spans = boxes
          .filter((picture) => box.left < picture.right && box.right > picture.left)
          .map((picture) => [Math.max(box.top, picture.top), Math.min(box.bottom, picture.bottom)])
          .filter(([top, bottom]) => bottom > top)
          .map(([top, bottom]) => [((top - box.top) / box.height) * 100, ((bottom - box.top) / box.height) * 100]);
        // The word is turned half a turn: « to top » runs from its visual top down.
        const stops = spans.flatMap(([from, to]) => [
          `transparent ${from.toFixed(2)}%`,
          `#000 ${from.toFixed(2)}%`,
          `#000 ${to.toFixed(2)}%`,
          `transparent ${to.toFixed(2)}%`,
        ]);
        word.style.setProperty('--over', `linear-gradient(to top, transparent, ${stops.join(', ')}${stops.length ? ', ' : ''}transparent)`);
      }
    };
    update();
    page.addEventListener('scroll', update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(page);
    return () => {
      page.removeEventListener('scroll', update);
      resize.disconnect();
    };
  }, [ref, pictures]);
}
