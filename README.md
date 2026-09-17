# Portfolio Desktop

Portfolio interactif en React + Vite, pense comme un bureau retro inspire des interfaces Mac/desktop annees 90-2000.

## Scripts

- `pnpm dev` : lance le serveur de developpement
- `pnpm build` : verifie TypeScript puis genere la version de production
- `pnpm lint` : lance ESLint
- `pnpm preview` : sert le build localement

## Profil pour les agents IA

- `/agent` (ou `/agent/`) : page HTML complète, lisible sans JavaScript.
- `/agent/profile.md` : profil en Markdown, sans prompt.
- `/agent/profile.json` : données structurées avec leurs sources.
- `/agent/context.txt` : prompt d’introduction suivi du profil, utilisé par le bouton de copie.
- `/llms.txt` : liens de découverte proposés aux agents ; leur consultation dépend de chaque outil.

La page `/agent` partage le composant `MachineResumeDocument.tsx` et la feuille
`machineMode.css` avec le mode Machine. Tous les projets y sont ouverts par défaut.
Le bouton « Copy all » copie le prompt suivi du profil entier ; « Human interface »
ramène au bureau. Les commandes `curl` utilisent automatiquement l’origine du site.
`GET /agent/profile.json` permet aussi de récupérer toutes les données structurées,
sans clé API, avec un contrôle de débit côté serveur sur Vercel. Les exports
renvoient 503 tant que la règle du pare-feu n’est pas configurée. Exemple local
(Vite ne fait pas tourner le middleware Vercel) :

```sh
curl -fsSL 'http://localhost:4173/agent/context.txt'
curl -fsSL 'http://localhost:4173/agent/profile.json'
```

Le plugin `build/agentPages.ts` sert ces pages en développement et les génère dans
`dist` à chaque build, depuis les mêmes données que le mode Machine. Publier tout
le dossier `dist` et laisser l’hébergeur servir les fichiers statiques avant toute
règle de repli SPA ; `/agent` doit résoudre vers `agent.html` ou `agent/index.html`.
Les deux fichiers sont générés pour les hébergeurs qui gèrent les URL sans extension
ou les index de dossiers.

Le prompt et la structure sont dans `src/agent/agentContent.ts`, la page dans
`src/agent/agentDocument.ts`. Le contenu est fondé sur les CV fournis ; les dates
ne constituent pas une vérification en temps réel de la situation professionnelle.

## Structure de l’expérience

Les pages `/cv/fr/` et `/cv/en/` affichent les PDF dans leur langue respective,
avec un lien de téléchargement, un changement de langue et un bouton de retour
à l’interface. Elles sont aussi accessibles depuis la fenêtre CV et le mode Machine.

## Sécurité et déploiement

`vercel.json` contient les routes et les en-têtes de sécurité. `middleware.ts`
limite les exports aux méthodes GET/HEAD et exige une autorisation du pare-feu.
La règle `public-profile-downloads` doit être activée séparément dans Vercel ;
en son absence, les exports sont bloqués (503) après déploiement.
Voir [la configuration et ses limites](docs/vercel-security.md).
Les coordonnées actuellement présentes dans les PDF et le profil restent publiques.

## Bureau

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
