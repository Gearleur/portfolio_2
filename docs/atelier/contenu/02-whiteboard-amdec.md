# Whiteboard AMDEC

> Étape 7. Texte français validé le 2026-11-06 (journal n° 96), tiré de tes
> réponses. Deuxième projet de la Vitrine.
>
> Volontairement absents : le nom de ton interlocuteur chez Alpine, toute remarque
> sur tes coéquipiers, et le détail des droits obtenus sur le serveur (le groupe
> docker) : sur un portfolio public, ça se lit comme une faille chez le client.

## Le parti pris

L'outil n'a pas abouti, et la page le dit franchement. Ce qu'elle montre, c'est
ce qui reste valable : faire travailler des agents sur un problème d'ingénieur,
les pousser au-delà des évidences, et faire adopter l'IA par des équipes qui la
découvrent. Pour un recruteur, c'est plus convaincant qu'un succès sans
aspérité.

---

## 0. En-tête

**Whiteboard AMDEC**
Un tableau blanc où des agents IA aident les ingénieurs d'Alpine à construire
leurs analyses de risques.

*Les chiffres d'abord, ceux du point de départ :*

- **6 mois** d'ateliers pour une AMDEC ;
- **4 à 5** ingénieurs autour de fichiers Excel ;
- **8** GPU A100 pour faire tourner nos propres modèles.

| | |
| --- | --- |
| Équipe | Quatre étudiants ; seul sur le produit, le logiciel et l'IA |
| Période | Mars – juin 2025, mission de Junior-Entreprise |
| Rôle | Conception du produit, agents, RAG, déploiement des modèles |

## 1. Comment aider des ingénieurs à trouver tout ce qui peut lâcher sur une voiture ?

Une AMDEC passe un système en revue, composant par composant. Pour chacun, on
liste ses modes de défaillance, leurs effets et leurs causes, et on les cote. Le
client était le groupe Renault ; nous avons surtout travaillé avec Alpine, l'équipe
la plus moteur.

*Trois tuiles :* **Ateliers** · **Agents** · **Tableau blanc**

**Le problème : six mois d'ateliers dans des fichiers Excel.** Une AMDEC
mobilisait quatre à cinq ingénieurs pendant six mois, dans des tableurs devenus
très complexes.

*Visuel : une AMDEC classique, la grille Excel et ses colonnes.*

**L'opportunité : des modèles capables de lire les anciennes AMDEC et la
documentation des pièces**, pour proposer une première version que les
ingénieurs corrigent, au lieu de partir d'une page blanche. L'objectif de la
mission : passer de six mois à deux.

## 2. Un tableau blanc, comme Miro, où des agents posent l'analyse et où les ingénieurs la reprennent à la main.

*Visuel principal : l'écran du tableau blanc, redessiné.*

Le tableau est écrit en TypeScript, sur une bibliothèque de tableau blanc
existante. Les agents y posent des tableaux de
défaillances générés, et ils lisent tout ce qui s'y trouve. Les ingénieurs, eux,
écrivent, ajoutent et déplacent des éléments, comme sur un vrai tableau.

## 3. Ce que fait l'ingénieur

*Quatre cartes, chacune avec une partie de l'écran redessiné :*

- **Poser le système.** Les sous-systèmes et leurs composants, sur le tableau.
- **Lancer les agents.** Ils proposent modes de défaillance, effets et causes, en
  tableaux.
- **Reprendre à la main.** Écrire, corriger, ajouter ce qui manque.
- **S'appuyer sur l'existant.** Les anciennes AMDEC et la documentation des pièces
  nourrissent chaque proposition.

## 4. J'ai d'abord observé les ateliers, puis j'ai dû expliquer l'IA.

**Observer.** J'ai suivi des ateliers d'AMDEC et décortiqué d'anciennes analyses,
pour voir comment les ingénieurs les construisaient. La demande était un outil
pour aider à créer des AMDEC. Sortir d'Excel pour un tableau blanc interactif,
c'est le produit que j'ai imaginé et proposé.

**Expliquer.** Ce n'était pas évident pour tout le monde : ce qu'est un LLM,
comment il fonctionne, ce dont il a besoin. Au début, certains utilisaient la
barre de ChatGPT comme un moteur de recherche. Il fallait accompagner avant de
livrer.

