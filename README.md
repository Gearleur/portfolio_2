# Portfolio Desktop

Portfolio interactif en React + Vite, pense comme un bureau retro inspire des interfaces Mac/desktop annees 90-2000.

## Scripts

- `pnpm dev` : lance le serveur de developpement
- `pnpm build` : verifie TypeScript puis genere la version de production
- `pnpm lint` : lance ESLint
- `pnpm preview` : sert le build localement

## Prochaine etape

Construire la structure de l'experience :

- bureau plein ecran
- icones de fichiers a gauche
- fenetres ouvrables, deplacables, fermables
- sections portfolio : education, experience, projets, contact

## Assets tiers

Les icones de test dans `public/assets/icons` viennent du repo
`trapd00r/win95-winxp_icons`. Elles sont utilisees ici pour valider la direction
artistique retro. Verifier/remplacer ces assets avant une publication publique si
une licence explicite est necessaire.

Les curseurs retro utilises dans `src/styles.css` viennent de `cursor.cc` :

- `Windows 1.0 - 3.1 cursor`
- `windows xp hand`

Leurs pages indiquent une licence Creative Commons sans attribution.
