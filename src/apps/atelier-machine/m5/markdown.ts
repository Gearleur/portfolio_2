import type { Bloc, Phrase, Projet } from '../../atelier/projets';

/*
 * The project pages' typed blocks, written as raw Markdown (Atelier 2, step M5): what the
 * terminal prints with `cat`. Nothing is invented: every word comes from projets.ts. A picture
 * is not shown, it is named, `[image: its caption](its reference)`; a picture drawn in the code
 * (a diagram, a part of a screen, a thumbnail) has no file, so its reference is the name it is
 * drawn under (`schema:parcours`).
 */

const phrase = ({ lead, text, href }: Phrase) => {
  const mots = lead ? `**${lead}** ${text}` : text;
  return href ? `[${mots}](${href})` : mots;
};

/** A picture as the terminal writes it: its caption when it has one, its reference when it has one. */
export const image = (legende: string, reference?: string) => `[image${legende ? `: ${legende}` : ''}]${reference ? `(${reference})` : ''}`;

export function blocEnMarkdown(bloc: Bloc): string {
  switch (bloc.type) {
    case 'texte':
      return phrase(bloc);
    case 'intertitre':
      return `### ${bloc.text}`;
    case 'liste':
    case 'colonnes':
      return bloc.items.map((item) => `- ${phrase(item)}`).join('\n');
    case 'cartes':
      return bloc.items.map((item) => `- ${phrase(item)}\n  ${image('', `ecran:${item.ecran}`)}`).join('\n');
    case 'question':
    case 'compromis':
      return `> ${bloc.text}`;
    case 'decision':
      return [`### ${bloc.n}. ${bloc.lead}`, bloc.text, image(bloc.visuel, bloc.schema && `schema:${bloc.schema}`)].join('\n\n');
    case 'visuel':
      return image(bloc.legende, bloc.image ?? (bloc.schema && `schema:${bloc.schema}`));
    case 'planche':
      return [...bloc.images.map(({ src, nom, note }) => image(note ? `${nom}, ${note}` : nom, src)), '', `*${bloc.legende}*`].join('\n');
    case 'journal':
      return [...bloc.lignes.map((ligne) => `- n°\u00a0${ligne.n}, ${ligne.date}\u00a0: ${ligne.decision} «\u00a0${ligne.pourquoi}\u00a0»`), '', `*${bloc.legende}*`].join('\n');
  }
}

/** A whole project page: its title, its hook, its thumbnail, its figures and facts, then its sections. */
export function projetEnMarkdown(projet: Projet): string {
  const { miniature } = projet;
  const reference = miniature.image ?? (miniature.affiche ? `affiche:${miniature.affiche}` : miniature.aiguillage ? 'miniature:aiguillage' : undefined);
  return `${[
    `# ${projet.nom}`,
    projet.accroche,
    image(miniature.legende, reference),
    projet.chiffres.map((chiffre) => `- **${chiffre.value}** ${chiffre.text}`).join('\n'),
    projet.cartel.map(([terme, valeur]) => `- **${terme}\u00a0:** ${valeur}`).join('\n'),
    ...projet.sections.flatMap((section) => [`## ${section.titre}`, ...section.blocs.map(blocEnMarkdown)]),
  ].join('\n\n')}\n`;
}
