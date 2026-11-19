import { describe, expect, it } from 'vitest';
import { BORNES, PROPOSITIONS, RETENU, etatDe, intacte, resume, valider } from './reglages';
import { commandeLs, commandeOuvrir, commandeRetour, completer, demarrer, executer, lignesDe, poids, reduire } from './shell';
import type { Ecran, Ligne, Options, Session } from './shell';

const OPTIONS: Options = { colonnes: 120, pliage: 80, numeros: false, agence: false, liste: 'ligne', parent: false, relister: false, invite: 'signe' };
const RACINE: Session = { cwd: [], langue: 'fr' };
const FR: Session = { cwd: ['fr'], langue: 'fr' };

const ecrit = (lignes: Ligne[]) => lignes.map((ligne) => ligne.morceaux.map((m) => m.texte).join(''));
const taper = (ecran: Ecran, commande: string, options = OPTIONS) => reduire(ecran, { type: 'executer', commande, options, progressif: false });

describe('the commands', () => {
  it('ls lists the names in a row, each one a path to open', () => {
    const r = executer(RACINE, 'ls', OPTIONS);
    expect(ecrit(r.lignes)).toEqual(['$ ls', 'README.md  en/  fr/', '']);
    expect(r.entrees).toEqual([['README.md'], ['en'], ['fr']]);
    expect(r.lignes[1].morceaux.filter((m) => m.cible).map((m) => [m.texte, m.sorte, m.rang])).toEqual([['README.md', 'sortie', 0], ['en/', 'dossier', 1], ['fr/', 'dossier', 2]]);
    expect(r.vue).toBe('liste');
  });

  it('ls -l gives one name per line, with its weight and what it is; -a adds the way back', () => {
    const r = executer(FR, 'ls -la', OPTIONS);
    const lignes = ecrit(r.lignes);
    expect(lignes[1]).toBe('    -  ../');
    expect(lignes[2]).toMatch(/^ {2}\d{3} {2}a-propos\.md {2}Alexandre Teixeira$/);
    expect(lignes[4]).toBe(' 236K  cv.pdf       PDF, s’ouvre dans un nouvel onglet');
    expect(lignes[5]).toBe('    -  projets/     4 fichiers');
    expect(r.entrees?.[0]).toEqual([]);
  });

  it('wraps a row of names between two names when the screen is narrow', () => {
    const r = executer({ cwd: ['fr', 'projets'], langue: 'fr' }, 'ls', { ...OPTIONS, colonnes: 60 });
    expect(ecrit(r.lignes).slice(1, 3)).toEqual(['01-whiteboard-amdec.md  02-sncf-gpt.md', '03-synthese-de-reunions.md  04-dessiner-avec-l-ia.md']);
  });

  it('cd enters a folder, and a chain stops at the first command that fails', () => {
    const r = executer(FR, 'cd projets && ls', OPTIONS);
    expect(r.session.cwd).toEqual(['fr', 'projets']);
    expect(ecrit(r.lignes)[1]).toContain('02-sncf-gpt.md');
    const rate = executer(FR, 'cd nulle-part && ls', OPTIONS);
    expect(ecrit(rate.lignes)).toEqual(['$ cd nulle-part && ls', 'cd: nulle-part\u00a0: aucun fichier ou dossier de ce nom', '']);
    expect(rate.session).toEqual(FR);
    expect(executer(FR, 'cd cv.pdf', OPTIONS).lignes[1].morceaux[0].texte).toContain('ce n’est pas un dossier');
    expect(executer({ cwd: ['fr', 'projets'], langue: 'fr' }, 'cd', OPTIONS).session.cwd).toEqual([]);
  });

  it('entering the folder of another language restarts the terminal in that language', () => {
    const r = executer(FR, 'cd ~/en && ls -l', { ...OPTIONS, invite: 'chemin' });
    expect(r.efface).toBe(true);
    expect(r.session).toEqual({ cwd: ['en'], langue: 'en' });
    expect(ecrit(r.lignes).slice(0, 4)).toEqual(['Session restarted in English (LANG=en_US.UTF-8).', '', '~/en $ ls -l', expect.stringMatching(/about\.md/)]);
    expect(ecrit(executer(r.session, 'cat nope.md', OPTIONS).lignes)[1]).toBe('cat: nope.md: no such file or directory');
    // going back up to the root does not change the language
    expect(executer(r.session, 'cd ..', OPTIONS)).toMatchObject({ efface: false, session: { cwd: [], langue: 'en' } });
  });

  it('cat prints a file raw, folded, its headings and links marked; -n numbers its lines', () => {
    const r = executer(FR, 'cat contact.md', OPTIONS);
    expect(ecrit(r.lignes).slice(1, 4)).toEqual(['# Contact', '', '- E-mail\u00a0: [alexandretei13@gmail.com](mailto:alexandretei13@gmail.com)']);
    expect(r.lignes[1].morceaux[0].sorte).toBe('titre');
    expect(r.lignes[3].morceaux[1]).toMatchObject({ sorte: 'meta', href: 'mailto:alexandretei13@gmail.com' });
    expect(r.lignes.flatMap((l) => l.morceaux).find((m) => m.texte === '(cv.pdf)')?.cible).toEqual(['fr', 'cv.pdf']);
    expect(r).toMatchObject({ vue: 'fichier', fichier: ['fr', 'contact.md'], entrees: null });
    expect(ecrit(executer(FR, 'cat -n contact.md', OPTIONS).lignes).slice(1, 4)).toEqual(['1  # Contact', '2  ', '3  - E-mail\u00a0: [alexandretei13@gmail.com](mailto:alexandretei13@gmail.com)']);
  });

  it('folds at word spaces, hanging the lines of a list under its text, and names a picture without showing it', () => {
    const lignes = ecrit(lignesDe('- un deux trois quatre cinq six\n\n```\na   b\n```\n[image: Une légende.](/a.webp)', 22, [], false));
    expect(lignes).toEqual(['- un deux trois quatre', '  cinq six', '', '```', 'a   b', '```', '[image: Une', 'légende.](/a.webp)']);
    const projet = executer(FR, 'cat projets/02-sncf-gpt.md', OPTIONS);
    expect(Math.max(...ecrit(projet.lignes).slice(1).map((ligne) => ligne.length))).toBeLessThanOrEqual(80);
    expect(ecrit(projet.lignes)).toContain('[image: SNCF GPT, détail de l’aiguillage.](miniature:aiguillage)');
  });

  it('a PDF is not printed: cat says so, open opens it', () => {
    expect(ecrit(executer(FR, 'cat cv.pdf', OPTIONS).lignes)[1]).toBe('cat: cv.pdf\u00a0: un PDF ne s’affiche pas ici. Pour l’ouvrir\u00a0: open cv.pdf');
    const r = executer({ cwd: ['en'], langue: 'en' }, 'open cv.pdf', OPTIONS);
    expect(r.ouvre).toBe('/documents/cv-en.pdf');
    expect(r.lignes[1].morceaux[1]).toMatchObject({ href: '/documents/cv-en.pdf' });
  });

  it('help, pwd, clear and an unknown command answer in the session’s language', () => {
    expect(ecrit(executer(FR, 'help', OPTIONS).lignes)[1]).toContain('lister un dossier');
    expect(ecrit(executer({ cwd: ['en'], langue: 'en' }, 'help', OPTIONS).lignes)[1]).toContain('list a folder');
    expect(ecrit(executer({ cwd: ['fr', 'projets'], langue: 'fr' }, 'pwd', OPTIONS).lignes)[1]).toBe('~/fr/projets');
    expect(executer(FR, 'clear', OPTIONS)).toMatchObject({ efface: true, lignes: [] });
    expect(ecrit(executer(FR, 'sudo rm -rf /', OPTIONS).lignes)[1]).toBe('sudo: commande introuvable\u00a0: sudo. Tapez help.');
    expect(ecrit(executer(FR, '', OPTIONS).lignes)).toEqual(['$ ']);
  });

  it('Tab completes a command or a name as far as there is one way only', () => {
    expect(completer(FR, 'he')).toBe('help ');
    expect(completer(FR, 'c')).toBe('c');
    expect(completer(FR, 'cat a')).toBe('cat a-propos.md');
    expect(completer(FR, 'cd p')).toBe('cd projets/');
    expect(completer(FR, 'cat projets/0')).toBe('cat projets/0');
    expect(completer(FR, 'cat projets/02')).toBe('cat projets/02-sncf-gpt.md');
    expect(completer(FR, 'cd projets && l')).toBe('cd projets && ls ');
    expect(completer(FR, 'cat zz')).toBe('cat zz');
  });

  it('weights are written as ls -h writes them', () => {
    expect([poids(null, 'fr'), poids(412, 'fr'), poids(1331, 'fr'), poids(1331, 'en'), poids(241910, 'fr')]).toEqual(['-', '412', '1,3K', '1.3K', '236K']);
  });
});

