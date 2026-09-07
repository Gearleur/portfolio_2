import { useCallback, useEffect, useRef, useState } from 'react';
import { clamp01 } from '../stage/easing';
import { actIndexFromProgress } from './scrollTimeline';

/*
 * `onProgress` est optionnel : `CameraRig` lit sa propre copie du scroll via
 * `roomProgressRef`, une ref du contexte de scene. Plutot qu'une boucle qui
 * tournerait a chaque frame pour recopier une valeur qui ne bouge qu'au
 * scroll (ruling R20), l'appelant passe ici un ecrivain synchrone que le
 * gestionnaire de scroll invoque directement, au meme endroit ou `progressRef`
 * lui-meme change.
 */
export function useScrollTimeline(actCount: number, onProgress?: (progress: number) => void) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const [actIndex, setActIndex] = useState(0);

  // Le dernier callback en date, sans figurer dans les dependances de l'effet
  // ci-dessous : une identite qui change a chaque rendu de l'appelant ne doit
  // pas reattacher l'ecouteur de scroll. L'ecriture passe par son propre
  // effet -- react-hooks/refs interdit de toucher a `.current` pendant le
  // rendu, meme pour ce genre de "derniere valeur connue".
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  // Recalcule la progression depuis le `scrollTop` reel. Le gestionnaire de
  // scroll ci-dessous l'appelle a chaque evenement ; `CinematicOverlay`
  // l'appelle aussi explicitement a l'entree dans la piece, pour
  // resynchroniser `actIndex` et la progression partagee sur une deuxieme
  // visite -- le conteneur ne demonte jamais, donc `scrollTop` (et l'etat
  // React qui en derive) survit tel quel a un passage par `hidden`.
  const sync = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const max = element.scrollHeight - element.clientHeight;
    const progress = max <= 0 ? 0 : clamp01(element.scrollTop / max);
    progressRef.current = progress;
    onProgressRef.current?.(progress);
    setActIndex(actIndexFromProgress(progress, actCount));
  }, [actCount]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    sync();
    element.addEventListener('scroll', sync, { passive: true });
    return () => {
      element.removeEventListener('scroll', sync);
      // La piece n'est plus survolee : la progression partagee retombe a
      // zero plutot que de garder la derniere valeur lue.
      onProgressRef.current?.(0);
    };
  }, [sync]);

  const goToAct = useCallback(
    (index: number) => {
      const element = scrollRef.current;
      if (!element || actCount <= 0) {
        return;
      }

      const target = Math.min(Math.max(index, 0), actCount - 1);
      const max = element.scrollHeight - element.clientHeight;
      element.scrollTo({ top: (max * target) / Math.max(actCount - 1, 1), behavior: 'smooth' });
    },
    [actCount],
  );

  return { scrollRef, progressRef, actIndex, goToAct, sync };
}
