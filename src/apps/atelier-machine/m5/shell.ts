import { plier } from '../m2/plier';
import type { Sorte } from '../m2/contenu';
import { ecrire, langueDe, octets, relatif, resoudre, titreDe, trouver } from './fichiers';
import type { Dossier, Langue, Noeud } from './fichiers';

/*
 * The terminal's shell (Atelier 2, step M5), without a screen: what a command prints, where it
 * leaves the visitor, and the screen's state from one command to the next. A handful of real
 * commands (`ls`, `cd`, `cat`, `open`, `pwd`, `help`, `clear`, chained with `&&`), read-only.
 * Entering the folder of a language restarts the session in that language.
 */

export type Session = { cwd: string[]; langue: Langue };

/** A run of cells: a name that opens (`cible`, a path from the root) or a link that leaves (`href`). */
export type Morceau = { sorte: Sorte; texte: string; cible?: string[]; rang?: number; href?: string };

/** A line of the screen; `debut` is where a command starts, `liste` the listing its names belong to. */
export type Ligne = { morceaux: Morceau[]; debut?: boolean; liste?: number };

export type Vue = 'liste' | 'fichier' | 'autre';

/** What changes what is printed: the screen's width and the bench's settings for the text. */
export type Options = {
  colonnes: number;
  pliage: number;
  numeros: boolean;
  /** The Markdown is arranged a little: its signs become underlined headings, bullets and bold; the pictures are left out. */
  agence: boolean;
  liste: 'ligne' | 'longue';
  /** `../` in the listings: the way back as a name. */
  parent: boolean;
  /** The folder is listed again under a file just read. */
  relister: boolean;
  invite: 'signe' | 'chemin';
};

const MESSAGES = {
  fr: {
    accueil: 'Le portfolio d’Alexandre Teixeira, tel qu’une machine le lit. Un nom se clique\u00a0; help liste les commandes.',
    redemarrage: 'Session redémarrée en français (LANG=fr_FR.UTF-8).',
    introuvable: (nom: string) => `${nom}\u00a0: aucun fichier ou dossier de ce nom`,
    dossier: (nom: string) => `${nom}\u00a0: c’est un dossier`,
    pasDossier: (nom: string) => `${nom}\u00a0: ce n’est pas un dossier`,
    binaire: (nom: string) => `${nom}\u00a0: un PDF ne s’affiche pas ici. Pour l’ouvrir\u00a0: open ${nom}`,
    manque: 'il manque un nom de fichier',
    inconnue: (nom: string) => `commande introuvable\u00a0: ${nom}. Tapez help.`,
    ouverture: (nom: string) => `${nom} s’ouvre dans un nouvel onglet\u00a0: `,
    fichiers: (n: number) => `${n} fichier${n > 1 ? 's' : ''}`,
    pdf: 'PDF, s’ouvre dans un nouvel onglet',
    aide: [
      'ls [-l] [dossier]   lister un dossier',
      'cd <dossier>        entrer dans un dossier\u00a0; cd .. remonte, cd fr ou cd en change de langue',
      'cat [-n] <fichier>  lire un fichier .md, tel quel',
      'open <fichier>      ouvrir un PDF dans un nouvel onglet',
      'pwd  clear  help    où suis-je, effacer l’écran, cette aide',
      '',
      'Clavier\u00a0: Tab complète un nom, Ctrl+P et Ctrl+N rappellent l’historique, Échap efface la ligne.',
      'Souris\u00a0: chaque nom de fichier ou de dossier se clique, la commande s’écrit toute seule.',
    ],
  },
  en: {
    accueil: 'Alexandre Teixeira’s portfolio, as a machine reads it. Click a name; help lists the commands.',
    redemarrage: 'Session restarted in English (LANG=en_US.UTF-8).',
    introuvable: (nom: string) => `${nom}: no such file or directory`,
    dossier: (nom: string) => `${nom}: is a directory`,
    pasDossier: (nom: string) => `${nom}: not a directory`,
    binaire: (nom: string) => `${nom}: a PDF cannot be shown here. To open it: open ${nom}`,
    manque: 'missing file name',
    inconnue: (nom: string) => `command not found: ${nom}. Type help.`,
    ouverture: (nom: string) => `${nom} opens in a new tab: `,
    fichiers: (n: number) => `${n} file${n > 1 ? 's' : ''}`,
    pdf: 'PDF, opens in a new tab',
    aide: [
      'ls [-l] [folder]    list a folder',
      'cd <folder>         enter a folder; cd .. goes up, cd fr or cd en changes the language',
      'cat [-n] <file>     read a .md file, as it is',
      'open <file>         open a PDF in a new tab',
      'pwd  clear  help    where am I, clear the screen, this help',
      '',
      'Keyboard: Tab completes a name, Ctrl+P and Ctrl+N recall the history, Esc clears the line.',
      'Mouse: every file or folder name can be clicked, the command types itself.',
    ],
  },
};

