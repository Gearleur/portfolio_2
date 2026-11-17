/**
 * The project pages' words, validated with Alexandre at step 7
 * (docs/atelier/contenu/). French first; the English comes next.
 */

import type { LogoId } from './logos';
import architecture from './medias/sncf-architecture.webp';
import hybride from './medias/sncf-hybride.webp';
import langfuse from './medias/sncf-langfuse.webp';
import pCharte from './medias/processus-charte.webp';
import pChemin from './medias/processus-chemin.webp';
import pFond from './medias/processus-fond.webp';
import pTypo from './medias/processus-typo.webp';
import pPistes from './medias/processus-pistes.webp';
import pMikkyLogos from './medias/processus-mikky-logos.webp';
import pMikkyPouvoirs from './medias/processus-mikky-pouvoirs.webp';
import pMikkyAffiche from './medias/processus-mikky-planches.webp';
import pSaifySommaire from './medias/processus-saify-sommaire.webp';
import pSaifyParloa from './medias/processus-saify-parloa.webp';
import pSaifyClones from './medias/processus-saify-clones.webp';
import pSaifyComposants from './medias/processus-saify-composants.webp';
import pSaifyVerre from './medias/processus-saify-verre.webp';
import pSaifyFonds from './medias/processus-saify-fonds.webp';
import pSaifyPiliers from './medias/processus-saify-piliers.webp';
import pSaifyDispositions from './medias/processus-saify-dispositions.webp';
import pSaifyLabo from './medias/processus-saify-labo.webp';
import pSaifyJournal from './medias/processus-saify-journal.webp';
import pSaifyChamps from './medias/processus-saify-champs.webp';
import pSaifySysteme from './medias/processus-saify-systeme.webp';
import pSaifyCarnet from './medias/processus-saify-carnet.webp';
import pSaifyAffiches from './medias/processus-saify-affiches.webp';
import pSaifyEnsemble from './medias/processus-saify-ensemble.webp';
import pMikkyAv1 from './medias/processus-mikky-planches-av1.mp4';
import pMikkyH264 from './medias/processus-mikky-planches-h264.mp4';
import react from './medias/sncf-react.webp';
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
  | { type: 'visuel'; schema?: SchemaId; image?: string; large?: boolean; legende: string; film?: { av1: string; h264: string; affiche: string } };

type Section = { id: string; nav: string; titre: string; blocs: Bloc[] };

type Chiffre = { value: string; text: string };

