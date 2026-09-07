/*
 * Texte de la cinematique. C'est une premiere version fonctionnelle et
 * remplacable : le fichier est isole precisement pour pouvoir etre reecrit
 * sans toucher au rendu (CinematicOverlay, CinematicA11yArticle).
 */

export type LineEnter = 'mask-up' | 'blur-in' | 'track-in';

export type CinematicLine = {
  text: string;
  enter: LineEnter;
};

export type CinematicAct = {
  id: string;
  kind: 'text' | 'cta';
  cameraDepth: number;
  lines: CinematicLine[];
};

export const cinematicScript: CinematicAct[] = [
  {
    id: 'constat',
    kind: 'text',
    cameraDepth: 10.4,
    lines: [
      { text: 'Chaque entreprise a déjà ses données.', enter: 'mask-up' },
      { text: "Presque aucune n'en tire une décision.", enter: 'mask-up' },
    ],
  },
  {
    id: 'bascule',
    kind: 'text',
    cameraDepth: 18.2,
    lines: [
      { text: "L'IA n'a pas remplacé les métiers.", enter: 'blur-in' },
      { text: "Elle a déplacé l'endroit où le travail a de la valeur.", enter: 'mask-up' },
    ],
  },
  {
    id: 'friction',
    kind: 'text',
    cameraDepth: 26.5,
    lines: [
      { text: "Le modèle n'est jamais le problème.", enter: 'track-in' },
      { text: "Le problème, c'est tout ce qu'il y a autour.", enter: 'mask-up' },
    ],
  },
  {
    id: 'apport',
    kind: 'text',
    cameraDepth: 34.8,
    lines: [
      { text: 'Je construis ce qui va autour.', enter: 'mask-up' },
      {
        text: "De la donnée brute jusqu'à l'interface que quelqu'un utilise vraiment.",
        enter: 'blur-in',
      },
    ],
  },
  {
    id: 'contact',
    kind: 'cta',
    cameraDepth: 42.0,
    lines: [{ text: 'Parlons de ce que vous voulez déplacer.', enter: 'mask-up' }],
  },
];
