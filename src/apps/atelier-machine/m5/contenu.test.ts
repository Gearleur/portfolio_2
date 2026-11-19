import { describe, expect, it } from 'vitest';
import { readFileSync, statSync } from 'node:fs';
import { PROJETS, SNCF_GPT } from '../../atelier/projets';
import type { Bloc } from '../../atelier/projets';
import { ACCUEIL, NON_TRADUIT, OCTETS, RACINE, arbre, ecrire, langueDe, relatif, resoudre, trouver } from './fichiers';
import type { Langue } from './fichiers';
import { blocEnMarkdown, projetEnMarkdown } from './markdown';

const md = (chemin: string) => {
  const noeud = trouver(chemin.split('/'));
  if (noeud?.type !== 'md') throw new Error(`${chemin} is not a Markdown file`);
  return noeud.contenu;
};

describe('blocks as raw Markdown', () => {
  it('writes each kind of block with Markdown’s own signs', () => {
    const blocs: [Bloc, string][] = [
      [{ type: 'texte', lead: 'Écouter.', text: 'Avant le code.' }, '**Écouter.** Avant le code.'],
      [{ type: 'texte', text: 'un article', href: 'https://exemple.fr/a' }, '[un article](https://exemple.fr/a)'],
      [{ type: 'intertitre', text: 'Sous le capot' }, '### Sous le capot'],
      [{ type: 'liste', items: [{ text: 'un' }, { lead: 'Deux.', text: 'Puis.' }] }, '- un\n- **Deux.** Puis.'],
      [{ type: 'question', text: 'Comment ?' }, '> Comment ?'],
      [{ type: 'decision', n: 2, lead: 'Hybride.', text: 'Mots et vecteurs.', visuel: 'La recherche.', schema: 'recherche' }, '### 2. Hybride.\n\nMots et vecteurs.\n\n[image: La recherche.](schema:recherche)'],
      [{ type: 'visuel', image: '/medias/a.webp', legende: 'L’architecture.' }, '[image: L’architecture.](/medias/a.webp)'],
      [{ type: 'visuel', legende: 'À venir.' }, '[image: À venir.]'],
      [{ type: 'cartes', items: [{ ecran: 'liste', lead: 'Choisir.', text: 'La liste.' }] }, '- **Choisir.** La liste.\n  [image](ecran:liste)'],
      [
        { type: 'planche', colonnes: 2, taille: [10, 10], images: [{ src: '/a.webp', nom: 'Signal', note: 'comme Thrad' }, { src: '/b.webp', nom: 'Console' }], legende: 'Deux écrans.' },
        '[image: Signal, comme Thrad](/a.webp)\n[image: Console](/b.webp)\n\n*Deux écrans.*',
      ],
      [
        { type: 'journal', lignes: [{ n: 41, date: '6 nov.', decision: 'La nav à droite.', pourquoi: 'J’aime bien.' }], legende: 'Une ligne.' },
        '- n°\u00a041, 6 nov.\u00a0: La nav à droite. «\u00a0J’aime bien.\u00a0»\n\n*Une ligne.*',
      ],
    ];
    for (const [bloc, attendu] of blocs) expect(blocEnMarkdown(bloc)).toBe(attendu);
  });

  it('writes a whole project: title, hook, thumbnail, figures, facts, then a heading per section', () => {
    const texte = projetEnMarkdown(SNCF_GPT);
    expect(texte.startsWith(`# SNCF GPT\n\n${SNCF_GPT.accroche}\n\n[image: SNCF GPT, détail de l’aiguillage.](miniature:aiguillage)\n\n- **82 %** `)).toBe(true);
    expect(texte).toContain('- **Équipe\u00a0:** Seul sur le prototype');
    for (const section of SNCF_GPT.sections) expect(texte).toContain(`\n\n## ${section.titre}\n\n`);
    expect(texte).not.toMatch(/undefined|\[object/);
    // every picture of the page is named, none is shown
    const visuels = SNCF_GPT.sections.flatMap((s) => s.blocs).filter((b) => b.type === 'visuel' || b.type === 'decision').length;
    expect(texte.match(/^\[image: /gm)?.length).toBe(visuels + 1);
  });
});

describe('the files at hand', () => {
  it('are a README and a folder per language, each with the same four things', () => {
    expect(['.', ...arbre(RACINE)]).toEqual([
      '.',
      '├── README.md',
      '├── en/',
      '│   ├── about.md',
      '│   ├── contact.md',
      '│   ├── cv.pdf',
      '│   └── projects/',
      '│       ├── 01-whiteboard-amdec.md',
      '│       ├── 02-sncf-gpt.md',
      '│       ├── 03-synthese-de-reunions.md',
      '│       └── 04-dessiner-avec-l-ia.md',
      '└── fr/',
      '    ├── a-propos.md',
      '    ├── contact.md',
      '    ├── cv.pdf',
      '    └── projets/',
      '        ├── 01-whiteboard-amdec.md',
      '        ├── 02-sncf-gpt.md',
      '        ├── 03-synthese-de-reunions.md',
      '        └── 04-dessiner-avec-l-ia.md',
    ]);
    expect(md('README.md')).toContain('└── fr/');
  });

  it('hold every project page, in French', () => {
    for (const [numero, projet] of Object.entries(PROJETS)) {
      const carte = ACCUEIL.projets.find((p) => p.numero === numero);
      expect(carte).toBeDefined();
      const dossier = trouver(['fr', 'projets']);
      const fichier = dossier?.type === 'dossier' ? dossier.enfants.find((enfant) => enfant.nom.startsWith(`${numero}-`)) : undefined;
      expect(fichier?.type === 'md' && fichier.contenu).toBe(projet && projetEnMarkdown(projet));
    }
  });

  it('say so, in one line, where the English does not exist, and do not translate', () => {
    const [francais, anglais] = [md('fr/projets/02-sncf-gpt.md'), md('en/projects/02-sncf-gpt.md')];
    expect(anglais).toBe(`${NON_TRADUIT}\n\n${francais}`);
    // the home page has its English: it is used as it is
    expect(md('en/about.md')).toContain('AI engineer, from prototype to production.');
    expect(md('en/about.md')).toContain('## Previously\n\nAI engineer [@SNCF](https://www.groupe-sncf.com), AI engineer [@Renault](https://www.renaultgroup.com)');
    expect(md('en/about.md')).toContain('- 03 · [Meeting summaries](projects/03-synthese-de-reunions.md) · SNCF, 2025');
    expect(md('fr/a-propos.md')).toContain('## Formation\n\n- [@UTC](https://www.utc.fr), 2022 – 2026\n- [@Shanghai University]');
  });

  it('keep the home page’s words as Maquettes.tsx writes them', () => {
    const source = readFileSync(new URL('../../atelier/Maquettes.tsx', import.meta.url), 'utf8');
    const mots: string[] = [];
    const cueillir = (valeur: unknown) => {
      if (typeof valeur === 'string') mots.push(valeur);
      else if (typeof valeur === 'object' && valeur !== null) Object.values(valeur).forEach(cueillir);
    };
    cueillir(ACCUEIL);
    expect(mots.length).toBeGreaterThan(40);
    // the source writes its no-break spaces as escapes
    for (const mot of mots) expect(source, mot).toContain(mot.replace(/\u00a0/g, '\\u00a0'));
  });

  it('point at the two résumés of public/documents, with their real weights', () => {
    for (const langue of ['fr', 'en'] as Langue[]) {
      const cv = trouver([langue, 'cv.pdf']);
      expect(cv).toMatchObject({ type: 'pdf', href: `/documents/cv-${langue}.pdf`, octets: OCTETS[langue] });
      expect(statSync(new URL(`../../../../public/documents/cv-${langue}.pdf`, import.meta.url)).size).toBe(OCTETS[langue]);
    }
  });

  it('have links that lead somewhere', () => {
    for (const chemin of ['README.md', 'fr/a-propos.md', 'en/about.md', 'fr/contact.md', 'en/contact.md']) {
      const dossier = chemin.split('/').slice(0, -1);
      const liens = [...md(chemin).matchAll(/\]\(([^)]+)\)/g)].map((lien) => lien[1]).filter((lien) => !/^(https?:|mailto:)/.test(lien));
      expect(liens.length).toBeGreaterThan(0);
      for (const lien of liens) expect(trouver(resoudre(dossier, lien)), `${chemin} → ${lien}`).toBeDefined();
    }
  });
});

describe('paths', () => {
  it('are read as a shell reads them', () => {
    expect(resoudre(['fr'], 'projets')).toEqual(['fr', 'projets']);
    expect(resoudre(['fr', 'projets'], '../../en/')).toEqual(['en']);
    expect(resoudre(['fr'], '~/en/projects')).toEqual(['en', 'projects']);
    expect(resoudre(['fr'], '/')).toEqual([]);
    expect(resoudre([], '..')).toEqual([]);
  });

  it('are written the shortest way from where one is', () => {
    expect(ecrire([])).toBe('~');
    expect(relatif(['fr'], ['fr', 'projets', '02-sncf-gpt.md'])).toBe('projets/02-sncf-gpt.md');
    expect(relatif(['fr', 'projets'], ['fr'])).toBe('..');
    expect(relatif(['fr', 'projets'], ['en'])).toBe('~/en');
    expect(langueDe(['en', 'projects'])).toBe('en');
    expect(langueDe([])).toBeNull();
  });
});