describe('the commands a click or an arrow writes', () => {
  it('enter and list a folder, read a file, open a PDF', () => {
    expect(commandeOuvrir(FR, ['fr', 'projets'], OPTIONS)).toBe('cd projets && ls');
    expect(commandeOuvrir(FR, ['fr', 'a-propos.md'], { ...OPTIONS, numeros: true })).toBe('cat -n a-propos.md');
    expect(commandeOuvrir(FR, ['fr', 'cv.pdf'], OPTIONS)).toBe('open cv.pdf');
    expect(commandeOuvrir(FR, ['en'], { ...OPTIONS, liste: 'longue', parent: true })).toBe('cd ~/en && ls -la');
    expect(commandeOuvrir(FR, ['fr'], OPTIONS)).toBe('ls');
    expect(commandeOuvrir(FR, ['nulle', 'part'], OPTIONS)).toBeNull();
    expect(commandeLs({ liste: 'longue', parent: false })).toBe('ls -l');
  });

  it('go back: from a file to its folder, from a folder to the one above, from the root nowhere', () => {
    expect(commandeRetour(FR, 'fichier', OPTIONS)).toBe('ls');
    expect(commandeRetour(FR, 'liste', OPTIONS)).toBe('cd .. && ls');
    expect(commandeRetour(RACINE, 'liste', OPTIONS)).toBeNull();
  });
});

