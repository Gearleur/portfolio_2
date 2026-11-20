import type { Borne } from '../m1/reglages';
import { RETENU } from './retenu';

export { RETENU };

/*
 * How much the terminal helps (Atelier 2, step M5): what the bench tunes. The terminal always
 * works as a terminal, and every name it lists can be clicked; the question is how much it
 * shows of the way to move about, between a bare shell and a menu. Three propositions to start
 * from, then every aid is a switch of its own.
 */

export type Reglages = {
  /** A name of the listing is chosen, moved with ↑ ↓, opened with ↵; ← goes back. Without it the arrows recall the history. */
  selection: 'aucune' | 'inverse' | 'chevron';
  /** The command ↵ would run, written in grey after the prompt. */
  suggestion: boolean;
  /** The keys that work, recalled on the last line; each can be clicked. */
  touches: boolean;
  /** The way back in view: `../` among the names, an arrow on the first line, or the whole path, each folder a link. */
  retour: 'aucun' | 'entree' | 'fleche' | 'fil';
  /** The folder is listed again under a file just read. */
  relister: boolean;
  invite: 'signe' | 'chemin';
  /** `ls`, the names in a row; or `ls -l`, one per line with its weight and what it is. */
  liste: 'ligne' | 'longue';
  /** Characters per second of a command that types itself; 0, all at once. */
  vitesse: number;
  /** The answer comes line by line, or all at once. */
  sortie: 'ligne' | 'coup';
  /** Each command goes on under the last, as in any terminal, or starts at the top of a clean screen (the rest stays above). */
  ecran: 'suite' | 'neuf';
  /** Where the Markdown folds, in columns (never more than the screen has). */
  pliage: number;
  /** `cat -n`: the file's lines are numbered. */
  numeros: boolean;
  /** The Markdown as written, or arranged a little: underlined headings, bullets, bold leads, no pictures. */
  markdown: 'brut' | 'agence';
};

export const BORNES = {
  vitesse: { min: 0, max: 120, step: 10 },
  pliage: { min: 60, max: 140, step: 4 },
} satisfies Partial<Record<keyof Reglages, Borne>>;

/** The values each switch may take. */
export const OPTIONS = {
  selection: ['aucune', 'inverse', 'chevron'],
  suggestion: [false, true],
  touches: [false, true],
  retour: ['aucun', 'entree', 'fleche', 'fil'],
  relister: [false, true],
  invite: ['signe', 'chemin'],
  liste: ['ligne', 'longue'],
  sortie: ['ligne', 'coup'],
  ecran: ['suite', 'neuf'],
  numeros: [false, true],
  markdown: ['brut', 'agence'],
} as const satisfies { [K in Exclude<keyof Reglages, keyof typeof BORNES>]: readonly Reglages[K][] };

export type Proposition = { id: string; nom: string; pari: string; reglages: Reglages };

/** The three bets, from the bare shell to the menu. */
export const PROPOSITIONS: Proposition[] = [
  {
    id: 'nu',
    nom: 'Nu',
    pari: 'Un vrai terminal, rien autour. Les noms sont les seuls liens : en cliquer un écrit la commande à ta place, « ../ » remonte, le dossier se liste de nouveau sous chaque fichier lu, et tout s’écrit à la suite. Les flèches rappellent l’historique, comme dans n’importe quel shell.',
    reglages: { selection: 'aucune', suggestion: false, touches: false, retour: 'entree', relister: true, invite: 'chemin', liste: 'ligne', vitesse: 40, sortie: 'ligne', ecran: 'suite', pliage: 100, numeros: false, markdown: 'brut' },
  },
  {
    id: 'touches',
    nom: 'Touches',
    pari: 'Le terminal se pilote comme un menu : un nom surligné que ↑ ↓ déplacent, ↵ pour ouvrir, ← pour revenir, et ces touches rappelées sur la dernière ligne. L’invite montre en gris la commande que ↵ va lancer, et chaque commande repart du haut de l’écran : on ne voit qu’une chose à la fois.',
    reglages: { selection: 'inverse', suggestion: true, touches: true, retour: 'aucun', relister: false, invite: 'signe', liste: 'longue', vitesse: 60, sortie: 'ligne', ecran: 'neuf', pliage: 80, numeros: false, markdown: 'brut' },
  },
  {
    id: 'fil',
    nom: 'Fil d’Ariane',
    pari: 'Le terminal garde une ligne de repère en haut, comme la barre d’adresse d’un explorateur de fichiers : une flèche pour revenir et le chemin, dont chaque dossier se clique. On sait toujours où l’on est ; les fichiers sont numérotés, la commande s’écrit vite et la réponse arrive d’un coup.',
    reglages: { selection: 'chevron', suggestion: false, touches: false, retour: 'fil', relister: false, invite: 'signe', liste: 'longue', vitesse: 120, sortie: 'coup', ecran: 'neuf', pliage: 72, numeros: true, markdown: 'brut' },
  },
];

