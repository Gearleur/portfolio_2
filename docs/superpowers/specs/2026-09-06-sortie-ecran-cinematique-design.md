# Sortie de l'ecran : onboarding, portail et cinematique IA

Date : 2026-09-06
Statut : design valide, pret pour plan d'implementation

## 1. Contexte et probleme

Le portfolio est aujourd'hui un bureau retro plein ecran (`DesktopShell`) avec des
icones cliquables qui ouvrent des fenetres deplacables. Deux problemes :

1. **Le bureau ressemble a une image.** Rien n'indique au visiteur qu'il faut
   cliquer les icones pour lire le CV. Si le premier clic n'arrive pas dans les
   premieres secondes, la visite est perdue.
2. **Le portfolio ne raconte que le passe.** Il montre un parcours, pas un
   positionnement. Il manque un espace pour dire ce qu'Alexandre apporte a une
   entreprise sur l'IA.

## 2. Objectifs

- Amener le premier clic sur une icone en moins de 5 secondes.
- Recompenser l'exploration par une seconde partie d'experience, narrative.
- Faire porter le message par la mise en scene : sortir de l'ecran cathodique
  (le passe, le CV classique) pour entrer dans un espace vide ou s'ecrit une
  vision de l'IA en entreprise (le present, le futur).
- Garder le texte du pitch separe du code, pour pouvoir l'ecrire plus tard.

## 3. Non-objectifs

- Ecrire le contenu du pitch IA. La spec definit la structure, pas la copie.
- Refondre le bureau existant, les fenetres ou le mode machine.
- Toute forme d'audio.
- Un editeur de scene ou une timeline configurable a l'execution.

## 4. Parcours utilisateur

```
Arrivee
  |
  v
Bureau retro + tuto diegetique (fenetre "Lisez-moi", curseur fantome)
  |  premier clic sur une icone -> le tuto meurt
  v
Exploration du CV (fenetres)
  |  2 fenetres ouvertes OU 40 s ecoulees
  v
Apparition du bouton portail (rupture stylistique assumee)
  |  clic
  v
Dezoom 2,5 s : on decouvre que le bureau etait un ecran cathodique,
le CRT part en biais dans une piece immense et vide
  |
  v
Cinematique pilotee au scroll : la camera avance, les phrases se revelent
  |
  v
Dernier acte : contact, ou retour au bureau (pushin ~1,6 s)
```

## 5. Decisions actees

| Sujet | Decision | Raison |
|---|---|---|
| Destination | Une piece immense et vide, le CRT sur le cote, des phrases qui apparaissent | Le vide rend chaque phrase importante |
| Rythme | Pilote au scroll du visiteur | Il ralentit sur une phrase forte, revient en arriere, n'est jamais enferme |
| Motion design | Code, pas video | Une video coute 20-60 Mo, casse la continuite, floute le texte et ne se reprend pas en main |
| Tuto | Diegetique : fenetre "Lisez-moi" + curseur fantome | Le tuto fait partie du monde au lieu de le briser |
| Declencheur du portail | 2 fenetres ouvertes OU 40 s, au premier des deux | Recompense l'exploration sans punir la passivite |
| Retour | Aller-retour libre | Le CRT reste visible, le retour est evident |
| Techno | `three` + `@react-three/fiber` | Vraie camera, vraie lumiere, vrai reflet |
| Texte de la cinematique | DOM superpose au canvas, pas du texte 3D | Net a tout DPR, selectionnable, indexable, accessible, animable en CSS |
| Mobile | Bouton + cinematique sans dezoom, avec un telephone a la place du CRT | La metaphore du CRT n'existe pas sur mobile ; pas de 2e choregraphie camera |

## 6. Architecture

### 6.1 Machine a etats

Source de verite unique, au-dessus de `DesktopShell` / `MobileShell` :

```
desktop --enterRoom()--> pullback --(fin timeline | skip)--> room
room --returnToDesktop()--> pushin --(fin timeline)--> desktop
```