describe('the screen from one command to the next', () => {
  it('opens at the root with a line of welcome and the listing', () => {
    const ecran = demarrer(OPTIONS);
    expect(ecrit(ecran.lignes).slice(1)).toEqual(['', '$ ls', 'README.md  en/  fr/', '']);
    expect(ecran).toMatchObject({ vue: 'liste', choix: 0, historique: [], cache: 0 });
    expect(new Set(ecran.lignes.map((ligne) => ligne.id)).size).toBe(ecran.lignes.length);
  });

  it('walks root → fr → projets → a project → back, then en, keeping the trace', () => {
    let ecran = demarrer(OPTIONS);
    ecran = reduire(ecran, { type: 'choisir', pas: 2 });
    expect(ecran.listing?.entrees[ecran.choix]).toEqual(['fr']);
    ecran = taper(ecran, 'cd fr && ls');
    ecran = taper(ecran, 'cd projets && ls');
    ecran = taper(ecran, 'cat 02-sncf-gpt.md');
    expect(ecran).toMatchObject({ vue: 'fichier', fichier: ['fr', 'projets', '02-sncf-gpt.md'], listing: null });
    ecran = taper(ecran, commandeRetour(ecran.session, ecran.vue, OPTIONS) ?? '');
    // back on the listing, the file just read is the one chosen
    expect(ecran.listing?.entrees[ecran.choix]).toEqual(['fr', 'projets', '02-sncf-gpt.md']);
    ecran = taper(ecran, 'cd .. && ls');
    expect(ecran.listing?.entrees[ecran.choix]).toEqual(['fr', 'projets']);
    const avant = ecran.lignes.length;
    ecran = taper(ecran, 'cd ~/en && ls');
    expect(ecran.session).toEqual({ cwd: ['en'], langue: 'en' });
    expect(ecran.lignes.length).toBeLessThan(avant);
    expect(ecrit(ecran.lignes)[0]).toBe('Session restarted in English (LANG=en_US.UTF-8).');
    expect(ecran.historique).toEqual(['cd fr && ls', 'cd projets && ls', 'cat 02-sncf-gpt.md', 'ls', 'cd .. && ls', 'cd ~/en && ls']);
  });

  it('with the way back among the names, the first name chosen is not the way back', () => {
    const options = { ...OPTIONS, parent: true };
    const ecran = taper(demarrer(options), 'cd fr && ls -a', options);
    expect(ecran.listing?.entrees[ecran.choix]).toEqual(['fr', 'a-propos.md']);
  });

  it('lists the folder again under a file when asked, and shows a long answer a few lines at a time', () => {
    const options = { ...OPTIONS, relister: true };
    let ecran = reduire(demarrer(options), { type: 'executer', commande: 'cat README.md', options, progressif: true });
    expect(ecrit(ecran.lignes).slice(-4)).toEqual(['', '$ ls', 'README.md  en/  fr/', '']);
    expect(ecran.vue).toBe('fichier');
    expect(ecran.listing?.entrees).toHaveLength(3);
    expect(ecran.cache).toBeGreaterThan(10);
    for (let i = 0; i < 40 && ecran.cache > 0; i += 1) ecran = reduire(ecran, { type: 'reveler' });
    expect(ecran.cache).toBe(0);
  });

  it('prints the same place again when the settings change what is printed', () => {
    let ecran = taper(taper(demarrer(OPTIONS), 'cd fr && ls'), 'cat a-propos.md');
    ecran = reduire(ecran, { type: 'rejouer', options: { ...OPTIONS, numeros: true } });
    expect(ecrit(ecran.lignes).slice(0, 2)).toEqual(['$ cat -n a-propos.md', ' 1  # Alexandre Teixeira']);
    expect(ecran.historique).toHaveLength(2);
    expect(ecrit(reduire(demarrer(OPTIONS), { type: 'rejouer', options: { ...OPTIONS, liste: 'longue' } }).lignes)[2]).toBe('$ ls -l');
  });
});

