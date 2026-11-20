/*
 * The number is put away (step M6). Large in the middle of the black while the bubble spreads,
 * it has no strip to stay in on a phone: once the terminal is there it is written small on one
 * of its lines (.m6-pose, its figures in .m6-chiffres). So that the eye follows it, a copy of
 * the figures (.m6-vol) starts where the bubble showed them, at their size, and shrinks to where
 * the terminal writes them, while the canvas's own fade; the terminal's show once it has landed.
 */

/**
 * Plays it on the terminal's layer: `grand` is the large figures' size, px; `attente` and `duree`
 * are the terminal's own delay and entrance. Returns what ends it at once.
 */
export function ranger(couche: HTMLElement, grand: number, attente: number, duree: number) {
  const pose = couche.querySelector<HTMLElement>('.m6-pose');
  const chiffres = pose?.querySelector<HTMLElement>('.m6-chiffres');
  const vol = couche.querySelector<HTMLElement>('.m6-vol');
  const cible = chiffres?.getBoundingClientRect();
  if (!pose || !chiffres || !cible?.width || !vol?.animate) return () => undefined;

  const cadre = couche.getBoundingClientRect();
  const style = getComputedStyle(chiffres);
  const figures = chiffres.textContent ?? '';
  // The copy: the same figures in the same face, laid exactly over those the terminal writes.
  vol.textContent = figures;
  Object.assign(vol.style, {
    left: `${cible.left - cadre.left}px`,
    top: `${cible.top - cadre.top}px`,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    letterSpacing: style.letterSpacing,
    lineHeight: `${cible.height}px`,
  });
  const k = grand / parseFloat(style.fontSize);
  // The large figures are in the middle of the screen with their cursor after them (nombre.ts): their own middle is a third of a cell to its left.
  const cellule = (k * cible.width) / Math.max(1, figures.length);
  const dx = cadre.width / 2 - 0.35 * cellule - (cible.left - cadre.left + cible.width / 2);
  const dy = cadre.height * 0.49 - (cible.top - cadre.top + cible.height / 2);
  const depart = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${k.toFixed(3)})`;

  couche.setAttribute('data-vol', '');
  const trajet = vol.animate([{ transform: depart, opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: 'translate(0, 0) scale(1)', opacity: 1 }], { delay: attente, duration: duree + 150, easing: 'cubic-bezier(0.5, 0, 0.2, 1)', fill: 'both' });
  let fini = false;
  const finir = () => {
    if (fini) return;
    fini = true;
    couche.removeAttribute('data-vol');
    trajet.cancel();
  };
  // Landed: the terminal's own figures and their label come up under the copy, which then goes.
  trajet.finished.then(
    () => {
      if (fini) return;
      couche.removeAttribute('data-vol');
      pose.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 }).finished.then(finir, finir);
    },
    () => undefined,
  );
  return finir;
}
