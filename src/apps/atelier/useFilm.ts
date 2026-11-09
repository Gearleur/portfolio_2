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

export function useFilm(hote: RefObject<HTMLElement | null>, film: RefObject<HTMLVideoElement | null>, { av1, h264, depart = 0, relance }: Film) {
  useEffect(() => {
    const el = hote.current;
    const video = film.current;
    if (!el || !video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let visible = false;
    let pret = false;
    let fini = false;
    let sorti = 0;

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

    const joue = () => (el.dataset.film = '');
    const part = () => video.pause();
    video.addEventListener('playing', joue, { once: true });
    document.addEventListener('visibilitychange', maj);
    window.addEventListener('pagehide', part);
    window.addEventListener('pageshow', maj);
    return () => {
      fini = true;
      vue.disconnect();
      proche.disconnect();
      video.pause();
      video.removeEventListener('playing', joue);
      window.removeEventListener('load', charge);
      document.removeEventListener('visibilitychange', maj);
      window.removeEventListener('pagehide', part);
      window.removeEventListener('pageshow', maj);
    };
  }, [hote, film, av1, h264, depart, relance]);
}
