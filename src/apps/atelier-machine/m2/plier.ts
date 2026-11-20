/*
 * Folding text to the terminal's measure (step M2), apart from the bench's screen (contenu.ts): the
 * shell of M5 folds every file it prints with it.
 */

/** Folds running text at its word spaces, as `fold -s` does; a word longer than the measure is cut. */
export function plier(texte: string, colonnes: number): string[] {
  const n = Math.max(1, Math.floor(colonnes));
  const lignes: string[] = [];
  let ligne = '';
  for (let mot of texte.split(' ')) {
    if (ligne && ligne.length + 1 + mot.length > n) {
      lignes.push(ligne);
      ligne = '';
    }
    if (ligne) {
      ligne += ` ${mot}`;
      continue;
    }
    for (; mot.length > n; mot = mot.slice(n)) lignes.push(mot.slice(0, n));
    ligne = mot;
  }
  if (ligne || !lignes.length) lignes.push(ligne);
  return lignes;
}
