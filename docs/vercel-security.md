# Publication et protections Vercel

## Ce qui est prêt dans le dépôt

`vercel.json` configure les routes CV et Agent et les en-têtes des réponses :
Content Security Policy (scripts du site uniquement, sans `unsafe-eval`), refus
d’intégration en iframe, `nosniff`, absence de transmission du référent,
désactivation des permissions inutiles et HSTS. Les styles inline restent permis
pour le positionnement des fenêtres et les animations React.

Les exports Agent utilisent une liste explicite de champs publics. Ajouter une
propriété interne à un projet ou à une expérience ne l’ajoute pas automatiquement
au JSON. La compilation refuse certains fichiers accidentellement placés dans
`public/` : `.env`, clés privées, sources TypeScript, source maps, sauvegardes,
liens symboliques et certaines signatures de secrets. Ce contrôle est partiel :
il ne détecte pas toute donnée personnelle, ni le contenu des PDF ou des images.
Les source maps de production sont désactivées.

Le service worker ne conserve plus les exports texte/JSON ni les PDF dans son
cache hors ligne. Les données déjà téléchargées par un visiteur ne peuvent pas
être révoquées. Le HTML et le code du portfolio restent publics.

## Règle à activer dans le projet Vercel

**Cette règle n’est pas activée par le dépôt ou par un build.** Elle nécessite
l’accès au pare-feu du projet. Le site est statique : un compteur JavaScript
dans le navigateur ne limiterait ni `curl`, ni les autres téléchargements.

Dans **Project → Firewall → Configure → New Rule** :

1. Nom : `public-profile-downloads`.
2. Condition : chemin égal à l’un des chemins suivants (conditions OU) :
   `/agent`, `/agent/`, `/agent.html`, `/agent/index.html`,
   `/agent/profile.md`, `/agent/profile.json`, `/agent/context.txt`, `/llms.txt`,
   `/CV_en.pdf`, `/CV_fr.pdf`, `/cv/fr`, `/cv/fr/`, `/cv/fr/index.html`,
   `/cv/en`, `/cv/en/`, `/cv/en/index.html`.
3. Action : **Rate Limit**, algorithme **Fixed Window**, fenêtre **60 secondes**,
   limite initiale **60 requêtes**, clé **IP**, réponse **429**.
4. Enregistrer, vérifier les changements puis publier la règle.
5. Surveiller les événements et ajuster le seuil selon le trafic réel. Plusieurs
   personnes sur un réseau partagé ont parfois la même IP.

La limite est un point de départ, pas une garantie contre la collecte : les
compteurs Vercel sont régionaux et un robot peut répartir ses requêtes entre IP.
Les lecteurs IA doivent pouvoir effectuer un GET normal sans défi JavaScript.
Il ne faut donc pas bloquer tous les clients `curl` ou tous les agents.

Référence : [rate limiting du pare-feu Vercel](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting).

## Choisir les informations publiques

Les pages, les exports, le JavaScript du site et les deux PDF sont consultables
sans authentification. Les en-têtes de sécurité ne rendent pas leur contenu
privé. Actuellement, l’e-mail et le téléphone figurent encore dans les sources
du profil et les PDF fournis. Leur suppression éventuelle doit couvrir tous ces
formats, puis être suivie d’un nouveau déploiement.

Si une partie doit devenir privée, la sortir de `public/`, des exports et des
sources compilées côté navigateur, puis la servir par un endpoint authentifié.
Ne pas mettre une clé « secrète » dans le frontend : elle serait récupérable.

## Validation avant et après déploiement

```sh
pnpm build
pnpm lint
pnpm test
PORTFOLIO_E2E_PREVIEW=1 pnpm exec playwright test
```

Le mode preview utilise les mêmes en-têtes globaux que `vercel.json` : les tests
vérifient le rendu PDF et le copier-coller sous CSP. Il ne simule pas le pare-feu
Vercel. Après déploiement, vérifier sur le domaine réel les routes `/agent/`,
`/cv/fr/`, `/cv/en/`, les en-têtes HTTP, puis l’état publié de la règle dans
Firewall. Aucune règle WAF ni vérification du déploiement distant n’est annoncée
comme effectuée sans accès au projet.

Références : [configuration Vercel](https://vercel.com/docs/project-configuration/vercel-json),
[en-têtes de sécurité](https://vercel.com/docs/cdn-security/security-headers).
