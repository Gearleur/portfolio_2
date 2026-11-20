import { describe, expect, it } from 'vitest';
import { RETENU as PASSAGE } from '../m4/retenu';
import { RACINE } from '../m5/fichiers';
import type { Noeud } from '../m5/fichiers';
import { RETENU as CONTENU } from '../m5/retenu';
import { commandeLs, demarrer, lignesDe, reduire } from '../m5/shell';
import type { Options } from '../m5/shell';
import { contenuDe, passageDe, typeDe } from './derives';
import { BORNES, CHOIX, OPTIONS, PROPOSITIONS, TAILLES, choisie, colonnes, deplacer, etatDe, intacte, pilule, resume, toile, valider } from './reglages';
import { RETENU } from './retenu';
import { interrupteurDe, peutPrecharger, placeEncoche } from './telephone';

const OPTIONS_SHELL: Options = { colonnes: 40, pliage: 128, numeros: false, agence: true, liste: 'courte', parent: false, relister: true, invite: 'signe' };

const large = (lignes: { morceaux: { texte: string }[] }[]) => Math.max(...lignes.map((ligne) => ligne.morceaux.reduce((n, m) => n + m.texte.length, 0)));

describe('les propositions de M6', () => {
  it('tiennent dans leurs bornes', () => {
    for (const { reglages: r } of [...PROPOSITIONS, CHOIX]) {
      for (const [cle, { min, max }] of Object.entries({ ...BORNES, taille: TAILLES[r.interrupteur] })) {
        const valeur = r[cle as keyof typeof r] as number;
        expect(valeur, cle).toBeGreaterThanOrEqual(min);
        expect(valeur, cle).toBeLessThanOrEqual(max);
      }
      for (const [cle, permis] of Object.entries(OPTIONS)) expect(permis as readonly unknown[], cle).toContain(r[cle as keyof typeof r]);
      // Apple's minimum for what a finger has to hit
      expect(r.cible).toBeGreaterThanOrEqual(44);
      expect(r.touche).toBeGreaterThanOrEqual(44);
    }
  });

  it('se reconnaissent, et se relisent telles quelles', () => {
    for (const p of PROPOSITIONS) {
      expect(intacte(p.reglages)).toBe(p);
      expect(valider(JSON.parse(JSON.stringify(etatDe(p.id))))).toEqual(etatDe(p.id));
      expect(resume(etatDe(p.id))).toContain(`« ${p.nom} », telle quelle`);
    }
  });

  it('ramènent dans les bornes ce qui en sort, et à la proposition ce qui manque', () => {
    const lu = valider({ depart: 'pouce', reglages: { interrupteur: 'encoche', taille: 90, cible: 10, corps: 13.2, densite: 4, chargement: 'jamais' } });
    expect(lu?.depart).toBe('pouce');
    expect(lu?.reglages).toMatchObject({ interrupteur: 'encoche', taille: 32, cible: 44, corps: 13, densite: 1.5, chargement: 'repos', pave: true, gestes: false, rangs: 'lignes' });
    expect(valider(null)).toBeNull();
    expect(valider({ depart: 'encoche' })).toBeNull();
  });

  it('partent de ce qui est retenu : l’encoche, les noms et les gestes, la feuille, le numéro en filigrane', () => {
    expect(RETENU).toEqual({ interrupteur: 'encoche', taille: 28, gestes: true, pave: false, rangs: 'feuille', cible: 48, touche: 52, numero: 'filigrane', corps: 13, liste: 'courte', duree: 1500, largeur: 140, densite: 1.5, chargement: 'repos' });
    expect(CHOIX).toEqual({ depart: 'encoche', reglages: RETENU });
    expect(choisie(RETENU)).toBe(true);
    expect(intacte(RETENU)).toBeUndefined();
    expect(valider(JSON.parse(JSON.stringify(CHOIX)))).toEqual(CHOIX);
    expect(resume(CHOIX)).toContain('ce qui est retenu, tel quel');
    expect(resume(CHOIX)).toContain('pilule de 59 × 28 px');
    expect(resume(CHOIX)).toContain('en touchant les noms, et en glissant vers la droite pour revenir · cibles de 48 px · liste native');
    expect(resume(CHOIX)).toContain('puis en filigrane derrière les lignes');
    expect(resume(CHOIX)).toContain(JSON.stringify(CHOIX));
  });

  it('font de ce qui est retenu les pièces que la Vitrine monte', () => {
    // the switch: M3's object, shorter, at the notch's scale
    expect(pilule(RETENU)).toEqual({ largeur: 59, hauteur: 28 });
    expect(interrupteurDe(RETENU)).toMatchObject({ largeur: 168, hauteur: 80, echelle: 0.35, bas: 0, matiere: 'verre', fenetre: 'petale' });
    // a native list: the command written at once, no chosen name without keys, no bar of keys
    expect(contenuDe(RETENU)).toMatchObject({ vitesse: 0, sortie: 'coup', retour: 'fleche', selection: 'aucune', suggestion: false, touches: false, liste: 'courte', relister: true });
    // the number stays behind the lines, as on a desktop
    expect(passageDe(RETENU, 'fr')).toMatchObject({ duree: 1500, largeur: 140, place: 'centre', force: PASSAGE.force, numero: PASSAGE.numero });
    expect(typeDe(RETENU.corps).police.corps).toBe(13);
    expect(colonnes(RETENU.corps)).toBeGreaterThanOrEqual(40);
    expect(toile(RETENU.densite)).toEqual({ largeur: 585, hauteur: 1266 });
    expect(RETENU.cible).toBeGreaterThanOrEqual(44);
  });

  it('donnent à l’interrupteur la taille de sa place', () => {
    const { reglages } = etatDe('pouce');
    expect(deplacer(reglages, 'encoche')).toMatchObject({ interrupteur: 'encoche', taille: 28 });
    // in the notch: about a phone's own switch, and it fits between the name and « Menu » (358 px for 151 + 37 + 44 + 20)
    expect(pilule({ interrupteur: 'encoche', taille: 32 }).largeur).toBeLessThanOrEqual(358 - 252);
    expect(pilule({ interrupteur: 'bas', taille: 44 })).toEqual({ largeur: 163, hauteur: 44 });
    expect(interrupteurDe({ interrupteur: 'menu', taille: 36 })).toMatchObject({ largeur: 296, hauteur: 80, echelle: 0.45, matiere: 'verre', fenetre: 'petale' });
  });

  it('comptent une quarantaine de colonnes et une toile plafonnée', () => {
    expect(colonnes(14)).toBe(41);
    expect(colonnes(16)).toBeGreaterThanOrEqual(36);
    expect(toile(1.5)).toEqual({ largeur: 585, hauteur: 1266 });
    expect(toile(4)).toEqual({ largeur: 1170, hauteur: 2532 });
  });
});

