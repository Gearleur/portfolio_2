# Atelier — le portfolio « argile »

Méthode, références, plan et journal de bord pour construire une page portfolio
à part, épurée comme un site de mode ou de studio de design, sur un fond argile.

Ce document sert de règle du jeu. On le complète à chaque étape validée.

---

## 1. L'idée

Deux nouvelles pages, séparées du bureau rétro (qui ne change pas) :

| Page | URL proposée | Rôle |
| --- | --- | --- |
| **L'Atelier** | `/atelier/` | Notre Figma en code : moodboard, couleurs, typos, espaces, grille, composants, chemin de fer. Tout y est cliquable. C'est la **source de vérité**. |
| **La Vitrine** | `/portfolio/` | Le portfolio lui-même, construit **uniquement** avec ce qui a été validé dans l'Atelier. |

L'Atelier s'ouvre sur **la charte**, qui rassemble le brief et toutes les
décisions validées. Elle se remplit à chaque étape. En dessous, une **barre
d'étapes** permet de revenir à n'importe quelle étape déjà faite : chacune garde
son établi de réglages, à son adresse (`/atelier/#etape-1`, `#etape-2`…).

L'Atelier est l'arrière-boutique et la Vitrine est ce que voient les visiteurs.

---

## 2. Comment travaillent les équipes artistiques

Les studios (agences de marque, équipes design produit, directions artistiques
de mode) suivent à peu près tous la même logique : **on part du large vers le
précis, et on ouvre avant de fermer.** On ouvre en cherchant beaucoup de pistes,
puis on ferme en choisissant. On ne choisit jamais le survol d'un bouton avant
d'avoir fixé le fond de la page.

| Phase | Ce que fait un studio | Ce qu'on fait nous |
| --- | --- | --- |
| **Brief** | Une page : intention, public, ce qu'on doit ressentir, contraintes. | 10 min de questions, je note tes réponses ici. |
| **Recherche / moodboard** | Planche de références **annotées** : pas « j'aime », mais « on prend ça, pour ça ». | Section 4 ci-dessous, puis une section Moodboard dans l'Atelier. |
| **Pistes (territoires)** | 2–3 directions possibles, on en retient une. | Variantes A/B/C côte à côte dans l'Atelier, cliquables. |
| **Fondations** | Couleurs, typos, espaces, grille, matière, mouvement : les *design tokens*. | Un seul fichier de tokens, partagé par l'Atelier et la Vitrine. |
| **Chemin de fer** | Plan de la page en boîtes grises : où va quoi, sans style. | Compositions en blocs gris, superposables à la grille. |
| **Composants** | Les briques, chacune avec ses états (repos, survol, actif, désactivé). | Une par une, tes composants compris, toutes visibles dans l'Atelier. |
| **Maquette → prototype** | Maquette haute fidélité, puis prototype cliquable. | Directement la vraie page : la maquette *est* le prototype. |
| **Crit + BAT** | Revue critique à chaque jalon. Le « bon à tirer » fige un choix. | À la fin de chaque étape, tu donnes ton BAT. Sans BAT, on ne passe pas à la suite. |
| **Production / finitions** | Responsive, accessibilité, performance, détails de mouvement. | Les dernières étapes du plan. |

À mon avis c'est la bonne façon de faire, avec une mise en garde : l'Atelier est
un **outil**, pas le produit. Il reste sobre et fonctionnel pour que l'énergie
aille dans la Vitrine.

---

## 3. Nos règles de travail

1. **Une étape = une décision.** On ne passe à la suivante qu'après ton BAT.
2. **2 ou 3 variantes au plus**, côte à côte et cliquables. Je ne t'impose pas une
   seule option, et je ne t'en sors pas dix non plus.
3. **Ta critique tient en trois mots : Garde / Jette / Change**, avec un mot de
   pourquoi si possible (« trop sombre », « trop chargé », « pas assez rouge »…).
4. **Chaque décision validée va dans le journal** (section 6), avec sa raison. On
   n'y revient que si une nouvelle raison apparaît.
5. **Rien en dur dans la Vitrine.** Chaque couleur, taille ou espace vient d'un
   token de l'Atelier. Ce qui n'est pas dans l'Atelier n'existe pas.
