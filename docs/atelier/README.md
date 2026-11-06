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
| 6 | Les composants | Chaque brique, une par une | Validé le 2026-11-06 |
| 7 | Le contenu | Tes projets et tes textes | En cours |
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

**Revu à l'étape 7 (journal n° 75)** : le texte et les étiquettes passent à
**15 px**, comme chez Rachel Chen. Les tailles d'origine (13 et 10,5 px) avaient
été jugées dans l'Atelier, qui agrandissait la page pour remplir la fenêtre
(×1,33 sur un écran de 1920 px). Le plein écran s'ouvre maintenant en taille
réelle.

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

**Version téléphone, premier tour.** Un écran de 390 × 844 sur une grille de 4
colonnes (gouttières et marges de 16 px, la même unité de 4 px). La typo descend
pour le petit écran, en proposition : titre 40 px, texte 14 px, étiquettes
11 px (le titre passe ensuite à 68 px et traverse la tranche : journal n° 50 à 53). Trois façons de replier la colonne de droite, vues menu fermé ou ouvert :

- **Barre en haut** : le nom à gauche, « Menu » à droite ; le menu ouvre la
  colonne de droite en plein écran, alignée à droite, la nav en serif ;
- **Barre en bas** : le nom reste en haut à droite, la nav et FR · EN passent
  dans une barre en bas, sous le pouce ; rien à ouvrir ;
- **Tranche à droite** : la colonne se replie en une tranche fine le long du
  bord droit, le nom écrit à la verticale, et s'ouvre en panneau sur 82 % de la
  largeur.

**Téléphone, retenu : la tranche à droite**, avec un twist : les images des
projets passent par-dessus la tranche jusqu'au bord de l'écran, ce qui casse sa
ligne ; le nom et « Menu » restent lisibles au-dessus. Barre en haut et barre
en bas sont retirées du code.

**Le contenu de l'en-tête, premier jet.** La bio et les infos Rôle, Approche,
Langues répétaient la phrase-titre : elles disparaissent. Comme sur la page de
Rachel Chen, l'en-tête ne garde que trois blocs, tirés de ton CV :

- **Actuellement** : Mikky, un compagnon de bureau pour piloter ses agents de
  code ; recherche @ UCL, imagerie médicale 3D ;
- **Précédemment** : ingénieur IA @ SNCF (SNCF GPT, synthèse de réunions) ;
  ingénieur IA @ Renault / Alpine ;
- **Formation** : UTC, ingénieur en informatique, 2022 – 2026 ; Shanghai
  University, semestre en IA, 2024 – 2025.

Les cartes montrent de vrais projets : SNCF GPT (SNCF, 2023), Synthèse de
réunions (SNCF, 2025), Whiteboard AMDEC (Renault / Alpine, 2025). Les mots
définitifs s'écrivent avec toi à l'étape 7.

**Tes corrections** : Actuellement devient « Étudiant » ; Précédemment,
« Ingénieur IA @ SNCF » (sans détail, journal n° 46) puis « Ingénieur IA @
Renault / Alpine » ; Formation, « UTC, 2022 – 2026 » et
« Shanghai University, 2024 – 2025 ».

### Étape 6 — Les composants

Un par un, chacun avec ses états :
lien, étiquette + valeur, navigation, ligne de projet (index), vignette de
projet, tag/filtre, **et tes propres composants** quand tu les apportes.

**Retenu** (validé le 2026-11-06) :

- **Le curseur** : un seul élément accent qui se déforme (clip-path entre trois
  polygones, 0,42 s, léger rebond). Cube au repos **et sur la nav** ; **barre
  fine** sur le texte (2,5 px, 20 px de haut au plus) ; **petite pointe
  d'agent** (10 × 14 px, comme un curseur de collaboration) sur un projet ou un
  lien, avec « Voir le projet » en petit à côté d'une carte. Pas de curseur sur
  téléphone ;
- **Le lien @** : filet clair qui passe à l'accent au survol ; pas de main
  du système, seulement la pointe ;
- **La nav** : au survol, un soulignement accent de 1 px, comme les liens @ ;
  la page en cours garde son carré accent ;
- **Le menu sur téléphone** : **Glisse**, le panneau arrive du bord droit en
  0,5 s et repart de même ;
- **Les projets** : les cartels de l'étape 5 (*titre* · organisation, année).

Écartés : Déplie, Fondu, Échelle, Glisse courte et Volet pour le menu ; Équerre
et Cube pour la forme sur un projet. Pas de ligne d'index ni de tag/filtre : la
composition retenue n'en a pas besoin pour trois projets. Tu n'as pas de
composant à toi pour l'instant.

La palette d'appoint (journal n° 23) n'a servi à aucun composant : ses rôles se
décident en assemblant la Vitrine, à l'étape 8.

### Étape 7 — Le contenu

Une interview projet par projet : ce que c'était, ton rôle, l'impact, ce qui a
bloqué, ce que tu as appris. Tu écris ou tu valides chaque texte.