const COMMANDES = ['cat', 'cd', 'clear', 'help', 'ls', 'open', 'pwd'];

const texte = (sorte: Sorte, mots: string): Ligne => ({ morceaux: [{ sorte, texte: mots }] });
const VIDE: Ligne = { morceaux: [] };

export const invite = (session: Session, maniere: Options['invite']) => (maniere === 'chemin' ? `${ecrire(session.cwd)} $ ` : '$ ');

const echo = (session: Session, commande: string, options: Options): Ligne => ({
  morceaux: [
    { sorte: 'invite', texte: invite(session, options.invite) },
    { sorte: 'commande', texte: commande },
  ],
  debut: true,
});

/** A weight as `ls -h` writes it, with the language's decimal sign. */
export function poids(n: number | null, langue: Langue) {
  if (n === null) return '-';
  if (n < 1000) return String(n);
  const k = n / 1024;
  return `${k < 9.95 ? k.toFixed(1).replace('.', langue === 'fr' ? ',' : '.') : Math.round(k)}K`;
}

function legende(noeud: Noeud, langue: Langue) {
  const m = MESSAGES[langue];
  if (noeud.type === 'dossier') return m.fichiers(noeud.enfants.length);
  return noeud.type === 'pdf' ? m.pdf : titreDe(noeud.contenu);
}

/** A folder's listing: its names in a row, or one per line with its weight and what it is. */
function lister(dossier: Dossier, chemin: string[], { long, parent }: { long: boolean; parent: boolean }, session: Session, colonnes: number, liste: number) {
  const entrees = [
    ...(parent && chemin.length ? [{ nom: '../', cible: chemin.slice(0, -1), noeud: undefined as Noeud | undefined }] : []),
    ...dossier.enfants.map((noeud) => ({ nom: noeud.type === 'dossier' ? `${noeud.nom}/` : noeud.nom, cible: [...chemin, noeud.nom], noeud })),
  ];
  const nom = (entree: (typeof entrees)[number], rang: number): Morceau => ({ sorte: entree.nom.endsWith('/') ? 'dossier' : 'sortie', texte: entree.nom, cible: entree.cible, rang });
  const lignes: Ligne[] = [];
  if (long) {
    const large = Math.max(...entrees.map((entree) => entree.nom.length));
    entrees.forEach((entree, rang) => {
      const avant = `${poids(entree.noeud ? octets(entree.noeud) : null, session.langue).padStart(5)}  `;
      const place = Math.max(0, colonnes - avant.length - large - 2);
      const dit = entree.noeud ? legende(entree.noeud, session.langue) : '';
      lignes.push({
        liste,
        morceaux: [
          { sorte: 'meta', texte: avant },
          nom(entree, rang),
          ...(dit ? [{ sorte: 'meta' as const, texte: `${' '.repeat(large - entree.nom.length + 2)}${dit.length > place ? `${dit.slice(0, Math.max(0, place - 1))}…` : dit}` }] : []),
        ],
      });
    });
  } else {
    let ligne: Morceau[] = [];
    let pris = 0;
    entrees.forEach((entree, rang) => {
      if (ligne.length && pris + 2 + entree.nom.length > colonnes) {
        lignes.push({ liste, morceaux: ligne });
        [ligne, pris] = [[], 0];
      }
      if (ligne.length) ligne.push({ sorte: 'sortie', texte: '  ' });
      ligne.push(nom(entree, rang));
      pris += (pris ? 2 : 0) + entree.nom.length;
    });
    if (ligne.length) lignes.push({ liste, morceaux: ligne });
  }
  return { lignes, entrees: entrees.map((entree) => entree.cible) };
}

