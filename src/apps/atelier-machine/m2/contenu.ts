import { INVITES } from './reglages';
import type { Habillage } from './reglages';

/*
 * What the bench's screen shows (step M2): a plain `ls`, the projects in long form, and the top
 * of a file read with `cat`: a title, a paragraph, and a picture written as in Markdown. The
 * words are the Vitrine's own; which folders and files there are is step M5's.
 */

export type Sorte = 'invite' | 'commande' | 'sortie' | 'dossier' | 'titre' | 'meta';
export type Morceau = [Sorte, string];
export type Ligne = Morceau[];

const fichier = (taille: string, date: string, nom: string): Morceau[] => [
  ['meta', `-rw-r--r--  ${taille.padStart(3)}  ${date.padStart(13)}  `],
  ['sortie', nom],
];

const RACINE: Morceau[] = [['sortie', 'a-propos.md  cv.pdf  '], ['dossier', 'en/'], ['sortie', '  '], ['dossier', 'fr/'], ['sortie', '  '], ['dossier', 'projets/']];

const PROJETS = [
  fichier('21K', '6 nov. 16:20', '01-whiteboard-amdec.md'),
  fichier('24K', '6 nov. 14:02', '02-sncf-gpt.md'),
  fichier('15K', '9 nov. 17:45', '03-synthese-de-reunions.md'),
  fichier('17K', '19 nov. 10:12', '04-dessiner-avec-l-ia.md'),
];

// No-break spaces inside the guillemets and before the colons: a fold never starts a line with them.
const TITRE = '# Comment je dessine un produit avec l’IA';
const PARAGRAPHE =
  'Je ne demande pas à un modèle «\u00a0fais-moi un beau site\u00a0». Je travaille avec lui comme une équipe artistique\u00a0: il ouvre des pistes, je ferme en choisissant. Le goût, les idées et la décision restent à moi. La production, les variantes et la mémoire des choix, c’est son travail.';
const IMAGE: Morceau[] = [
  ['sortie', '[image: Le haut de la charte de ce portfolio\u00a0: chaque décision validée, avec l’étape où elle a été prise.]'],
  ['meta', '(medias/processus-charte.webp)'],
];

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

/** Lays pieces on lines of `colonnes` cells: at word spaces when `mots`, else cell by cell, as a terminal wraps. */
function poser(morceaux: Morceau[], colonnes: number, mots = false): Ligne[] {
  const n = Math.max(1, Math.floor(colonnes));
  const texte = morceaux.map(([, t]) => t).join('');
  const sortes = morceaux.flatMap(([sorte, t]) => Array.from({ length: t.length }, () => sorte));
  const lignes = mots ? plier(texte, n) : Array.from({ length: Math.ceil(texte.length / n) }, (_, i) => texte.slice(i * n, (i + 1) * n));
  let lu = 0;
  return lignes.map((ligne) => {
    const depart = lu;
    lu += ligne.length;
    // the space a fold was made at is gone
    if (mots && texte[lu] === ' ') lu += 1;
    const posee: Ligne = [];
    for (let k = 0; k < ligne.length; k += 1) {
      const dernier = posee[posee.length - 1];
      if (dernier && dernier[0] === sortes[depart + k]) dernier[1] += ligne[k];
      else posee.push([sortes[depart + k], ligne[k]]);
    }
    return posee;
  });
}

/**
 * The screen's lines, but the last prompt: commands and listings wrap at the screen's edge, the
 * file's text is folded at the measure.
 */
export function composer({ invite, aeree }: { invite: Habillage['invite']; aeree: boolean }, colonnes: number, mesure: number): Ligne[] {
  const commande = (texte: string) => poser([['invite', INVITES[invite]], ['commande', texte]], colonnes);
  const texte = (...morceaux: Morceau[]) => poser(morceaux, Math.min(colonnes, mesure), true);
  const blocs: Ligne[][] = [
    [...commande('ls'), ...poser(RACINE, colonnes)],
    [...commande('ls -l projets/'), ...PROJETS.flatMap((projet) => poser(projet, colonnes))],
    [...commande('cat projets/04-dessiner-avec-l-ia.md'), ...texte(['titre', TITRE]), [], ...texte(['sortie', PARAGRAPHE]), [], ...texte(...IMAGE)],
  ];
  return blocs.flatMap((bloc) => (aeree ? [...bloc, []] : bloc));
}