describe('ce que le téléphone change aux pièces retenues', () => {
  it('garde le passage de M4, le numéro au milieu puis rangé', () => {
    const p = passageDe({ duree: 1500, largeur: 140, numero: 'etat' }, 'en');
    expect(p).toMatchObject({ foyer: 'bouton', retrait: 'bouton', courbe: PASSAGE.courbe, teintes: 'onde', numero: PASSAGE.numero, duree: 1500, largeur: 140, place: 'centre', langue: 'en', force: 0 });
    expect(passageDe({ duree: 1500, largeur: 140, numero: 'filigrane' }, 'fr').force).toBe(PASSAGE.force);
  });

  it('garde les aides de M5, sans la barre de touches', () => {
    expect(contenuDe({ pave: false, rangs: 'lignes', liste: 'courte' })).toEqual({ ...CONTENU, liste: 'courte', touches: false, selection: 'aucune', suggestion: false });
    expect(contenuDe({ pave: true, rangs: 'lignes', liste: 'longue' })).toMatchObject({ selection: 'inverse', suggestion: true, liste: 'longue', vitesse: CONTENU.vitesse });
    expect(contenuDe({ pave: false, rangs: 'feuille', liste: 'courte' })).toMatchObject({ selection: 'aucune', vitesse: 0, sortie: 'coup' });
    expect(typeDe(13).police).toMatchObject({ corps: 13, maniere: 'classique' });
    expect(typeDe(13).grille.marge).toBe(16);
  });

  it('ne précharge pas pour qui économise ses données ou n’a que la 2G', () => {
    expect(peutPrecharger(undefined)).toBe(true);
    expect(peutPrecharger({ effectiveType: '4g' })).toBe(true);
    expect(peutPrecharger({ effectiveType: '3g' })).toBe(true);
    expect(peutPrecharger({ effectiveType: '2g' })).toBe(false);
    expect(peutPrecharger({ effectiveType: 'slow-2g' })).toBe(false);
    expect(peutPrecharger({ saveData: true, effectiveType: '4g' })).toBe(false);
  });
});

