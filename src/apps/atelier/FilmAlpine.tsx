import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Icon } from '../../shared/mikky-ui/Icon';
import { AfficheAlpine } from './AfficheAlpine';
import fond from './medias/whiteboard-amdec-fond.webp';
import { monter } from './alpine-scene/chrono';
import { Feuille } from './alpine-scene/Feuille';
import type { Piste } from './alpine-scene/piste';
import { DOSSIER, MODELE, MOTS, QUESTION } from './alpine-scene/texte';
import '../../shared/mikky-ui/mikky-ui.css';
import './alpine-scene/alpine-scene.css';

/*
 * Whiteboard AMDEC's thumbnail, as a short film (journal n° 102): the poster,
 * then Mikky's chat in which the question is typed and sent, then the sheet
 * the agents fill, then the poster again. The markup is the whole scene, laid
 * out once at 640 × 360 in u; chrono.ts moves it. With reduced motion, only the
 * poster is shown.
 */

const reduit = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function FilmAlpine() {
  const [immobile] = useState(reduit);
  const racine = useRef<HTMLDivElement>(null);
  const graine = useRef(0);

  useEffect(() => {
    const el = racine.current;
    if (immobile || !el) return;

    let piste: Piste | null = null;
    graine.current = Math.floor(Math.random() * 1e9);
    let largeur = 0;
    let visible = true;
    const maj = () => (visible && !document.hidden ? piste?.reprend() : piste?.pause());

    const monte = () => {
      piste?.annule();
      // each turn of the film draws the agents' moves anew
      graine.current += 7919;
      piste = monter(el, el.clientWidth / 640, { graine: graine.current, suite: monte });
      el.dataset.pret = '';
      piste.jouer();
      maj();
    };

    const taille = new ResizeObserver(() => {
      const w = el.clientWidth;
      if (!w || Math.abs(w - largeur) < 1) return;
      largeur = w;
      monte();
    });
    taille.observe(el);
    // out of view the film stops; back in view it starts again from the poster, so that
    // whoever scrolls to it never waits for the next turn
    // (a short absence, under 8 s, is not an exit: the film goes on where it was)
    let sorti = 0;
    const vue = new IntersectionObserver(([entree]) => {
      const etaitVisible = visible;
      visible = entree.isIntersecting;
      if (!visible) sorti = performance.now();
      if (visible && !etaitVisible && piste && performance.now() - sorti > 8000) monte();
      else maj();
    });
    vue.observe(el);
    document.addEventListener('visibilitychange', maj);

    return () => {
      taille.disconnect();
      vue.disconnect();
      document.removeEventListener('visibilitychange', maj);
      piste?.annule();
    };
  }, [immobile]);

  if (immobile) return <AfficheAlpine />;

  return (
    <div ref={racine} className="as">
      <div className="as-stage mk">
        <img className="as-flou" data-k="flou" src={fond} alt="" decoding="async" />
        <div className="as-affiche" data-k="affiche">
          <AfficheAlpine />
        </div>
        <div className="as-voile" data-k="voile" />

        <div className="as-chat mk-island" data-k="chat">
          <span className="as-chevron" data-k="chevron" aria-hidden="true">
            <Icon name="back" />
          </span>
          <div className="as-accueil" data-k="accueil">
            Qu’est-ce qu’on lance ?
          </div>

          <div className="as-fil">
            <div className="mk-thread" data-k="rail">
              <div className="mk-user" data-k="bulle">
                <span className="mk-bubble">{QUESTION}</span>
                <div className="mk-time" data-k="heure">
                  14:00
                </div>
              </div>
              <p className="mk-agent">
                {MOTS.map((mot, i) => (
                  <span key={i}>
                    <span className="as-mot" data-k="mot">
                      {mot}
                    </span>{' '}
                  </span>
                ))}
              </p>
              <div className="mk-tool" data-k="outil">
                <Icon name="sparkle" />
                Lit leve-vitre.xlsx
                <Icon name="right" />
              </div>
              <div className="mk-tool mk-tool--now" data-k="outil" style={{ '--c': 'var(--blue)' } as CSSProperties}>
                <Icon name="sparkle" />
                Construit le tableau
                <Icon name="right" />
              </div>
            </div>
          </div>

          <div className="as-barre" data-k="barre">
            <div className="mk-pill" data-k="pill">
              <span className="mk-pill__text as-texte">
                <span className="as-ph" data-k="ph1">
                  Que doit faire l’agent ?
                </span>
                <span className="as-saisie" data-k="saisie">
                  <span className="as-car" data-k="car">
                    <i />
                  </span>
                  {[...QUESTION].map((lettre, i) => (
                    <span key={i} className="as-ch" data-k="ch">
                      {lettre}
                      <span className="as-car" data-k="car">
                        <i />
                      </span>
                    </span>
                  ))}
                </span>
                <span className="as-ph" data-k="ph2">
                  Écris à cet agent…
                </span>
              </span>
              <Icon name="mic" />
              <span className="mk-round mk-round--ink mk-send" data-k="envoi">
                <span className="as-onde" data-k="onde" />
                <span className="as-fleche" data-k="fleche">
                  <Icon name="up" />
                </span>
              </span>
            </div>
            <div className="mk-chips">
              <span className="mk-chip" data-k="puce">
                <Icon name="folder" />
                {DOSSIER}
                <Icon name="down" />
              </span>
              <span className="mk-chip" data-k="puce">
                <span className="as-logo">
                  <Icon name="sparkle" />
                </span>
                {MODELE}
                <Icon name="down" />
              </span>
            </div>
          </div>
        </div>

        <Feuille contenu anime />
      </div>
    </div>
  );
}