**Ta direction** : chaque page projet raconte comment le projet s'est construit,
comme la page OpenAI de Rachel Chen (titres en phrases, cartel, décisions
numérotées, leçons à la première personne). Elle tourne autour de trois questions :
ce que j'ai mis en place, comment j'ai travaillé, ce que ça m'a apporté.

Les brouillons vivent dans `docs/atelier/contenu/`, un fichier par projet, d'abord
en français. On ne commite un texte qu'une fois validé, sans nom de collègue, sans
nom interne et sans capture d'application interne. Les sources privées, comme ton
rapport de stage, restent hors du dépôt.

- **SNCF GPT** (`01-sncf-gpt.md`) : texte français validé, tiré du rapport de stage TN09
  et calé partie par partie sur la page de Rachel. On montre d'abord le produit
  (la solution, puis ce que voit le support), puis la construction : l'écoute et
  la lecture, les options explorées, le prototype et ses tests, les décisions, la
  mise en production. Viennent ensuite les résultats et les leçons. Il reprend tes
  points : la CI/CD, les papiers de recherche, l'écoute des équipes DevOps.

**Les miniatures.** Pour SNCF GPT, ton schéma de l'architecture déployée
(rapport, fig. 9.5) est redessiné en plan de voies, comme un dessin technique
ferroviaire :

- en haut, la voie de la résolution : l'agent, le modèle, l'app, les
  utilisateurs ;
- à gauche, le faisceau des outils de l'agent ;
- en bas, la voie de l'ingestion ;
- le cube accent marque l'agent, à l'aiguillage où toutes les voies se
  rejoignent ;
- une cote donne la durée du stage, et un cartouche porte le titre en italique.

**Retenue : l'alu irisé.** De l'aluminium brossé, le dessin gravé dedans, les
couleurs de l'onde reflétées comme sur un métal anodisé. La lumière suit la
souris, dans la Vitrine aussi. Le plan détaillé, trop fin pour une carte, a
ensuite été retiré de la page projet (journal n° 82).

**Retenu : l'aiguillage**, redessiné comme une planche d'ingénierie de la voie,
en micrographie, puis épuré :

- **la voie** : des rails en double filet, de longues traverses sous l'appareil,
  les aiguilles, les deux cœurs et leurs contre-rails, les axes en trait mixte ;
  les cotes d'écartement (1 435) et d'angle ; les quatre destinations. Le cube
  accent est l'agent ;
- **le titre** et la référence du dossier, sans autre information ;
- **des marquages** comme au coin d'une vitre de voiture : un logo « Atelier
  A.T. » et des tampons ronds (A7, cycle, RAG, CI/CD, FR).

(La planche entière, avec son cadre à zones, son chaînage et ses codes, a été
remplacée par la vue de détail : journal n° 69 et 71.)

Sur une carte, la planche est une texture qui donne envie de cliquer ; en gros
plan, tout se lit. La géométrie (rails, traverses, cœurs) est calculée dans
`src/atelier/voies.ts`, le dessin dans `Aiguillage.tsx`.

**Sur téléphone, retenu : la vue de détail.** L'aiguillage est agrandi dans un
cercle bordé de micro-texte. « SNCF GPT » est en haut, à la taille des
étiquettes ; la référence et les tampons sont sous le cercle. Planche et
Rallongée sont retirées. La bande de la tranche passe sous les images, mais ton
nom et « Menu » restent dessus. Ils prennent le fond accent, comme un survol,
mais seulement sur la partie qu'une image recouvre : le bord orange suit
exactement le bord de l'image pendant le défilement.

**Sur ordinateur aussi, la vue de détail** remplace la planche entière. Elle
est agrandie pour la carte en paysage : le cercle à gauche, « *SNCF GPT* » en
grand en haut à gauche (serif italique, comme les cartels), la référence en bas
à gauche et les tampons en bas à droite.

**La grille des projets change** : deux projets par rangée sur 6 colonnes
chacun, soit la largeur des trois cartes d'avant. Le troisième vient sous le
deuxième, en diagonale. La page défile, et la nav reste en place à droite ; sur
téléphone, la tranche aussi.

Le tout se trouve dans `src/atelier/Miniature.tsx`.

**La page projet** (`src/atelier/Projet.tsx`, textes dans `projets.ts`) est
construite comme celle de Rachel Chen :

- **en tête** : le titre, l'accroche, **les trois chiffres clés** (les résultats
  d'abord), le cartel et la miniature. La partie Résultats, à la fin, garde le
  reste sans répéter les chiffres ;
- **dix parties** : un filet, un numéro, un titre en phrase, puis les blocs (texte,
  colonnes, cartes, décisions, question, compromis, chiffres clés) ;
- **la lecture au milieu** : le texte sur 6 colonnes (6 à 11 sur 16), les images,
  colonnes et chiffres sur 8 (5 à 12), la miniature sur 10 ;
- **en haut à gauche, le retour** : « ← Projets / SNCF GPT » ramène à la Vitrine.
  La flèche est la pointe d'agent du curseur (étape 6), redessinée droite :
  la même tête à encoche, symétrique et pointée vers la gauche, en accent ; elle
  recule un peu au survol. Dans l'Atelier, la carte SNCF GPT
  rouvre la page ;