describe('la place de l’interrupteur dans l’encoche', () => {
  const piece = (left: number, right: number, top = 10, bottom = 52) => ({ left, right, top, bottom, width: right - left });

  it('est le milieu du vide entre le nom et « Menu », sur leur ligne', () => {
    // the home's notch, open: the name, 79 px of room, « Menu »
    expect(placeEncoche([piece(62, 213), piece(292, 328)], { left: 0, top: 0 })).toEqual({ x: 252.5, y: 31 });
    // in a stage that is not at the window's corner (the bench's phone)
    expect(placeEncoche([piece(162, 313, 34, 76), piece(392, 428, 34, 76)], { left: 100, top: 24 })).toEqual({ x: 252.5, y: 31 });
  });

  it('ne compte pas ce qui n’est pas dessiné, quel que soit l’ordre des pièces', () => {
    // a project's page: « ‹ Projets », the name hidden, « Menu »
    expect(placeEncoche([piece(243, 280), piece(0, 0), piece(110, 165)], { left: 0, top: 0 })).toEqual({ x: 204, y: 31 });
  });

  it('ne dit rien tant que l’encoche n’est pas là', () => {
    expect(placeEncoche([], { left: 0, top: 0 })).toBeNull();
    expect(placeEncoche([piece(62, 213)], { left: 0, top: 0 })).toBeNull();
  });
});

describe('le terminal sur quarante colonnes', () => {
  it('liste un poids et un nom par ligne avec ls -s', () => {
    expect(commandeLs({ liste: 'courte', parent: false })).toBe('ls -s');
    expect(commandeLs({ liste: 'longue', parent: false })).toBe('ls -l');
    const ecran = reduire(demarrer(OPTIONS_SHELL), { type: 'executer', commande: 'cd fr && ls -s', options: OPTIONS_SHELL, progressif: false });
    const liste = ecran.lignes.filter((ligne) => ligne.liste === ecran.listing?.id).map((ligne) => ligne.morceaux.map((m) => m.texte).join(''));
    expect(liste.map((ligne) => ligne.slice(7))).toEqual(['a-propos.md', 'contact.md', 'cv.pdf', 'projets/']);
    for (const ligne of liste) expect(ligne).toMatch(/^ {0,4}(\d+|[\d,]+K|-) {2}\S+$/);
    expect(liste[2]).toBe(' 236K  cv.pdf');
    expect(ecran.listing?.entrees).toHaveLength(4);
  });

  it('plie chaque fichier dans la largeur de l’écran, de 36 à 48 colonnes', () => {
    const fichiers = (noeud: Noeud, chemin: string[] = []): [string[], string][] => (noeud.type === 'dossier' ? noeud.enfants.flatMap((enfant) => fichiers(enfant, [...chemin, enfant.nom])) : noeud.type === 'md' ? [[chemin, noeud.contenu]] : []);
    for (const mesure of [36, 41, 48]) {
      for (const [chemin, contenu] of fichiers(RACINE)) {
        expect(large(lignesDe(contenu, mesure, chemin.slice(0, -1), false, true)), `${chemin.join('/')} à ${mesure}`).toBeLessThanOrEqual(mesure);
      }
    }
  });

  it('coupe au bord, comme un terminal, la ligne d’un bloc trop longue pour l’écran, et pas les autres', () => {
    const arbre = ['```', '│   │   ├── 03-synthese-de-reunions.md', '```'].join('\n');
    expect(lignesDe(arbre, 36, [], false, true).map((ligne) => ligne.morceaux.map((m) => m.texte).join(''))).toEqual(['```', '│   │   ├── 03-synthese-de-reunions.', 'md', '```']);
    expect(lignesDe(arbre, 128, [], false, true)).toHaveLength(3);
  });

  it('plie aussi ce que dit le shell : l’accueil, le redémarrage, l’aide, l’ouverture d’un PDF', () => {
    const options = { ...OPTIONS_SHELL, colonnes: 38 };
    let ecran = demarrer(options);
    expect(ecran.lignes.filter((ligne) => ligne.debut)).toHaveLength(1);
    for (const commande of ['help', 'cd en && ls -s', 'open cv.pdf', 'cat cv.pdf', 'cd nulle-part-ailleurs', 'cd ../fr && ls -s']) {
      ecran = reduire(ecran, { type: 'executer', commande, options, progressif: false });
      expect(large(ecran.lignes), commande).toBeLessThanOrEqual(38);
    }
    // on a desktop's width nothing folds: one line of welcome, as before
    expect(demarrer({ ...options, colonnes: 145 }).lignes[1].morceaux).toEqual([]);
  });

  it('garde chaque liste dans la largeur, quel que soit le dossier', () => {
    for (const commande of ['ls -s', 'cd fr && ls -s', 'cd fr/projets && ls -s', 'cd en/projects && ls -s']) {
      const ecran = reduire(demarrer({ ...OPTIONS_SHELL, colonnes: 36 }), { type: 'executer', commande, options: { ...OPTIONS_SHELL, colonnes: 36 }, progressif: false });
      expect(large(ecran.lignes.filter((ligne) => ligne.liste !== undefined)), commande).toBeLessThanOrEqual(36);
    }
  });
});