describe('the bench’s settings', () => {
  it('has three propositions, each inside the bounds and recognised untouched', () => {
    expect(PROPOSITIONS).toHaveLength(3);
    for (const p of PROPOSITIONS) {
      expect(valider({ depart: p.id, reglages: p.reglages })).toEqual({ depart: p.id, reglages: p.reglages });
      expect(intacte(p.reglages)).toBe(p);
    }
    expect(intacte({ ...PROPOSITIONS[0].reglages, numeros: true })).toBeUndefined();
  });

  it('brings kept or pasted settings back to what is allowed', () => {
    expect(valider(null)).toBeNull();
    expect(valider({ depart: 'nu' })).toBeNull();
    const lu = valider({ depart: 'touches', reglages: { selection: 'laser', touches: 'oui', vitesse: 999, pliage: 77, numeros: true } });
    expect(lu?.reglages).toEqual({ ...etatDe('touches').reglages, vitesse: BORNES.vitesse.max, pliage: 76, numeros: true });
  });

  it('copies a summary to read, then the same as JSON', () => {
    const lignes = resume(etatDe('fil')).split('\n');
    expect(lignes[0]).toBe('Mode machine · M5, le contenu : proposition « Fil d’Ariane », telle quelle');
    expect(lignes[1]).toContain('retour fil d’Ariane en haut');
    expect(valider(JSON.parse(lignes[lignes.length - 1]))).toEqual(etatDe('fil'));
    expect(resume({ depart: 'nu', reglages: { ...etatDe('nu').reglages, vitesse: 0 } })).toContain('partie de « Nu », réglée à la main');
  });
});

describe('the Markdown, arranged a little', () => {
  const texte = (lignes: Ligne[]) => lignes.map((ligne) => ligne.morceaux.map((m) => m.texte).join(''));
  const source = '# Titre\n\nUne phrase.\n\n[image: Une légende.](schema:x)\n\n## Partie\n\n- **Amorce** la suite\n> une question\n';

  it('underlines its headings, puts bullets, drops the signs and the pictures', () => {
    expect(texte(lignesDe(source, 80, [], false, true))).toEqual(['TITRE', '═════', '', 'Une phrase.', '', 'Partie', '──────', '', '• Amorce la suite', '│ une question']);
  });

  it('keeps the lead of a line bold', () => {
    const [, , , , , , , , puce] = lignesDe(source, 80, [], false, true);
    expect(puce.morceaux.map((m) => [m.sorte, m.texte])).toEqual([['meta', '• '], ['titre', 'Amorce'], ['sortie', ' la suite']]);
  });

  it('is left as written when not asked', () => {
    expect(texte(lignesDe(source, 80, [], false))[4]).toBe('[image: Une légende.](schema:x)');
  });
});

describe('what was retained at M5', () => {
  it('is settings the bench accepts, and offers the next file under the one just read', () => {
    expect(valider({ depart: 'touches', reglages: RETENU })?.reglages).toEqual(RETENU);
    let ecran = demarrer({ ...OPTIONS, relister: true, liste: 'longue' });
    ecran = reduire(ecran, { type: 'executer', commande: 'cd fr && cat a-propos.md', options: { ...OPTIONS, relister: true, liste: 'longue' }, progressif: false });
    expect(ecran.vue).toBe('fichier');
    expect(ecran.listing?.entrees[ecran.choix].at(-1)).toBe('contact.md');
  });
});