- **à gauche, le sommaire**, à 240 px du haut comme chez Rachel : il suit la
  lecture, et chaque ligne mène à sa partie. À droite restent le nom, la nav et
  le contact ;
- **le fond sans l'onde**, qui gênait la lecture (`FOND_LECTURE`) ;
- **les tailles** : texte à 15 px, titres de partie à 29 px, chiffres à 58 px ;
- **les schémas** (`src/atelier/Schemas.tsx`) : techniques et à plat, sans
  aluminium, pour qui veut comprendre. Traits à l'encre, typo de la page, accent
  sur le chemin qui compte. Tirés du rapport de stage : le parcours d'un ticket,
  l'écran de l'assistant (et ses quatre recadrages dans les cartes), la carte des
  pistes, les sources, la recherche hybride, la lecture des PDF, l'agent ReAct,
  le pipeline CI/CD. Le plan d'architecture en voies est retiré. Les flèches
  reprennent la pointe du curseur, dessinée droite comme celle du retour, et
  gardent la même taille quel que soit le trait ;
- **les marques** (`src/atelier/logos.ts`) : le logo SNCF dans la ligne du
  titre, à la hauteur des capitales ; des pastilles de marque sur les boîtes
  des schémas.
- **sur téléphone** (`ProjetMobile`) : le cadre de la Vitrine, avec la tranche
  à droite et « Menu ». Le retour reste fixé en haut à gauche, sur une pastille
  papier légère, un peu transparente et floutée. La lecture se fait sur une
  colonne. Les
  chiffres et le cartel sont empilés, les cartes deux par deux, la miniature en
  portrait. Les schémas gardent une taille lisible, s'ouvrent centrés et glissent
  des deux côtés. Comme
  les images de l'accueil, la miniature et les schémas passent par-dessus la
  tranche, et ton nom et « Menu » s'allument en accent là où ils passent dessous.
  « Menu » ouvre le sommaire au-dessus de la nav ;