/** A line of Markdown in pieces: a heading stands out, and what a link points at can be followed. */
function morceaux(ligne: string, titre: boolean, dossier: string[]): Morceau[] {
  if (titre) return [{ sorte: 'titre', texte: ligne }];
  const pieces: Morceau[] = [];
  let lu = 0;
  for (const lien of ligne.matchAll(/\]\(([^)\s]+)\)/g)) {
    const [debut, adresse] = [lien.index + 1, lien[1]];
    if (debut > lu) pieces.push({ sorte: 'sortie', texte: ligne.slice(lu, debut) });
    const piece: Morceau = { sorte: 'meta', texte: `(${adresse})` };
    if (/^(https?:|mailto:)/.test(adresse)) piece.href = adresse;
    else if (!adresse.includes(':') && trouver(resoudre(dossier, adresse))) piece.cible = resoudre(dossier, adresse);
    pieces.push(piece);
    lu = debut + adresse.length + 2;
  }
  if (lu < ligne.length) pieces.push({ sorte: 'sortie', texte: ligne.slice(lu) });
  return pieces;
}

/**
 * A Markdown file as the terminal prints it: raw, folded at word spaces. The lines of a list or a
 * quote hang under their text, a fenced block is left as it is, and `-n` numbers the file's own lines.
 * Arranged (`agence`), its signs give way to what they mean: a heading is underlined, a list has
 * bullets, a lead is bold, and the pictures, which a terminal cannot show, are left out.
 */
export function lignesDe(contenu: string, largeur: number, dossier: string[], numeros: boolean, agence = false): Ligne[] {
  let source = contenu.replace(/\n$/, '').split('\n');
  if (agence) {
    source = source.filter((ligne) => !/^\s*\[image[\]:]/.test(ligne)).filter((ligne, i, toutes) => ligne !== '' || toutes[i - 1] !== '');
    while (source.at(-1) === '') source.pop();
  }
  const gouttiere = numeros ? String(source.length).length + 2 : 0;
  const marge = (i: number, k: number): Morceau[] => (numeros ? [{ sorte: 'meta', texte: `${k ? '' : String(i + 1)}`.padStart(gouttiere - 2).padEnd(gouttiere) }] : []);
  let bloc = false;
  return source.flatMap((brute, i) => {
    const cloture = brute.startsWith('```');
    const telle = bloc || cloture;
    if (cloture) bloc = !bloc;
    const titre = !telle && /^#{1,6} /.test(brute);
    if (agence && !telle) {
      const niveau = titre ? brute.indexOf(' ') : 0;
      const signe = /^\s*(?:[-*>] |\d+\. )?/.exec(brute)?.[0] ?? '';
      const retrait = titre ? '' : signe.replace(/[-*] $/, '• ').replace('> ', '│ ');
      let corps = brute.slice(titre ? niveau + 1 : signe.length);
      // the bold lead of a line keeps its weight; the other signs just go
      const tete = /^\*\*(.+?)\*\*/.exec(corps)?.[1] ?? '';
      corps = corps.replace(/\*\*/g, '').replace(/^\*(.+)\*$/, '$1');
      if (niveau === 1) corps = corps.toUpperCase();
      const plis = plier(corps, Math.max(20, largeur - gouttiere - retrait.length));
      let gras = titre ? Infinity : tete.length;
      const lignes = plis.map((pli, k): Ligne => {
        const fort = pli.slice(0, Math.max(0, gras));
        gras -= pli.length + 1;
        const debut = k ? ' '.repeat(retrait.length) : retrait;
        return { morceaux: [...marge(i, k), ...(debut ? [{ sorte: 'meta' as const, texte: debut }] : []), ...(fort ? [{ sorte: 'titre' as const, texte: fort }] : []), ...morceaux(pli.slice(fort.length), false, dossier)] };
      });
      if (niveau === 1 || niveau === 2) lignes.push({ morceaux: [...marge(i, 1), { sorte: 'meta', texte: (niveau === 1 ? '═' : '─').repeat(Math.max(...plis.map((pli) => pli.length))) }] });
      return lignes;
    }
    const retrait = telle ? '' : (/^\s*(?:[-*>] |\d+\. )?/.exec(brute)?.[0] ?? '');
    const plis = telle ? [brute] : plier(brute.slice(retrait.length), Math.max(20, largeur - gouttiere - retrait.length));
    return plis.map((pli, k): Ligne => ({ morceaux: [...marge(i, k), ...morceaux(`${k ? ' '.repeat(retrait.length) : retrait}${pli}`, titre, dossier)] }));
  });
}

