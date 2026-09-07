# Portfolio Desktop

Portfolio interactif en React + Vite, pense comme un bureau retro inspire des interfaces Mac/desktop annees 90-2000.

## Scripts

- `pnpm dev` : lance le serveur de developpement
- `pnpm build` : verifie TypeScript puis genere la version de production
- `pnpm lint` : lance ESLint
- `pnpm preview` : sert le build localement

## Experience de sortie de l'ecran

Apres deux fenetres ouvertes ou 40 secondes, un bouton portail apparait. Il fait
reculer la camera hors de l'ecran cathodique vers une piece vide ou se joue une
cinematique pilotee au scroll.

- Design : `docs/superpowers/specs/2026-09-06-sortie-ecran-cinematique-design.md`
- Plan : `docs/superpowers/plans/2026-09-06-sortie-ecran-cinematique.md`
- Le texte du pitch vit dans `src/experience/cinematic/cinematicScript.ts` et se
  reecrit sans toucher au rendu.

## Assets tiers

Les icones de test dans `public/assets/icons` viennent du repo
`trapd00r/win95-winxp_icons`. Elles sont utilisees ici pour valider la direction
artistique retro. Verifier/remplacer ces assets avant une publication publique si
une licence explicite est necessaire.

Les curseurs retro utilises dans `src/styles.css` viennent de `cursor.cc` :

- `Windows 1.0 - 3.1 cursor`
- `windows xp hand`

Leurs pages indiquent une licence Creative Commons sans attribution.