- **Whiteboard AMDEC**, deuxième projet de la Vitrine (texte dans
  `docs/atelier/contenu/02-whiteboard-amdec.md`). Sa page suit le même modèle
  que SNCF GPT, avec le logo Renault (à l'encre) dans le titre et neuf parties.
  La miniature a été faite à part, avec un autre agent ; en attendant, son
  emplacement est gris. Huit schémas à plat :
  - la grille AMDEC dans Excel ;
  - l'écran du tableau blanc, avec ses quatre recadrages pour les cartes ;
  - la pile déployée, des 8 A100 au tableau ;
  - la boucle de créativité ;
  - le graphe des agents ;
  - le nuage d'idées dans l'espace des embeddings ;
  - les chemins RAG et CAG ;
  - les outils des agents sur le tableau.

  Dans l'Atelier, un bouton choisit la page affichée, et chaque carte de la
  Vitrine ouvre la sienne.
- **l'anglais, préparé** : les libellés des schémas existent en français et en
  anglais (`src/atelier/langue.ts`). Le texte anglais de la page reste à brancher. Les logos viennent de Simple
  Icons (CC0), sauf Jenkins (CC BY-SA 3.0, le projet Jenkins). Azure, ServiceNow
  et OpenAI n'y sont pas, ils restent en texte. Les images du rapport de stage
  ne sont pas reprises : ce sont des documents internes SNCF.

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
| 42 | 2026-11-06 | Version téléphone ouverte : trois façons de replier la colonne de droite (barre en haut, barre en bas, tranche à droite), grille de 4 colonnes, typo proposée à 40 · 14 · 11 px. | « C'est parti pour la version mobile » | 5 |
| 43 | 2026-11-06 | Téléphone : **tranche à droite**, les images passent par-dessus jusqu'au bord de l'écran. Barre en haut et barre en bas retirées. | « Je veux la tranche à droite, mais les rectangles d'image passent par-dessus : ça casse le truc » | 5 |
| 44 | 2026-11-06 | En-tête réduit à Actuellement, Précédemment et Formation (premier jet tiré du CV) ; la bio et Rôle, Approche, Langues disparaissent. | « Un truc plus simple, sans que ça se répète » · « Currently, previously et mes formations » | 5 |
| 45 | 2026-11-06 | En-tête corrigé : Actuellement « Étudiant » ; Précédemment « Ingénieur IA @ SNCF (SNCF GPT agentique, RFI, synthèse de réunions) », « Ingénieur IA @ Renault / Alpine » ; Formation « UTC, 2022 – 2026 », « Shanghai University, 2024 – 2025 ». | Tes corrections | 5 |
| 46 | 2026-11-06 | Précédemment : « Ingénieur IA @ SNCF », sans la parenthèse. | « Enlève ça » | 5 |
| 47 | 2026-11-06 | Précédemment en une seule phrase sur deux lignes, coupée après le second « @ » : « Ingénieur IA @ SNCF, ingénieur IA @ / Renault / Alpine ». Moins linéaire qu'une ligne par poste. | « Sur deux lignes mais qui se continue, c'est moins linéaire » | 5 |
| 48 | 2026-11-06 | Les « @ » collés au nom et liés au site de chaque organisation : @SNCF (groupe-sncf.com), @Renault (renaultgroup.com), Alpine (alpinecars.com), @UTC (utc.fr), @Shanghai University (shu.edu.cn). Soulignés d'un filet clair qui passe à l'accent au survol. | « Un @ devant UTC et Shanghai University, colle les arobases, mets le lien du site » | 5 |
| 49 | 2026-11-06 | Le point final du titre devient un carré accent qui clignote comme un curseur (0,53 s allumé, 0,53 s éteint), fixe si l'on a demandé moins d'animations. | « Remplace le point par un carré rouge qui clignote pour montrer un peu de vie » | 5 |
| 50 | 2026-11-06 | Titre téléphone plus imposant : 68 px (au lieu de 40), sur trois lignes qui vont jusqu'à la marge droite et traversent la tranche, comme les images. Le nom et « Menu » descendent dans le bas de la tranche. | « Qu'il prenne plus de largeur, qu'il soit plus imposant » | 5 |
| 51 | 2026-11-06 | Titre téléphone sur deux lignes, coupé après « prototype » : 40 px, la plus grande taille où « AI engineer, du prototype » tient de la marge gauche à la marge droite en traversant la tranche. | « Essaie de le mettre sur deux lignes, mais c'est exactement ça » | 5 |
| 52 | 2026-11-06 | Le carré final ne clignote plus en continu : il reste allumé et, toutes les 30 s, s'éteint en douceur pendant environ 0,6 s (fondu de 0,15 s de chaque côté). | « Moins vite, là ça prend le regard, c'est stressant ; qu'il disparaisse vraiment occasionnellement, genre toutes les 30 s » | 5 |
| 53 | 2026-11-06 | Retour au titre téléphone à 68 px sur trois lignes (journal n° 50) : plus imposant que la version à deux lignes. | « En fait, le titre mobile revient comme avant, plus gros » | 5 |
| 54 | 2026-11-06 | Trois twists à comparer, chacun avec son interrupteur dans l'Atelier : **cartes qui traversent** (sur ordinateur, la troisième carte s'étire sous la colonne de droite jusqu'au bord), **chiffres qui défilent** (82 %, 3 000+, 90 %, 8 × A100 dans la colonne, ou en ligne verticale le long de la tranche), **cartels** (titre en italique et année, programme, technique en guise de médium). | « Fais une version où on peut activer et désactiver les twists pour comparer » | 5 |
| 55 | 2026-11-06 | Twists : on garde les **cartels**, réduits au minimum (titre en italique et année, sur une ligne) ; chiffres qui défilent et cartes qui traversent sont retirés. | « Chiffres, on oublie ; cartel, ça peut être bien mais minimaliste au possible ; carte qui traverse, on oublie » | 5 |
| 56 | 2026-11-06 | Cartel en petit : *titre* · organisation · année, séparés par un point médian. Le titre en italique à 16 px (un palier au-dessus du texte), le reste à la taille du texte, en encre douce. | « Un rond au milieu pour séparer company, date ; écris ça en petit, là c'est vraiment trop gros » | 5 |
| 57 | 2026-11-06 | Cartel : une virgule entre l'organisation et l'année (*SNCF GPT* · SNCF, 2023). | « Enlève le point entre la company et la date, mets une virgule » | 5 |
| 58 | 2026-11-06 | Étape 6 ouverte. Curseur : cube au repos, barre sur le texte, flèche d'agent avec « Voir le projet » sur un projet, en se déformant d'une forme à l'autre ; absent sur téléphone. | « Quand on arrive sur du texte il devient une barre, en morphing ; sur un projet, une flèche d'agent qui guide » | 6 |
| 59 | 2026-11-06 | Lien @ gardé tel quel ; nav soulignée de 1 px au survol. Trois ouvertures du menu téléphone à essayer : Glisse, Déplie, Fondu. | « 2 ok » · « hover du menu : juste souligné, minimaliste » · « propose-moi des choses » | 6 |
| 60 | 2026-11-06 | Curseur plus discret : il reste un cube sur le menu ; barre de 1,5 px et 20 px au plus ; la flèche devient une petite pointe de 10 × 14 px avec une étiquette de 10 px. Nav soulignée en accent. | « Sur le menu le cube doit rester un cube, soulignement en rouge ; la barre beaucoup trop grande ; la flèche trop grosse, je veux un truc discret et plus petit » | 6 |
| 61 | 2026-11-06 | Barre sur le texte à 2,5 px. Deux autres formes sur un projet à comparer avec la pointe : Équerre et Cube. Menu : Glisse gardée, Déplie et Fondu remplacées par Échelle, Glisse courte et Volet, autour de 0,2 s. | « Un peu plus épais sur le texte » · « propose-moi d'autres curseurs » · « une animation où on veut l'information rapidement, genre 0,90 → 1 » | 6 |
| 62 | 2026-11-06 | **Étape 6 validée.** Menu téléphone : Glisse (0,5 s) ; Échelle, Glisse courte et Volet retirés. Sur un projet : la Pointe gardée ; Équerre et Cube retirés. Les rôles de la palette d'appoint passent à l'étape 8. | « Glisse 0,5 s, c'est bon, on peut continuer » · « il est beaucoup mieux, celui que tu m'as donné » | 6 |
| 63 | 2026-11-06 | Plus de main du système sur les liens @ (écoles, entreprises) : seule la petite pointe dessinée. Sur les téléphones de l'Atelier, la flèche du système reste pour pouvoir toucher « Menu ». | « Il y a la main quand on survole les liens des universités et des entreprises ; enlève la main, garde la flèche uniquement » | 6 |
| 64 | 2026-11-06 | Étape 7 ouverte. Les pages projet racontent comment le projet s'est construit, comme la page OpenAI de Rachel Chen : ce que j'ai mis en place, comment j'ai travaillé, ce que ça m'a apporté. Premier sujet : SNCF GPT, d'après le rapport de stage, qui reste hors du dépôt. | « Que ça ressemble à cette page, de comment on construit le projet » · « Quelque chose de plus structuré : ce que ça m'a apporté, ce que j'ai mis en place, comment j'ai bossé » | 7 |
| 65 | 2026-11-06 | Miniature de SNCF GPT : le schéma d'architecture déployée redessiné en plan de voies technique (le cube accent est l'agent). Trois finitions à comparer : Onde et grain, Aluminium, Alu irisé. | « Reprendre les schémas de l'architecture déployée, une miniature moderne avec notre patte adaptée à la SNCF : des rails, du technique, technical graphic design, nos gradients par-dessus avec du grain ou une brillance type aluminium réfléchissant » | 7 |
| 66 | 2026-11-06 | Finition des miniatures : **alu irisé** ; Onde et grain et Aluminium retirés. Le plan détaillé reste pour la page projet. Trois agencements lisibles en carte à comparer : Aiguillage, Ligne, Plaque. | « Alu irisé c'est le mieux, il faut qu'il soit un peu interactif » · « Beaucoup trop petits, les détails des titres ; fais un truc plus simple mais technique » | 7 |
| 67 | 2026-11-06 | Miniature : l'**Aiguillage** retenu (Ligne et Plaque retirées), redessiné en planche d'ingénierie micrographique : rails en double filet, longues traverses, aiguilles, cœurs, contre-rails, cotes, cartouche, nomenclature, micro-texte. Lisible en gros plan, texture sur une carte. | « On part sur ça, mais les rails ne font pas assez technique, trop cheap ; des détails plus petits, plus techniques, quelque chose de plus micrographique ; pas grave si la miniature ne parle pas, le tout c'est qu'on veuille cliquer dessus » | 7 |
| 68 | 2026-11-06 | Planche épurée : titre plus grand, en haut à droite avec la seule référence du dossier ; bulles, nomenclature, notes et code-barres retirés ; en bas à gauche, des marquages façon vitre de voiture (logo, tampons ronds, petits mots techniques, code-date). Trois cadrages téléphone à comparer : Planche, Rallongée, Détail. Vitrine : **deux projets par rangée** (6 colonnes chacun, la largeur des trois cartes d'avant), le troisième sous le deuxième, en diagonale ; la page défile, la nav et la tranche restent en place. | « Le titre un peu plus gros, enlève des infos, il y en a trop ; ajoute des logos, des certifs, des trucs industriels en petit, comme en bas des fenêtres de voiture » · « En haut à droite, titre plus réf. dossier, plus épuré » · « Pour le mobile, peut-être la rallonger pour montrer qu'elle est coupée mais que c'est fait exprès » · « Deux projets sur la page, un en dessous du deuxième, en diagonale ; deux projets font la taille de trois maintenant » | 7 |
| 69 | 2026-11-06 | Téléphone : la **vue de détail** retenue (Planche et Rallongée retirées) ; « SNCF GPT » remplace « Détail A · 2:1 », à la même taille. La bande de la tranche passe sous les images ; le nom et « Menu » restent dessus et prennent le fond accent quand une image passe sous eux. | « Pour le cadrage du téléphone je veux le 3 » · « Juste le menu et Alexandre Teixeira qui passent par-dessus ; un fond orange genre hover quand ils passent sur l'image » · « Rajoute SNCF GPT, pas trop gros, à la place de détail et de la même taille » | 7 |
| 70 | 2026-11-06 | Le fond accent du nom et de « Menu » ne couvre que la partie au-dessus d'une image et suit son bord au défilement (une copie accent du mot, masquée). Essai : la vue de détail agrandie sur la carte d'ordinateur, à comparer à la planche. | « Le hover sur Menu et Alexandre Teixeira uniquement sur les images, de façon dynamique sur le texte, pas tout ou rien » · « Utilise l'image mobile pour le desktop, adaptée en plus grand, juste pour voir » | 7 |
| 71 | 2026-11-06 | Sur ordinateur aussi, la **vue de détail** (la planche entière est retirée), avec « *SNCF GPT* » plus grand en haut à gauche, en serif italique. Le micro-texte fait exactement un tour du cercle. | « Je préfère Détail pour la version desktop aussi, mais écris SNCF GPT plus gros en haut à gauche ; sinon on est bon » | 7 |
| 72 | 2026-11-06 | SNCF GPT, ce qu'on peut publier : les **82 %**, à présenter comme une mesure interne sur un jeu de tickets de test ; les **3 000+ utilisateurs par mois**, atteints dans un second temps, quand SNCF Groupe GPT a été branché sur SharePoint, Jira et d'autres sources ; les chiffres de l'Usine Logicielle (1 200 projets, 4 500 utilisateurs). Le travail avec les équipes DevOps s'est fait main dans la main. | « Les 82 %, c'est une mesure interne mais sur des tickets de test » · « Ils ont adoré, les équipes DevOps, j'étais main dans la main avec eux ; c'est ensuite devenu SNCF GPT Groupe connecté à SharePoint, Jira… c'est les 3 000 utilisateurs, dans un deuxième temps » · « Oui » | 7 |
| 73 | 2026-11-06 | **Texte français de SNCF GPT validé.** On y précise que tu étais seul au début et que tu as branché Jira (SharePoint est venu après ton départ). BFM Business est retiré faute de trace retrouvée ; à la place, l'article du Journal du Net (juin 2024) sur SNCF Groupe GPT. Les images et les schémas viennent ensuite. | « Jira oui, SharePoint non, j'ai quitté à ce moment-là » · « Je n'arrive pas à retrouver [BFM] » · « Ouais c'est bien, faut dire qu'au début j'étais tout seul sur le projet » · « On rajoutera des images, des schémas » | 7 |
| 74 | 2026-11-06 | SNCF GPT : **3 000+ utilisateurs par jour** (et non par mois), cohérent avec le Journal du Net (2 500 par jour en juin 2024) ; seul au début, en équipe à partir de SNCF Groupe GPT. Lien du Journal du Net gardé. Page projet montée dans l'Atelier, à valider : fil, titre, accroche, cartel, miniature en grand, dix parties aux titres en phrases, sommaire dans la colonne de droite qui suit la lecture. | « Garde, c'est parfait avec le lien ; je crois qu'en fait c'était 3 000 utilisateurs quotidiens » · « J'étais avec une équipe à partir du moment où on a fait SNCF GPT Groupe » · « On peut faire la page » | 7 |
| 75 | 2026-11-06 | **Tailles en vrai** : le plein écran de l'Atelier s'ouvre en taille réelle (il agrandissait la page de 1440 px à la largeur de la fenêtre, ×1,33 sur 1920 px) ; le texte et les étiquettes passent à **15 px**, comme chez Rachel Chen. Page projet : **la lecture au milieu**, texte sur 6 colonnes centrées, images sur 8. | « Tout est beaucoup trop gros ; quand c'est déployé sur Vercel c'est plus petit » · « Le menu sur le côté et tout est un peu trop petit ; je veux que ce soit la même taille [que Rachel] » · « Lire au milieu comme rachelchen.tech/projects/openai, c'est quand même plus agréable » | 7 |
| 76 | 2026-11-06 | Page projet : le **sommaire passe à gauche**, comme chez Rachel Chen, avec une **barre de défilement en vague de traits**. Les traits au niveau de la lecture s'allongent, toute la colonne ondule un peu, le début de chaque partie est marqué, et on peut cliquer ou glisser dessus. Le nom, la nav et le contact restent à droite. | « Le sommaire, tu peux le mettre à gauche » · « Je veux une sorte de vague avec des traits pour la barre de scroll, et qu'elle soit aussi sur la gauche » | 7 |
| 77 | 2026-11-06 | Barre de défilement en vague **retirée**. Le sommaire reste seul à gauche, et la page défile normalement. | « Enlève cette barre de scroll, ça fait too much » | 7 |
| 78 | 2026-11-06 | Page projet : **pas d'onde** (fond clair et grain seulement, pour la lecture) ; le **sommaire descend à 240 px** du haut ; en haut à gauche, un **retour « ← Projets / SNCF GPT »** qui remplace le fil au-dessus du titre. | « Sur la page projet je ne veux pas d'onde, ça empêche la lecture » · « Le sommaire un peu plus bas » · « Un truc qui permet de revenir en arrière sur les projets en haut à gauche : ← work / SNCF GPT » | 7 |
| 79 | 2026-11-06 | La flèche du retour reprend la **pointe d'agent du curseur** sur les projets, en accent, tournée vers la gauche ; elle recule un peu au survol. | « La flèche, mets le curseur qu'on a mis en hover des projets, ça peut être cool de reprendre ça » | 7 |
| 80 | 2026-11-06 | La flèche du retour, redessinée **droite** : la tête à encoche de la pointe, rendue symétrique et pointée vers la gauche, alignée sur les capitales (elle était tournée de travers). | « Mets le curseur de façon propre s'il te plaît, il n'est pas droit » | 7 |
| 81 | 2026-11-06 | **Les résultats d'abord** : les trois chiffres clés (82 %, 500+, 3 000+) passent en tête de la page, sous l'accroche, entre deux filets. La partie Résultats, à la fin, garde le reste (comité exécutif, présentations, presse) sans répéter les chiffres. | « Est-ce qu'on ne mettrait pas les résultats en premier, et à la fin ? » | 7 |
| 82 | 2026-11-06 | **Schémas techniques** de la page SNCF GPT, à plat, sans surcouche argentée : parcours d'un ticket, écran de l'assistant (et ses recadrages dans les cartes), carte des pistes, sources gardées et écartées, recherche hybride, lecture des PDF, agent ReAct, pipeline CI/CD. Le plan d'architecture en voies est retiré des décisions. | « Je veux des schémas techniques et pas une surcouche argentée ; s'il lit l'article, il va vouloir comprendre ; des schémas clairs, efficaces » · « Les décisions techniques, tu peux supprimer ce schéma ; pour le reste je te laisse faire avec le rapport de stage » | 7 |
| 83 | 2026-11-06 | **Relecture critique** de SNCF GPT. L'accroche dit « point de départ de SNCF Groupe GPT » au lieu de « devenu ». Chaque chiffre dit à quel outil il se rapporte (assistant support ou SNCF Groupe GPT). « Ni équipe IA » contredisait « premier membre de l'équipe IA ». Les ingénieurs de l'Usine, pas « des experts », sont pris sur leurs sujets. Les retours ne mélangent plus les deux outils. **Flèches** des schémas : la pointe du curseur, à taille fixe ; le crochet « escalade » ne croise plus la flèche de la doc ; les outils de l'agent partent d'un même bus. **Sommaire** : la partie 10 est détectée en bas de page, et la partie cliquée reste marquée pendant le défilement. | « Repasse sur l'article de façon critique » · « Revois les schémas et les flèches, des fois il y a des bugs ; essaie de réutiliser notre curseur pour les flèches » · « Quand on scrolle jusqu'en bas, le 10 n'est pas détecté dans le sommaire » | 7 |
| 84 | 2026-11-06 | **De la couleur et des marques** sur la page SNCF GPT : le logo SNCF au-dessus du titre avec « e.SNCF Solutions · Usine Logicielle, Lyon » ; une rangée de 16 outils avec leurs logos en couleur ; des pastilles de marque sur les boîtes des schémas (SNCF, GitLab, Jenkins, Docker, Python, SonarQube, Checkmarx, JFrog, Ansible, Vault). Les flèches courbes finissent par un bout droit, pour que la pointe ne se torde plus. | « Petit raté sur la flèche de ce schéma en haut à gauche » · « Rajouter de la couleur, des icônes ; montrer que c'est quand même à la SNCF ; là il n'y a pas de logo, c'est impersonnel » | 7 |
| 85 | 2026-11-06 | En tête de page, la rangée de logos d'outils et la ligne « e.SNCF Solutions · Usine Logicielle, Lyon » sont **retirées**. Le **logo SNCF** passe dans la ligne du titre, juste après « SNCF GPT », à la hauteur des capitales. Les pastilles des schémas restent. | « Tous les logos au début, supprime ; e.SNCF Solutions · Usine Logicielle, Lyon, supprime ça aussi ; garde le logo mais intègre-le, ne le mets pas tout seul au-dessus ; sinon le reste c'est pas mal » | 7 |
| 86 | 2026-11-06 | **Page projet sur téléphone** : le cadre de la Vitrine (tranche, Menu), une colonne, les chiffres et le cartel empilés, la miniature en portrait. Les schémas, à taille lisible, glissent de côté. Le sommaire est dans le panneau Menu et suit la lecture jusqu'à la partie 10. Les libellés des schémas sont préparés en anglais, le texte anglais reste à faire. | « Fais la version téléphone maintenant et on est bon ; ensuite on va attaquer la partie Alpine » | 7 |
| 87 | 2026-11-06 | Sur téléphone, la **miniature et les schémas passent par-dessus la tranche**, jusqu'au bord de l'écran, comme les images de l'accueil. Le nom et « Menu » prennent l'accent seulement là où une image passe dessous (le même effet, partagé dans `tranche.ts`). | « Fais en sorte que les schémas passent par-dessus la sidebar de droite comme les images sur la page d'accueil, pour la version mobile » | 7 |
| 88 | 2026-11-06 | Sur téléphone, le **retour « ← Projets / SNCF GPT » reste fixé en haut à gauche** pendant le défilement. Une pastille papier légère (80 % opaque, floutée, sans bordure) le garde lisible par-dessus le texte et les schémas. | « Il manque aussi le retour en haut à gauche pour revenir en arrière ; je veux qu'il soit fixe ; à toi d'ajuster avec les schémas et le texte pour qu'il reste visible, mais je veux un truc léger » | 7 |
| 89 | 2026-11-06 | Sur téléphone, les **schémas s'ouvrent centrés** et glissent des deux côtés (« ← glisser → »). | « Centre les schémas de base » | 7 |
| 90 | 2026-11-06 | **Whiteboard AMDEC** : texte écrit à partir de tes réponses (non commité, à relire). **Miniature, première version** : un arbre de transmission en vue éclatée sur les bleus d'Alpine avec du grain, qui s'éclate puis se réassemble. Trois agents, la pointe du curseur, cliquent chacun sur une pièce, qui s'allume, et nomment un mode de défaillance (roulement grippé, dent cassée, usure de denture). | « Pour la miniature je veux un autre truc avec un autre fond ; du motion sur un pignon de moteur qui s'éclate en long, puis qui se refusionne ; les couleurs d'Alpine ; des petites flèches qui vont sur les différentes parties en vue éclatée et qui cliquent dessus ; fais un truc ultra propre et on itérera » | 7 |
| 91 | 2026-11-06 | Miniature Whiteboard AMDEC, **deuxième version, façon scan holographique** : un train épicycloïdal de 16 pièces qui éclate dans toutes les directions, sur un bleu acier froid (grille de plan, scan, lueur cyan, grain). Habillage : anneau de visée qui tourne, pièces numérotées, nomenclature, marque « Atelier A.T. », jauge et tampons, comme sur la planche SNCF. | « Fais un truc plus à la Iron Man, vraiment un truc complexe qui s'explose en plein de pièces ; le fond, un truc plus industriel, plus froid, mais bleu quand même ; rajoute des annotations et logos techniques comme sur le truc SNCF » | 7 |
| 92 | 2026-11-06 | Miniature Whiteboard AMDEC, **troisième tour, plus épuré**, façon motion design Apple : plus de scan, de grille, d'anneau ni de coins. L'ouverture est lente avec de longues pauses (boucle de 18 s), les numéros sont sur des filets fins, l'étiquette est en pilule. **Une couleur par agent** : rouge, ambre, menthe. Trois finitions à comparer : Graphite, Plan clair, Bleu Alpine. | « Fais un truc avec moins d'animation, enlève le scanner, le rayon qui va de haut en bas ; fais-moi d'autres propositions, là je trouve que ça fait trop cheap ; un truc plus propre, plus épuré, plus motion design à la Apple, avec du technique derrière ; change la couleur des flèches pour montrer que ce sont des agents différents » | 7 |
| 93 | 2026-11-06 | Miniature Whiteboard AMDEC, **quatrième tour, d'après ta référence** (une planche de turboréacteur ; le style seulement, l'image n'est pas reprise). Un turboréacteur de 23 étages en trait crème sur ardoise avec une grille, des étiquettes en boîte à chasse fixe. Les étages s'écartent puis se referment, les aubes tournent doucement. **Trois toutes petites flèches rouges** glissent de pièce en pièce, sans colorer les pièces. Les trois finitions précédentes sont retirées. | « Prends ça comme base, simplifie et ajoute du motion ; garde la couleur et tout du schéma, les traits ; les agents, quelque chose de discret avec des toutes petites flèches, pas cheap ; pas de couleur sur les éléments cliqués, juste les flèches qui se déplacent, toutes rouges comme notre couleur » | 7 |
| 94 | 2026-11-06 | Miniature Whiteboard AMDEC : on repart de zéro avec une **affiche fixe**, sans motion, **bleu électrique avec des touches de rouge**, d'après tes références (étiquettes industrielles, affiches à grille, affiche bleue). On y trouve une berlinette Alpine cotée avec deux agents, la grille quittée pour l'inédit, une étiquette produit (agents, modèles, GPU), des capitales condensées (Big Shoulders), du large (Mona Sans) et de la mono (Geist Mono). | « Oublie ce qu'on a fait ; adapte ces idées à la couleur d'Alpine avec des éléments Alpine ; j'adore le bleu de la dernière image, tout en bleu, un poster bleu avec des touches de rouge et des annotations techniques ; plus de motion, un truc statique » | 7 |
| 95 | 2026-11-06 | Miniature Whiteboard AMDEC **retirée** de l'Atelier (composant, styles, gros plan et carte de la Vitrine) : tu l'as faite avec un autre agent. Les quatre tours précédents restent dans l'historique (commits 1189514 à bdb94a2). | « Supprime la miniature, je l'ai faite avec un autre agent » | 7 |
| 96 | 2026-11-06 | **Texte de Whiteboard AMDEC validé**, et le projet **passe en deuxième** dans la Vitrine (avant Synthèse de réunions). Sa page est montée sur le modèle de SNCF GPT : logo Renault dans le titre, chiffres du point de départ, neuf parties, huit schémas techniques à plat (grille AMDEC, tableau blanc, pile déployée, boucle de créativité, graphe des agents, nuage d'idées, RAG et CAG, outils des agents). La miniature est faite à part. | « Vas-y, c'est bon, le texte, on peut l'implémenter ; et mets-le en deuxième comme article, pas en troisième » | 7 |

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
