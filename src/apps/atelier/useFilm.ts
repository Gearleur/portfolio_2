import { useEffect } from 'react';
import type { RefObject } from 'react';

/*
 * A thumbnail's film (journal n° 105 and 106): a short loop, filmed
 * beforehand (scripts/tourner*.mjs) and played by the machine's video decoder,
 * where drawing it live kept the processor and the GPU busy and made the page
 * stutter as it opened. Its poster shows at once; the video is fetched once
 * the page has loaded and the card is within a screen, fades in when it plays
 * (film.css), and plays only on screen. With reduced motion, the poster only.
 */

export type Film = {
  av1: string;
  h264: string;
  /** Where the card starts, in seconds into the video: its poster's frame, on a key frame. */
  depart?: number;
  /** Back in view after more than this many ms away, the film starts again from `depart`. */
  relance?: number;
};

const AV1 = 'video/mp4; codecs="av01.0.04M.08"';
const H264 = 'video/mp4; codecs="avc1.64001F"';

/** AV1 where the machine decodes it in hardware (lighter and sharper), H.264 everywhere else. */
async function choisir(video: HTMLVideoElement, { av1, h264 }: Film) {
  if (video.canPlayType(AV1) && navigator.mediaCapabilities) {
    const info = await navigator.mediaCapabilities
      .decodingInfo({ type: 'file', video: { contentType: AV1, width: 1024, height: 576, bitrate: 240_000, framerate: 30 } })
      .catch(() => null);
    if (info?.powerEfficient) return av1;
  }
  return video.canPlayType(H264) ? h264 : av1;
}

export function useFilm(
  hote: RefObject<HTMLElement | null>,
  film: RefObject<HTMLVideoElement | null>,
  toile: RefObject<HTMLCanvasElement | null>,
  { av1, h264, depart = 0, relance }: Film,
) {
  useEffect(() => {
    const el = hote.current;
    const video = film.current;
    const canvas = toile.current;
    const g = canvas?.getContext('2d', { alpha: false });
    if (!el || !video || !canvas || !g || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let visible = false;
    let pret = false;
    let fini = false;
    let sorti = 0;

    /*
     * The video itself is never shown: each of its frames is copied onto a canvas,
     * drawn like the rest of the page. A <video> on screen is composited apart on a
     * desktop, which left a thin dark band under it (gone while scrolling or in a
     * screenshot); a canvas has no such layer. Its frame is cropped like object-fit: cover.
     */
    const peint = () => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh || !canvas.width || video.readyState < 2) return false;
      const s = Math.max(canvas.width / vw, canvas.height / vh);
      g.drawImage(video, (canvas.width - vw * s) / 2, (canvas.height - vh * s) / 2, vw * s, vh * s);
      return true;
    };
    const taille = new ResizeObserver(() => {
      const d = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(el.clientWidth * d);
      const h = Math.round(el.clientHeight * d);
      if (!w || !h || (w === canvas.width && h === canvas.height)) return;
      canvas.width = w;
      canvas.height = h;
      peint();
    });
    taille.observe(el);

    // each new frame, as the decoder gives it (or every screen frame where that is not known)
    let boucle = 0;
    const image = () => {
      if (fini) return;
      if (peint()) el.dataset.film = '';
      boucle = 'requestVideoFrameCallback' in video ? video.requestVideoFrameCallback(image) : requestAnimationFrame(image);
    };

    const maj = () => {
      if (!pret) return;
      if (visible && !document.hidden) video.play().catch(() => {});
      else video.pause();
    };
    const vue = new IntersectionObserver(([entree]) => {
      const etait = visible;
      visible = entree.isIntersecting;
      if (etait && !visible) sorti = performance.now();
      // whoever scrolls back to it after a while sees it from its start, not in the middle
      if (!etait && visible && pret && relance !== undefined && sorti && performance.now() - sorti > relance) video.currentTime = depart;
      maj();
    });
    vue.observe(el);

    const charge = async () => {
      const src = await choisir(video, { av1, h264 });
      if (fini) return;
      video.muted = true;
      video.src = depart ? `${src}#t=${depart}` : src;
      pret = true;
      image();
      maj();
    };
    const proche = new IntersectionObserver(
      ([entree]) => {
        if (!entree.isIntersecting) return;
        proche.disconnect();
        if (document.readyState === 'complete') void charge();
        else window.addEventListener('load', charge, { once: true });
      },
      { rootMargin: '100% 0px' },
    );
    proche.observe(el);

    const part = () => video.pause();
    document.addEventListener('visibilitychange', maj);
    window.addEventListener('pagehide', part);
    window.addEventListener('pageshow', maj);
    return () => {
      fini = true;
      if ('cancelVideoFrameCallback' in video) video.cancelVideoFrameCallback(boucle);
      cancelAnimationFrame(boucle);
      taille.disconnect();
      vue.disconnect();
      proche.disconnect();
      video.pause();
      window.removeEventListener('load', charge);
      document.removeEventListener('visibilitychange', maj);
      window.removeEventListener('pagehide', part);
      window.removeEventListener('pageshow', maj);
    };
  }, [hote, film, toile, av1, h264, depart, relance]);
}
