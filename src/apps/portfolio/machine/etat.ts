import type { Langue } from '../../atelier/langue';

/*
 * The Machine mode's state on the Vitrine, apart from the screen: whether the switch is thrown,
 * and the page it was thrown on. The mode is not in the address: it holds for the address it was
 * thrown at, so the browser's back button or a link, which change the address under the
 * terminal, give the human page back. And the terminal opens where the page was: in its
 * language, on its project.
 */

/** The page the visitor is on: its address (#…), its language, the project it reads if any. */
export type Page = { adresse: string; langue: Langue; numero?: string };

/** The switch, and the page it was last thrown towards the Machine on. */
export type Etat = Page & { machine: boolean };

/** The Machine side shows: the switch is thrown, and the address has not changed since. */
export const versMachine = (etat: Etat, adresse: string) => etat.machine && etat.adresse === adresse;

/**
 * The switch is thrown. Towards the Machine, the page it is thrown on is kept: the terminal
 * opens there. Back, the terminal keeps its place: thrown again from the same page, it is where
 * it was left.
 */
export function lancer(etat: Etat, vers: boolean, page: Page): Etat {
  if (vers) return { ...page, machine: true };
  return etat.machine ? { ...etat, machine: false } : etat;
}
