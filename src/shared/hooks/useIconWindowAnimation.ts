import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react';

/** Pull a window out of its desktop icon; fold it back before unmounting. */
export function useIconWindowAnimation(ref: RefObject<HTMLElement | null>, iconSelector?: string) {
  const animation = useRef<Animation | null>(null);
  const closing = useRef(false);

  const keyframes = useCallback((): Keyframe[] | null => {
    const element = ref.current;
    const icon = iconSelector ? document.querySelector(iconSelector) : null;
    if (!element || !icon || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
    const origin = icon.getBoundingClientRect();
    // Layout dimensions stay stable even if an opening animation is interrupted.
    const target = element.getBoundingClientRect();
    const x = origin.left + origin.width / 2 - (target.left + target.width / 2);
    const y = origin.top + origin.height / 2 - (target.top + target.height / 2);
    return [
      { transform: `translate(${x}px, ${y}px) scale(${origin.width / target.width}, ${origin.height / target.height})`, opacity: 0, clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)' },
      { transform: `translate(${x * .28}px, ${y * .18}px) scale(.42, .88)`, opacity: 1, clipPath: 'polygon(0 0, 100% 0, 78% 100%, 22% 100%)', offset: .55 },
      { transform: 'translate(0, 0) scale(1)', opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
    ];
  }, [iconSelector, ref]);

  useLayoutEffect(() => {
    closing.current = false;
    const element = ref.current;
    const frames = keyframes();
    if (!element || !frames) return;
    element.dataset.windowPhase = 'opening';
    animation.current = element.animate(frames, { duration: 780, easing: 'cubic-bezier(.22, 1, .36, 1)' });
    animation.current.onfinish = () => { element.dataset.windowPhase = 'open'; };
    return () => { animation.current?.cancel(); };
  }, [keyframes, ref]);

  return useCallback((onClosed: () => void) => {
    if (closing.current) return;
    closing.current = true;
    const element = ref.current;
    const current = element ? getComputedStyle(element) : null;
    const interrupted: Keyframe | null = current ? {
      transform: current.transform, opacity: current.opacity, clipPath: current.clipPath,
    } : null;
    animation.current?.cancel();
    const frames = keyframes();
    const finish = () => {
      if (iconSelector) document.querySelector(iconSelector)?.closest<HTMLElement>('button')?.focus({ preventScroll: true });
      onClosed();
    };
    if (!element || !frames) { finish(); return; }
    element.dataset.windowPhase = 'closing';
    const reversed = [...frames].reverse().map((frame) => ({ ...frame, offset: undefined }));
    if (interrupted) reversed[0] = { ...interrupted, offset: undefined };
    animation.current = element.animate(reversed, {
      duration: 500, easing: 'cubic-bezier(.55, 0, .75, .4)', fill: 'forwards',
    });
    animation.current.onfinish = finish;
  }, [iconSelector, keyframes, ref]);
}
