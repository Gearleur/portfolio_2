# Comment je dessine un produit avec l'IA

> Brouillon du 2026-11-17, à relire. Même squelette que les pages projet
> (en-tête, chiffres, cartel, parties aux titres en phrases, leçons), mais c'est
> un article de méthode : il parle de trois produits à la fois.
>
> Sources : ce dépôt (`docs/atelier/README.md`, journal n° 1 à 107), Mikky
> (`app/lib/boards/`, `tuning/`, les décisions datées dans le code), le Studio
> SAIFY (`ateliers/index.html`, `PASSATION.md`, journal D1 à D102, branche
> `alexandre/atelier-site-web`).
>
> Volontairement absents : les noms des clients et des collègues de SAIFY, les
> noms des clients du site, les captures de sites tiers du moodboard (on les
> nomme, on ne les montre pas).
>
> À vérifier avec toi : voir les questions à la fin.

## 0. En-tête

**Comment je dessine un produit avec l'IA**
L'IA produit, je dirige. Des ateliers en code, des références, des clones qui
marchent vraiment, des curseurs, et une décision à la fois.

- **3** produits faits ainsi : ce portfolio, Mikky et le site de SAIFY ;
- **17** mises en page explorées pour ce portfolio avant d'en garder une ;
- **560+** décisions datées et justifiées, dans les trois journaux.

| | |
| --- | --- |
| Rôle | Directeur artistique et seul arbitre ; l'IA propose, construit et consigne |
| Outils | Claude Code, des pages d'atelier en code, Figma seulement pour les repères |
| Période | Septembre – novembre 2026 |

## 1. L'IA propose, je dirige.

Je ne demande pas à un modèle « fais-moi un beau site ». Je travaille avec lui
comme une équipe artistique : il ouvre des pistes, je ferme en choisissant. Le
goût, les idées et la décision restent à moi ; la production, les variantes et
la mémoire des choix, c'est son travail.

*Trois tuiles :* **Ouvrir** (références, propositions, variantes) ·
**Régler** (des curseurs bornés sur ce qui reste à décider) · **Fermer** (je
tranche, c'est écrit, on passe à la suite).

**Le problème : une IA laissée seule produit du générique.** Une page propre,
moyenne, qui ressemble à toutes les autres. Ma première refonte de ce
portfolio, faite d'un bloc par un agent, était exactement ça : je l'ai jetée.

**L'opportunité : produire coûte presque rien.** Dix variantes vivantes
coûtent quelques minutes. Ce qui devient rare, c'est de savoir choisir et de
garder le cap. C'est là que je me place.

## 2. Avant le produit, je construis l'atelier.

Chaque produit commence par une page qui n'est pas le produit : un **atelier**,
mon Figma en code. Tout y est vivant et cliquable, et c'est la source de vérité.
Ce qui n'est pas dans l'atelier n'existe pas dans le produit.

- **Ce portfolio** : `/atelier/` s'ouvre sur la charte (le brief et chaque
  décision validée), puis une barre de dix étapes, du fond et de l'accent
  jusqu'à la mise en ligne. Chaque étape garde son établi de réglages, à son
  adresse, pour y revenir sans rien perdre.
- **Mikky** : des planches comme dans Figma, lancées par `mikky.exe --kit`. La
  marque, chaque composant une fois, chaque écran dans chacun de ses états, en
  clair et en sombre, qui bougent et qu'on clique. Chaque cadre porte une
  étiquette : *Dans l'app*, *Essai*, *À essayer*.
- **SAIFY** : le Studio, un atelier par question, de 00 Diagnostic à 08.8
  Branding. Chaque page pose une seule question, propose deux ou trois
  réponses, fait parler des voix contraires, puis je tranche.

**On va du large au précis.** On ne choisit jamais le survol d'un bouton avant
d'avoir fixé le fond de la page : fond et accent, couleurs, typo, grille,
chemin de fer, composants, contenu, puis la page assemblée.

*Visuel : l'atelier du portfolio, la barre d'étapes et un établi.*

## 3. Je pars de références, jamais d'une page blanche.

Un modèle sans référence revient à la moyenne. Avec des références, il a une
direction. Mais je les annote : pas « j'aime », mais « on prend ça, pour ça ».

- **Ce portfolio** : rachelchen.tech pour la phrase-titre et les paires
  étiquette + valeur ; paulkalkbrenner.net pour un seul moment énorme ;
  clintonvanarnam.net pour la hiérarchie sans changer de taille ; les dégradés
  granuleux de Feral UI pour l'onde qui traverse la page.
