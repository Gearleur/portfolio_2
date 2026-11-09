import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import affiche from './medias/reunions-affiche.webp';
import './reunions-scene/reunions.css';

/*
 * Synthèse de réunions' thumbnail (journal n° 103). It is the poster first,
 * which is all that is loaded with the page. The film (its WebGL code and
 * shaders) is fetched only when the card comes within a screen of the
 * viewport, and takes over from the poster, which is its first frame. With
 * reduced motion, the film is never fetched.
 */

const Film = lazy(() => import('./FilmReunions'));

const reduit = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Affiche() {
  return (
    <div className="reunions">
      <img className="reunions__affiche" src={affiche} alt="" decoding="async" />
    </div>
  );
}

export function MiniatureReunions() {
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
        <Suspense fallback={<Affiche />}>
          <Film />
        </Suspense>
      ) : (
        <Affiche />
      )}
    </div>
  );
}
