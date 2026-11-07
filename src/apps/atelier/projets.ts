/**
 * The project pages' words, validated with Alexandre at step 7
 * (docs/atelier/contenu/). French first; the English comes next.
 */

import type { LogoId } from './logos';
import type { Ecran, SchemaId } from './Schemas';

/** A run of text, opened by a bold lead; `href` links the whole of it. */
export type Phrase = { lead?: string; text: string; href?: string };

export type Bloc =
  | ({ type: 'texte' } & Phrase)
  | { type: 'intertitre'; text: string }
  | { type: 'liste'; items: Phrase[] }
  | { type: 'colonnes'; items: Phrase[] }
  /** Cards, each showing a part of the assistant's screen. */
  | { type: 'cartes'; items: (Phrase & { ecran: Ecran })[] }
  | { type: 'question'; text: string }
  | { type: 'compromis'; text: string }
  | { type: 'decision'; n: number; lead: string; text: string; visuel: string; schema?: SchemaId }
  /** A diagram (`schema`), or a placeholder described by its caption. */
  | { type: 'visuel'; schema?: SchemaId; legende: string };

type Section = { id: string; nav: string; titre: string; blocs: Bloc[] };

type Chiffre = { value: string; text: string };

export type Projet = {
  nom: string;
  /** The company's mark, in the title line (journal n° 85). */
  logo: LogoId;
  /** The thumbnail at the top of the page: drawn in the Atelier (the turnout), a picture, or a picture brought to life (affiche); its caption. */
  miniature: { aiguillage?: boolean; image?: string; affiche?: 'alpine'; legende: string };
  accroche: string;
  /** The key figures, first thing under the line (journal n° 81). */
  chiffres: Chiffre[];
  cartel: [string, string][];
  sections: Section[];
};