/** The command that lists a folder the way the bench asks. */
export const commandeLs = ({ liste, parent }: Pick<Options, 'liste' | 'parent'>) => {
  const drapeaux = `${liste === 'longue' ? 'l' : ''}${parent ? 'a' : ''}`;
  return drapeaux ? `ls -${drapeaux}` : 'ls';
};

/** The command a click on a name writes: enter and list a folder, read a file, open a PDF. */
export function commandeOuvrir(session: Session, cible: string[], options: Pick<Options, 'liste' | 'parent' | 'numeros'>): string | null {
  const noeud = trouver(cible);
  if (!noeud) return null;
  const chemin = relatif(session.cwd, cible);
  // the folder one is already in is only listed again
  if (noeud.type === 'dossier') return meme(cible, session.cwd) ? commandeLs(options) : `cd ${chemin} && ${commandeLs(options)}`;
  return noeud.type === 'pdf' ? `open ${chemin}` : `cat ${options.numeros ? '-n ' : ''}${chemin}`;
}

/** The command that goes back: from a file to its folder's listing, from a listing to the folder above. */
export function commandeRetour(session: Session, vue: Vue, options: Pick<Options, 'liste' | 'parent'>): string | null {
  if (vue !== 'liste') return commandeLs(options);
  return session.cwd.length ? `cd .. && ${commandeLs(options)}` : null;
}

export type Resultat = {
  session: Session;
  lignes: Ligne[];
  /** The screen was cleared before these lines. */
  efface: boolean;
  /** A document to open in another tab. */
  ouvre?: string;
  vue: Vue;
  /** The names of the last listing printed, as paths from the root, and that listing's number. */
  entrees: string[][] | null;
  liste: number;
  /** The file just read. */
  fichier: string[] | null;
};

/** Runs what was typed: one command, or several chained with `&&` (the chain stops at the first that fails). */
export function executer(depart: Session, saisie: string, options: Options): Resultat {
  const r: Resultat = { session: depart, lignes: [echo(depart, saisie, options)], efface: false, vue: 'autre', entrees: null, liste: 0, fichier: null };
  const commandes = saisie.split('&&').map((commande) => commande.trim());
  const largeur = Math.min(options.colonnes, options.pliage);

  for (const [n, commande] of commandes.entries()) {
    const [nom = '', ...mots] = commande.split(/\s+/).filter(Boolean);
    const drapeaux = mots.filter((m) => m.startsWith('-')).join('');
    const [premier] = mots.filter((m) => !m.startsWith('-'));
    const m = MESSAGES[r.session.langue];
    const chemin = resoudre(r.session.cwd, premier ?? '.');
    const noeud = trouver(chemin);
    const dire = (...lignes: string[]) => r.lignes.push(...lignes.map((ligne) => texte('sortie', ligne)));
    let echec = false;
    const refuser = (message: string) => {
      dire(`${nom}: ${message}`);
      echec = true;
    };
    const imprimerListe = (dossier: Dossier, ou: string[], long: boolean, parent: boolean) => {
      const { lignes, entrees } = lister(dossier, ou, { long, parent }, r.session, options.colonnes, ++r.liste);
      r.lignes.push(...lignes);
      r.entrees = entrees;
    };

    if (nom === '') continue;
    else if (nom === 'pwd') dire(ecrire(r.session.cwd));
    else if (nom === 'help') dire(...m.aide);
    else if (nom === 'clear') [r.lignes, r.efface, r.entrees] = [[], true, null];
    else if (nom === 'ls') {
      if (!noeud) refuser(m.introuvable(premier));
      else if (noeud.type !== 'dossier') dire(premier);
      else {
        imprimerListe(noeud, chemin, drapeaux.includes('l'), drapeaux.includes('a'));
        [r.vue, r.fichier] = ['liste', null];
      }
    } else if (nom === 'cd') {
      const ou = premier ? chemin : [];
      const cible = trouver(ou);
      if (!cible) refuser(m.introuvable(premier));
      else if (cible.type !== 'dossier') refuser(m.pasDossier(premier));
      else {
        const langue = langueDe(ou) ?? r.session.langue;
        const redemarre = langue !== r.session.langue;
        r.session = { cwd: ou, langue };
        [r.vue, r.fichier] = ['autre', null];
        if (redemarre) {
          // the terminal starts again in the folder's language; what is left of the chain is typed again
          const suite = commandes.slice(n + 1).join(' && ');
          r.lignes = [{ ...texte('meta', MESSAGES[langue].redemarrage), debut: true }, VIDE, ...(suite ? [{ ...echo(r.session, suite, options), debut: false }] : [])];
          [r.efface, r.entrees] = [true, null];
        }
      }
    } else if (nom === 'cat' || nom === 'open') {
      if (!premier) refuser(m.manque);
      else if (!noeud) refuser(m.introuvable(premier));
      else if (noeud.type === 'dossier') refuser(m.dossier(premier));
      else if (noeud.type === 'pdf' && nom === 'cat') refuser(m.binaire(premier));
      else if (noeud.type === 'pdf') {
        r.ouvre = noeud.href;
        r.lignes.push({ morceaux: [{ sorte: 'sortie', texte: m.ouverture(noeud.nom) }, { sorte: 'meta', texte: noeud.href, href: noeud.href }] });
      } else {
        const dossier = chemin.slice(0, -1);
        r.lignes.push(...lignesDe(noeud.contenu, largeur, dossier, drapeaux.includes('n'), options.agence));
        [r.vue, r.fichier, r.entrees] = ['fichier', chemin, null];
        const ici = trouver(r.session.cwd);
        if (options.relister && ici?.type === 'dossier') {
          r.lignes.push(VIDE, { ...echo(r.session, commandeLs(options), options), debut: false });
          imprimerListe(ici, r.session.cwd, options.liste === 'longue', options.parent);
        }
      }
    } else refuser(m.inconnue(nom));

    if (echec) break;
  }
  // an empty line after each command's answer (M2), none after an empty command
  if (saisie.trim() && (!r.efface || r.lignes.length)) r.lignes.push(VIDE);
  return r;
}

