import { profile } from '../../../shared/data/profile';
import { PROJETS } from '../../atelier/projets';
import { projetEnMarkdown } from './markdown';

/*
 * The files the terminal has at hand (Atelier 2, step M5), built from the Vitrine's own data:
 * the project pages (projets.ts), the home page's words (Maquettes.tsx), the profile and the
 * two résumés of public/documents. At the root a README and one folder per language; in a
 * language, who I am, how to reach me, the résumé and one file per project.
 */

export type Langue = 'fr' | 'en';
export type Fichier = { type: 'md'; nom: string; contenu: string } | { type: 'pdf'; nom: string; href: string; octets: number };
export type Dossier = { type: 'dossier'; nom: string; enfants: Noeud[] };
export type Noeud = Fichier | Dossier;

type Bilingue = Record<Langue, string>;
type Mot = string | Bilingue | { lien: string; href: string; arobase?: boolean };

/**
 * The home page's words in both languages, copied from Maquettes.tsx, which keeps them inside
 * its components: contenu.test.ts checks that each one is still written there.
 */
export const ACCUEIL = {
  phrase: { fr: 'AI engineer, du prototype à la ', en: 'AI engineer, from prototype to ' } as Bilingue,
  chute: 'production',
  faits: [
    { terme: { fr: 'Actuellement', en: 'Currently' }, lignes: [[{ fr: 'Étudiant', en: 'Student' }]] },
    {
      terme: { fr: 'Précédemment', en: 'Previously' },
      lignes: [
        [
          { fr: 'Ingénieur IA ', en: 'AI engineer ' },
          { lien: 'SNCF', href: 'https://www.groupe-sncf.com', arobase: true },
          { fr: ', ingénieur IA', en: ', AI engineer' },
          ' ',
          { lien: 'Renault', href: 'https://www.renaultgroup.com', arobase: true },
          '\u00a0/\u00a0',
          { lien: 'Alpine', href: 'https://www.alpinecars.com' },
        ],
      ],
    },
    {
      terme: { fr: 'Formation', en: 'Education' },
      lignes: [
        [{ lien: 'UTC', href: 'https://www.utc.fr', arobase: true }, ', 2022 – 2026'],
        [{ lien: 'Shanghai University', href: 'https://www.shu.edu.cn', arobase: true }, ', 2024 – 2025'],
      ],
    },
  ] as { terme: Bilingue; lignes: Mot[][] }[],
  projets: [
    { numero: '01', nom: 'Whiteboard AMDEC', org: 'Renault / Alpine', annee: '2025' },
    { numero: '02', nom: 'SNCF GPT', org: 'SNCF', annee: '2023' },
    { numero: '03', nom: 'Synthèse de réunions', nomEn: 'Meeting summaries', org: 'SNCF', annee: '2025' },
    { numero: '04', nom: 'Dessiner avec l’IA', nomEn: 'Designing with AI', org: 'Méthode', annee: '2026' },
  ] as { numero: string; nom: string; nomEn?: string; org: string; annee: string }[],
  nav: { projets: { fr: 'Projets', en: 'Projects' }, apropos: { fr: 'À propos', en: 'About' }, courriel: { fr: 'E-mail', en: 'Email' } } as Record<string, Bilingue>,
};

/** The résumés' weights, in bytes: contenu.test.ts checks them against public/documents. */
export const OCTETS: Record<Langue, number> = { fr: 241910, en: 217633 };

/** What an English file says, in one line, when its text only exists in French. */
export const NON_TRADUIT = '> Not translated yet: this text only exists in French in the portfolio’s data. The French original follows.';

/** A name for a file: lower case, no accent, hyphens. */
export const nomDeFichier = (texte: string) =>
  texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const NOMS: Record<Langue, { apropos: string; projets: string }> = { fr: { apropos: 'a-propos.md', projets: 'projets' }, en: { apropos: 'about.md', projets: 'projects' } };

const fichierProjet = ({ numero, nom }: { numero: string; nom: string }) => `${numero}-${nomDeFichier(nom)}.md`;

const mot = (m: Mot, langue: Langue) => (typeof m === 'string' ? m : 'lien' in m ? `[${m.arobase ? '@' : ''}${m.lien}](${m.href})` : m[langue]);

