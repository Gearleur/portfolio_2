/**
 * The project pages' words, validated with Alexandre at step 7
 * (docs/atelier/contenu/). French first; the English comes next.
 */

/** A run of text, opened by a bold lead; `href` links the whole of it. */
export type Phrase = { lead?: string; text: string; href?: string };

export type Bloc =
  | ({ type: 'texte' } & Phrase)
  | { type: 'intertitre'; text: string }
  | { type: 'liste'; items: Phrase[] }
  | { type: 'colonnes'; items: Phrase[] }
  | { type: 'cartes'; items: Phrase[] }
  | { type: 'chiffres'; items: { value: string; text: string }[] }
  | { type: 'question'; text: string }
  | { type: 'compromis'; text: string }
  | { type: 'decision'; n: number; lead: string; text: string; visuel: string }
  /** A picture: one already drawn (`figure`), or a placeholder described by its caption. */
  | { type: 'visuel'; figure?: 'miniature' | 'plan'; legende: string };

export type Section = { id: string; nav: string; titre: string; blocs: Bloc[] };

export type Projet = {
  nom: string;
  accroche: string;
  cartel: [string, string][];
  sections: Section[];
};

export const SNCF_GPT: Projet = {
  nom: 'SNCF GPT',
  accroche: 'Un assistant pour le support DevOps, devenu l’IA générative du groupe SNCF.',
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
            { lead: 'Production', text: 'De décembre à février.' },
          ],
        },
        {
          type: 'texte',
          lead: 'Le problème : la réponse existe déjà, mais un expert la cherche quand même.',
          text: 'La plupart des tickets de niveau 1 se règlent avec la documentation. Pourtant, ils mobilisent des experts, qui n’avancent plus sur leurs propres sujets.',
        },
        {
          type: 'visuel',
          legende: 'Le parcours d’un ticket, de l’utilisateur à l’expert, avec la documentation juste à côté.',
        },
        {
          type: 'texte',
          lead: 'L’opportunité : l’IA générative arrivait, et tout était à construire.',
          text: 'En 2023, la SNCF commençait à peine à s’y intéresser. Il n’y avait ni équipe IA ni méthode.',
        },
      ],
    },
    {
      id: 'solution',
      nav: 'La solution',
      titre:
        'Un assistant qui lit le ticket, cherche dans la documentation et les incidents déjà résolus, puis propose une résolution avec ses sources.',
      blocs: [
        { type: 'visuel', legende: 'La maquette de l’assistant, refaite.' },
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
            { lead: 'Choisir un ticket ouvert.', text: 'La liste vient directement de ServiceNow.' },
            { lead: 'Lire l’incident, résumé.', text: 'L’assistant en extrait l’essentiel.' },
            {
              lead: 'Une résolution en étapes, avec ses sources.',
              text: 'Les pages de documentation et les incidents similaires déjà résolus.',
            },
            { lead: 'Continuer la conversation.', text: 'Pour préciser, corriger, creuser.' },
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
        { type: 'visuel', legende: 'La carte des pistes explorées.' },
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
              text: 'Des millions d’euros de calcul et une équipe dédiée : écarté.',
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
          text: 'Les équipes DevOps ont adoré. L’outil a ensuite grandi : j’ai branché SNCF Groupe GPT sur Jira ; après mon départ, SharePoint et d’autres sources du groupe ont suivi, et l’outil a dépassé 3 000 utilisateurs par jour.',
        },
      ],
    },
    {
      id: 'decisions',
      nav: 'Décisions',
      titre: 'Les décisions techniques',
      blocs: [
        { type: 'visuel', figure: 'plan', legende: 'L’architecture déployée, en plan de voies.' },
        {
          type: 'decision',
          n: 1,
          lead: 'Peu de sources, mais fiables.',
          text: 'J’ai gardé la documentation et l’historique des incidents résolus. J’ai écarté le forum, trop daté, et le fil d’actualité, qui change en permanence.',
          visuel: 'Les sources gardées et écartées.',
        },
        {
          type: 'decision',
          n: 2,
          lead: 'Une recherche hybride.',
          text: 'Les mots-clés trouvent les codes d’erreur, les vecteurs trouvent le sens, et un reclassement sémantique remonte les meilleurs passages.',
          visuel: 'Les quatre méthodes de recherche comparées.',
        },
        {
          type: 'decision',
          n: 3,
          lead: 'Lire les PDF avec un modèle, pas avec des règles.',
          text: 'Pour le démonstrateur, j’ai comparé deux outils sur des documents réels : un parseur à règles et Azure Document Intelligence. Seul le second gardait l’ordre de lecture et les tableaux.',
          visuel: 'Le même PDF, lu par les deux outils.',
        },
        {
          type: 'decision',
          n: 4,
          lead: 'Laisser le modèle chercher lui-même.',
          text: 'Au début, le système cherchait avant chaque réponse. À la fin, un agent ReAct choisit ses outils, reformule la question et suit les liens d’une documentation organisée en graphe.',
          visuel: 'Avant, après : la recherche systématique, puis la boucle de l’agent.',
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
        { type: 'visuel', legende: 'Le pipeline, du commit à la production.' },
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
          type: 'chiffres',
          items: [
            { value: '82 %', text: 'des incidents de niveau 1 d’un jeu de tickets de test résolus par l’assistant (mesure interne)' },
            { value: '500+', text: 'personnes habilitées à la fin du stage' },
            { value: '3 000+', text: 'utilisateurs par jour, une fois l’outil branché sur Jira, SharePoint et d’autres sources' },
          ],
        },
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
