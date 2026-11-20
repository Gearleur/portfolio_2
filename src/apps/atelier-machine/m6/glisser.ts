/*
 * The swipe back (step M6, « Feuille »): as in a native list, a finger that slides to the right
 * takes the screen with it, and let go far enough it goes back. It presses the terminal's own
 * way back, so the command is written as for any other move.
 *
 * It is told from two other gestures. A finger that goes up or down is reading: the browser
 * scrolls (touch-action: pan-y, m6.css), which ends the gesture here, and only a move within
 * about 27° of level is a swipe at all. And a finger that starts on the screen's left edge is
 * the browser's, which goes back in its own history there (iOS, Android): it is left alone.
 */

/** Px a finger travels to the right before the screen follows it, and before letting go means « back ». */
const PRISE = 12;
const SEUIL = 64;
/** Px from the screen's left edge that are the browser's own. */
const BORD = 24;

type Geste = { id: number; x: number; y: number; zone: HTMLElement; pris: boolean };

/** Listens on the terminal's layer; returns what stops it. */
export function glisser(couche: HTMLElement) {
  let geste: Geste | null = null;
  // The click a mouse sends when it lets go of a drag is not a touch on a name.
  let avale = false;

  const rendre = (zone: HTMLElement, doucement: boolean) => {
    zone.style.transition = doucement ? 'translate 0.2s ease, opacity 0.2s ease' : '';
    zone.style.translate = '';
    zone.style.opacity = '';
  };

  const debut = (event: PointerEvent) => {
    avale = false;
    const zone = couche.querySelector<HTMLElement>('.m5-defile');
    if (!zone || (event.pointerType === 'mouse' && event.button !== 0) || event.clientX - couche.getBoundingClientRect().left < BORD) return;
    geste = { id: event.pointerId, x: event.clientX, y: event.clientY, zone, pris: false };
  };

  const suite = (event: PointerEvent) => {
    if (!geste || geste.id !== event.pointerId) return;
    const [dx, dy] = [event.clientX - geste.x, event.clientY - geste.y];
    if (!geste.pris) {
      if (Math.abs(dy) > PRISE && Math.abs(dy) > dx / 2) geste = null;
      if (!geste || dx < PRISE || Math.abs(dy) > dx / 2) return;
      geste.pris = true;
      couche.setAttribute('data-glisse', '');
      window.getSelection()?.removeAllRanges();
    }
    const avance = Math.max(0, dx - PRISE);
    geste.zone.style.transition = '';
    geste.zone.style.translate = `${(avance * 0.85).toFixed(1)}px 0`;
    geste.zone.style.opacity = String(Math.max(0.4, 1 - avance / 320));
  };

  const fin = (event: PointerEvent) => {
    if (!geste || geste.id !== event.pointerId) return;
    const { zone, pris, x } = geste;
    geste = null;
    if (!pris) return;
    couche.removeAttribute('data-glisse');
    const retour = event.type === 'pointerup' && event.clientX - x > SEUIL ? couche.querySelector<HTMLElement>('[data-touche="retour"]:not(:disabled)') : null;
    rendre(zone, !retour);
    retour?.click();
    avale = event.pointerType === 'mouse';
  };

  const clic = (event: MouseEvent) => {
    if (!avale) return;
    avale = false;
    event.stopPropagation();
    event.preventDefault();
  };

  couche.addEventListener('pointerdown', debut);
  couche.addEventListener('pointermove', suite);
  couche.addEventListener('pointerup', fin);
  couche.addEventListener('pointercancel', fin);
  couche.addEventListener('click', clic, true);
  return () => {
    couche.removeEventListener('pointerdown', debut);
    couche.removeEventListener('pointermove', suite);
    couche.removeEventListener('pointerup', fin);
    couche.removeEventListener('pointercancel', fin);
    couche.removeEventListener('click', clic, true);
    couche.removeAttribute('data-glisse');
    if (geste) rendre(geste.zone, false);
  };
}
