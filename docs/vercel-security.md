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

## Contrôle serveur des exports

Le middleware Vercel `middleware.ts` protège les exports sous `/agent/`, avant
le cache CDN. La page HTML, sa feuille de style et son script restent accessibles.
Les exports `/agent/profile.json`, `/agent/profile.md` et `/agent/context.txt`
acceptent uniquement **GET et HEAD** (405 pour les autres méthodes).

Chaque lecture interroge le pare-feu avec la règle `public-profile-downloads` et
l’IP fournie par Vercel, sans compteur en mémoire ou clé exposée au navigateur :

- quota dépassé : **429**, avec `Retry-After: 60` ;
- blocage explicite du pare-feu : **403** ;
- règle absente, configuration serveur manquante, panne ou délai dépassé : **503** ;
- lecture autorisée : transmission du fichier, avec `Cache-Control: no-store`.

Le code traite explicitement l’erreur `not-found` du SDK : ce dernier retourne
`rateLimited: false` quand la règle manque. Le middleware refuse également de
s’appuyer sur le mode développement du SDK, qui ne compte pas les requêtes.
L’hôte utilisé pour joindre le pare-feu provient de `VERCEL_URL`, pas du client.

**Le middleware sera actif après un déploiement Vercel. Tant que sa règle n’est
pas publiée, les exports et le bouton « Copy all » de `/agent` seront indisponibles
(503). Le profil HTML, les pages CV et le bureau resteront consultables.**

## Règle à activer dans le projet Vercel

La création de la règle nécessite l’accès au projet ; elle n’est pas effectuée
par le build. Dans **Project → Firewall → Configure → New Rule** :

1. Nom : `public-profile-downloads`.
2. Condition : **@vercel/firewall**, Rate limit ID : `public-profile-downloads`.
   Ne pas utiliser uniquement une condition de chemin : le SDK a besoin de cette
   règle dédiée. Ne pas ajouter de filtre de chemin ou d’en-tête supplémentaire.
3. **Rate Limit**, algorithme **Fixed Window**, fenêtre **60 secondes**,
   limite initiale **60 requêtes**, réponse **429**. Le middleware fournit l’IP
   comme clé commune aux trois formats, y compris pour HEAD et les query strings.
4. Enregistrer, vérifier les changements puis **Publish**.
5. Garder les variables système Vercel exposées (`VERCEL`, `VERCEL_URL`). Pour
   les déploiements Preview protégés, suivre aussi la configuration de bypass
   d’automatisation décrite dans la documentation SDK, sans désactiver leur protection.
6. Vérifier un GET normal, puis le retour 429 sur un test limité et contrôlé en
   Preview. Surveiller les événements et ajuster le seuil au trafic réel.

Les compteurs Vercel sont régionaux : ce n’est pas un quota mondial absolu. Un
robot peut aussi répartir ses requêtes entre plusieurs IP. Les lecteurs IA
restent autorisés sous le seuil ; il ne faut pas bloquer tous les clients curl.

Le HTML, les PDF et le JavaScript publics contiennent aussi le profil : ils ne
sont pas rendus privés par cette restriction des exports. Une protection contre
l’abus portant sur tout le site demanderait une règle WAF complémentaire.

Références : [SDK du pare-feu Vercel](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting-sdk),
[Routing Middleware](https://vercel.com/docs/routing-middleware),
[limites de débit](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting).

## Choisir les informations publiques

Les pages, le JavaScript et les deux PDF sont consultables sans authentification.
Les exports sont publics sous réserve du contrôle de débit décrit ci-dessus. Les en-têtes de sécurité ne rendent pas leur contenu
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
vérifient le rendu PDF et le copier-coller sous CSP. Vite dev/preview et un simple hébergement de `dist` n’exécutent pas le middleware
Vercel : les exports y sont sans limite. Les tests unitaires exercent le middleware
et le vrai SDK avec des réponses réseau simulées (autorisation, quota, absence de
règle, panne et timeout). Ils ne remplacent pas un contrôle sur Vercel. Après déploiement, vérifier sur le domaine réel les routes `/agent/`,
`/cv/fr/`, `/cv/en/`, les en-têtes HTTP, puis l’état publié de la règle dans
Firewall. Aucune règle WAF ni vérification du déploiement distant n’est annoncée
comme effectuée sans accès au projet.

Références : [configuration Vercel](https://vercel.com/docs/project-configuration/vercel-json),
[en-têtes de sécurité](https://vercel.com/docs/cdn-security/security-headers).