- **Mikky** : la matrice de points de Nothing, les couleurs système d'Apple,
  l'ambiance des sons de la PSP, et mes propres captures (le ciel de Mikky,
  l'orange d'une image).
- **SAIFY** : 57 captures de studios (Pentagram, Studio Dumbar, Collins,
  Koto…) et un banc d'essai de 8 agences et 12 startups, mesurées dans le
  navigateur plutôt qu'à l'œil.

**On reprend des principes, pas des pixels.** La référence donne la direction ;
la page reste la nôtre.

## 4. Je travaille sur des clones qui marchent, pas sur des maquettes.

Une maquette ment : elle ne bouge pas, ne charge pas, ne casse pas sur un
téléphone. Je préfère partir de vrais produits, reconstruits en front et qui
fonctionnent, puis garder ce qui marche le mieux.

- **SAIFY** : onze pages d'accueil construites d'après des sites connus,
  chacune reprenant un agencement qui a fait ses preuves (Linear, Vercel,
  Attio, une page produit d'Apple, Raycast…). Elles tournent pour de vrai, avec
  le contenu de SAIFY, et un panneau « Personnaliser » les pilote toutes. On a
  retenu trois dispositions sur douze, et écarté les neuf autres.
- **Les composants** reprennent l'anatomie et les états de bibliothèques
  éprouvées (shadcn/ui, Base UI), puis prennent nos couleurs.
- **Ce portfolio** : chaque mise en page du chemin de fer est un vrai premier
  écran, avec la vraie grille, la vraie typo et un texte provisoire. Un bouton
  remplace chaque mot par un pavé gris pour ne juger que la place. La maquette
  *est* le prototype.

**Juger en vrai.** Une fois, tout me paraissait juste dans l'atelier, et trop
gros en ligne : l'atelier agrandissait la page pour remplir l'écran. Depuis,
on juge en taille réelle.

*Visuel : le panneau Personnaliser et trois pages d'accueil côte à côte.*

## 5. Je demande des idées, pas une réponse.

Ma règle : deux ou trois propositions, côte à côte et cliquables. Pas une seule
option imposée, pas dix non plus. Quand aucune ne me plaît, je ne corrige pas :
je demande d'autres idées, ailleurs.

- Pour le chemin de fer de ce portfolio, les trois premières compositions ne
  me suffisaient pas. J'ai demandé « des propositions comme les magazines de
  mode, les cabinets d'architectes » : sont venus Couverture, Lookbook,
  Agence, Affiche suisse, puis Journal, Cartel, Plan, Manuel. Dix-sept pistes
  au total. J'ai gardé la nav latérale, à droite.
- Pour le visuel de Whiteboard AMDEC, quatre tours (vue éclatée, scan
  holographique, motion à la Apple, planche de turboréacteur), puis une affiche
  fixe. Aucune n'était juste : je l'ai faite à part, avec un autre agent.
  Savoir arrêter fait partie du travail.
- Pour SAIFY, chaque proposition arrive au format d'une startup : constat,
  idée, rendu, coût. Puis des voix contraires (le directeur financier d'un
  client, le fondateur, un designer qui n'est pas d'accord) la contestent avant
  que je tranche.

**Quand un client dit « je n'aime aucune »,** cinq identités de plus ne servent
à rien. Il faut passer à des variations de réglages (densité, verre, arrondis,
accent) sur une base qu'il aime déjà.

## 6. Les curseurs donnent une direction, pas la mainmise.

J'aime régler moi-même, mais à l'intérieur d'un cadre. Chaque établi part de
préréglages, et chaque curseur est **borné** : on peut ajuster sans sortir de
la direction choisie.

- **Le fond de ce portfolio** : teinte, saturation et clarté en OKLCH, avec une
  saturation entre 0 et 0,03 et une clarté entre 88 et 98 %. On reste dans le
  « clair et uni ». Un bouton « Copier mes réglages » me donne un résumé à
  coller à l'agent, qui en fait la valeur retenue.
- **La typo** : une typothèque de 55 polices libres, chacune avec trois boutons
  pour lui donner un rôle (titre, texte, étiquettes), et la taille de chaque
  rôle sur son curseur.
- **Le visage de Mikky** : un écran de réglage, `mikky.exe --tuning`, avec un
  bouton par état et par geste, et des curseurs pour ses proportions (hauteur
  et écart des yeux, oreilles…). On valide les expressions avant de les figer.
- **SAIFY** : douze styles prêts en un clic (« un effet principal et une ou
  deux touches, jamais plus »), puis des curseurs pour la texture, la courbe,
  le grain, la graisse. Et un lien à partager pour montrer un réglage.

*Visuel : l'établi du fond, ses curseurs bornés et l'aperçu en direct.*

## 7. Je choisis vite, et j'écris pourquoi.

Ma critique tient en trois mots : **Garde, Jette, Change**, avec un mot de
pourquoi (« trop chargé », « pas assez rouge », « ça fait too much »). Je
réponds souvent par numéro : « 1, et le 3 en plus foncé ».

1. **Une étape, une décision.** On ne passe à la suivante qu'après mon accord.
2. **Chaque décision va dans un journal**, avec sa date, ma phrase exacte et sa
   raison : 107 pour ce portfolio, 102 pour SAIFY, plus de 350 notes datées
   dans le code de Mikky. Ce qui y est écrit ne se rediscute plus sans raison
   nouvelle.
3. **Les pistes rejetées quittent le code** et restent dans l'historique Git.
   Pas de pistes mortes dans le produit, mais rien n'est perdu.
4. **Les numéros ne changent jamais.** Une piste écartée laisse un trou dans la
   numérotation : on sait toujours de quoi on parle.

**Le journal sert aussi l'IA.** Une session neuve relit l'atelier et le journal
avant de proposer : elle reprend au bon endroit, sans repartir de zéro.

## 8. Le modèle le plus fort, seulement pour créer.

Les modèles réglés sur l'effort le plus élevé ne sont vraiment utiles qu'à un
endroit : la création, l'UI et l'UX. Là, ils font la différence ; ailleurs,
ils coûtent plus sans faire mieux.

**Ma règle sur SAIFY :** toute génération créative (territoires, interface,
composants, parcours) part sur le modèle le plus fort, à effort élevé, dans une
session fraîche qui relit d'abord le Studio. Le reste (brancher, déplacer,
corriger, optimiser) se fait avec les réglages habituels.