6. **Tes composants entrent par l'Atelier.** Quand tu en apportes un, on l'habille
   avec nos tokens, on montre ses états, puis la Vitrine peut s'en servir.
7. **Le contenu vient de toi.** Je t'interviewe, tu écris, je mets en forme. Dans
   le chemin de fer, le faux texte est visiblement faux.
8. **On reprend des principes, pas des pixels.** Chaque référence est annotée
   avec ce qu'on lui emprunte.
9. **Je te montre toujours dans le navigateur** (URL locale + capture) avant de te
   demander ton avis.
10. **Une étape validée = un commit.** Les variantes rejetées sont supprimées du
    code : on ne garde pas de pistes mortes.

### Le rituel de chaque étape

```
Je prépare 2–3 variantes  →  je te montre  →  tu critiques (Garde / Jette / Change)
        ↑                                                  │
        └──────────── on ajuste si besoin ←────────────────┘
                                                           ↓
                              BAT → journal → commit → étape suivante
```

---

## 4. Moodboard annoté (premier jet)

> Les captures sont gardées **en local** dans `docs/atelier/references/` : le
> dossier est ignoré par git parce que le repo est public et que ces images
> viennent de sites tiers. Sur GitHub, les images ci-dessous n'apparaissent pas.

### Ta capture : le fond argile

![Fond argile](references/fond-argile.png)

- **Ce qu'on voit :** une terre sombre et rouge, avec un grain fin de pellicule et
  une **ombre diagonale douce**, comme la lumière d'une fenêtre. L'encre est
  presque blanche, le mot-symbole est en pixels, les liens sont petits et discrets.
- **Couleurs relevées :** zone éclairée `#49180B`, zone d'ombre `#2E0F07`,
  encre `#F9F8F7`.
- **Ce qu'on prend :** la matière (grain + lumière), le contraste encre/terre, le
  côté pixel du titre.
- **Précision :** l'argile n'est pas le fond, c'est l'**accent** (curseur,
  sélection, surbrillance). On l'a d'abord poussé vers le rouge-orangé, puis il
  est devenu le Cramoisi `#8E0F24` (journal n° 16). Le fond est clair, uni et
  granuleux.

### rachelchen.tech

![Rachel Chen](references/rachelchen.png)

- **Ce qu'on voit :** un fond papier blanc cassé avec un léger grain. Le nom est
  petit en haut à gauche. Une nav verticale à gauche signale l'élément actif par
  un petit carré orange. Le grand titre serif (Libre Baskerville, 64 px) dit qui
  elle est en une phrase. En dessous, des blocs « Currently / Previously » en
  étiquette grise + valeur. Les projets sont en grille de 2, avec la légende
  « Nom / Statut Année » sous chaque vignette.
- **Ce qu'on prend :** la phrase-titre qui te présente, les paires étiquette +
  valeur, la légende de projet très courte, l'accent unique (son orange
  `#E65F2E` est déjà presque notre argile).

### paulkalkbrenner.net

![Paul Kalkbrenner](references/paulkalkbrenner.png)

- **Ce qu'on voit :** du blanc et du noir purs, une seule famille de caractères
  (ABC Diatype, gras) déclinée de 9 à 150 px. Tout est accroché **aux quatre
  coins** : logo en haut à gauche, nav en haut à droite, « Now playing » en bas à
  gauche, accroche en bas au centre, « Sound OFF » en bas à droite. Au centre, le
  nom en très grand, avec une photo noir et blanc glissée entre les deux mots.
- **Ce qu'on prend :** la composition aux coins avec un centre vide, un seul
  moment énorme, une seule famille de caractères.

### clintonvanarnam.net

![Clinton Van Arnam](references/clintonvanarnam.png)

- **Ce qu'on voit :** presque tout le texte est à la même taille (~14 px). La
  hiérarchie vient de la **position et du gris**, pas de la taille. La bio est en
  haut à gauche. À droite, « Selected Work: » en gris, suivi de la liste des
  projets, puis « Filter: » et ses catégories. Le nom souligné en rouge est le
  seul accent. En bas, un mur de petites vignettes sert d'index visuel.
- **Ce qu'on prend :** l'index de projets en colonnes, le filtre par type, le mur
  de vignettes, la hiérarchie sans changer de taille.