export const SNCF_GPT: Projet = {
  nom: 'SNCF GPT',
  logo: 'sncf',
  miniature: { aiguillage: true, legende: 'SNCF GPT, détail de l’aiguillage.' },
  accroche: 'Un assistant IA pour le support DevOps, point de départ de SNCF Groupe GPT, l’IA générative du groupe.',
  chiffres: [
    { value: '82 %', text: 'des tickets de niveau 1 résolus par l’assistant support, sur un jeu de test (mesure interne)' },
    { value: '500+', text: 'personnes habilitées sur SNCF Groupe GPT à la fin du stage' },
    { value: '3 000+', text: 'utilisateurs par jour sur SNCF Groupe GPT, une fois branché sur Jira, SharePoint et d’autres sources' },
  ],
  cartel: [
    ['Équipe', 'Seul sur le prototype · à trois sur le démonstrateur · à deux pour la production'],
    ['Période', 'Septembre 2023 – février 2024, à Lyon'],
    ['Rôle', 'Ingénieur IA stagiaire : recherche, RAG, agent, CI/CD, mise en production'],
  ],
  sections: [
    {
      id: 'vue',
      nav: 'Vue d’ensemble',
      titre: 'Comment aider le support d’une usine logicielle qui sert tout le groupe ?',
      blocs: [
        {
          type: 'texte',
          text: 'L’Usine Logicielle d’e.SNCF fournit l’intégration et le déploiement continus à tous les projets du groupe : plus de 1 200 projets et 4 500 utilisateurs. J’ai été le premier membre de sa nouvelle équipe IA, pendant 24 semaines. Au début, j’étais seul sur le projet ; à partir de SNCF Groupe GPT, j’ai travaillé en équipe.',
        },
        {
          type: 'colonnes',
          items: [
            { lead: 'Prototype', text: 'Seul, de septembre à novembre.' },
            { lead: 'Démonstrateur', text: 'À trois, en quatre jours.' },
            { lead: 'Production', text: 'À deux, de décembre à février.' },
          ],
        },
        {
          type: 'texte',
          lead: 'Le problème : la réponse existe déjà, mais un expert la cherche quand même.',
          text: 'Les tickets de niveau 1 se règlent souvent avec la documentation. Mais sur 1 200 projets, le support mobilise les ingénieurs de l’Usine, qui n’avancent plus sur leurs propres sujets.',
        },
        {
          type: 'visuel',
          schema: 'parcours',
          legende: 'Le parcours d’un ticket, du projet aux experts, avec la documentation juste à côté du niveau 1.',
        },
        {
          type: 'texte',
          lead: 'L’opportunité : l’IA générative arrivait, et tout était à construire.',
          text: 'En 2023, la SNCF commençait à peine à s’y intéresser. L’équipe IA de l’Usine venait d’être créée : il n’y avait encore ni méthode ni outil.',
        },
      ],
    },
    {
      id: 'solution',
      nav: 'La solution',
      titre:
        'Un assistant qui lit le ticket, cherche dans la documentation et les incidents déjà résolus, puis propose une résolution avec ses sources.',
      blocs: [
        { type: 'visuel', schema: 'assistant', legende: 'L’écran de l’assistant, redessiné.' },
        {
          type: 'texte',
          text: 'Il ne remplace pas le support : il lui fait gagner la recherche. Chaque réponse dit d’où elle vient, et le support peut la corriger en continuant la conversation.',
        },
      ],
    },
    {
      id: 'support',
      nav: 'Ce que voit le support',
      titre: 'Ce que voit le support',
      blocs: [
        {
          type: 'cartes',
          items: [
            { ecran: 'liste', lead: 'Choisir un ticket ouvert.', text: 'La liste vient directement de ServiceNow.' },
            { ecran: 'incident', lead: 'Lire l’incident, résumé.', text: 'L’assistant en extrait l’essentiel.' },
            {
              ecran: 'reponse',
              lead: 'Une résolution en étapes, avec ses sources.',
              text: 'Les pages de documentation et les incidents similaires déjà résolus.',
            },
            { ecran: 'conversation', lead: 'Continuer la conversation.', text: 'Pour préciser, corriger, creuser.' },
          ],
        },
      ],
    },
    {
      id: 'methode',
      nav: 'Écouter, lire',
      titre: 'J’ai d’abord écouté les équipes, puis lu la recherche.',
      blocs: [
        {
          type: 'texte',
          lead: 'Écouter.',
          text: 'J’ai travaillé main dans la main avec les équipes DevOps et le support. Avant d’écrire du code, je leur ai demandé quels tickets reviennent, où se trouve la réponse et ce qu’ils attendent d’un outil. Leurs retours ont guidé chaque version. L’outil en garde trois partis pris : rester dans le flux des tickets, toujours montrer ses sources, laisser la main à l’humain.',
        },
        {
          type: 'texte',
          lead: 'Lire.',
          text: 'Les papiers de recherche ont été mon école. Pour choisir l’approche, j’ai lu les études qui comparent le RAG et le fine-tuning. Pour l’agent, j’ai lu l’article ReAct (Yao et al.).',
        },
        { type: 'visuel', schema: 'pistes', legende: 'La carte des pistes explorées pendant l’étude.' },
      ],
    },
    {
      id: 'options',
      nav: 'Les options',
      titre: 'J’ai exploré trois façons de donner nos connaissances au modèle.',
      blocs: [
        {
          type: 'colonnes',
          items: [
            {
              lead: 'Entraîner notre propre modèle.',
              text: 'Des millions en calcul et une équipe dédiée : écarté d’emblée.',
            },
            {
              lead: 'Fine-tuner un modèle existant.',
              text: 'Plus coûteux, et à refaire à chaque mise à jour de la documentation.',
            },
            { lead: 'Le RAG.', text: 'Le modèle va chercher dans nos documents au moment de répondre.' },
          ],
        },
        { type: 'intertitre', text: 'Pourquoi le RAG ?' },
        {
          type: 'liste',
          items: [
            { lead: 'Aussi bon, pour bien moins cher.', text: 'C’est ce que montraient les études.' },
            { lead: 'Toujours à jour.', text: 'Une page de doc change ? On la réindexe, sans rien réentraîner.' },
            { lead: 'Vérifiable.', text: 'On sait de quel document vient chaque réponse.' },
          ],
        },
        {
          type: 'texte',
          text: 'Même démarche pour le modèle : un modèle open source demandait de faire tourner nos propres GPU. Azure OpenAI était prêt, accompagné par Microsoft, et les données restaient en France.',
        },
      ],
    },
    {
      id: 'prototype',
      nav: 'Prototype',
      titre: 'Prototyper vite, montrer tôt, recommencer.',
      blocs: [
        {
          type: 'texte',
          lead: 'Le prototype, seul.',
          text: 'J’ai d’abord dessiné l’interface sur Figma, puis je l’ai construite en Python avec Streamlit. Je l’ai présentée à l’équipe le 16 novembre, après presque trois mois. L’intérêt a dépassé l’Usine.',
        },
        {
          type: 'texte',
          lead: 'Le démonstrateur, en quatre jours.',
          text: 'Le lendemain, la direction a voulu une version pour le comité exécutif. Nous l’avons faite à trois, sur la base du prototype. Ma part : la préparation et l’indexation des documents, puis l’interface. C’est devenu SNCF Groupe GPT.',
        },
        {
          type: 'texte',
          lead: 'Les retours.',
          text: 'Les équipes DevOps ont adoré l’assistant. SNCF Groupe GPT, lui, a grandi : je l’ai branché sur Jira ; après mon départ, SharePoint et d’autres sources du groupe ont suivi, jusqu’à plus de 3 000 utilisateurs par jour.',
        },
      ],
    },
    {
      id: 'decisions',
      nav: 'Décisions',
      titre: 'Les décisions techniques',
      blocs: [
        {
          type: 'decision',
          n: 1,
          lead: 'Peu de sources, mais fiables.',
          text: 'J’ai gardé la documentation et l’historique des incidents résolus. J’ai écarté le forum, trop daté, et le fil d’actualité, qui change en permanence.',
          visuel: 'Les sources gardées et écartées.',
          schema: 'sources',
        },
        {
          type: 'decision',
          n: 2,
          lead: 'Une recherche hybride.',
          text: 'Les mots-clés trouvent les codes d’erreur, les vecteurs trouvent le sens, et un reclassement sémantique remonte les meilleurs passages.',
          visuel: 'La recherche hybride : mots-clés et vecteurs en parallèle, puis un reclassement sémantique.',
          schema: 'recherche',
        },
        {
          type: 'decision',
          n: 3,
          lead: 'Lire les PDF avec un modèle, pas avec des règles.',
          text: 'Pour le démonstrateur, j’ai comparé deux outils sur des documents réels : un parseur à règles et Azure Document Intelligence. Seul le second gardait l’ordre de lecture et les tableaux.',
          visuel: 'Le même PDF, lu par les deux outils.',
          schema: 'pdf',
        },
        {
          type: 'decision',
          n: 4,
          lead: 'Laisser le modèle chercher lui-même.',
          text: 'Au début, le système cherchait avant chaque réponse. À la fin, un agent ReAct choisit ses outils, reformule la question et suit les liens d’une documentation organisée en graphe.',
          visuel: 'Avant, après : la recherche systématique, puis la boucle de l’agent.',
          schema: 'agent',
        },
      ],
    },
    {
      id: 'production',
      nav: 'Production',
      titre: 'Un prototype ne se met pas en production tel quel.',
      blocs: [
        {
          type: 'question',
          text: 'Comment faire d’un prototype un outil qu’une autre équipe peut déployer, sécuriser et reprendre ?',
        },
        { type: 'texte', lead: 'La CI/CD de l’Usine, de bout en bout.', text: 'C’est là que je l’ai apprise :' },
        {
          type: 'liste',
          items: [
            { text: 'build et tests dans Jenkins ;' },
            { text: 'qualité et sécurité avec SonarQube et Checkmarx ;' },
            { text: 'artefacts dans Artifactory ;' },
            { text: 'déploiement sur Azure avec Ansible, secrets dans Vault.' },
          ],
        },
        { type: 'visuel', schema: 'pipeline', legende: 'Le pipeline de l’Usine, du commit à la production.' },
        {
          type: 'texte',
          lead: 'Repartir de zéro pour l’interface.',
          text: 'Streamlit ne permettait pas l’authentification SNCF. Nous l’avons réécrite en Flask, à deux sur le même dépôt, puis j’ai passé le projet au collègue qui l’a repris.',
        },
        {
          type: 'compromis',
          text: 'On a refait l’interface plutôt que de forcer le prototype. C’était un détour, mais l’Usine sait maintenant déployer et maintenir l’application.',
        },
      ],
    },
    {
      id: 'resultats',
      nav: 'Résultats',
      titre: 'Résultats',
      blocs: [
        {
          type: 'liste',
          items: [
            { text: 'Présenté au comité exécutif du groupe, qui a demandé de l’ouvrir à tout le groupe.' },
            { text: 'Présenté à plus de 350 personnes de la direction, puis au TechAndFest de Grenoble en 2024.' },
            {
              lead: 'Dans la presse :',
              text: '« Comment la SNCF a déployé son propre ChatGPT », Journal du Net, juin 2024.',
              href: 'https://www.journaldunet.com/intelligence-artificielle/1530933-comment-la-sncf-a-deploye-son-propre-chatgpt/',
            },
          ],
        },
      ],
    },
    {
      id: 'apports',
      nav: 'Ce que ça m’a apporté',
      titre: 'Ce que ça m’a apporté',
      blocs: [
        {
          type: 'texte',
          lead: 'La vraie demande n’est pas la demande formulée.',
          text: 'J’ai appris à poser des questions avant de proposer une solution.',
        },
        {
          type: 'texte',
          lead: 'Un papier de recherche peut trancher une décision.',
          text: 'Il m’a évité des semaines sur la mauvaise piste.',
        },
        {
          type: 'texte',
          lead: 'Un prototype imparfait, montré tôt, vaut mieux qu’un prototype parfait, montré trop tard.',
          text: 'C’est celui du 16 novembre qui a lancé tout le reste.',
        },
        {
          type: 'texte',
          lead: 'La production est un métier à part.',
          text: 'La CI/CD, la sécurité et la passation : c’est là que j’ai compris ce que « du prototype à la production » veut dire.',
        },
        {
          type: 'texte',
          lead: 'Mesurer dès le premier jour.',
          text: 'J’ai testé Langfuse pour suivre la qualité, les coûts et les conversations, sans avoir le temps de le brancher. Aujourd’hui, je commencerais par là.',
        },
      ],
    },
  ],
};

