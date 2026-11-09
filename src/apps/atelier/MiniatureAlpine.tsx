import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AfficheAlpine } from './AfficheAlpine';
import affiche from './medias/alpine-affiche.webp';
import av1 from './medias/alpine-film-av1.mp4';
import h264 from './medias/alpine-film-h264.mp4';
import { useFilm } from './useFilm';
import './film.css';

/*
 * Whiteboard AMDEC's thumbnail: the poster, then Mikky's chat, then the sheet
 * the agents fill, then the poster again (journal n° 102).
 *
 * On a card (journal n° 106) it is that film shot beforehand
 * (alpine-scene/tournage.html, scripts/tournerAlpine.mjs) and played as a
 * video: drawn live, its blurs, its growing window and the poster's own
 * movements made the Vitrine stutter as it opened. The video starts on the
 * poster at rest, its own first frame; back in view after more than 8 s away,
 * it starts there again.
 *
 * `direct` keeps the film live, sharp at any size: for the project page, where
 * it is shown large and alone. Its poster loads with the page; the film (its
 * code, styles and fonts) only when the card comes within a screen. With
 * reduced motion, the poster only, in both cases.
 */

const FILM = { av1, h264, depart: 20, relance: 8000 };

function EnVideo() {
  const hote = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  useFilm(hote, film, FILM);
  return (
    <div ref={hote} className="film">
      <img className="film__affiche" src={affiche} alt="" decoding="async" />
      <video ref={film} className="film__video" muted loop playsInline disablePictureInPicture preload="auto" aria-hidden="true" />
    </div>
  );
}

const Film = lazy(() => import('./FilmAlpine'));

const reduit = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function EnDirect() {
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

export function MiniatureAlpine({ direct = false }: { direct?: boolean }) {
  return direct ? <EnDirect /> : <EnVideo />;
}