/** Tab: completes a command's name, or the name of a file or folder, as far as there is only one way. */
export function completer(session: Session, saisie: string): string {
  const coupe = Math.max(saisie.lastIndexOf(' '), saisie.lastIndexOf('&')) + 1;
  const [avant, mot] = [saisie.slice(0, coupe), saisie.slice(coupe)];
  const commun = (noms: string[]) => noms.reduce((a, b) => a.slice(0, [...a].findIndex((lettre, i) => lettre !== b[i]) >>> 0));
  if (!avant.trim() || /&&\s*$/.test(avant)) {
    const noms = COMMANDES.filter((commande) => commande.startsWith(mot));
    return noms.length ? `${avant}${noms.length === 1 ? `${noms[0]} ` : commun(noms)}` : saisie;
  }
  const barre = mot.lastIndexOf('/') + 1;
  const [base, debut] = [mot.slice(0, barre), mot.slice(barre)];
  const dossier = trouver(resoudre(session.cwd, base || '.'));
  if (dossier?.type !== 'dossier') return saisie;
  const noms = dossier.enfants.filter((enfant) => enfant.nom.startsWith(debut)).map((enfant) => (enfant.type === 'dossier' ? `${enfant.nom}/` : enfant.nom));
  return noms.length ? `${avant}${base}${noms.length === 1 ? noms[0] : commun(noms)}` : saisie;
}

// --- the screen, from one command to the next

export type LigneEcran = Ligne & { id: number };

export type Ecran = {
  session: Session;
  lignes: LigneEcran[];
  /** The last listing printed, while nothing else was asked since: the arrows choose among its names when it is the view. */
  listing: { id: number; entrees: string[][] } | null;
  vue: Vue;
  fichier: string[] | null;
  /** The chosen name's place in the listing. */
  choix: number;
  historique: string[];
  /** How many of the last lines are not shown yet, and how many appear at a time. */
  cache: number;
  pas: number;
  ouvre: { url: string } | null;
  /** Commands run so far. */
  tour: number;
  /** Where this terminal was asked to open, when not at the root in French. */
  depart?: Depart;
};

/** Where a terminal opens: its language, and a Markdown file to read at once (a path from the root). The Vitrine opens it in the page's language, on the project being read. */
export type Depart = { langue: Langue; fichier?: string[] };

export type Action =
  | { type: 'executer'; commande: string; options: Options; progressif: boolean }
  | { type: 'rejouer'; options: Options }
  | { type: 'reveler' }
  | { type: 'choisir'; pas: number };

