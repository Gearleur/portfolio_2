import { useCallback, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useExperienceStageContext } from '../stage/ExperienceStageContext';
import { CinematicA11yArticle } from './CinematicA11yArticle';
import { cinematicScript } from './cinematicScript';
import { useScrollTimeline } from './useScrollTimeline';
import './cinematic.css';

/*
 * Le conteneur reste monte en permanence -- seul l'attribut `hidden` bascule
 * avec la phase. Le demonter et le remonter casserait l'ecouteur de scroll :
 * l'effet de `useScrollTimeline` ne s'attache qu'une fois, a l'ouverture de
 * la scene, et ne se reattache jamais si l'element n'existait pas encore a
 * ce moment-la (une ref ne fait pas partie des dependances d'un effet). En
 * restant monte, `scrollRef.current` est deja pret des le premier montage de
 * l'application, avant meme que la piece ne soit visible.
 */
export function CinematicOverlay() {
  const { stage, returnToDesktop, roomProgressRef } = useExperienceStageContext();
  const isRoom = stage === 'room';
  const containerRef = useRef<HTMLDivElement | null>(null);

  const syncRoomProgress = useCallback(
    (progress: number) => {
      roomProgressRef.current = progress;
    },
    [roomProgressRef],
  );

  const { scrollRef, actIndex, goToAct, sync } = useScrollTimeline(
    cinematicScript.length,
    syncRoomProgress,
  );

  // Entree/sortie de la piece uniquement -- ni `actIndex` ni `goToAct` dans
  // les dependances, sinon `.focus()` se redeclencherait a chaque acte et
  // volerait le focus a un visiteur au clavier qui a deja tabule ailleurs
  // (ex. sur "Revenir au bureau" pendant que la piece continue de defiler).
  useEffect(() => {
    if (!isRoom) {
      // Quitte la piece, par le bouton ou par Echap : la progression partagee
      // ne doit pas trainer une vieille valeur pendant que le rig recule vers
      // la dalle.
      roomProgressRef.current = 0;
      return;
    }

    // Une deuxieme visite retrouve le conteneur deja scrolle -- il n'a
    // jamais demonte, `scrollTop` a survecu au passage par `hidden`. On
    // resynchronise la progression partagee et `actIndex` dessus plutot que
    // de les laisser a zero pendant que le texte affiche encore le dernier
    // acte visite : sinon la camera repartirait de la dalle sous un texte
    // qui, lui, resterait sur l'acte ou le visiteur s'etait arrete.
    sync();
    containerRef.current?.focus();
  }, [isRoom, roomProgressRef, sync]);

  // Navigation clavier : peut se reabonner a chaque acte sans consequence,
  // contrairement au focus ci-dessus -- reattacher un ecouteur `window` est
  // gratuit.
  useEffect(() => {
    if (!isRoom) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        returnToDesktop();
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault();
        goToAct(actIndex + 1);
        return;
      }

      if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        goToAct(actIndex - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [actIndex, goToAct, isRoom, returnToDesktop]);

  return (
    <div
      className="cinematic"
      ref={containerRef}
      tabIndex={-1}
      aria-label="Cinématique"
      hidden={!isRoom}
    >
      <CinematicA11yArticle />

      <div className="cinematic-scroll" ref={scrollRef}>
        <div
          className="cinematic-scroll__spacer"
          style={{ height: `${cinematicScript.length * 100}vh` }}
        />
      </div>

      <div className="cinematic-stage" aria-hidden="true">
        {cinematicScript.map((act, index) => (
          <div
            className="cinematic-act"
            key={act.id}
            data-active={index === actIndex ? 'true' : 'false'}
          >
            {act.lines.map((line, lineIndex) => (
              <p
                className="cinematic-line"
                key={line.text}
                data-enter={line.enter}
                style={{ '--line-delay': `${lineIndex * 60}ms` } as CSSProperties}
              >
                <span>{line.text}</span>
              </p>
            ))}

            {act.kind === 'cta' ? (
              <div className="cinematic-cta">
                <a className="cinematic-cta__link" href="mailto:alexandre.teixeira1303@gmail.com">
                  Me contacter
                </a>
                <button className="cinematic-cta__back" type="button" onClick={returnToDesktop}>
                  Revenir au bureau
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <button className="cinematic-back" type="button" onClick={returnToDesktop}>
        Revenir au bureau
      </button>
    </div>
  );
}