### feralui.dev/gradients

![Feral UI — Sunrise](references/feralui-sunrise.webp)
![Feral UI — Snow crimson](references/feralui-snow-crimson.webp)
![Feral UI — Ocaso](references/feralui-ocaso.webp)

- **Ce qu'on voit :** des dégradés granuleux en arcs ou en bandes, avec des
  compositions de 4 à 8 couleurs : bleu nuit → lilas → rose → vermillon, glace →
  marine → cramoisi, nuit → cyan → blanc → saumon → violet. Le grain rend la
  couleur matérielle, comme du pigment.
- **Ce qu'on prend :** pas le fond, qui reste uni. On prend les compositions et
  le grain pour une **onde** qui traverse la page de temps en temps.

La palette Snow crimson est gardée en appoint (journal n° 23) :

![Feral UI — palette Snow crimson](references/feralui-palette-appoint.png)

### Ce qui relie ces quatre sites

1. **Un fond, une encre, un accent.** Pas plus.
2. **Une seule chose énorme** (un nom, une phrase), tout le reste petit.
3. **Les éléments s'accrochent aux bords et aux coins**, le centre respire.
4. **Étiquette grise + valeur**, comme l'étiquette d'un vêtement ou une fiche produit.
5. **Les projets forment un index ou un catalogue** (nom, année, type), pas des cartes bavardes.
6. **La matière remplace la décoration** : grain, lumière, photo.

### Ce qu'on a déjà sous la main

- **Departure Mono** (police pixel, dans le même esprit que le « d » de ta capture)
  et **Inter Variable** sont déjà dans `public/fonts`.
- **Contrainte technique :** la politique de sécurité du site (`vercel.json`,
  `font-src 'self'`) n'autorise que les polices hébergées chez nous. Pas de Google
  Fonts en lien direct : toute nouvelle police doit être téléchargée dans le repo,
  avec une licence qui le permet.

---

## 5. Le plan, étape par étape

| # | Étape | Ce que tu décides | Statut |
| --- | --- | --- | --- |
| 0 | Le brief | L'intention, le ton, la langue, les noms d'URL | Validé le 2026-11-05 |
| 1 | Le fond et l'accent | La couleur du fond clair, le grain, l'onde ; l'accent | Validé le 2026-11-05 |
| 2 | Les couleurs | La palette complète : encres, gris, états, contrastes | Validé le 2026-11-05 |
| 3 | La typo | Le couple de polices et l'échelle de tailles | — |
| 4 | Espaces et grille | Le rythme et les colonnes | — |
| 5 | Le chemin de fer | La composition de la Vitrine | — |
| 6 | Les composants | Chaque brique, une par une | — |
| 7 | Le contenu | Tes projets et tes textes | — |
| 8 | La Vitrine | La page assemblée | — |
| 9 | Mouvement et finitions | Survols, apparitions, mobile, accessibilité | — |
| 10 | Mise en ligne | Le lien depuis le bureau, le déploiement | — |

### Étape 0 — Le brief

Une conversation et aucun code. Je te pose ces questions :

- **Trois mots** que la page doit évoquer.
- **Pour qui** : recruteurs, clients, autres ingénieurs, studios ?
- **Ce qu'on doit retenir en 5 secondes.**
- **Ce que tu refuses** (anti-références).
- **La langue** de la Vitrine : français, anglais ou les deux.
- **Les noms** : `/atelier/` et `/portfolio/` te vont-ils ?

Livrable : la section « Brief » de ce document.

### Étape 1 — Le fond et l'accent

**Premier tour.** Trois fonds granuleux (Terre, Noir chaud, Papier) × trois accents
(Terre battue, Argile vive, Vermillon), avec ou sans ombre de fenêtre. Tu as gardé
le Vermillon. Tu veux un fond clair, sans lumière, avec un grain moins régulier
et une onde rare (journal n° 8 à 12).

**Deuxième tour : un établi de réglages, à la Feral UI.** Le panneau de gauche
pilote un grand aperçu en direct. Le texte témoin, la surbrillance et le curseur
cube y sont toujours présents.

- **Fond** : trois directions claires (Brume, Craie, Lin rosé). Les curseurs
  Teinte, Saturation et Clarté sont en OKLCH et **bornés** (saturation 0–0,03,
  clarté 88–98 %) : on peut ajuster sans sortir du « clair et uni ».
