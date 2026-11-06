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
| 3 | La typo | Le couple de polices et l'échelle de tailles | Validé le 2026-11-05 |
| 4 | Espaces et grille | Le rythme et les colonnes | Validé le 2026-11-06 |
| 5 | Le chemin de fer | La composition de la Vitrine | Validé le 2026-11-06 |
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

**Premier tour.** Trois directions sur la page témoin, avec le fond, les encres
et l'accent validés :

- **Pixel** : Departure Mono pour le titre et les étiquettes, Inter pour le
  texte. Le côté machine du « d » de la première capture. La taille saute de
  11 px en 11 px, la grille de la police.
- **Grotesque** : Inter seule, grasse et serrée pour le titre. Kalkbrenner.
- **Éditoriale** : Instrument Serif pour la phrase-titre, Inter pour
  l'information. Rachel Chen.

Les curseurs règlent la taille du moment fort (56 à 160 px), l'interlettrage, la
graisse (Inter seulement), la taille du texte (13 à 18 px) et l'écart entre les
tailles (×1,125 à ×1,5). Un interrupteur passe les étiquettes en capitales ou
en minuscules. Une **planche d'échelle** montre chaque taille sur les couleurs
de la page.

Instrument Serif (licence OFL 1.1) est ajoutée dans `public/fonts` avec sa
licence, parce que la politique de sécurité n'autorise que des polices locales.
Elle sera retirée si l'Éditoriale n'est pas retenue.

**Deuxième tour.** Ton réglage (Éditoriale : Instrument Serif à 58 px, texte
Inter à 13 px, écart ×1,25, étiquettes en minuscules) devient la composition de
départ. Les curseurs descendent plus bas : 24 px pour le moment fort, 11 px pour
le texte. Chaque rôle (titre, texte, étiquettes) peut prendre n'importe quelle
police :

- une **typothèque** de 54 polices libres (licence OFL), classées en gluant (9),
  pixel (11), éditorial (11), innovant (11) et institutionnel (12). Chacune a une
  note, ses axes variables et trois boutons pour lui donner un rôle. Un texte
  d'essai modifiable sert d'échantillon ;