/** No more lines than this are kept above the prompt. */
const MEMOIRE = 1500;

const meme = (a: string[], b: string[]) => a.length === b.length && a.every((nom, i) => nom === b[i]);

function appliquer(ecran: Ecran, commande: string, options: Options, progressif: boolean, noter: boolean): Ecran {
  const r = executer(ecran.session, commande, options);
  const tour = ecran.tour + 1;
  const nouvelles = r.lignes.map((ligne, i): LigneEcran => ({ ...ligne, id: tour * 10000 + i, liste: ligne.liste === undefined ? undefined : tour * 100 + ligne.liste }));
  // The name one comes from is the one chosen: the file just read, or the folder just left.
  const dedans = (entree: string[]) => entree.length > r.session.cwd.length;
  const retrouve = r.entrees?.findIndex((entree) => dedans(entree) && (meme(entree, ecran.fichier ?? []) || meme(entree, ecran.session.cwd))) ?? -1;
  const premier = r.entrees?.findIndex(dedans) ?? -1;
  const cache = progressif ? Math.max(0, nouvelles.length - 1) : 0;
  return {
    session: r.session,
    lignes: [...(r.efface ? [] : ecran.lignes), ...nouvelles].slice(-MEMOIRE),
    listing: r.entrees ? { id: tour * 100 + r.liste, entrees: r.entrees } : null,
    vue: r.vue,
    fichier: r.fichier,
    // under a file just read, the menu offers the next one
    choix: Math.max(0, r.vue === 'fichier' && r.entrees ? (r.entrees.findIndex((entree) => meme(entree, r.fichier ?? [])) + 1) % r.entrees.length : retrouve >= 0 ? retrouve : premier),
    historique: noter && commande.trim() ? [...ecran.historique, commande.trim()] : ecran.historique,
    cache,
    pas: Math.max(1, Math.ceil(cache / 24)),
    ouvre: r.ouvre ? { url: r.ouvre } : ecran.ouvre,
    tour,
    depart: ecran.depart,
  };
}

const NEUF = { lignes: [], listing: null, vue: 'autre', fichier: null, choix: 0, historique: [], cache: 0, pas: 1, ouvre: null, tour: 0 } satisfies Partial<Ecran>;

/**
 * The terminal as it opens: at the root, in French, one line of welcome and the root's listing.
 * Asked to (`depart`), it opens in another language, or in a file's folder with that file read.
 */
export function demarrer(options: Options, depart?: Depart): Ecran {
  const langue = depart?.langue ?? 'fr';
  const fichier = depart?.fichier && trouver(depart.fichier)?.type === 'md' ? depart.fichier : null;
  const session: Session = { cwd: fichier ? fichier.slice(0, -1) : [], langue };
  const commande = (fichier && commandeOuvrir(session, fichier, options)) ?? commandeLs(options);
  const ecran = appliquer({ ...NEUF, session, depart }, commande, options, false, false);
  // the welcome is where this first screen starts, not the first command
  return { ...ecran, lignes: [{ ...texte('meta', MESSAGES[langue].accueil), id: 0, debut: true }, { ...VIDE, id: 1 }, ...ecran.lignes.map((ligne) => ({ ...ligne, debut: false }))] };
}

export function reduire(ecran: Ecran, action: Action): Ecran {
  switch (action.type) {
    case 'executer':
      return appliquer(ecran, action.commande, action.options, action.progressif, true);
    case 'rejouer': {
      // The settings changed what is printed: the same place, printed again on a clean screen.
      if (!ecran.historique.length) return demarrer(action.options, ecran.depart);
      const commande = ecran.vue === 'fichier' && ecran.fichier ? commandeOuvrir(ecran.session, ecran.fichier, action.options) : commandeLs(action.options);
      return appliquer({ ...ecran, lignes: [], fichier: ecran.vue === 'fichier' ? null : ecran.fichier }, commande ?? commandeLs(action.options), action.options, false, false);
    }
    case 'reveler':
      return { ...ecran, cache: Math.max(0, ecran.cache - ecran.pas) };
    case 'choisir': {
      const n = ecran.listing?.entrees.length ?? 0;
      return n ? { ...ecran, choix: (ecran.choix + action.pas + n) % n } : ecran;
    }
  }
}
