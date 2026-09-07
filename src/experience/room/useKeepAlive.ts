import { useEffect, useState } from 'react';
import type { RoomRenderer } from './roomRenderer';

export const KEEP_ALIVE_MS = 10_000;

export function shouldKeepCanvasMounted(input: {
  renderer: RoomRenderer;
  msSinceLeftRoom: number;
}): boolean {
  if (input.renderer !== 'none') {
    return true;
  }

  return input.msSinceLeftRoom < KEEP_ALIVE_MS;
}

/*
 * `Canvas` recompile ses shaders et retelecharge ses textures a chaque montage :
 * demonter puis remonter a chaque aller-retour dans la piece serait couteux.
 * Le montage reste donc actif un peu apres la sortie ("chaud"). Deux
 * decisions distinctes : le montage par defaut (`renderer !== 'none'`, teste
 * en ligne plus bas -- `shouldKeepCanvasMounted` suppose qu'on vient de
 * quitter la piece, ce qu'elle ne peut pas exprimer avant une premiere
 * entree) et la liberation apres le delai de grace, la seule qui compte
 * vraiment ici, qui passe toujours par `shouldKeepCanvasMounted` et jamais
 * par une reecriture de son seuil.
 */
export function useKeepAlive(renderer: RoomRenderer): boolean {
  const [prevRenderer, setPrevRenderer] = useState(renderer);
  // `shouldKeepCanvasMounted` suppose qu'on vient de quitter la piece : ca ne
  // s'applique pas avant une premiere entree, sans quoi la toute premiere
  // image du site (stage "desktop", `renderer` deja a `none`) serait lue
  // comme "on vient de sortir" et monterait le canvas pour rien.
  const [hasEntered, setHasEntered] = useState(renderer !== 'none');
  const [isMounted, setMounted] = useState(renderer !== 'none');

  /*
   * Ajustement pendant le rendu, pas dans un effet : eslint-plugin-react-hooks
   * 7.1.1 (react-hooks/set-state-in-effect) refuse qu'un effet appelle
   * `setState` de facon synchrone des son declenchement -- seule une mise a
   * jour venant d'un abonnement externe (le minuteur plus bas) est admise.
   * Comparer `renderer` a sa valeur precedente en state est le contournement
   * documente par React pour deriver un etat depuis une prop qui vient de
   * changer, sans passer par un effet.
   */
  if (renderer !== prevRenderer) {
    setPrevRenderer(renderer);
    if (renderer !== 'none') {
      setHasEntered(true);
      setMounted(shouldKeepCanvasMounted({ renderer, msSinceLeftRoom: 0 }));
    }
  }

  useEffect(() => {
    if (renderer !== 'none' || !hasEntered) {
      return undefined;
    }

    // `Date.now()` est impur : il doit rester dans l'effet (pas pendant le
    // rendu, que `react-hooks/purity` interdit) et n'est lu qu'une fois par
    // sortie de piece, au moment ou ce minuteur se met en place.
    const leftAt = Date.now();
    const timer = window.setTimeout(() => {
      setMounted(shouldKeepCanvasMounted({ renderer, msSinceLeftRoom: Date.now() - leftAt }));
    }, KEEP_ALIVE_MS);

    return () => window.clearTimeout(timer);
  }, [renderer, hasEntered]);

  return isMounted;
}
