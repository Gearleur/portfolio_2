/*
 * The phone's keyboard (step M6). It never comes out by itself: only a touch on the line where
 * one types gives it the keys (Console, `tactile`). And when it does, the page is not resized:
 * a phone lays its keyboard over the page (iOS always, Android by default) and may slide the
 * page up under it. What can still be seen is the visual viewport. While the keyboard is out,
 * the terminal's layer and the switch take that box (m6.css, data-clavier), so the line being
 * typed stays in view above the keys. The canvas keeps the whole screen: its black is what
 * shows around the keyboard while it slides.
 */

/** Px of height the window has to lose before it is a keyboard: an address bar that folds takes less. */
const SEUIL = 120;

type Boite = { haut: number; hauteur: number };

/**
 * What a browser says can be seen: the visual viewport's height and its top in the window, px,
 * its zoom, and the height of the window the page is laid out in, which a keyboard leaves as it is.
 */
export type Vue = { hauteur: number; haut: number; echelle: number; fenetre: number };

/**
 * The part of the stage a keyboard leaves in view, px from the stage's top; null when none is
 * out. `scene` is the stage's box in the window. A keyboard is out when the window shows less
 * than it is high. A page zoomed with two fingers shows less too: that is not a keyboard, and the
 * terminal stays as it is. Nor is a stage that merely stands low in a page that scrolls (the
 * bench's phone) under a keyboard.
 */
export function boiteVisible(scene: Boite, vue: Vue): Boite | null {
  if (Math.abs(vue.echelle - 1) > 0.01 || vue.fenetre - vue.hauteur < SEUIL) return null;
  const haut = Math.min(scene.hauteur, Math.max(0, vue.haut - scene.haut));
  const bas = Math.min(scene.hauteur, Math.max(haut, vue.haut + vue.hauteur - scene.haut));
  return { haut: Math.round(haut), hauteur: Math.round(bas - haut) };
}

/** Follows the keyboard on the stage; returns what stops it. */
export function suivreClavier(scene: HTMLElement) {
  const vue = window.visualViewport;
  if (!vue) return () => undefined;
  const regler = () => {
    const cadre = (scene.parentElement ?? scene).getBoundingClientRect();
    const boite = boiteVisible({ haut: cadre.top, hauteur: cadre.height }, { hauteur: vue.height, haut: vue.offsetTop, echelle: vue.scale, fenetre: document.documentElement.clientHeight });
    scene.toggleAttribute('data-clavier', boite !== null);
    if (boite) {
      scene.style.setProperty('--m6-vy', `${boite.haut}px`);
      scene.style.setProperty('--m6-vh', `${boite.hauteur}px`);
    } else {
      scene.style.removeProperty('--m6-vy');
      scene.style.removeProperty('--m6-vh');
    }
  };
  regler();
  vue.addEventListener('resize', regler);
  vue.addEventListener('scroll', regler);
  return () => {
    vue.removeEventListener('resize', regler);
    vue.removeEventListener('scroll', regler);
    scene.removeAttribute('data-clavier');
    scene.style.removeProperty('--m6-vy');
    scene.style.removeProperty('--m6-vh');
  };
}