export type Projet = {
  nom: string;
  /** The company's mark, in the title line (journal n° 85); none on an article that is not about one company. */
  logo?: LogoId;
  /** The thumbnail at the top of the page: drawn in the Atelier (the turnout), a picture, or a picture brought to life (affiche); its caption. */
  miniature: { aiguillage?: boolean; image?: string; affiche?: 'alpine' | 'reunion'; legende: string };
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
          text: 'L’Usine Logicielle d’e.SNCF fournit l’intégration et le déploiement continus à plus de 1 200 projets et 4 500 utilisateurs. J’ai été le premier membre de sa nouvelle équipe IA, pendant 24 semaines : seul au début, en équipe à partir de SNCF Groupe GPT.',
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
        { type: 'intertitre', text: 'Sous le capot, deux chaînes.' },
        { type: 'texte', text: 'L’une prépare la documentation, l’autre répond avec.' },
        {
          type: 'visuel',
          image: architecture,
          large: true,
          legende: 'L’architecture : à gauche l’ingestion, à droite l’agent et ses outils. En vert ce qui était réalisé, en bleu les priorités suivantes.',
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
          text: 'Avant d’écrire du code, j’ai demandé aux équipes DevOps et au support quels tickets reviennent, où se trouve la réponse et ce qu’ils attendent d’un outil. L’outil en garde trois partis pris : rester dans le flux des tickets, toujours montrer ses sources, laisser la main à l’humain.',
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
          type: 'visuel',
          image: hybride,
          legende: 'Mots-clés, vecteurs, hybride, hybride avec reclassement : la part des requêtes bien servies selon le nombre de résultats.',
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
        {
          type: 'visuel',
          image: react,
          large: true,
          legende: 'L’article ReAct (Yao et al.) : raisonner, agir, observer résout ce que ni la réponse directe ni l’action seule ne résolvent.',
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
        { type: 'visuel', image: langfuse, legende: 'Langfuse sur mes tests : les traces, le coût par modèle, la consommation par utilisateur.' },
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

/** Synthèse de réunions, the Vitrine's third project, from the TN10 internship report. */
const SYNTHESE_REUNIONS: Projet = {
  nom: 'Synthèse de réunions',
  logo: 'sncf',
  miniature: { affiche: 'reunion', legende: 'Synthèse de réunions : trois voix sous une loupe de verre.' },
  accroche:
    'Un outil qui transforme une réunion Teams en transcription, en rapport et en conversation, pour retrouver une décision sans réécouter une heure.',
  chiffres: [
    { value: '24 semaines', text: 'dans l’équipe IA d’e.SNCF, de l’exploration au déploiement' },
    { value: '3', text: 'modèles de transcription comparés : Whisper, Faster-Whisper et Voxtral' },
    { value: '2', text: 'Web Apps déployées sur Azure, le front et le back, avec authentification SSO' },
  ],
  cartel: [
    ['Équipe', 'Seul sur la réalisation et le déploiement, dans l’équipe IA d’e.SNCF'],
    ['Période', 'Septembre 2025 – février 2026, à Saint-Denis'],
    ['Rôle', 'Ingénieur IA stagiaire : transcription, LLM, backend, frontend, déploiement Azure'],
  ],
  sections: [
    {
      id: 'vue',
      nav: 'Vue d’ensemble',
      titre: 'Comment retrouver ce qui s’est décidé dans une réunion, sans la réécouter ?',
      blocs: [
        {
          type: 'texte',
          text: 'Dans une grande entreprise, l’information utile se perd dans des réunions d’une heure. J’ai passé mon stage dans l’équipe IA d’e.SNCF, autour de SNCF GPT, à explorer la voix et l’IA générative. J’y ai construit, de l’idée au déploiement, un outil de synthèse de réunions Teams.',
        },
        {
          type: 'colonnes',
          items: [
            { lead: 'Explorer', text: 'Comparer les modèles de transcription et chercher des usages.' },
            { lead: 'Prototyper', text: 'Un résumé de réunion de bout en bout, puis un second cas d’usage sur le terrain.' },
            { lead: 'Déployer', text: 'Un backend et un frontend séparés, sur Azure.' },
          ],
        },
        {
          type: 'texte',
          lead: 'Le problème : l’essentiel d’une réunion est dit, pas écrit.',
          text: 'Une réunion longue éparpille décisions et actions. Pour les retrouver, il faut la réécouter, ou compter sur quelqu’un qui a pris des notes.',
        },
        {
          type: 'texte',
          lead: 'L’opportunité : la transcription est devenue assez fiable pour servir de base.',
          text: 'Avec une transcription qui dit qui parle, un modèle de langage peut résumer, répondre aux questions et extraire les tâches. L’enjeu, pour la SNCF : le faire chez elle, avec des données qui restent chez elle, à un coût maîtrisé.',
        },
      ],
    },
    {
      id: 'sujet',
      nav: 'Le sujet change',
      titre: 'Le sujet de départ n’était pas faisable, alors j’ai changé de piste.',
      blocs: [
        {
          type: 'texte',
          text: 'La convention de stage parlait d’explorer les modèles temps réel. Pour des raisons de sécurité et de déploiement, certains environnements et modèles n’étaient pas utilisables en Europe. Plutôt que d’attendre, nous avons réorienté le stage vers la transcription et la synthèse vocale, pour trouver des usages concrets et déployables.',
        },
        {
          type: 'texte',
          lead: 'Comparer avant de choisir.',
          text: 'J’ai fait des tests comparatifs de Whisper, Faster-Whisper et Voxtral, de Mistral, et ajouté la diarisation avec pyannote pour savoir qui parle. En passant à Voxtral, une partie de cette complexité a disparu : le modèle rend directement des segments exploitables.',
        },
        {
          type: 'texte',
          lead: 'Choisir la réunion.',
          text: 'Parmi les usages repérés, c’était le plus structurant : un contenu long, éparpillé, que tout le monde subit.',
        },
      ],
    },
    {
      id: 'solution',
      nav: 'La solution',
      titre: 'Une réunion entre, un rapport sort, et on peut lui poser des questions.',
      blocs: [
        {
          type: 'visuel',
          schema: 'reunion',
          legende: 'La page d’une réunion, redessinée : la vidéo et sa chronologie, le transcript par locuteur, et les onglets Report et Chat.',
        },
        {
          type: 'texte',
          text: 'On importe une vidéo, ou on récupère une réunion Teams. L’outil produit la transcription avec ses locuteurs, puis un rapport structuré : résumé, points clés, actions. Reste à chatter avec la réunion, pour retrouver un chiffre ou une décision, et assigner des tâches.',
        },
        { type: 'intertitre', text: 'Sous le capot, une chaîne en deux temps.' },
        { type: 'texte', text: 'D’abord on prépare le son, ensuite le modèle lit.' },
        {
          type: 'visuel',
          schema: 'chaine',
          legende: 'De l’enregistrement au transcript par locuteur, puis, par la passerelle LiteLLM, au rapport et au chat.',
        },
      ],
    },
    {
      id: 'decisions',
      nav: 'Décisions',
      titre: 'Les décisions techniques',
      blocs: [
        {
          type: 'texte',
          lead: 'Normaliser le son avant tout.',
          text: 'Les modèles de transcription se comportent mieux sur un signal standard. Tout média est converti dans un même format audio, ce qui rend la chaîne reproductible.',
        },
        {
          type: 'texte',
          lead: 'Découper selon les limites de chaque fournisseur.',
          text: 'Une limite de durée pour l’un, de taille pour l’autre : je coupe avec une marge de sécurité plutôt que de subir l’erreur de l’API.',
        },
        {
          type: 'texte',
          lead: 'Passer par une passerelle, pas par un fournisseur.',
          text: 'Les appels de modèles passent par LiteLLM, compatible avec le format OpenAI et routé vers Azure ou Mistral. Le backend ne dépend d’aucune API, et le modèle change sans toucher à l’architecture.',
        },
        {
          type: 'texte',
          lead: 'Un chat qui raisonne, pas seulement qui répond.',
          text: 'Il suit le motif ReAct : il alterne raisonnement et action, ce qui garde sous contrôle ce que le backend exécute. Le transcript entier est dans le contexte : suffisant pour une réunion, à revoir pour les plus longues.',
        },
        {
          type: 'compromis',
          text: 'La transcription est longue, alors l’API répond tout de suite et le traitement continue derrière, avec le mécanisme de tâche de fond de FastAPI plutôt qu’une file dédiée. C’est moins robuste, mais livrable seul et à temps : l’orchestration est isolée pour pouvoir changer ça.',
        },
      ],
    },
    {
      id: 'ecran',
      nav: 'Ce que dit l’écran',
      titre: 'Un transcript ne dit pas ce qui est affiché à l’écran.',
      blocs: [
        {
          type: 'texte',
          text: 'Dans une présentation, un titre ou un chiffre n’est parfois jamais prononcé. J’ai ajouté au chat le texte vu à l’écran, pour répondre à des questions que la seule transcription ne permet pas.',
        },
        {
          type: 'visuel',
          schema: 'images',
          legende: 'Les images sont choisies avant d’être lues ; les modèles vision-langage sont restés une piste à part.',
        },
        {
          type: 'texte',
          lead: 'Choisir les images avant de les lire.',
          text: 'Une présentation change de slide, puis reste stable. J’échantillonne régulièrement, je densifie autour des changements et j’écarte les doublons avec un hash perceptuel. La sélection compte plus que le moteur d’OCR : un bon OCR ne rattrape pas une image floue.',
        },
        {
          type: 'texte',
          lead: 'Ce qui n’est pas allé plus loin.',
          text: 'J’ai testé Mistral OCR après un outil local, et regardé des modèles vision-langage. Ils ouvrent des usages plus riches, mais sur une vidéo longue il faut décider quand les interroger sans faire exploser latence et coût. La piste est restée à part du pipeline principal.',
        },
      ],
    },
    {
      id: 'deploiement',
      nav: 'Déploiement',
      titre: 'Passer du « ça marche en local » à un outil que l’entreprise accepte.',
      blocs: [
        { type: 'question', text: 'Comment faire entrer l’application dans le cadre de sécurité de l’entreprise ?' },
        {
          type: 'texte',
          lead: 'Deux Web Apps sur Azure,',
          text: 'une pour le front, une pour le back, dans le même groupe de ressources, par la chaîne GitLab, Jenkins et Artifactory de l’entreprise. Chaque brique est une image Docker, le back avec ffmpeg inclus.',
        },
        {
          type: 'visuel',
          schema: 'azure',
          legende: 'Le front envoie /api vers le back, qui parle à la base, au stockage et à la passerelle de modèles.',
        },
        {
          type: 'liste',
          items: [
            {
              lead: 'Le proxy.',
              text: 'Front et back sont sur deux domaines : Nginx redirige /api vers le back, avec les en-têtes qui lui disent qu’il est derrière du HTTPS.',
            },
            {
              lead: 'Le SSO et les cookies.',
              text: 'En local tout passait ; une fois déployé, le navigateur devient strict. J’ai réglé SameSite et le mode sécurisé, un CORS limité à l’origine du front, et l’adresse de retour du SSO.',
            },
            {
              lead: 'Les certificats internes.',
              text: 'Sans eux, les appels vers la passerelle échouaient sur une erreur TLS peu évidente. Le bundle est dans l’image Docker.',
            },
            {
              lead: 'Pas de clé dans le code.',
              text: 'Le back accède au stockage avec une identité managée Azure et les bons rôles.',
            },
          ],
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
            { text: 'Une application complète : un front React, un back FastAPI, une base SQL et un stockage de fichiers, déployée sur Azure.' },
            { text: 'De l’import ou de la réunion Teams jusqu’au rapport, au chat et aux tâches, sur un même écran, avec un enregistrement micro ou écran en picture-in-picture.' },
            { text: 'La voix n’est pas conservée : on garde le transcript et les sorties utiles, comme les résumés.' },
            { text: 'Resté en presque production : stabiliser le déploiement et brancher l’outil sur SNCF GPT sont les étapes suivantes.' },
          ],
        },
      ],
    },
    {
      id: 'cote',
      nav: 'À côté',
      titre: 'À côté, quatre autres missions.',
      blocs: [
        {
          type: 'liste',
          items: [
            {
              lead: 'Un prototype mobile pour les contre-visites.',
              text: 'Une application Flutter où la voix remplace la rédaction : détection de parole, transcription, puis un rapport. Resté un prototype.',
            },
            {
              lead: 'Un hackathon de trois jours sur MCP.',
              text: 'Un assistant qui cherche dans Confluence et GitLab grâce à des outils exposés par un serveur MCP, limité à la lecture.',
            },
            {
              lead: 'Des RFI avec des entreprises d’IA européennes.',
              text: 'Illuin, Gladia, Vespa AI, Galadrim, Hugging Face, Mistral et IBM : plusieurs fois par semaine pendant deux à trois mois, j’ai challengé ce qu’elles font et les technologies derrière, et je me suis projeté à six mois. Ces échanges devaient nourrir un appel d’offres.',
            },
            {
              lead: 'De l’agentique et de l’automatisation.',
              text: 'J’ai agencé des pipelines avec des bibliothèques internes et des modèles Azure : des rapports quotidiens sur l’actualité de la SNCF, des newsletters connectées à plusieurs sources, et des rapports d’audit automatisés des systèmes numériques.',
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
          lead: 'Un sujet se cadre en route.',
          text: 'Le sujet de départ n’était pas déployable. Le réorienter, prioriser et rendre une idée démontrable m’a appris autant que le code.',
        },
        {
          type: 'texte',
          lead: 'Le plus gros du travail est en amont du modèle.',
          text: 'Normaliser le son, découper, choisir les bonnes images : la qualité se joue avant l’appel au LLM.',
        },
        {
          type: 'texte',
          lead: 'L’entreprise commence au déploiement.',
          text: 'Proxy, cookies, certificats, identités : pour l’équipe, un prototype n’existe que s’il passe tout cela.',
        },
        {
          type: 'texte',
          lead: 'Traiter moins est aussi une qualité.',
          text: 'Des images choisies plutôt que toute la vidéo, pas de voix conservée : moins de calcul et moins de données sensibles.',
        },
      ],
    },
  ],
};

/** Not a project: how Alexandre designs a product with AI, told through this portfolio, Mikky and SAIFY's site (docs/atelier/contenu/04-processus-design.md). */
export const PROCESSUS_DESIGN: Projet = {
  nom: 'Comment je dessine un produit avec l’IA',
  miniature: { image: pPistes, legende: 'Les dix-sept mises en page explorées pour ce portfolio. Celle encadrée a été retenue.' },
  accroche: 'L’IA produit, je dirige. Des ateliers en code, des références, des clones qui marchent vraiment, des curseurs, et une décision à la fois.',
  chiffres: [
    { value: '3', text: 'produits dessinés ainsi : ce portfolio, Mikky et le site de SAIFY' },
    { value: '17', text: 'mises en page explorées pour ce portfolio avant d’en garder une' },
    { value: '560+', text: 'décisions datées et justifiées, dans les trois journaux' },
  ],
  cartel: [
    ['Rôle', 'Direction artistique et arbitrage. L’IA propose, construit et consigne'],
    ['Outils', 'Claude Code, des pages d’atelier en code, des clones de vrais produits'],
    ['Période', 'Septembre – novembre 2026'],
  ],
  sections: [
    {
      id: 'vision',
      nav: 'Ma vision',
      titre: 'L’IA propose, je dirige.',
      blocs: [
        {
          type: 'texte',
          text: 'Je ne demande pas à un modèle « fais-moi un beau site ». Je travaille avec lui comme une équipe artistique : il ouvre des pistes, je ferme en choisissant. Le goût, les idées et la décision restent à moi. La production, les variantes et la mémoire des choix, c’est son travail.',
        },
        {
          type: 'colonnes',
          items: [
            { lead: 'Ouvrir', text: 'Des références, des propositions, des variantes qui marchent.' },
            { lead: 'Régler', text: 'Des curseurs bornés sur ce qui reste à décider.' },
            { lead: 'Fermer', text: 'Je tranche, c’est écrit, on passe à la suite.' },
          ],
        },
        {
          type: 'texte',
          lead: 'Le problème : une IA laissée seule produit du générique.',
          text: 'Une page propre, moyenne, qui ressemble à toutes les autres. Ma première refonte de ce portfolio, faite d’un bloc par un agent, était exactement ça : je l’ai jetée.',
        },
        {
          type: 'texte',
          lead: 'L’opportunité : produire ne coûte presque plus rien.',
          text: 'Dix variantes vivantes coûtent quelques minutes. Ce qui devient rare, c’est de savoir choisir et de garder le cap. C’est là que je me place.',
        },
      ],
    },
    {
      id: 'atelier',
      nav: 'L’atelier',
      titre: 'Avant le produit, je construis l’atelier.',
      blocs: [
        {
          type: 'texte',
          text: 'Chaque produit commence par une page qui n’est pas le produit : un atelier, mon Figma en code. Tout y est vivant et cliquable, et c’est la source de vérité. Ce qui n’est pas dans l’atelier n’existe pas dans le produit.',
        },
        { type: 'visuel', image: pCharte, legende: 'L’atelier de ce portfolio s’ouvre sur la charte : le brief, puis chaque décision validée, avec son étape.' },
        {
          type: 'liste',
          items: [
            { lead: 'Ce portfolio.', text: 'Dix étapes, du fond et de l’accent jusqu’à la mise en ligne. Chaque étape garde son établi, à son adresse, pour y revenir sans rien perdre.' },
            { lead: 'Mikky.', text: 'Des planches comme dans Figma : la marque, chaque composant une fois, chaque écran dans chacun de ses états, en clair et en sombre, qui bougent et qu’on clique. Chaque cadre porte une étiquette : Dans l’app, Essai ou À essayer.' },
            { lead: 'SAIFY.', text: 'Le Studio, un atelier par question, du diagnostic au branding. Chaque page pose une seule question, propose deux ou trois réponses, fait parler des voix contraires, puis je tranche.' },
          ],
        },
        { type: 'visuel', film: { av1: pMikkyAv1, h264: pMikkyH264, affiche: pMikkyAffiche }, legende: 'Les neuf planches de Mikky, de la marque à la technique : chaque composant, chaque écran dans chacun de ses états, chaque essai étiqueté.' },
        { type: 'visuel', image: pSaifySommaire, legende: 'Le Studio SAIFY : « Rebâtir SAIFY, un atelier à la fois. »' },
        {
          type: 'texte',
          lead: 'On va du large au précis.',
          text: 'On ne choisit jamais le survol d’un bouton avant d’avoir fixé le fond de la page : fond et accent, couleurs, typo, grille, chemin de fer, composants, contenu, puis la page assemblée.',
        },
      ],
    },
    {
      id: 'references',
      nav: 'Les références',
      titre: 'Je pars de références, jamais d’une page blanche.',
      blocs: [
        {
          type: 'texte',
          text: 'Un modèle sans référence revient à la moyenne. Avec des références, il a une direction. Mais je les annote : pas « j’aime », mais « on prend ça, pour ça ».',
        },
        {
          type: 'liste',
          items: [
            { lead: 'Ce portfolio.', text: 'rachelchen.tech pour la phrase-titre et les paires étiquette et valeur, paulkalkbrenner.net pour un seul moment énorme, clintonvanarnam.net pour la hiérarchie sans changer de taille, les dégradés granuleux de Feral UI pour l’onde qui traverse la page.' },
            { lead: 'Mikky.', text: 'La matrice de points de Nothing, les couleurs système d’Apple, l’ambiance sonore de la PSP, et mes propres captures.' },
            { lead: 'SAIFY.', text: '57 captures de studios (Pentagram, Studio Dumbar, Collins, Koto…) et un banc d’essai de 8 agences et 12 startups, mesurées dans le navigateur plutôt qu’à l’œil.' },
          ],
        },
        { type: 'visuel', image: pSaifyParloa, legende: 'Une référence lue, pas copiée : ce qu’on prend à Parloa Drive pour les carrousels de SAIFY, et ce qu’on change.' },
        {
          type: 'texte',
          lead: 'On reprend des principes, pas des pixels.',
          text: 'La référence donne la direction, la page reste la nôtre.',
        },
      ],
    },
    {
      id: 'clones',
      nav: 'Des clones qui marchent',
      titre: 'Je travaille sur des clones qui marchent, pas sur des maquettes.',
      blocs: [
        {
          type: 'texte',
          text: 'Une maquette ment : elle ne bouge pas, ne charge pas, ne casse pas sur un téléphone. Je préfère partir de vrais produits, reconstruits en front et qui fonctionnent, puis garder ce qui marche le mieux.',
        },
        { type: 'visuel', image: pSaifyClones, legende: 'Onze premiers écrans pour SAIFY, chacun agencé comme un produit connu : Signal comme Thrad, Pipeline comme Linear. Ils tournent pour de vrai, avec le contenu de SAIFY.' },
        {
          type: 'liste',
          items: [
            { lead: 'Des agencements éprouvés.', text: 'Linear, Vercel, Attio, une page produit d’Apple, Raycast : chacun a déjà fait ses preuves. On les reconstruit avec nos couleurs et notre contenu, puis on compare.' },
            { lead: 'Des composants éprouvés.', text: 'Ils reprennent l’anatomie et les états de shadcn/ui et de Base UI, puis prennent nos couleurs.' },
            { lead: 'La maquette est le prototype.', text: 'Dans l’atelier de ce portfolio, chaque mise en page est un vrai premier écran, avec la vraie grille et la vraie typo. Un bouton remplace chaque mot par un pavé gris pour ne juger que la place.' },
          ],
        },
        { type: 'visuel', image: pSaifyComposants, legende: 'La même scène dans quatre familles de formes. Seuls les rayons et la surface des panneaux changent.' },
        { type: 'visuel', image: pSaifyVerre, legende: 'Du vrai verre liquide, calculé pixel par pixel, d’après une bibliothèque libre (liquid-glass-studio, MIT) : on reprend une technique qui marche, pas une image.' },
        {
          type: 'texte',
          lead: 'Juger en vrai.',
          text: 'Une fois, tout me paraissait juste dans l’atelier, et trop gros en ligne : l’atelier agrandissait la page pour remplir l’écran. Depuis, on juge en taille réelle.',
        },
      ],
    },
    {
      id: 'idees',
      nav: 'Demander des idées',
      titre: 'Je demande des idées, pas une réponse.',
      blocs: [
        {
          type: 'texte',
          text: 'Ma règle : deux ou trois propositions, côte à côte et cliquables. Pas une seule option imposée, pas dix non plus. Quand aucune ne me plaît, je ne corrige pas : je demande d’autres idées, ailleurs.',
        },
        { type: 'visuel', image: pChemin, legende: 'Le chemin de fer de ce portfolio : les pistes rangées par famille, chacune un vrai premier écran.' },
        {
          type: 'liste',
          items: [
            { lead: 'Chercher ailleurs.', text: 'Les trois premières compositions ne me suffisaient pas. J’ai demandé des pistes venues des magazines de mode et des cabinets d’architectes : Couverture, Lookbook, Agence, Affiche suisse, puis Journal, Cartel, Plan, Manuel. Dix-sept au total. J’ai gardé la nav latérale, à droite.' },
            { lead: 'Savoir arrêter.', text: 'Pour la miniature de Whiteboard AMDEC, quatre tours (vue éclatée, scan holographique, motion à la Apple, planche de turboréacteur), puis une affiche fixe. Aucune n’était juste : je l’ai faite à part, avec un autre agent.' },
            { lead: 'Faire contester.', text: 'Pour SAIFY, chaque proposition arrive avec son constat, son idée, son rendu et son coût. Puis des voix contraires la contestent avant que je tranche : le directeur financier d’un client, le fondateur, un designer qui n’est pas d’accord.' },
          ],
        },
        { type: 'visuel', image: pSaifyFonds, legende: 'Les fonds de SAIFY : six matières calculées en direct. Le point rouge marque ma préférée.' },
        { type: 'visuel', image: pSaifyPiliers, legende: 'Une idée à creuser : les cinq pièces du S deviennent cinq piliers, une façade de banque à nos couleurs.' },
        { type: 'visuel', image: pSaifyDispositions, legende: 'Douze dispositions du premier écran de SAIFY, en rectangles seulement. Trois retenues, dans l’ordre ; les neuf autres écartées.' },
        { type: 'visuel', image: pMikkyPouvoirs, legende: 'Mikky en pixels : huit couleurs, avec ou sans ses bras, en sprite ou en magicien. Des essais côte à côte, pour choisir d’un regard.' },
        {
          type: 'texte',
          lead: 'Quand quelqu’un dit « je n’aime aucune ».',
          text: 'Cinq identités de plus ne servent à rien. Il faut passer à des variations de réglages (densité, verre, arrondis, accent) sur une base qu’il aime déjà.',
        },
      ],
    },
    {
      id: 'curseurs',
      nav: 'Les curseurs',
      titre: 'Les curseurs donnent une direction, pas la mainmise.',
      blocs: [
        {
          type: 'texte',
          text: 'J’aime régler moi-même, mais dans un cadre. Chaque établi part de préréglages, et chaque curseur est borné : on ajuste sans sortir de la direction choisie.',
        },
        { type: 'visuel', image: pFond, legende: 'L’établi du fond : trois directions, puis teinte, saturation et clarté bornées pour rester dans le « clair et uni ».' },
        {
          type: 'liste',
          items: [
            { lead: 'Le fond de ce portfolio.', text: 'Une saturation entre 0 et 0,03 et une clarté entre 88 et 98 %. « Copier mes réglages » me donne un résumé à coller à l’agent, qui en fait la valeur retenue.' },
            { lead: 'La typo.', text: 'Six compositions de départ, puis une typothèque de 55 polices libres : chacune peut prendre un rôle (titre, texte, étiquettes), avec sa taille sur son curseur.' },
            { lead: 'Le visage de Mikky.', text: 'Un écran de réglage, avec un bouton par état et par geste, et des curseurs pour ses proportions : les yeux, leur écart, les oreilles. On valide les expressions avant de les figer.' },
            { lead: 'SAIFY.', text: 'Sept gammes, quinze contrepoints et trois doses : 315 façons de sortir du tout bleu sans toucher au logo. Douze styles prêts en un clic, « un effet principal et une ou deux touches, jamais plus ».' },
          ],
        },
        { type: 'visuel', image: pTypo, legende: 'L’établi de la typo : la composition retenue, puis la police et la taille de chaque rôle.' },
        { type: 'visuel', image: pSaifyLabo, legende: 'Le laboratoire de SAIFY : gamme, contrepoint, dose et police, réglés en haut de page et appliqués partout.' },
      ],
    },
    {
      id: 'decider',
      nav: 'Décider',
      titre: 'Je choisis vite, et j’écris pourquoi.',
      blocs: [
        {
          type: 'texte',
          text: 'Ma critique tient en trois mots : garde, jette, change, avec un mot de pourquoi (« trop chargé », « pas assez rouge », « ça fait too much »). Je réponds souvent par numéro : « le 1, et le 3 en plus foncé ».',
        },
        {
          type: 'liste',
          items: [
            { lead: 'Une étape, une décision.', text: 'On ne passe à la suivante qu’après mon accord.' },
            { lead: 'Chaque décision va dans un journal,', text: 'avec sa date, ma phrase exacte et sa raison : 107 pour ce portfolio, 102 pour SAIFY, plus de 350 notes datées dans le code de Mikky. Ce qui y est écrit ne se rediscute plus sans raison nouvelle.' },
            { lead: 'Les pistes rejetées quittent le code', text: 'et restent dans l’historique Git. Pas de pistes mortes dans le produit, mais rien n’est perdu : les dix-sept mises en page en tête de cette page sont ressorties de là.' },
            { lead: 'Les numéros ne changent jamais.', text: 'Une piste écartée laisse un trou dans la numérotation : on sait toujours de quoi on parle.' },
          ],
        },
        { type: 'visuel', image: pMikkyLogos, legende: 'Le logo de Mikky : C, qui dépasse, est retenu ; C2, C3 et C4 restent à côté, étiquetés, pour y revenir.' },
        { type: 'visuel', image: pSaifyJournal, legende: 'Le journal du Studio SAIFY : « La première maquette de la landing est rejetée et supprimée : “c’est pas beau”. »' },
        {
          type: 'texte',
          lead: 'Le journal sert aussi l’IA.',
          text: 'Une session neuve relit l’atelier et le journal avant de proposer : elle reprend au bon endroit, sans repartir de zéro.',
        },
      ],
    },
    {
      id: 'resultat',
      nav: 'Le résultat',
      titre: 'Au bout de l’atelier, un système, pas une page.',
      blocs: [
        {
          type: 'texte',
          text: 'Pour SAIFY, j’ai demandé un branding complet, fait comme le ferait un grand studio, tiré de mes préférées et d’elles seules. Une règle : on ne change jamais le champ, on change l’écriture. Le résultat : cent quarante-cinq images prêtes à l’emploi et sept PDF, tous calculés par le code et exportés d’un seul geste.',
        },
        { type: 'visuel', image: pSaifySysteme, legende: 'Le système : six gestes, six écritures, trente-six champs. Chaque case est calculée, pas dessinée.' },
        {
          type: 'colonnes',
          items: [
            { lead: 'Identité', text: 'Un carnet de seize planches, au format d’un carrousel : la marque expliquée en une minute.' },
            { lead: 'Publications', text: 'Cinq carrousels, dix affiches, les bannières et les images de lien.' },
            { lead: 'Le reste', text: 'Une présentation de huit diapositives, des fonds d’écran, la papeterie.' },
          ],
        },
        { type: 'visuel', image: pSaifyChamps, legende: 'Huit champs pour les carrousels : la même bande partout, quatre gestes, puis quatre formes tirées de la finance.' },
        { type: 'visuel', image: pSaifyAffiches, legende: 'Dix affiches, une idée par affiche : c’est ici qu’est la folie.' },
        { type: 'visuel', image: pSaifyCarnet, legende: 'Le carnet d’identité : la couverture, l’idée, le monogramme, le nom sur trois fonds.' },
        { type: 'visuel', image: pSaifyEnsemble, legende: 'L’ensemble : vingt pièces côte à côte. Ce qui compte, c’est qu’on reconnaisse la maison d’une pièce à l’autre.' },
      ],
    },
    {
      id: 'modeles',
      nav: 'Les modèles',
      titre: 'Le modèle le plus fort, seulement pour créer.',
      blocs: [
        {
          type: 'texte',
          text: 'Les modèles réglés sur l’effort le plus élevé ne sont vraiment utiles qu’à un endroit : la création, l’UI et l’UX. Là, ils font la différence. Ailleurs, ils coûtent plus sans faire mieux.',
        },
        {
          type: 'texte',
          lead: 'Ma règle sur SAIFY.',
          text: 'Toute génération créative (territoires, interface, composants, parcours) part sur le modèle le plus fort, à effort élevé, dans une session neuve qui relit d’abord le Studio. Le reste (brancher, déplacer, corriger, optimiser) se fait avec les réglages habituels.',
        },
        {
          type: 'texte',
          lead: 'Pourquoi ça reste propre.',
          text: 'La création se fait dans l’atelier, avec ses tokens et ses composants validés. Le produit n’est assemblé qu’à partir de pièces déjà choisies.',
        },
      ],
    },
    {
      id: 'apports',
      nav: 'Ce que ça m’a appris',
      titre: 'Ce que ça m’a appris',
      blocs: [
        { type: 'texte', lead: 'Le goût ne se délègue pas, la production si.', text: 'L’IA m’a rendu bien plus rapide pour explorer, pas pour décider.' },
        { type: 'texte', lead: 'Ouvrir avant de fermer.', text: 'Les meilleures idées sont venues quand j’ai demandé ailleurs (magazines, architectes, studios), pas quand j’ai corrigé la première proposition.' },
        { type: 'texte', lead: 'Simplifier, toujours.', text: 'Une barre de défilement en vague, un rang de logos, une ligne de trop : la plupart des retraits ont amélioré la page.' },
        { type: 'texte', lead: 'Juger le vrai.', text: 'En taille réelle, sur un vrai téléphone, avec le vrai texte. Une maquette ne m’a jamais dit la vérité.' },
      ],
    },
  ],
};

/** The project pages, by their number on the Vitrine. */
export const PROJETS: Partial<Record<string, Projet>> = { '01': WHITEBOARD_AMDEC, '02': SNCF_GPT, '03': SYNTHESE_REUNIONS, '04': PROCESSUS_DESIGN };
