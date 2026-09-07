import type { Frameloop } from '@react-three/fiber';

/*
 * Deux signaux independants doivent museler la boucle de rendu : l'onglet en
 * arriere-plan (`document.hidden`) et le canvas garde chaud mais invisible
 * pendant le delai de grace de `useKeepAlive` (`data-idle`). Aucun des deux ne
 * doit pouvoir reveiller la boucle tant que l'autre l'exige encore -- une
 * regle pure et testee les compose en OU, plutot que deux ecritures de
 * `setFrameloop` assemblees a la main dans un effet et susceptibles de se
 * marcher dessus (un onglet qui redevient visible ne doit pas relancer le
 * rendu d'un canvas toujours idle, et inversement).
 */
export function resolveFrameloop(input: { isIdle: boolean; isDocumentHidden: boolean }): Frameloop {
  return input.isIdle || input.isDocumentHidden ? 'never' : 'always';
}
