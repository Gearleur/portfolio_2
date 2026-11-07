/*
 * A timeline of the Web Animations API. Every animation is created paused
 * with its own delay, so each one sits at its place on one common clock; the
 * whole is played at once, paused when the card is out of view, and played
 * again from the start when the last one is over. Transform, opacity and
 * filter run on the compositor; no frame loop in JavaScript.
 */

export const OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)';
export const STD = 'cubic-bezier(0.4, 0, 0.2, 1)';
export const IN = 'cubic-bezier(0.5, 0, 0.75, 0)';

type Options = {
  /** Start, in ms on the timeline. */
  a: number;
  /** Duration, in ms. */
  d: number;
  easing?: string;
  /**
   * « both » holds the first keyframe before the start: for the first
   * animation of a property. « forwards » holds only the last one: for those
   * that follow it, which must not hide the state before them.
   */
  fill?: 'both' | 'forwards';
};

export class Piste {
  private animations: Animation[] = [];
  private horloge?: Animation;

  constructor(private readonly racine: HTMLElement) {}

  ajoute(element: Element | null | undefined, cles: Keyframe[], { a, d, easing = 'linear', fill = 'both' }: Options) {
    if (!element) return;
    const animation = element.animate(cles, { delay: a, duration: d, easing, fill });
    animation.pause();
    this.animations.push(animation);
  }

  /** The end of the film: the clock that plays it again from the start, or hands over to `suite`. */
  termine(duree: number, suite?: () => void) {
    this.horloge = this.racine.animate([{ opacity: 1 }, { opacity: 1 }], { duration: duree });
    this.horloge.pause();
    this.horloge.onfinish = suite ?? (() => this.jouer());
  }

  private toutes() {
    return this.horloge ? [...this.animations, this.horloge] : this.animations;
  }

  /** From the start, all together. */
  jouer() {
    for (const animation of this.toutes()) {
      animation.currentTime = 0;
      animation.play();
    }
  }

  pause() {
    for (const animation of this.toutes()) animation.pause();
  }

  reprend() {
    for (const animation of this.toutes()) if (animation.playState === 'paused') animation.play();
  }

  annule() {
    if (this.horloge) this.horloge.onfinish = null;
    for (const animation of this.toutes()) animation.cancel();
    this.animations = [];
  }
}
