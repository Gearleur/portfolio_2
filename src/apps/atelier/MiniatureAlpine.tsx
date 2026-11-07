import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AfficheAlpine } from './AfficheAlpine';

/*
 * Whiteboard AMDEC's thumbnail. It is the poster first, which is all that is
 * loaded with the page. The film (its code, its styles, its fonts) is fetched
 * only when the card comes within a screen of the viewport, and takes over from
 * the poster, which it begins with. With reduced motion, the film is never
 * fetched.
 */

const Film = lazy(() => import('./FilmAlpine'));

const reduit = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function MiniatureAlpine() {
  const hote = useRef<HTMLDivElement>(null);
  const [immobile] = useState(reduit);
  const [proche, setProche] = useState(false);

  useEffect(() => {
    const el = hote.current;
    if (immobile || !el) return;
    const vue = new IntersectionObserver(
      ([entree]) => {
        if (!entree.isIntersecting) return;
        setProche(true);
        vue.disconnect();
      },
      { rootMargin: '100% 0px' },
    );
    vue.observe(el);
    return () => vue.disconnect();
  }, [immobile]);

  return (
    <div ref={hote} style={{ width: '100%', height: '100%' }}>
      {proche ? (
        <Suspense fallback={<AfficheAlpine />}>
          <Film />
        </Suspense>
      ) : (
        <AfficheAlpine />
      )}
    </div>
  );
}