## 5. Ni API, ni cloud : j'ai fait tourner nos propres modèles.

*Trois colonnes :*

- **Une API.** Pas d'accès au fournisseur cloud du groupe au départ : impossible.
- **Un grand benchmark.** Coûteux, long, et dépassé dans trois mois par le
  prochain modèle : je l'ai déconseillé.
- **Des modèles open source, chez nous.** Les meilleurs modèles ouverts du
  printemps 2025 : Mistral Small 3.1, Gemma 3 de Google et Qwen3, servis avec
  vLLM sur huit GPU A100.

**Faire tourner un GPU.** J'ai déployé les modèles moi-même : vLLM, puis la mise à
jour des pilotes et des frameworks NVIDIA du serveur. C'est là que j'ai appris
l'infrastructure d'un modèle, sous la couche d'API.

## 6. Le cœur : pousser les agents au-delà des évidences.

**Le plus dur** n'était pas de générer des défaillances, mais d'éviter les
évidences. Un modèle donne d'abord les réponses de tout le monde. Pour une AMDEC,
ce sont les défaillances système moins attendues qui comptent.

**Une boucle de créativité.** Les agents génèrent des idées. Chacune est classée
et projetée dans un espace d'embeddings. On voit lesquelles se ressemblent, et
on relance l'exploration vers les plus éloignées, au lieu de les écarter.

*Visuel : la boucle. Générer, plonger dans l'espace des embeddings, classer,
garder les idées éloignées, relancer.*

## 7. Les décisions techniques

**Décision 1. Un agent par sous-système, un superviseur au-dessus.** Un seul agent
noyait son contexte. Chaque sous-système a donc son agent, et un superviseur
garde la vue d'ensemble pour que les agents ne partent pas tous dans la même
direction. Construit avec Google ADK et LangGraph. *Visuel : le graphe des
agents.*

**Décision 2. Mesurer la nouveauté plutôt que la deviner.** La distance entre
embeddings dit si une idée est neuve ou une redite. *Visuel : un nuage d'idées,
les grappes de redites et les idées isolées.*

**Décision 3. Le RAG pour l'historique, le CAG pour la pièce.** Les anciennes AMDEC
sont trop nombreuses : on y cherche (RAG). La documentation technique de la pièce
étudiée tient dans le contexte : on la charge en entier (CAG). *Visuel : les deux
chemins jusqu'au modèle.*

**Décision 4. Les agents voient le tableau.** Ils lisent les éléments posés par les
ingénieurs et y écrivent à leur tour : l'humain et l'IA travaillent sur la même
surface. *Visuel : les outils des agents sur le tableau.*

## 8. Un prototype, pas un produit.

**Ce qui a marché.** Le tableau blanc et les agents fonctionnaient de bout en
bout.

**Ce qui n'a pas abouti.** Avec des modèles locaux moins puissants, les
propositions n'étaient pas assez bonnes pour convaincre, et l'objectif des deux
mois n'a pas pu être mesuré. Des étudiants ont repris le projet après nous.

**Ce qui reste.** L'agencement des agents, les boucles de créativité et
l'intégration du RAG et du CAG. Avec les modèles d'aujourd'hui, c'est la partie qui
compte, et elle tient.

**Avec des modèles locaux, la qualité plafonnait. Mais c'était la seule façon de
commencer sans accès au cloud, et l'architecture se branchera sur un meilleur
modèle sans changer.**

## 9. Ce que ça m'a apporté

**L'adoption passe avant la technologie.** On arrive avec des outils puissants
chez des gens qui font leur métier depuis des années. Le plus important est
d'accompagner, d'expliquer et d'écouter.

**Ne pas benchmarker l'état de l'art.** Les modèles changent tous les trois mois.
Mieux vaut une architecture où l'on change de modèle facilement.

**Diviser pour garder le contexte propre.** Un agent par sous-système, un
superviseur pour l'ensemble.

**La créativité se construit.** Un modèle seul donne la réponse moyenne. Une
boucle qui mesure la nouveauté va chercher plus loin.