- `pullback` et `pushin` sont non interruptibles mais **skippables** (Escape ou
  clic saute a l'etat final).
- Sur mobile, `pullback` et `pushin` sont remplaces par un fondu de 400 ms.
- `prefers-reduced-motion` remplace egalement les deux par un fondu de 400 ms.

### 6.2 Arborescence

```
src/experience/
  stage/
    useExperienceStage.ts        machine a etats + regle de declenchement
    ExperienceStageContext.tsx   provider, consomme par les shells
    portalTrigger.ts             fonction pure testable
  onboarding/
    useOnboarding.ts             etat du tuto, extinction, persistance
    ReadmeWindow.tsx             reutilise RetroWindow
    GhostCursor.tsx              curseur fantome SVG
    onboarding.css
  portal/
    PortalButton.tsx
    portal.css
  room/
    RoomScene.tsx                entree lazy : Canvas R3F
    CameraRig.tsx                progress -> position camera
    CrtMonitor.tsx               objet desktop
    PhoneDevice.tsx              objet mobile
    Floor.tsx                    sol + reflet miroir
    ScreenMaterial.ts            shader dalle (scanlines, phosphore, derive)
    useScreenProjection.ts       matrice camera -> matrix3d CSS
    RoomFallback.tsx             piece en degrade CSS si WebGL absent
  cinematic/
    cinematicScript.ts           DONNEES : actes, lignes, profondeurs
    CinematicOverlay.tsx         couche texte DOM
    CinematicA11yArticle.tsx     actes complets, visuellement masques
    useScrollTimeline.ts         scroll -> progress (ref) + acte (state)
    cinematic.css
```

### 6.3 Contrats de modules

```ts
// stage/useExperienceStage.ts
type Stage = 'desktop' | 'pullback' | 'room' | 'pushin';

type ExperienceStage = {
  stage: Stage;
  isPortalReady: boolean;
  notifyWindowOpened: (windowId: string) => void;
  enterRoom: () => void;
  skipTransition: () => void;
  returnToDesktop: () => void;
};

// stage/portalTrigger.ts  (pur, teste)
function shouldRevealPortal(input: {
  openedWindowCount: number;
  elapsedMs: number;
}): boolean; // openedWindowCount >= 2 || elapsedMs >= 40_000

// cinematic/useScrollTimeline.ts
function actIndexFromProgress(progress: number, actCount: number): number; // pur, teste

// room/useScreenProjection.ts
function cssPerspectiveFromFov(fovDeg: number, viewportHeight: number): number; // pur, teste
```

`DesktopShell.openWindow` appelle `notifyWindowOpened(windowId)`. C'est la seule
modification apportee au bureau existant.

### 6.4 Chargement

`RoomScene` est importe en `React.lazy`. Le prefetch est declenche a l'instant
precis ou `isPortalReady` passe a vrai. Un visiteur qui lit le CV et repart ne
telecharge jamais un octet de three.js. Chunk vise : environ 150 Ko gzip.

### 6.5 Empilement

- z 0 : canvas R3F, `position: fixed`, plein ecran
- z 1 : plan DOM du bureau, pilote en `matrix3d`
- z 2 : couche texte de la cinematique
- z 3 : commandes (retour, indicateur de scroll)

## 7. Onboarding diegetique

**Fenetre "Lisez-moi"** : s'ouvre seule environ 800 ms apres l'arrivee, construite
sur le `RetroWindow` existant, donc deplacable et fermable comme les autres. En la
manipulant, le visiteur apprend deja le geste. Une seule phrase. Position decalee,
jamais par-dessus la colonne d'icones.

**Curseur fantome** : declenche uniquement si aucun clic apres 4 s. Un curseur SVG
glisse en courbe douce du centre vers l'icone Education, marque un temps, "clique"
(l'icone repond : surbrillance + micro-scale), puis s'efface et recommence 3 s plus
tard. **Maximum 3 boucles**, puis abandon.

**Extinction** : le premier clic reel sur une icone tue les deux couches
definitivement, sans animation de sortie. Si c'est le delai de 40 s qui revele le
portail, le tuto s'eteint au meme instant pour ne pas se disputer l'attention.

**Details** :
- Les icones sont des `<button>` a clic simple (`DesktopIcon.tsx:33`) : le tuto
  enseigne un clic, pas un double-clic. Tab + Entree fonctionne deja.
- Les `.cur` de `styles.css:4` sont au format ICO et ne s'affichent pas de facon
  fiable dans un `<img>`. Un **asset SVG** repliquant la fleche Wii est a produire.
- `prefers-reduced-motion` : la fenetre reste, le curseur fantome ne se lance pas.
- Le curseur fantome est `aria-hidden` et `pointer-events: none`. L'instruction
  reelle est le texte de la fenetre.
- Persistance : `localStorage` cle `portfolio.onboarding.v1`. Un visiteur qui
  revient n'est pas re-eduque. La cle est versionnee pour pouvoir reinitialiser.

## 8. Bouton portail

**Apparition** : `shouldRevealPortal` (2 fenetres ou 40 s). `openedWindowCount`
compte les **fenetres distinctes ouvertes depuis l'arrivee** ; refermer une fenetre
ne decremente pas, et rouvrir la meme ne recompte pas.

**Placement** : en bas au centre. La barre de menu occupe le haut, les icones la
colonne de gauche ; c'est la seule zone libre, et elle lit comme un seuil plutot
que comme un widget.

**Dessin** : pastille de verre sombre (`backdrop-filter: blur + saturate`), bordure
1 px en degrade, halo en `conic-gradient` tournant lentement (environ 8 s) derriere.
Typographie : grotesque geometrique, petite, capitales, `letter-spacing` large --
l'oppose du Geneva pixelise du bureau. Au survol : le halo accelere, le tracking
s'ouvre.

**Entree** : il ne glisse pas, il se materialise. `scale(0.94)` + `blur(12px)` qui
se resorbent sur environ 900 ms pendant que le halo se dessine.

**Garde-fou de direction artistique** : ni carte arrondie, ni grosse ombre portee.
Sinon le bouton lit comme un bandeau cookies et l'effet meurt.

**Accessibilite** : vrai `<button>`, annonce polie via live region a l'apparition.

## 9. Transition (desktop uniquement)

### 9.1 Dezoom, 2,5 s, quatre temps

| Temps | Ce qui se passe |
|---|---|
| 0-300 ms | Le bureau se fige, les scanlines se renforcent une fraction de seconde comme un CRT qui encaisse une commande, le bouton s'efface, les interactions se coupent |
| 300-1200 ms | La camera recule en Z. Le bezel se materialise autour de l'ecran. La piece nait du noir : le vide, puis le sol qui emerge du brouillard |
| 1200-2100 ms | La camera derive lateralement, le CRT part vers la gauche en `rotateY`. Le DOM passe sous le seuil de lisibilite et se fond dans le shader d'ecran. Le halo s'allume sur la dalle |
| 2100-2500 ms | Deceleration forte, la piece finit de se reveler, l'indicateur de scroll apparait |

### 9.2 Synchronisation DOM / camera

Pendant tout le recul, le bureau reste du **vrai DOM interactif**, transforme par
une `matrix3d` calculee depuis la camera R3F a chaque frame. La `perspective` CSS
est derivee du FOV (`cssPerspectiveFromFov`), donc l'alignement est exact et non
approxime. C'est la mathematique de `CSS3DRenderer`, appliquee a un seul element,
sans dependance supplementaire.

**Seuil de bascule** : quand la largeur projetee de l'ecran passe sous 20 % de la
largeur du viewport, le DOM se fond (200 ms) vers le materiau shader. Le raccord
est invisible parce qu'il arrive au moment ou plus personne ne peut lire.

### 9.3 Retour

`pushin` rejoue la meme timeline inversee en environ 1,6 s. Le DOM reprend la main
a la fin, le focus revient sur le bouton portail.

## 10. La piece

**Composition** : un sol, du brouillard, du noir. L'immensite vient de trois
choses -- le sol qui fuit vers un horizon jamais atteint, la brume qui l'avale
(`FogExp2`), et l'objet ecran comme **unique reference d'echelle**.

**Lumiere** : une seule source, l'ecran lui-meme. Un point light a la dalle dont la
couleur derive au rythme du shader. La piece entiere est eclairee par le CV.

**Reflet** : copie miroir de l'objet sous le sol, masquee par un degrade. Pas de
materiau reflectif.

**Halo** : billboard additif autour de la dalle. **Pas de pipeline de
post-processing** : pour une scene a une seule source lumineuse, le rendu est
equivalent pour une fraction du cout. Si le resultat decoit a l'usage, ajouter
`@react-three/postprocessing` reste un changement contenu a `RoomScene`.

**Dependances totales ajoutees** : `three` et `@react-three/fiber`. Rien d'autre.

## 11. La cinematique

**Repartition** : la piece est en 3D, les mots sont du DOM superpose. Cela donne du
texte net a tout DPR, selectionnable, indexable, accessible, et tout le vocabulaire
CSS d'un motion design type After Effects.

**Vocabulaire de mouvement** : revelation par masque, `stagger` de 40-60 ms entre
les lignes, `blur` 8px -> 0, `letter-spacing` de 0.3em -> 0.02em, opacite. Chaque
acte **entre et sort** : les phrases ne s'empilent pas.

**Scroll** : un conteneur haut de `N x 100vh`. `progress` est stocke en `ref` et lu
dans `useFrame` ; React ne se re-rend qu'au changement d'acte, jamais par frame. La
camera suit une **courbe, pas une ligne droite** : elle derive, donc l'angle de
l'objet ecran change pendant la progression. A la fin, il n'est plus qu'une lueur
lointaine derriere le visiteur.

**Donnees** (`cinematicScript.ts`, sur le modele de `src/data/*.ts`) :

```ts
type LineEnter = 'mask-up' | 'blur-in' | 'track-in';

type CinematicLine = {
  text: string;
  enter: LineEnter;
};

type CinematicAct =
  | { kind: 'text'; id: string; lines: CinematicLine[]; cameraDepth: number }
  | { kind: 'cta'; id: string; lines: CinematicLine[]; cameraDepth: number };

const cinematicScript: CinematicAct[]; // 4 a 6 actes, le dernier de kind 'cta'
```

**Dernier acte** : contact et retour au bureau, les deux proposes.

**Clavier** : fleches et PageDown / PageUp avancent d'acte en acte. Escape ramene
au bureau.

## 12. Mobile

`MobileShell` est un ecran d'accueil iOS avec un viewport verrouille en
`overflow: hidden` (`useLockedMobileViewport.ts`). En consequence :

- **Pas de dezoom.** Le clic sur le bouton portail fond directement (400 ms) dans
  la piece, sur un plan deja installe.
- **Un telephone remplace le CRT** dans la piece : un volume arrondi et un plan
  emissif portant le meme `ScreenMaterial`. Aucune seconde choregraphie de camera
  n'est necessaire, puisqu'il n'y a pas de mouvement d'entree a raccorder.
- Le verrou de viewport reste actif : la cinematique scrolle dans **son propre
  conteneur**, pas dans le body.
- `dpr` plafonne a 1.5 sur mobile.
- **Placement du bouton** : au-dessus du dock, centre. Il ne remplace ni ne
  chevauche une icone de l'ecran d'accueil.
- Declencheur identique : 2 applications ouvertes ou 40 s.

## 13. Performance

- Le canvas n'est monte que pendant `pullback` et `room`. Au retour au bureau, il
  est garde chaud 10 s puis les geometries et textures sont liberees.
- `dpr` plafonne a 1.75 (desktop) / 1.5 (mobile).
- Boucle de rendu coupee sur `visibilitychange`.
- Pendant le recul, les animations CSS infinies du wallpaper (`desktop.css:43` et
  `desktop.css:57`) sont mises en pause : une animation infinie sur un calque
  transforme en 3D est du repaint pur perdu.
- Budget : 60 fps desktop, 30 fps minimum mobile, **mesure et non suppose**.

## 14. Accessibilite et degradations

- **Risque principal** : le pitch est invisible aux lecteurs d'ecran si les phrases
  sont en `opacity: 0` tant qu'on n'a pas scrolle. Parade : `CinematicA11yArticle`
  rend **tous les actes en permanence**, en ordre de lecture, visuellement masques.
  Un lecteur d'ecran recoit le pitch entier d'un bloc.
- Focus deplace vers la region cinematique a l'entree, rendu au bouton portail au
  retour.
- Escape ramene au bureau depuis la piece.
- `prefers-reduced-motion` : pas de curseur fantome, transitions remplacees par des
  fondus de 400 ms, revelations de texte reduites a de l'opacite.
- **WebGL absent ou refuse** : `RoomFallback` joue la meme cinematique, memes
  textes et memes animations, sur une piece en degrade CSS. Le pitch n'est jamais
  perdu pour un probleme de carte graphique.

## 15. Tests

**Vitest (`pnpm test`, scope `src`)** -- ce qui casse en silence :
- `shouldRevealPortal` : 2 fenetres, 40 s, aucun des deux, les deux.
- Transitions de la machine a etats, y compris `skipTransition`.
- `actIndexFromProgress` : bornes 0 et 1, valeurs intermediaires.
- `cssPerspectiveFromFov`.
- Extinction et persistance de l'onboarding.

**Playwright (`tests/e2e`)** -- le parcours :
- Le tuto apparait, puis disparait au premier clic sur une icone.
- Le bouton portail apparait apres 2 fenetres ouvertes.
- Le clic mene a l'etat `room`.
- Escape ramene au bureau.
- Le chemin `prefers-reduced-motion`.

**Explicitement non teste** : le rendu visuel. Il se juge a l'oeil.

## 16. Hors perimetre

- Audio et ambiance sonore.
- Post-processing (bloom, DOF). Reevaluable apres avoir vu la scene.
- Contenu du pitch IA.
- Deuxieme choregraphie de camera pour mobile.
- Toute modification du mode machine ou des fenetres existantes.

## 17. A ecrire avant l'implementation

1. La phrase de la fenetre "Lisez-moi", dans le ton de l'OS.
2. Le libelle du bouton portail.
3. Les 4 a 6 actes du pitch IA (peut arriver apres le squelette technique :
   `cinematicScript.ts` est isole exactement pour ca).