- **Grain** : points de deux tailles mélangés, réglables en intensité, taille et
  irrégularité.
- **Onde** : trois compositions (Aube, Neige vermillon, Crépuscule), réglables en
  intensité, fréquence et durée de traversée. Un bouton la lance tout de suite.
  Elle ne se déclenche pas si le système demande de réduire les animations.
- **« Copier mes réglages »** donne un résumé à me coller. Les réglages restent
  enregistrés dans ton navigateur.

**Troisième tour.** Tu as retenu tes réglages (journal n° 13). L'onde part
maintenant du coin haut droit, arrive intense et s'efface en traversant. L'établi
reste la première section de l'Atelier : « Retenu » y est un préréglage, et
« Réinitialiser » ramène à tes valeurs.

**Quatrième tour.** L'accent devient le Cramoisi `#8E0F24`. L'onde a maintenant
deux intensités : une arrivée forte quand la page s'ouvre, puis des passages
discrets. Elle entre tout de suite par le coin, reste forte le temps de balayer
le haut droit, puis s'efface. Les curseurs « Arrivée », « Suivantes » et
« Effacée à » règlent ça. Les boutons « Rejouer l'arrivée » et « Onde suivante »
les montrent sans attendre (`A` et `O` en plein écran).

Chaque section de l'Atelier porte un statut visible : *à décider*, *en test* ou
*validé le…*

### Étape 2 — Les couleurs

On complète la palette autour du fond et du Coquelicot : l'**encre** (titres,
texte courant), l'**encre douce** (étiquettes, dates, métadonnées) et le
**filet** (séparateurs). Une seule teinte pour toute la famille, et chaque rôle
a sa clarté.