/** The bench's state: the settings, and the proposition they started from. */
export type Etat = { depart: string; reglages: Reglages };

export const proposition = (id: string) => PROPOSITIONS.find((p) => p.id === id) ?? PROPOSITIONS[0];

export const etatDe = (id: string): Etat => {
  const p = proposition(id);
  return { depart: p.id, reglages: p.reglages };
};

const CLES = Object.keys(PROPOSITIONS[0].reglages) as (keyof Reglages)[];

/** The proposition these settings are, untouched, if they are one. */
export const intacte = (reglages: Reglages) => PROPOSITIONS.find((p) => CLES.every((cle) => p.reglages[cle] === reglages[cle]));

// --- storage

const CLE = 'atelier-machine:m5:v1';

const borner = (valeur: unknown, { min, max, step }: Borne, defaut: number) => {
  if (typeof valeur !== 'number' || !Number.isFinite(valeur)) return defaut;
  return min + Math.round((Math.min(max, Math.max(min, valeur)) - min) / step) * step;
};

/** Reads settings kept or pasted: what is missing or not allowed falls back on the starting proposition. */
export function valider(brut: unknown): Etat | null {
  if (typeof brut !== 'object' || brut === null) return null;
  const { depart, reglages } = brut as { depart?: unknown; reglages?: unknown };
  if (typeof reglages !== 'object' || reglages === null) return null;
  const base = proposition(typeof depart === 'string' ? depart : '');
  const lu = reglages as Record<string, unknown>;
  const permis = OPTIONS as Record<string, readonly unknown[]>;
  const bornes = BORNES as Record<string, Borne>;
  const valeurs = CLES.map((cle) => [cle, cle in bornes ? borner(lu[cle], bornes[cle], base.reglages[cle] as number) : permis[cle].includes(lu[cle]) ? lu[cle] : base.reglages[cle]]);
  return { depart: base.id, reglages: Object.fromEntries(valeurs) as Reglages };
}

export function lire(): Etat {
  try {
    const garde = valider(JSON.parse(localStorage.getItem(CLE) ?? 'null'));
    if (garde) return garde;
  } catch {
    // Storage can be unavailable or hold an older shape; start from what was retained.
  }
  return { depart: 'touches', reglages: RETENU };
}

export function garder(etat: Etat) {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    // Keeping the settings across reloads is a convenience only.
  }
}

// --- the summary to paste

export const NOMS = {
  selection: { aucune: 'aucune', inverse: 'vidéo inverse', chevron: 'chevron' },
  retour: { aucun: 'aucun', entree: '« ../ » dans les listes', fleche: 'flèche en haut', fil: 'fil d’Ariane en haut' },
  invite: { signe: '$', chemin: 'chemin $' },
  liste: { ligne: 'ls, en ligne', longue: 'ls -l, un par ligne' },
  sortie: { ligne: 'ligne à ligne', coup: 'd’un coup' },
  ecran: { suite: 'à la suite de la précédente', neuf: 'en haut d’un écran neuf' },
  markdown: { brut: 'brut', agence: 'agencé, sans les images' },
} satisfies { [K in 'selection' | 'retour' | 'invite' | 'liste' | 'sortie' | 'ecran' | 'markdown']: Record<Reglages[K], string> };

const oui = (v: boolean) => (v ? 'oui' : 'non');

export const nomVitesse = (v: number) => (v ? `${v} car./s` : 'd’un coup');

/** What « Copier mes réglages » puts in the clipboard: a few lines to read, then the same as JSON. */
export function resume({ depart, reglages }: Etat) {
  const r = reglages;
  const telle = intacte(r);
  return [
    `Mode machine · M5, le contenu : ${telle ? `proposition « ${telle.nom} », telle quelle` : `partie de « ${proposition(depart).nom} », réglée à la main`}`,
    `Aide : sélection ${NOMS.selection[r.selection]} · commande proposée en gris ${oui(r.suggestion)} · barre de touches ${oui(r.touches)} · retour ${NOMS.retour[r.retour]} · dossier re-listé après lecture ${oui(r.relister)}`,
    `Écriture : la commande s’écrit à ${nomVitesse(r.vitesse)} · la réponse arrive ${NOMS.sortie[r.sortie]} · chaque commande part ${NOMS.ecran[r.ecran]}`,
    `Texte : invite « ${NOMS.invite[r.invite]} » · listes en ${NOMS.liste[r.liste]} · Markdown ${NOMS.markdown[r.markdown]}, plié à ${r.pliage} colonnes · numéros de ligne ${oui(r.numeros)}`,
    JSON.stringify({ depart, reglages }),
  ].join('\n');
}
