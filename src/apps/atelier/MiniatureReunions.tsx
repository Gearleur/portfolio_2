import { useEffect, useRef } from 'react';
import fond from './medias/reunions-fond.webp';
import av1 from './medias/reunions-fond-av1.mp4';
import h264 from './medias/reunions-fond-h264.mp4';
import { BASE, placeVitre } from './reunions-scene/vitre';
import { dessinerVoix } from './reunions-scene/voix';
import { useFilm } from './useFilm';
import './film.css';
import './reunions-scene/reunions.css';

/*
 * Synthèse de réunions' thumbnail (journal n° 103 and 105). The paper, the
 * embossed fingerprint, the current and the liquid glass are a 16 s loop,
 * filmed from reunions-scene (tournage.html, scripts/tournerReunions.mjs) and
 * played as a video (useFilm). The voices stay live, on a canvas over it, so
 * the conversation never repeats. With reduced motion: the first frame and the
 * voices, still.
 */

/** The voices' moment when the card appears. */
const DEPART = 6;
/**
 * The voices are drawn 30 times a second, as the film under them: they move
 * less than half a pixel between two frames. A quarter of a 240 Hz frame of
 * slack keeps the rhythm steady whatever the screen's rate.
 */
const PAS = 1 / 30 - 1 / 240;
/** Their canvas covers the glass and this margin (px of a card), not the whole card: six times fewer pixels. */
const MARGE = 6;
const FILM = { av1, h264 };

export function MiniatureReunions() {
  const hote = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const toile = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLCanvasElement>(null);
  useFilm(hote, film, image, FILM);

  // the voices
  useEffect(() => {
    const el = hote.current;
    const canvas = toile.current;
    const g = canvas?.getContext('2d');
    if (!el || !canvas || !g) return;
    const immobile = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0;
    let H = 0;
    let dpr = 1;
    // the canvas's place in the card, css px
    let zone = { x: 0, y: 0, w: 0, h: 0 };
    let visible = false;
    let raf = 0;
    let dernier = 0;
    let ecoule = 0;
    let tVoix = -Infinity;

    const dessine = (t: number) => {
      // the voices are drawn in the card's coordinates, shifted onto the canvas
      g.setTransform(dpr, 0, 0, dpr, -zone.x * dpr, -zone.y * dpr);
      g.clearRect(zone.x, zone.y, zone.w, zone.h);
      dessinerVoix(g, W, H, t);
      tVoix = t;
    };
    const image = (ms: number) => {
      raf = 0;
      // a pause (out of view, hidden tab) does not make the voices jump on return
      ecoule += dernier ? Math.min(0.1, (ms - dernier) / 1000) : 0;
      dernier = ms;
      const t = DEPART + ecoule;
      if (t - tVoix >= PAS) dessine(t);
      lance();
    };
    const lance = () => {
      if (!raf && !immobile && W && visible && !document.hidden) raf = requestAnimationFrame(image);
    };
    const arrete = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      dernier = 0;
    };
    const maj = () => (visible && !document.hidden ? lance() : arrete());

    const taille = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const d = Math.min(2, window.devicePixelRatio || 1);
      if (!w || !h || (w === W && h === H && d === dpr)) return;
      W = w;
      H = h;
      dpr = d;
      const v = placeVitre(W, H);
      const m = (MARGE * W) / BASE;
      // whole device pixels, so the voices stay as sharp as on a full-card canvas
      const x = Math.floor((v.x - m) * dpr) / dpr;
      const y = Math.floor((v.y - m) * dpr) / dpr;
      zone = { x, y, w: Math.ceil((v.x + v.w + m) * dpr) / dpr - x, h: Math.ceil((v.y + v.h + m) * dpr) / dpr - y };
      canvas.width = Math.round(zone.w * dpr);
      canvas.height = Math.round(zone.h * dpr);
      Object.assign(canvas.style, { left: `${zone.x}px`, top: `${zone.y}px`, width: `${zone.w}px`, height: `${zone.h}px` });
      // a resized canvas is blank: the voices are drawn again at once
      dessine(DEPART + ecoule);
      maj();
    });
    taille.observe(el);
    const vue = new IntersectionObserver(([entree]) => {
      visible = entree.isIntersecting;
      maj();
    });
    vue.observe(el);
    document.addEventListener('visibilitychange', maj);
    window.addEventListener('pagehide', arrete);
    window.addEventListener('pageshow', maj);

    return () => {
      arrete();
      taille.disconnect();
      vue.disconnect();
      document.removeEventListener('visibilitychange', maj);
      window.removeEventListener('pagehide', arrete);
      window.removeEventListener('pageshow', maj);
    };
  }, []);

  return (
    <div ref={hote} className="film reunions">
      <img className="film__affiche" src={fond} alt="" decoding="async" />
      <video ref={film} className="film__video" muted loop playsInline disablePictureInPicture preload="auto" aria-hidden="true" />
      <canvas ref={image} className="film__image" aria-hidden="true" />
      <canvas ref={toile} className="reunions__voix" aria-hidden="true" />
    </div>
  );
}