- **Trois directions** : Noir (neutre, le coquelicot est la seule couleur), Brun
  (encre chaude) et Marine (le bleu nuit de l'onde, contraste froid et chaud).
- **Curseurs bornés** : Teinte, Saturation (0 à 0,05), puis la clarté de
  l'encre, de l'encre douce et du filet.
- Une **page témoin** sur le vrai fond, avec le grain et l'onde : nom,
  navigation, phrase-titre, étiquettes et index de projets. Les projets sont
  factices.
- Le **nuancier** a six cartes : fond, encre, encre douce, filet, accent, sur
  accent. Un clic copie l'hexa, et chaque contraste est vérifié avec son verdict
  (AA, grand texte seulement, visible, décoratif).

**Retenu.** Les encres Noir (journal n° 22). La palette d'appoint Snow crimson
est gardée en plus, dans un second groupe du nuancier (journal n° 23). Brun et
Marine restent dans l'établi pour comparer.

### Étape 3 — La typo

2 ou 3 couples testés sur un **vrai texte** (ton nom, une phrase, une ligne de
projet), par exemple pixel + sans-serif, ou sans-serif seule à la Kalkbrenner.
On fixe ensuite l'échelle : beaucoup de petites tailles pour l'information, une
seule très grande pour le moment fort.

### Étape 4 — Espaces et grille

Une échelle d'espacements (4, 8, 12, 16, 24, 32, 48, 64…) et une grille de
colonnes. Comme dans Figma, **la touche `G` affiche la grille** par-dessus
n'importe quelle page de l'Atelier ou de la Vitrine.

### Étape 5 — Le chemin de fer

La Vitrine en blocs gris, sans style. Trois compositions à comparer :

- **Quatre coins** (Kalkbrenner) : le nom au centre, les infos aux coins.
- **Colonnes** (Van Arnam) : la bio à gauche, l'index des projets à droite, les vignettes en bas.
- **Nav latérale** (Rachel Chen) : la nav à gauche, la phrase-titre, puis la grille de projets.

On peut aussi en mélanger deux.

### Étape 6 — Les composants

Un par un, chacun avec ses états :
lien, étiquette + valeur, navigation, ligne de projet (index), vignette de
projet, tag/filtre, **et tes propres composants** quand tu les apportes.

### Étape 7 — Le contenu

Une interview projet par projet : ce que c'était, ton rôle, l'impact, ce qui a
bloqué, ce que tu as appris. Tu écris ou tu valides chaque texte.

### Étape 8 — La Vitrine

On assemble `/portfolio/` avec uniquement les pièces validées. Si quelque chose
manque, on revient d'abord dans l'Atelier.

### Étape 9 — Mouvement et finitions

Survols, apparitions, éventuellement un grain qui vit. On passe ensuite au mobile,
au clavier, aux contrastes et à `prefers-reduced-motion`.

### Étape 10 — Mise en ligne

On ajoute le lien depuis le bureau, on vérifie le build et la sécurité (CSP), et
on déploie. On décide aussi si l'Atelier reste public : montrer son process est
un bon argument dans un portfolio.

---

## 6. Journal des décisions

| # | Date | Décision | Pourquoi | Étape |
| --- | --- | --- | --- | --- |
| 1 | 2026-11-05 | Couleur principale = **accent** argile / terre battue, rouge-orangé plutôt que brun : curseur (petit cube), sélection, surbrillance. Ce n'est pas la couleur du fond. | Précisé par toi après la première version de l'étape 1 | 1 |
| 2 | 2026-11-05 | Références : rachelchen.tech, paulkalkbrenner.net, clintonvanarnam.net | Sites que tu aimes, pour leur côté épuré mode et design | — |
| 3 | 2026-11-05 | Brief validé (section 7) | Tes réponses à l'étape 0 | 0 |
| 4 | 2026-11-05 | URL : `/atelier/` et `/portfolio/` | Validé à l'étape 0 | 0 |
| 5 | 2026-11-05 | Vitrine bilingue FR/EN, Atelier en français | Recruteurs et clients des deux langues | 0 |
| 6 | 2026-11-05 | Le fond est granuleux | « Il faut une couleur avec du grain pour le fond » | 1 |
| 7 | 2026-11-05 | Le curseur est un petit cube couleur accent | Ton idée. Sa forme exacte se règle à l'étape 6. | 1 |
| 8 | 2026-11-05 | Accent : **Vermillon `#EA3F1C`** | Ton choix parmi Terre battue, Argile vive et Vermillon | 1 |
| 9 | 2026-11-05 | Le fond est **clair et uni** (ni Terre, ni Noir chaud). Papier ne convainc pas. | Ta préférence | 1 |
| 10 | 2026-11-05 | Pas d'ombre de fenêtre | Jeté | 1 |
| 11 | 2026-11-05 | Une **onde** de couleur traverse la page en diagonale, rarement et de façon organique, pour montrer que le fond vit. Ses couleurs s'inspirent de Feral UI. | Ta demande | 1 |
| 12 | 2026-11-05 | Le grain doit être moins régulier : nouvelle recette à points de deux tailles | Ta critique du premier grain | 1 |
| 13 | 2026-11-05 | **Réglages retenus** : fond `oklch(0.980 0.004 122)` · `#F8F9F6` ; grain 5 %, taille 75 %, irrégularité 75 % ; onde Neige vermillon, 55 %, environ toutes les 30 s, traversée 11 s. Source de vérité : `src/atelier/fondTokens.ts`. | Tes réglages, copiés depuis l'établi | 1 |
| 14 | 2026-11-05 | L'onde part du **coin haut droit** vers le bas à gauche. Elle est intense à l'arrivée et s'efface en traversant (environ 25 % de son intensité aux quatre cinquièmes du trajet). | Ta demande | 1 |
| 15 | 2026-11-05 | L'établi de l'étape 1 **reste dans l'Atelier**. Les étapes suivantes s'ajoutent en dessous, sans le remplacer. | « Garde cette page, elle est cool » | 1 |
| 16 | 2026-11-05 | Accent : **Cramoisi `#8E0F24`**, le rouge de la composition Neige vermillon. Il remplace le Vermillon (n° 8). Contraste 8,9:1 sur le fond, et 9,4:1 pour le texte blanc sélectionné. | « Remplace le orange par le rouge du Neige vermillon » | 1 |
| 17 | 2026-11-05 | La **première onde**, à l'ouverture de la page (après 1,2 s), est forte (75 %) et s'efface vite (effacée à 55 % du trajet). Les **suivantes**, environ toutes les 30 s, passent à 20 %. | Ta demande | 1 |
| 18 | 2026-11-05 | L'accent est **de nouveau à l'essai**. Un menu propose six teintes, du plus sombre à l'orange : Cramoisi `#8E0F24`, Carmin `#B0172F`, Cerise `#C81E32`, Rouge vif `#D7262B`, Coquelicot `#E0301F`, Vermillon `#EA3F1C`. Le contraste s'affiche en direct. | « L'orange d'avant était peut-être mieux, ou un rouge plus clair : laisse-moi choisir » | 1 |
| 19 | 2026-11-05 | Accent validé : **Coquelicot `#E0301F`**. Contraste 4,3:1 sur le fond : le cube et la surbrillance sont bien visibles, mais il ne faut pas l'utiliser pour du petit texte. Le texte blanc sélectionné est à 4,6:1 (AA). Source : `src/atelier/tokens.ts` et `tokens.css`. | Ton choix dans le menu | 1 |
| 20 | 2026-11-05 | **Étape 1 validée** (BAT) | « On valide, on passe à l'étape deux » | 1 |
| 21 | 2026-11-05 | L'Atelier s'ouvre sur **la charte** (brief et décisions validées), puis une **barre d'étapes**. Chaque étape garde son établi, à son adresse (`/atelier/#etape-1`, `#etape-2`…). | « Je veux pouvoir revenir à l'étape 1 sans tout perdre, avec en haut tout ce qu'on a validé » | 2 |
| 22 | 2026-11-05 | Encres validées, direction **Noir** : encre `#161614` (17,1:1), encre douce `#636361` (5,7:1), filet `#DEDEDD`. Source : `INKS` dans `src/atelier/tokens.ts` et `--ink`, `--ink-soft`, `--line` dans `tokens.css`. | « L'encre noire, on peut la garder » | 2 |
| 23 | 2026-11-05 | **Palette d'appoint** gardée en plus, d'après Snow crimson (Feral UI) : Moonwash Blue `#DBEAF4`, Misted Sky `#E5EDF3`, Moonwash Blue `#CADCE4`, Deep Hanada `#354050`, Orchid Grey `#392932`, Smoked Beni `#7F1727` et `#8E0A1F`. Les clairs servent de surfaces sous l'encre, les profonds de texte ou de blocs. Les rôles se décident à l'étape 6. | « Je veux quand même garder ces couleurs en plus » | 2 |
| 24 | 2026-11-05 | L'onde Neige vermillon reprend les valeurs exactes de Snow crimson : Moonwash Blue `#DBEAF4`, Deep Hanada `#354050`, Smoked Beni `#8E0A1F`. Le vermillon reste en bord d'attaque. | Ton « vas-y » | 2 |
| 25 | 2026-11-05 | **Étape 2 validée** (BAT) | « On continue, vas-y » | 2 |

---

## 7. Brief

*Validé le 2026-11-05 (étape 0).*

| Question | Réponse |
| --- | --- |
| **Trois mots** | AI engineer · du prototype à la production · expérimentation |
| **Pour qui** | Les recruteurs avant tout, des clients ensuite |
| **En 5 secondes** | Ce que je sais faire en IA, surtout les dernières technologies mises en service, avec une vraie adoption grâce à l'UI/UX |
| **On refuse** | Le fouillis, les idées en vrac. La page doit être construite. |
| **Langues** | La Vitrine en français et en anglais. L'Atelier reste en français (outil interne). |
| **URL** | `/atelier/` et `/portfolio/` |

### Ce que le brief implique (pistes, pas encore des décisions)

- **« Construit »** : une grille stricte, des alignements nets et un index de
  projets. Le brief penche vers la rigueur de Van Arnam et de Kalkbrenner plutôt
  que vers le collage.
- **« Du prototype à la production »** peut devenir l'axe de lecture des projets.
  Chaque projet afficherait son stade (prototype, pilote, en production),
  comme les statuts « Concept / Shipped » de Rachel Chen. À trancher aux étapes 6
  et 7.
- **« Adoption »** : chaque projet devrait pouvoir montrer une preuve d'usage
  (utilisateurs, équipes, chiffres). À creuser pendant l'interview de l'étape 7.
- **Recruteurs d'abord** : en 5 secondes, on doit voir ton rôle, ta spécialité et
  un accès direct au CV et au contact.