function aPropos(langue: Langue) {
  const deuxPoints = langue === 'fr' ? '\u00a0:' : ':';
  return `${[
    `# ${profile.name}`,
    `${ACCUEIL.phrase[langue]}${ACCUEIL.chute}.`,
    ...ACCUEIL.faits.flatMap(({ terme, lignes }) => {
      const ecrites = lignes.map((ligne) => ligne.map((m) => mot(m, langue)).join(''));
      return [`## ${terme[langue]}`, ecrites.length > 1 ? ecrites.map((ligne) => `- ${ligne}`).join('\n') : ecrites[0]];
    }),
    `## ${ACCUEIL.nav.projets[langue]}`,
    ACCUEIL.projets.map((p) => `- ${p.numero} · [${(langue === 'en' && p.nomEn) || p.nom}](${NOMS[langue].projets}/${fichierProjet(p)}) · ${p.org}, ${p.annee}`).join('\n'),
    `## Contact`,
    `- ${ACCUEIL.nav.courriel[langue]}${deuxPoints} [${profile.email}](mailto:${profile.email})\n- [contact.md](contact.md) · [cv.pdf](cv.pdf)`,
  ].join('\n\n')}\n`;
}

function contact(langue: Langue) {
  const deuxPoints = langue === 'fr' ? '\u00a0:' : ':';
  return `${[
    '# Contact',
    [
      `- ${ACCUEIL.nav.courriel[langue]}${deuxPoints} [${profile.email}](mailto:${profile.email})`,
      `- LinkedIn${deuxPoints} [${profile.linkedinHandle}](${profile.linkedinUrl})`,
      `- GitHub${deuxPoints} [${profile.githubHandle}](${profile.githubUrl})`,
      `- CV${deuxPoints} [cv.pdf](cv.pdf)`,
    ].join('\n'),
  ].join('\n\n')}\n`;
}

function langue(l: Langue): Dossier {
  const projets = ACCUEIL.projets.flatMap((carte): Fichier[] => {
    const projet = PROJETS[carte.numero];
    if (!projet) return [];
    const francais = projetEnMarkdown(projet);
    return [{ type: 'md', nom: fichierProjet(carte), contenu: l === 'fr' ? francais : `${NON_TRADUIT}\n\n${francais}` }];
  });
  return {
    type: 'dossier',
    nom: l,
    enfants: trier([
      { type: 'md', nom: NOMS[l].apropos, contenu: aPropos(l) },
      { type: 'md', nom: 'contact.md', contenu: contact(l) },
      { type: 'pdf', nom: 'cv.pdf', href: `/documents/cv-${l}.pdf`, octets: OCTETS[l] },
      { type: 'dossier', nom: NOMS[l].projets, enfants: trier(projets) },
    ]),
  };
}

/** The path of a project's file in a language's folder, from the project's number on the Vitrine (`02`), if it has one. */
export function cheminProjet(numero: string, l: Langue): string[] | null {
  const carte = ACCUEIL.projets.find((projet) => projet.numero === numero);
  return carte && PROJETS[numero] ? [l, NOMS[l].projets, fichierProjet(carte)] : null;
}

/** As `ls` sorts in the C locale: capitals first, then the alphabet. */
function trier<N extends Noeud>(noeuds: N[]) {
  return [...noeuds].sort((a, b) => (a.nom < b.nom ? -1 : a.nom > b.nom ? 1 : 0));
}

/** The folders drawn as `tree` draws them. */
export function arbre(dossier: Dossier, retrait = ''): string[] {
  return dossier.enfants.flatMap((enfant, i) => {
    const dernier = i === dossier.enfants.length - 1;
    const ligne = `${retrait}${dernier ? '└── ' : '├── '}${enfant.nom}${enfant.type === 'dossier' ? '/' : ''}`;
    return enfant.type === 'dossier' ? [ligne, ...arbre(enfant, `${retrait}${dernier ? '    ' : '│   '}`)] : [ligne];
  });
}

function racine(): Dossier {
  const langues = [langue('en'), langue('fr')];
  const sansReadme: Dossier = { type: 'dossier', nom: '', enfants: trier<Noeud>([{ type: 'md', nom: 'README.md', contenu: '' }, ...langues]) };
  const readme = `${[
    `# ${profile.name}`,
    'Ce dossier est mon portfolio tel qu’une machine le lit\u00a0: des dossiers, du Markdown brut, les images réduites à leur légende.\nThis folder is my portfolio as a machine reads it: folders, raw Markdown, pictures reduced to their captions.',
    '- [fr/](fr/)\u00a0: la version française\n- [en/](en/): the English version',
    ['```', '.', ...arbre(sansReadme), '```'].join('\n'),
  ].join('\n\n')}\n`;
  return { ...sansReadme, enfants: sansReadme.enfants.map((enfant) => (enfant.nom === 'README.md' ? { type: 'md', nom: 'README.md', contenu: readme } : enfant)) };
}

export const RACINE: Dossier = racine();

/** The node at a path from the root, if there is one. */
export function trouver(chemin: string[]): Noeud | undefined {
  let noeud: Noeud | undefined = RACINE;
  for (const nom of chemin) noeud = noeud?.type === 'dossier' ? noeud.enfants.find((enfant) => enfant.nom === nom) : undefined;
  return noeud;
}

/** A path as typed (`projets`, `../en`, `~/fr`, `/`), from the folder one is in. It may lead nowhere. */
export function resoudre(cwd: string[], saisi: string): string[] {
  const absolu = /^[~/]/.test(saisi);
  const chemin = absolu ? [] : [...cwd];
  for (const nom of saisi.replace(/^~/, '').split('/')) {
    if (nom === '' || nom === '.') continue;
    if (nom === '..') chemin.pop();
    else chemin.push(nom);
  }
  return chemin;
}

/** A path as the terminal writes it: the root is `~`. */
export const ecrire = (chemin: string[]) => (chemin.length ? `~/${chemin.join('/')}` : '~');

const commence = (chemin: string[], debut: string[]) => debut.every((nom, i) => chemin[i] === nom);

/** The shortest way to write a path from where one is: a child by its name, the parent as `..`, else from the root. */
export function relatif(cwd: string[], cible: string[]): string {
  if (cible.length > cwd.length && commence(cible, cwd)) return cible.slice(cwd.length).join('/');
  if (cwd.length && cible.length === cwd.length - 1 && commence(cwd, cible)) return '..';
  return ecrire(cible);
}

/** The language a path is in; the root is in none. */
export const langueDe = (chemin: string[]): Langue | null => (chemin[0] === 'fr' || chemin[0] === 'en' ? chemin[0] : null);

/** A file's weight in bytes; a folder has none. */
export function octets(noeud: Noeud): number | null {
  if (noeud.type === 'dossier') return null;
  return noeud.type === 'pdf' ? noeud.octets : new TextEncoder().encode(noeud.contenu).length;
}

/** A Markdown file's title: its first heading. */
export const titreDe = (contenu: string) => /^# (.+)$/m.exec(contenu)?.[1] ?? '';
