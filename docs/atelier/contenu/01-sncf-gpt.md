# SNCF GPT

> Étape 7. Texte français validé le 2026-11-06 (journal n° 73), tiré de ton
> rapport de stage TN09 (septembre 2023 – février 2024) et de tes réponses. Les
> images et les schémas viennent ensuite, puis la version anglaise.
>
> Volontairement absents : les noms de tes collègues, le nom interne de
> l'assistant de support et les captures des applications internes. Les visuels
> sont des schémas et des maquettes refaits par nous.

## La structure, calée sur la page OpenAI de Rachel Chen

Comme chez elle, on **montre d'abord** le produit, puis on raconte comment il s'est
construit : les options explorées, les tests, les décisions, les contraintes. La
leçon vient à la fin. Les titres sont des phrases, les paragraphes font deux ou
trois phrases, et les images sont en pleine largeur juste après chaque
introduction. Un menu des parties reste visible sur le côté.

| # | Chez Rachel | Ici | Tes trois questions |
| --- | --- | --- | --- |
| 0 | Hero + Collaborators · Timeline · Scope | Titre, accroche, cartel | |
| 1 | Overview : question, 3 phases, Problem / Opportunity | Vue d'ensemble | |
| 2 | Solution : « Introducing Tomo » | La solution | Ce que j'ai mis en place |
| 3 | Core Flows : 4 cartes | Ce que voit le support | Ce que j'ai mis en place |
| 4 | Research | Écouter, puis lire | Comment j'ai travaillé |
| 5 | Exploring Form Factors + Why Tomo? | Les options explorées | Comment j'ai travaillé |
| 6 | Prototyping and Testing | Prototyper, montrer, recommencer | Comment j'ai travaillé |
| 7 | Design Decisions : Insight 1, 2 | Les décisions techniques | Ce que j'ai mis en place |
| 8 | Hardware Constraints + compromis | Passer en production | Comment j'ai travaillé |
| 9 | — | Résultats (elle n'en a pas, toi oui) | |
| 10 | Reflection : What I learned | Ce que ça m'a apporté | Ce que ça m'a apporté |

---

## 0. En-tête

**SNCF GPT**
Un assistant pour le support DevOps, devenu l'IA générative du groupe SNCF.

| | |
| --- | --- |
| Équipe | Seul sur le prototype · à trois sur le démonstrateur · à deux pour la production |
| Période | Septembre 2023 – février 2024, à Lyon |
| Rôle | Ingénieur IA stagiaire : recherche, RAG, agent, CI/CD, mise en production |

## 1. Comment aider le support d'une usine logicielle qui sert tout le groupe ?

L'Usine Logicielle d'e.SNCF fournit l'intégration et le déploiement continus à tous
les projets du groupe : plus de 1 200 projets et 4 500 utilisateurs. J'ai été le
premier membre de sa nouvelle équipe IA, pendant 24 semaines. Au début, j'étais
seul sur le projet ; à partir de SNCF Groupe GPT, j'ai travaillé en équipe.

*Trois tuiles :* **Prototype** · **Démonstrateur** · **Production**

**Le problème : la réponse existe déjà, mais un expert la cherche quand même.**
La plupart des tickets de niveau 1 se règlent avec la documentation. Pourtant, ils
mobilisent des experts, qui n'avancent plus sur leurs propres sujets.

*Visuel : le parcours d'un ticket, de l'utilisateur à l'expert, avec la doc juste
à côté et que personne ne regarde.*

**L'opportunité : l'IA générative arrivait, et tout était à construire.** En 2023,
la SNCF commençait à peine à s'y intéresser. Il n'y avait ni équipe IA ni méthode.

## 2. Un assistant qui lit le ticket, cherche dans la documentation et les incidents déjà résolus, puis propose une résolution avec ses sources.

*Visuel principal : la maquette de l'assistant, refaite par nous.*

Il ne remplace pas le support : il lui fait gagner la recherche. Chaque réponse
dit d'où elle vient, et le support peut la corriger en continuant la conversation.

## 3. Ce que voit le support

*Quatre cartes, chacune avec une maquette refaite :*

- **Choisir un ticket ouvert.** La liste vient directement de ServiceNow.
- **Lire l'incident, résumé.** L'assistant en extrait l'essentiel.
- **Une résolution en étapes, avec ses sources.** Les pages de documentation et les
  incidents similaires déjà résolus.
- **Continuer la conversation.** Pour préciser, corriger, creuser.

## 4. J'ai d'abord écouté les équipes, puis lu la recherche.

**Écouter.** J'ai travaillé main dans la main avec les équipes DevOps et le
support. Avant d'écrire du code, je leur ai demandé quels tickets reviennent, où se
trouve la réponse et ce qu'ils attendent d'un outil. Leurs retours ont guidé chaque
version. L'outil en garde trois partis pris : rester dans le flux des tickets,
toujours montrer ses sources, laisser la main à l'humain.

**Lire.** Les papiers de recherche ont été mon école. Pour choisir l'approche, j'ai
lu les études qui comparent le RAG et le fine-tuning. Pour l'agent, j'ai lu
l'article ReAct (Yao et al.).

*Visuel : la carte des pistes explorées (la figure 7.4 de ton rapport, redessinée).*

## 5. J'ai exploré trois façons de donner nos connaissances au modèle.

*Trois colonnes, une phrase chacune :*

- **Entraîner notre propre modèle.** Des millions d'euros de calcul et une équipe
  dédiée : écarté.
- **Fine-tuner un modèle existant.** Plus coûteux, et à refaire à chaque mise à
  jour de la documentation.
- **Le RAG.** Le modèle va chercher dans nos documents au moment de répondre.

**Pourquoi le RAG ?**

- **Aussi bon, pour bien moins cher.** C'est ce que montraient les études.
- **Toujours à jour.** Une page de doc change ? On la réindexe, sans rien
  réentraîner.
- **Vérifiable.** On sait de quel document vient chaque réponse.

Même démarche pour le modèle : un modèle open source demandait de faire tourner nos
propres GPU. Azure OpenAI était prêt, accompagné par Microsoft, et les données
restaient en France.

## 6. Prototyper vite, montrer tôt, recommencer.

**Le prototype, seul.** J'ai d'abord dessiné l'interface sur Figma, puis je l'ai
construite en Python avec Streamlit. Je l'ai présentée à l'équipe le 16 novembre,
après presque trois mois. L'intérêt a dépassé l'Usine.

**Le démonstrateur, en quatre jours.** Le lendemain, la direction a voulu une
version pour le comité exécutif. Nous l'avons faite à trois, sur la base du
prototype. Ma part : la préparation et l'indexation des documents, puis
l'interface. C'est devenu SNCF Groupe GPT.

**Les retours.** Les équipes DevOps ont adoré. L'outil a ensuite grandi : j'ai
branché SNCF Groupe GPT sur Jira ; après mon départ, SharePoint et d'autres
sources du groupe ont suivi, et l'outil a dépassé 3 000 utilisateurs par jour.

## 7. Les décisions techniques

*Un schéma par décision.*

**Décision 1. Peu de sources, mais fiables.** J'ai gardé la documentation et
l'historique des incidents résolus. J'ai écarté le forum, trop daté, et le fil
d'actualité, qui change en permanence.

**Décision 2. Une recherche hybride.** Les mots-clés trouvent les codes d'erreur,
les vecteurs trouvent le sens, et un reclassement sémantique remonte les meilleurs
passages. *Visuel : les quatre méthodes comparées.*

**Décision 3. Lire les PDF avec un modèle, pas avec des règles.** Pour le
démonstrateur, j'ai comparé deux outils sur des documents réels : un parseur à
règles et Azure Document Intelligence. Seul le second gardait l'ordre de lecture et
les tableaux. *Visuel : le même PDF, lu par les deux.*

**Décision 4. Laisser le modèle chercher lui-même.** Au début, le système cherchait
avant chaque réponse. À la fin, un agent ReAct choisit ses outils, reformule la
question et suit les liens d'une documentation organisée en graphe. *Visuel :
avant / après.*

## 8. Un prototype ne se met pas en production tel quel.

Comment faire d'un prototype un outil qu'une autre équipe peut déployer, sécuriser
et reprendre ?

**La CI/CD de l'Usine, de bout en bout.** C'est là que je l'ai apprise :

- build et tests dans Jenkins ;
- qualité et sécurité avec SonarQube et Checkmarx ;
- artefacts dans Artifactory ;
- déploiement sur Azure avec Ansible, secrets dans Vault.

*Visuel : le pipeline, du commit à la production.*

**Repartir de zéro pour l'interface.** Streamlit ne permettait pas l'authentification
SNCF. Nous l'avons réécrite en Flask, à deux sur le même dépôt, puis j'ai passé le
projet au collègue qui l'a repris.

**On a refait l'interface plutôt que de forcer le prototype. C'était un détour, mais
l'Usine sait maintenant déployer et maintenir l'application.**

## 9. Résultats

- Sur un jeu de tickets de test, **82 %** des incidents de niveau 1 résolus par
  l'assistant (mesure interne).
- Plus de 500 personnes habilitées à la fin du stage, puis **plus de 3 000
  utilisateurs par jour** une fois l'outil branché sur Jira, SharePoint et
  d'autres sources du groupe.
- Présenté au comité exécutif du groupe, qui a demandé de l'ouvrir à tout le groupe.
- Présenté à plus de 350 personnes de la direction, puis au TechAndFest de Grenoble
  en 2024.
- Dans la presse : [« Comment la SNCF a déployé son propre ChatGPT »](https://www.journaldunet.com/intelligence-artificielle/1530933-comment-la-sncf-a-deploye-son-propre-chatgpt/),
  Journal du Net, juin 2024.

## 10. Ce que ça m'a apporté

**La vraie demande n'est pas la demande formulée.** J'ai appris à poser des questions
avant de proposer une solution.

**Un papier de recherche peut trancher une décision.** Il m'a évité des semaines sur
la mauvaise piste.

**Un prototype imparfait, montré tôt, vaut mieux qu'un prototype parfait, montré
trop tard.** C'est celui du 16 novembre qui a lancé tout le reste.

**La production est un métier à part.** La CI/CD, la sécurité et la passation :
c'est là que j'ai compris ce que « du prototype à la production » veut dire.

**Mesurer dès le premier jour.** J'ai testé Langfuse pour suivre la qualité, les
coûts et les conversations, sans avoir le temps de le brancher. Aujourd'hui, je
commencerais par là.