- les polices sont téléchargées depuis les paquets npm de Fontsource : un seul
  woff2 par famille (sous-ensemble latin, tous les axes quand c'est possible),
  avec sa licence dans `src/atelier/fonts/licenses/`. Elles ne se chargent que
  quand leur carte approche de l'écran ;
- quand le choix sera fait, on retire les polices non retenues du repo.

**Troisième tour.** Le panneau est rangé par rôle : Titre, Texte, Étiquettes.
Chacun a sa police et sa taille. Les étiquettes ne se déduisent plus du texte
(9 à 16 px) ; l'écart, renommé « Sous-titres », ne règle plus que les titres
intermédiaires de l'échelle. La typothèque passe à 55 polices avec **Glass TTY
VT220**, les lettres du terminal DEC VT220 (domaine public, 6 Ko, sans
apostrophe typographique). Une composition **Terminal** la met en titre et en
étiquettes, avec Inter pour le texte.

**Quatrième tour.** Ta photo « Frieden » montre une serif de titrage à fort
contraste, avec des déliés qui se croisent : sans doute un lettrage dessiné ou
une police payante. Parmi une vingtaine de serifs libres comparées, **Playfair**
(OFL, graisse et largeur variables) s'en approche le plus à 500, resserrée à
87,5 %. La composition **Frieden** la met en titre, avec Inter, plus simple,
pour le texte et les étiquettes. Le titre gagne un curseur de largeur quand sa
police en a l'axe. **Cinzel Decorative** (OFL), plus large et moins
contrastée mais avec des déliés qui débordent, rejoint ensuite la typothèque
comme autre piste.

Un essai de **relief** enfonce les valeurs sous les étiquettes (« AI engineer »
sous « Rôle ») dans le fond : **Incrusté** (lettres grises cernées de sombre,
le bord du haut dans l'ombre) ou **À sec** (gaufrage sans encre, moins lisible),
avec une profondeur réglable. Sur un fond aussi clair, le liseré blanc se voit
à peine : c'est le bord sombre qui fait le creux.

**Retenu.** Instrument Serif à 72 px pour le titre (interlettrage 0,010 em,
ajusté le 6 novembre ; 58 px et 0 au départ), Inter à
13 px pour le texte, Inter à 10,5 px en minuscules pour les étiquettes,
sous-titres par paliers de ×1,25 (16,5 · 20,5 · 25,5 px), valeurs à plat. Les
tailles valent pour une page de 1440 px. Elles sont dans `tokens.css` et `TYPO`
(`tokens.ts`). La typothèque reste dans l'Atelier pour y revenir plus tard.

### Étape 4 — Espaces et grille

Une échelle d'espacements (4, 8, 12, 16, 24, 32, 48, 64…) et une grille de
colonnes. Comme dans Figma, **la touche `G` affiche la grille** par-dessus
n'importe quelle page de l'Atelier ou de la Vitrine.

**Premier tour.** La page témoin se pose sur la grille : le titre couvre deux
tiers des colonnes, chaque info un quart, et l'index range le numéro, le nom,
l'étape et l'année dans des colonnes. Ses écarts viennent de l'échelle
d'espacements. Trois compositions :

- **Régulière** : unité de 8 px en multiples (8 · 16 · 24 · 32 · 48 · 64 · 96 ·
  128), 12 colonnes, gouttière 24 px, marges 72 px. Proche de la page témoin
  actuelle ;
- **Ample** : unité de 8 px en nombre d'or (8 · 16 · 24 · 40 · 64 · 104 · 168 ·
  272), 12 colonnes, gouttière 32 px, marges 128 px. La page respire, comme les
  boutiques de mode ;
- **Serrée** : unité de 4 px en multiples, 16 colonnes, gouttière 16 px, marges
  40 px. Un index dense, à la Van Arnam.

Les curseurs règlent l'unité (4 à 12 px), la progression, le nombre de colonnes
(6, 8, 12 ou 16), la gouttière et les marges. Les colonnes s'affichent en
accent à 10 %, comme dans Figma ; `G` les masque. La grille mobile viendra avec
le chemin de fer.

**Retenu.** Une unité de 4 px en multiples (4 · 8 · 12 · 16 · 24 · 32 · 48 ·
64), 16 colonnes de 73 px, gouttières et marges de 16 px : la page va presque
d'un bord à l'autre. Les valeurs sont dans `tokens.css` et `ESPACES`
(`tokens.ts`). La disposition du texte et des éléments se retravaille à
l'étape 5.

### Étape 5 — Le chemin de fer

La Vitrine en blocs gris, sans style. Trois compositions à comparer :

- **Quatre coins** (Kalkbrenner) : le nom au centre, les infos aux coins.
- **Colonnes** (Van Arnam) : la bio à gauche, l'index des projets à droite, les vignettes en bas.
- **Nav latérale** (Rachel Chen) : la nav à gauche, la phrase-titre, puis la grille de projets.

On peut aussi en mélanger deux.

**Premier tour.** Plutôt que des blocs gris seuls, chaque composition montre le
premier écran (1440 × 900) avec la grille, la typo et les couleurs validées, et
un texte provisoire. Le bouton **Blocs** remplace chaque mot par un pavé gris de
la même taille, pour ne juger que la place ; `G` affiche les 16 colonnes.

- **Quatre coins** : la phrase-titre seule au milieu, sur 10 colonnes ; le nom,
  la nav, les infos et le contact dans les coins ; les projets en faisant
  défiler.
- **Colonnes** : la phrase-titre, la bio et les infos sur 7 colonnes à gauche,
  l'index des projets sur 8 colonnes à droite, les visuels en bas qui
  continuent sous l'écran.
- **Nav latérale** : le nom, la nav et le contact sur 3 colonnes à gauche ; la
  phrase-titre, la bio et les infos sur 12 colonnes, puis trois cartes de
  projets avec leur visuel.

**Deuxième tour : les classiques.** Quatre mises en page qui ont fait leurs
preuves depuis longtemps dans la mode, l'architecture et le design, à tordre
ensuite d'une façon nouvelle :

- **Couverture** (magazine de mode : Vogue, The Gentlewoman) : ton nom en
  manchette sur toute la largeur (2,6 fois le titre), le numéro et la date
  entre deux filets, les projets en titres de une autour d'une grande image.
  Twist possible : l'image passe devant le nom, comme le mannequin devant le
  titre ;
- **Lookbook** (maison de mode : The Row, Jil Sander) : le nom discret au
  centre, les projets en silhouettes numérotées (Look 01…) sur une colonne sur
  quatre, beaucoup de vide. Twist possible : chaque look s'ouvre sur une fiche,
  comme l'étiquette d'un vêtement ;
- **Agence** (cabinet d'architectes : Chipperfield, Herzog & de Meuron) : une
  image, la phrase, les projets en fiche technique (programme, équipe, statut,
  année). Twist possible : chaque projet raconté comme un bâtiment livré ;
- **Affiche suisse** (Müller-Brockmann, Vignelli) : quatre colonnes d'infos sous
  un filet, la phrase deux fois plus grande, les projets en gros chiffres.
  Twist possible : la rigueur suisse, mais en serif, avec l'onde.

La manchette et l'affiche dépassent la taille de titre validée : si l'une est
retenue, on ajoutera cette taille à l'échelle.

**Tes préférées, pour l'instant :** Colonnes, Nav latérale, Agence et Affiche
suisse. Quatre coins, Couverture et Lookbook passent dans « Mises de côté ».

**Troisième tour**, dans la même veine construite (colonnes, index, filets) :

- **Journal** (quotidien grand format : FT Weekend, Le Monde) : le nom en titre
  de journal entre un filet et un double filet, la phrase en manchette, les
  infos en encadré, les projets en articles sur quatre colonnes séparées de
  filets. Twist possible : un journal qui ne parle que de toi, daté du jour ;
- **Cartel** (galerie : White Cube, Fondation Cartier) : une œuvre à la fois et
  son cartel de musée (titre en italique, année, médium, statut). Twist
  possible : le médium, ce sont les modèles et le code ;
- **Plan** (dessin d'architecte) : les 16 colonnes nommées de A à P et tracées
  sur la page, les projets en nomenclature, un cartouche (projet, auteur,
  échelle, date, planche). Twist possible : la grille devient le décor ;
- **Manuel** (normes graphiques : Vignelli, NASA 1975) : un en-tête courant, un
  sommaire numéroté, la section 1.0 avec la phrase, les projets en
  sous-sections 2.1 à 2.4, un folio. Twist possible : le portfolio lu comme le
  mode d'emploi de ton travail.

**Variantes de Colonnes, Nav latérale et Agence.** Le panneau range désormais
les compositions par famille (Colonnes, Nav latérale, Agence, Autres pistes,
Mises de côté), chaque famille avec sa version classique et deux variantes :

- **Colonnes · index d'abord** : l'index à gauche, une vignette et un grand
  titre serif par projet ; qui tu es à droite, en plus petit ;
- **Colonnes · trois colonnes** : la phrase en haut, puis Qui, Projets et
  Contact, chacune sous un filet ;
- **Nav latérale · liste** : les projets en grands titres serif, un par ligne ;
- **Nav latérale · à droite** : la colonne du nom et de la nav ferme la page à
  droite ;
- **Agence · plein cadre** : une grande image sur toute la largeur, la phrase
  posée dessus, la fiche technique en dessous ;
- **Agence · index seul** : la phrase, un petit aperçu du projet survolé, la
  fiche technique sur toute la largeur.

**Retenu : Nav latérale à droite.** Le contenu part du bord gauche sur 12
colonnes : la phrase-titre, la bio sur 5 colonnes, les trois infos sur 4
colonnes chacune, puis les projets en cartes de 4 colonnes avec leur visuel.
Le nom, la nav (avec FR · EN) et le contact ferment la page à droite, sur les
colonnes 14 à 16, alignés à droite. Les dix-sept pistes explorées restent dans
l'historique Git (commit `0022543`) et sont retirées du code. La version
téléphone et un éventuel twist restent à faire.

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
| 26 | 2026-11-05 | Étape 3 ouverte : trois directions (Pixel, Grotesque, Éditoriale). Instrument Serif est ajoutée comme candidate. | Plan | 3 |
| 27 | 2026-11-05 | Typo de départ : **Éditoriale réglée par toi**. Instrument Serif à 58 px, texte Inter à 13 px, écart ×1,25, interlettrage 0, étiquettes en minuscules. À explorer plus petit, et parmi une typothèque élargie. | Tes réglages copiés | 3 |
| 28 | 2026-11-05 | Chaque rôle a sa propre taille : le texte (11 à 20 px) et les étiquettes (9 à 16 px) se règlent comme le titre. | « On ne peut pas changer la taille des autres polices à part le titre » | 3 |
| 29 | 2026-11-05 | **Glass TTY VT220** (DEC VT220, domaine public) entre dans la typothèque, avec une composition Terminal. | « DEC VT100 / VT220, propose-la » | 3 |
| 30 | 2026-11-05 | **Playfair** entre dans la typothèque, comme la serif libre la plus proche de « Frieden ». Composition Frieden : Playfair 500 à 87,5 % en titre, Inter pour le reste. | « Celle-là en main et les autres un truc plus simple » | 3 |
| 31 | 2026-11-05 | Essai de relief sur les valeurs sous les étiquettes : Incrusté ou À sec, profondeur réglable. | « Enfoncé dans le fond, avec des contours sombres » | 3 |
| 32 | 2026-11-05 | **Étape 3 validée** (BAT) : Instrument Serif 58 px en titre, Inter 13 px en texte, Inter 10,5 px en minuscules pour les étiquettes, sous-titres ×1,25, valeurs à plat. La typothèque est gardée pour y revenir. | « On part sur ça, vas-y, je verrai plus tard » | 3 |
| 33 | 2026-11-05 | Étape 4 ouverte : trois compositions d'espaces et de grille (Régulière, Ample, Serrée), touche `G`. | Ton « vas-y » | 4 |
| 34 | 2026-11-06 | **Cinzel Decorative** (OFL) entre dans la typothèque : capitales romaines aux déliés qui débordent, l'autre piste « Frieden ». Les menus déroulants de l'Atelier passent en fond sombre, lisibles. | « Rajoute-la » · « on voit rien » | 3 |
| 35 | 2026-11-06 | Titre ajusté : Instrument Serif à **72 px**, interlettrage 0,010 em. Le reste de la typo ne change pas. | Tes réglages copiés | 3 |
| 36 | 2026-11-06 | **Étape 4 validée** (BAT) : unité de 4 px en multiples, 16 colonnes de 73 px, gouttières et marges de 16 px. | « Je crois que j'aime bien ça » | 4 |
| 37 | 2026-11-06 | Étape 5 ouverte : trois placements du premier écran (Quatre coins, Colonnes, Nav latérale), vus en texte ou en blocs. | « La disposition du texte et des éléments, on peut la retravailler » | 5 |
| 38 | 2026-11-06 | Deuxième tour du chemin de fer : quatre classiques (Couverture, Lookbook, Agence, Affiche suisse), chacun avec une piste de twist. | « D'autres propositions comme les magazines de mode, les cabinets d'architectes, de designers » | 5 |
| 39 | 2026-11-06 | Préférées pour l'instant : Colonnes, Nav latérale, Agence, Affiche suisse. Troisième tour : Journal, Cartel, Plan, Manuel. Quatre coins, Couverture et Lookbook mis de côté. | « Encore d'autres à me proposer » | 5 |
| 40 | 2026-11-06 | Deux variantes chacune pour Colonnes (index d'abord, trois colonnes), Nav latérale (liste, à droite) et Agence (plein cadre, index seul). Panneau rangé par famille. | « Propose des variantes de Colonnes, Nav latérale et Agence » | 5 |
| 41 | 2026-11-06 | **Étape 5 validée** (BAT) : nav latérale à droite. Les autres pistes sont retirées du code et gardées dans l'historique (`0022543`). | « Nav latérale à droite, j'aime bien, on part là-dessus » | 5 |

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
