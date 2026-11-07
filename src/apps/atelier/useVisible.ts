import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

/** Whether an element is on screen (a margin of 120 px included): what is off screen stops moving. */
export function useVisible(ref: RefObject<Element | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const vue = new IntersectionObserver(([entree]) => setVisible(entree.isIntersecting), { rootMargin: '120px' });
    vue.observe(el);
    return () => vue.disconnect();
  }, [ref]);
  return visible;
}