/** Whiteboard AMDEC, the Vitrine's second project (journal n° 96). */
const WHITEBOARD_AMDEC: Projet = {
  nom: 'Whiteboard AMDEC',
  logo: 'alpine',
  miniature: { affiche: 'alpine', legende: 'Whiteboard AMDEC, l’affiche du projet.' },
  accroche: 'Un tableau blanc où des agents IA aident les ingénieurs d’Alpine à construire leurs analyses de risques.',
  chiffres: [
    { value: '6 mois', text: 'd’ateliers pour une AMDEC, au départ' },
    { value: '4 à 5', text: 'ingénieurs autour de fichiers Excel' },
    { value: '8 GPU', text: 'A100 pour faire tourner nos propres modèles' },
  ],
  cartel: [
    ['Équipe', 'Quatre étudiants ; seul sur le produit, le logiciel et l’IA'],
    ['Période', 'Mars – juin 2025, mission de Junior-Entreprise'],
    ['Rôle', 'Conception du produit, agents, RAG, déploiement des modèles'],
  ],
  sections: [
    {
      id: 'vue',
      nav: 'Vue d’ensemble',
      titre: 'Comment aider des ingénieurs à trouver tout ce qui peut lâcher sur une voiture ?',
      blocs: [
        {
          type: 'texte',
          text: 'Une AMDEC passe un système en revue, composant par composant. Pour chacun, on liste ses modes de défaillance, leurs effets et leurs causes, et on les cote. Le client était le groupe Renault ; nous avons surtout travaillé avec Alpine, l’équipe la plus moteur.',
        },
        {
          type: 'colonnes',
          items: [
            { lead: 'Ateliers', text: 'Observer comment les ingénieurs construisent une AMDEC.' },
            { lead: 'Agents', text: 'Les faire proposer des défaillances, et sortir des évidences.' },
            { lead: 'Tableau blanc', text: 'Sortir d’Excel pour une surface partagée.' },
          ],
        },
        {
          type: 'texte',
          lead: 'Le problème : six mois d’ateliers dans des fichiers Excel.',
          text: 'Une AMDEC mobilisait quatre à cinq ingénieurs pendant six mois, dans des tableurs devenus très complexes.',
        },
        { type: 'visuel', schema: 'amdec', legende: 'Une AMDEC classique : la grille, ses colonnes et ses cotes.' },
        {
          type: 'texte',
          lead: 'L’opportunité : des modèles capables de lire les anciennes AMDEC et la documentation des pièces,',
          text: 'pour proposer une première version que les ingénieurs corrigent, au lieu de partir d’une page blanche. L’objectif de la mission : passer de six mois à deux.',
        },
      ],
    },
    {
      id: 'solution',
      nav: 'La solution',
      titre: 'Un tableau blanc, comme Miro, où des agents posent l’analyse et où les ingénieurs la reprennent à la main.',
      blocs: [
        { type: 'visuel', schema: 'whiteboard', legende: 'L’écran du tableau blanc, redessiné.' },
        {
          type: 'texte',
          text: 'Le tableau est écrit en TypeScript, sur une bibliothèque de tableau blanc existante. Les agents y posent des tableaux de défaillances générés, et ils lisent tout ce qui s’y trouve. Les ingénieurs, eux, écrivent, ajoutent et déplacent des éléments, comme sur un vrai tableau.',
        },
      ],
    },
    {
      id: 'ingenieur',
      nav: 'Ce que fait l’ingénieur',
      titre: 'Ce que fait l’ingénieur',
      blocs: [
        {
          type: 'cartes',
          items: [
            { ecran: 'wb-systeme', lead: 'Poser le système.', text: 'Les sous-systèmes et leurs composants, sur le tableau.' },
            { ecran: 'wb-agents', lead: 'Lancer les agents.', text: 'Ils proposent modes de défaillance, effets et causes, en tableaux.' },
            { ecran: 'wb-main', lead: 'Reprendre à la main.', text: 'Écrire, corriger, ajouter ce qui manque.' },
            {
              ecran: 'wb-sources',
              lead: 'S’appuyer sur l’existant.',
              text: 'Les anciennes AMDEC et la documentation des pièces nourrissent chaque proposition.',
            },
          ],
        },
      ],
    },
    {
      id: 'methode',
      nav: 'Observer, expliquer',
      titre: 'J’ai d’abord observé les ateliers, puis j’ai dû expliquer l’IA.',
      blocs: [
        {
          type: 'texte',
          lead: 'Observer.',
          text: 'J’ai suivi des ateliers d’AMDEC et décortiqué d’anciennes analyses, pour voir comment les ingénieurs les construisaient. La demande était un outil pour aider à créer des AMDEC. Sortir d’Excel pour un tableau blanc interactif, c’est le produit que j’ai imaginé et proposé.',
        },
        {
          type: 'texte',
          lead: 'Expliquer.',
          text: 'Ce n’était pas évident pour tout le monde : ce qu’est un LLM, comment il fonctionne, ce dont il a besoin. Au début, certains utilisaient la barre de ChatGPT comme un moteur de recherche. Il fallait accompagner avant de livrer.',
        },
      ],
    },
    {
      id: 'modeles',
      nav: 'Nos modèles',
      titre: 'Ni API, ni cloud : j’ai fait tourner nos propres modèles.',
      blocs: [
        {
          type: 'colonnes',
          items: [
            { lead: 'Une API.', text: 'Pas d’accès au fournisseur cloud du groupe au départ : impossible.' },
            { lead: 'Un grand benchmark.', text: 'Coûteux, long, et dépassé dans trois mois par le prochain modèle : je l’ai déconseillé.' },
            {
              lead: 'Des modèles ouverts, chez nous.',
              text: 'Les meilleurs du printemps 2025 : Mistral Small 3.1, Gemma 3 de Google et Qwen3, servis avec vLLM sur huit GPU A100.',
            },
          ],
        },
        {
          type: 'texte',
          lead: 'Faire tourner un GPU.',
          text: 'J’ai déployé les modèles moi-même : vLLM, puis la mise à jour des pilotes et des frameworks NVIDIA du serveur. C’est là que j’ai appris l’infrastructure d’un modèle, sous la couche d’API.',
        },
        { type: 'visuel', schema: 'pile', legende: 'Ce qui tournait sur le serveur, des GPU au tableau blanc.' },
      ],
    },
    {
      id: 'creativite',
      nav: 'Sortir des évidences',
      titre: 'Le cœur : pousser les agents au-delà des évidences.',
      blocs: [
        {
          type: 'texte',
          lead: 'Le plus dur',
          text: 'n’était pas de générer des défaillances, mais d’éviter les évidences. Un modèle donne d’abord les réponses de tout le monde. Pour une AMDEC, ce sont les défaillances système moins attendues qui comptent.',
        },
        {
          type: 'texte',
          lead: 'Une boucle de créativité.',
          text: 'Les agents génèrent des idées. Chacune est classée et projetée dans un espace d’embeddings. On voit lesquelles se ressemblent, et on relance l’exploration vers les plus éloignées, au lieu de les écarter.',
        },
        { type: 'visuel', schema: 'boucle', legende: 'La boucle : générer, plonger, classer, garder les idées éloignées, relancer.' },
      ],
    },
    {
      id: 'decisions',
      nav: 'Décisions',
      titre: 'Les décisions techniques',
      blocs: [
        {
          type: 'decision',
          n: 1,
          lead: 'Un agent par sous-système, un superviseur au-dessus.',
          text: 'Un seul agent noyait son contexte. Chaque sous-système a donc son agent, et un superviseur garde la vue d’ensemble pour que les agents ne partent pas tous dans la même direction. Construit avec Google ADK et LangGraph.',
          visuel: 'Le graphe des agents.',
          schema: 'agents',
        },
        {
          type: 'decision',
          n: 2,
          lead: 'Mesurer la nouveauté plutôt que la deviner.',
          text: 'La distance entre embeddings dit si une idée est neuve ou une redite.',
          visuel: 'Un nuage d’idées : les grappes de redites et les idées isolées.',
          schema: 'nuage',
        },
        {
          type: 'decision',
          n: 3,
          lead: 'Le RAG pour l’historique, le CAG pour la pièce.',
          text: 'Les anciennes AMDEC sont trop nombreuses : on y cherche (RAG). La documentation technique de la pièce étudiée tient dans le contexte : on la charge en entier (CAG).',
          visuel: 'Les deux chemins jusqu’au modèle.',
          schema: 'ragcag',
        },
        {
          type: 'decision',
          n: 4,
          lead: 'Les agents voient le tableau.',
          text: 'Ils lisent les éléments posés par les ingénieurs et y écrivent à leur tour : l’humain et l’IA travaillent sur la même surface.',
          visuel: 'Les outils des agents sur le tableau.',
          schema: 'outils',
        },
      ],
    },
    {
      id: 'prototype',
      nav: 'Un prototype',
      titre: 'Un prototype, pas un produit.',
      blocs: [
        { type: 'texte', lead: 'Ce qui a marché.', text: 'Le tableau blanc et les agents fonctionnaient de bout en bout.' },
        {
          type: 'texte',
          lead: 'Ce qui n’a pas abouti.',
          text: 'Avec des modèles locaux moins puissants, les propositions n’étaient pas assez bonnes pour convaincre, et l’objectif des deux mois n’a pas pu être mesuré. Des étudiants ont repris le projet après nous.',
        },
        {
          type: 'texte',
          lead: 'Ce qui reste.',
          text: 'L’agencement des agents, les boucles de créativité et l’intégration du RAG et du CAG. Avec les modèles d’aujourd’hui, c’est la partie qui compte, et elle tient.',
        },
        {
          type: 'compromis',
          text: 'Avec des modèles locaux, la qualité plafonnait. Mais c’était la seule façon de commencer sans accès au cloud, et l’architecture se branchera sur un meilleur modèle sans changer.',
        },
      ],
    },
    {
      id: 'apports',
      nav: 'Ce que ça m’a apporté',
      titre: 'Ce que ça m’a apporté',
      blocs: [
        {
          type: 'texte',
          lead: 'L’adoption passe avant la technologie.',
          text: 'On arrive avec des outils puissants chez des gens qui font leur métier depuis des années. Le plus important est d’accompagner, d’expliquer et d’écouter.',
        },
        {
          type: 'texte',
          lead: 'Ne pas benchmarker l’état de l’art.',
          text: 'Les modèles changent tous les trois mois. Mieux vaut une architecture où l’on change de modèle facilement.',
        },
        {
          type: 'texte',
          lead: 'Diviser pour garder le contexte propre.',
          text: 'Un agent par sous-système, un superviseur pour l’ensemble.',
        },
        {
          type: 'texte',
          lead: 'La créativité se construit.',
          text: 'Un modèle seul donne la réponse moyenne. Une boucle qui mesure la nouveauté va chercher plus loin.',
        },
      ],
    },
  ],
};

/** The project pages, by their number on the Vitrine. */
export const PROJETS: Partial<Record<string, Projet>> = { '01': SNCF_GPT, '02': WHITEBOARD_AMDEC };