**Pourquoi ça reste propre :** la création se fait dans l'atelier, avec ses
tokens et ses composants validés. Le produit, lui, n'est assemblé qu'à partir de
pièces déjà choisies.

## 9. Ce que ça m'a appris.

**Le goût ne se délègue pas, la production si.**
L'IA m'a rendu dix fois plus rapide pour explorer, pas pour décider.

**Ouvrir avant de fermer.**
Les meilleures idées sont venues quand j'ai demandé ailleurs (magazines,
architectes, studios), pas quand j'ai corrigé la première proposition.

**Simplifier, toujours.**
Une barre de défilement en vague, un rang de logos, une ligne de trop : la
plupart des retraits ont amélioré la page.

**Juger le vrai.**
En taille réelle, sur un vrai téléphone, avec le vrai texte. Une maquette ne
m'a jamais dit la vérité.

---

## Les visuels (vraies captures, pas de schémas)

Monté dans `projets.ts` (`PROCESSUS_DESIGN`, page `#processus-design`, carte 04
« Dessiner avec l'IA · Méthode, 2026 »). Médias dans `src/apps/atelier/medias/processus-*` :

- en tête : les 17 mises en page du chemin de fer, ressorties du commit `0022543`, la retenue encadrée ;
- l'atelier : la charte du portfolio ; **un film de 40 s** qui défile sur les neuf planches de Mikky
  (rendues à 2× par les tests Flutter dans une copie temporaire, empilées, puis filmées : AV1 et H.264) ;
  le sommaire du Studio SAIFY ;
- les références : Parloa Drive lu dans l'atelier 08.7 (ce qu'on prend, ce qu'on change). Les murs de
  références (03 « Tes treize dernières références », 08.8 « D'où vient chaque pièce ») sont laissés
  de côté : ce sont des images de tiers, et le dépôt est public ;
- les clones : les onze heros SAIFY, les quatre familles de composants, le verre liquide (03) ;
- les idées : le panneau du chemin de fer, les fonds (03, T3 préférée), les cinq piliers (03), les douze
  dispositions, Mikky en pixels ;
- les curseurs : l'établi du fond, l'établi de la typo, le laboratoire SAIFY ;
- décider : les logos de Mikky (C retenu), le journal SAIFY D58 à D67 ;
- le résultat (nouvelle partie) : le système, les huit champs (08.7), les dix affiches, le carnet
  d'identité, l'ensemble (08.8).

Encore à trancher : nommer le modèle (Fable 5.2) ou garder « le modèle le plus fort » ; l'écran de
réglage du visage de Mikky (`mikky.exe --tuning`) reste à capturer sous Windows.
