import type { WindowFrame } from '../types/window';

export type CaseStudyChallenge = {
  /** Short label shown in the lattice readout, e.g. "Grounding". */
  tag: string;
  problem: string;
  approach: string;
  shipped: string;
};

export type CaseStudy = {
  context: string;
  challenges: CaseStudyChallenge[];
  architecture?: {
    /** Prose explanation of how the final system fits together. */
    summary: string;
    /** Ordered end-to-end pipeline steps. */
    steps: string[];
    diagram?: {
      alt: string;
      src: string;
    };
  };
  impact: string[];
};

export type SelectedProject = {
  id: string;
  affiliation?: string;
  bullets: string[];
  caseStudy?: CaseStudy;
  period: string;
  presentation?: {
    architecture: string[];
    diagram?: {
      alt: string;
      src: string;
    };
    intro: string;
    links: {
      href: string;
      label: string;
    }[];
    predictions: string[];
    sections: {
      body: string;
      items: string[];
      title: string;
    }[];
  };
  stack: string[];
  summary: string;
  tone: 'cyan' | 'pink' | 'gold' | 'green';
  title: string;
};

export const selectedProjects: SelectedProject[] = [
  {
    id: 'ucl-medical-imaging',
    affiliation: 'University College London',
    period: 'Feb. 2026 - Present',
    title: 'Comparative Study of CNN and Transformer Architectures',
    summary:
      'Research-oriented comparison of CNN and Transformer-based architectures for 3D medical image analysis.',
    bullets: [
      'Compared convolutional and Transformer-based approaches for volumetric medical imaging tasks.',
      'Trained and evaluated early prototype models to assess performance, model complexity and inference constraints.',
      'Analyzed architectural trade-offs for medical imaging workflows where accuracy, compute cost and deployment constraints matter.',
    ],
    stack: ['3D medical imaging', 'CNN', 'Transformers', 'PyTorch', 'Model evaluation'],
    tone: 'cyan',
  },
  {
    id: 'got-search-graph',
    period: '2025',
    title: 'Game of Thrones Character Search Engine & Graph Visualization',
    summary:
      'Search and visualization project for Game of Thrones characters using scraping, NLP and graph exploration.',
    bullets: [
      'Built a character search engine from scraped web data and structured text-processing pipelines.',
      'Applied NLP techniques to extract, normalize and query character-related information.',
      'Designed graph-oriented visualization flows to explore relationships between characters and entities.',
    ],
    stack: ['Web scraping', 'NLP', 'Text processing', 'Search', 'Graph visualization'],
    tone: 'pink',
  },
  {
    id: 'alphazero-gopher-dodo',
    period: '2024',
    title: 'AlphaZero from Scratch - Gopher & Dodo Games',
    summary:
      'Implemented an AlphaZero-inspired AI agent for Gopher and Dodo with self-play and deep reinforcement learning.',
    bullets: [
      'Combined Monte Carlo Tree Search, self-play and deep reinforcement learning in a from-scratch agent.',
      'Designed a matrix-based encoding for game states and legal actions.',
      'Developed a PyTorch residual neural network with policy and value heads for game decision-making.',
    ],
    stack: ['AlphaZero', 'MCTS', 'Self-play', 'Deep RL', 'PyTorch', 'Residual networks'],
    tone: 'gold',
  },
  {
    id: 'tn09-rag-react',
    affiliation: 'TN09 Internship',
    period: '2022',
    title: 'RAG & ReAct Knowledge Assistant',
    summary:
      'Professional experience focused on retrieval-augmented generation, agentic reasoning and the future of knowledge work.',
    bullets: [
      'Studied how an assistant could ground answers in internal documents instead of relying only on model memory.',
      'Mapped the main RAG building blocks: document ingestion, chunking, embeddings, vector search, prompt assembly and cited answers.',
      'Explored ReAct-style loops where the assistant alternates reasoning, retrieval/tool actions, observations and final synthesis.',
      'Projected a shift toward source-grounded assistants connected to personal and team knowledge graphs.',
    ],
    stack: ['RAG', 'ReAct', 'Embeddings', 'Vector search', 'Prompt engineering', 'Obsidian', 'Knowledge graphs'],
    tone: 'green',
    // DRAFT — placeholder case study to refine with your real TN09 problems/solutions.
    caseStudy: {
      context:
        'During my TN09 internship I had to make scattered, heterogeneous project documentation actually usable. The brief: an assistant that answers from internal knowledge instead of improvising — which meant building the full retrieval, grounding and reasoning chain from the ground up.',
      challenges: [
        {
          tag: 'Grounding',
          problem:
            'A raw language model confidently invents answers when it lacks context, which is unacceptable when teammates rely on it for project facts.',
          approach:
            'I inverted the flow: retrieve relevant context first, inject it into a constrained prompt, and require the model to answer only from the provided evidence.',
          shipped:
            'A retrieval-then-generate pipeline where every answer carries source traces, so a reader can verify each claim against its document.',
        },
        {
          tag: 'Ingestion',
          problem:
            'Source material was heterogeneous — notes, reports, wiki pages — with no consistent structure to retrieve against.',
          approach:
            'I designed a cleaning and chunking strategy built around answerable units of knowledge rather than arbitrary character counts, keeping metadata for traceability.',
          shipped:
            'An ingestion process that turns mixed documents into consistent, metadata-tagged chunks ready for embedding.',
        },
        {
          tag: 'Retrieval',
          problem:
            'Keyword search missed paraphrased or conceptually related content, so the right context often never reached the model.',
          approach:
            'I embedded chunks into a vector index and retrieved by semantic similarity, tuning how much context to assemble before generation.',
          shipped:
            'A semantic retriever plus prompt-assembly layer connecting vector search to the generation step.',
        },
        {
          tag: 'Reasoning',
          problem:
            'Single-shot retrieval was not enough for multi-step questions that need to look something up, inspect it, then decide what to fetch next.',
          approach:
            'I added a ReAct-style loop: reason about the task, choose a retrieval/tool action, observe the evidence, and iterate until the answer is grounded enough.',
          shipped:
            'An agent loop exposing search and document lookup as explicit actions, keeping each step connected to verifiable context.',
        },
        {
          tag: 'Research watch',
          problem:
            'The LLM field moves faster than any product roadmap — what is state-of-the-art one month is outdated the next, so a frozen design quickly falls behind.',
          approach:
            'I kept a continuous arXiv watch — now everyone reads it, back then it was the edge — reading and triaging the latest RAG, retrieval and agent papers, then prototyping the few worth adopting.',
          shipped:
            'A habit of turning fresh research into concrete improvements to the assistant, keeping the architecture a step ahead instead of reacting late.',
        },
      ],
      architecture: {
        summary:
          'The final system splits into two cooperating pipelines. An offline ingestion process pulls project material from GitLab and Confluence, cleans and chunks it into answerable units, embeds each chunk through a cloud embedding function and indexes the vectors in a store. At query time the assistant embeds the question, runs semantic search over that index, reranks the best passages, assembles a grounded prompt and calls the served LLM — which answers the client with the retrieved context and its source traces. The ReAct loop sits on top, letting the assistant chain several retrieve-observe steps before committing to a final, cited answer.',
        steps: [
          'Sources — pull documents from GitLab and Confluence alongside notes and domain references.',
          'Ingestion — clean and split content into metadata-tagged chunks built around answerable units of knowledge.',
          'Embedding & indexing — embed each chunk through a cloud embedding function and store the vectors in the index.',
          'Retrieval & rerank — embed the question, run semantic search, then rerank the most relevant passages.',
          'Grounded generation — assemble a constrained prompt, call the served LLM and return the answer with source traces.',
          'ReAct loop — reason, act (retrieve / look up), observe and iterate until the answer is grounded enough.',
        ],
        diagram: {
          src: '/assets/tn09_architecture.png',
          alt: 'TN09 generative-AI architecture: an ingestion process embeds GitLab and Confluence documents into a vector store, and a query pipeline runs semantic search, reranking and LLM serving to answer clients.',
        },
      },
      impact: [
        'Internal search shifts from keyword lookup to conversational, source-grounded answers.',
        'Trust comes from provenance and human-readable traces, not raw generation quality.',
        'The architecture extends naturally toward agentic workflows: retrieve, inspect, act, verify and cite.',
      ],
    },
    presentation: {
      intro:
        'This TN09 project reframes my 2022 professional experience as an early RAG case study: how to turn scattered knowledge into a system that can retrieve, reason and answer with traceable context.',
      links: [
        {
          href: '/Rapport_de_Stage_TN09.pdf',
          label: 'Open TN09 report',
        },
      ],
      diagram: {
        src: '/assets/tn09_architecture.png',
        alt: 'Schema of the TN09 generative AI architecture: ingestion process, embeddings, vector store, LLM serving and GitLab/Confluence sources feeding the clients.',
      },
      architecture: [
        'Collect project documents, notes and domain references.',
        'Clean and split content into reusable chunks with metadata.',
        'Embed chunks and store them in a vector index.',
        'Retrieve the most relevant context for each question.',
        'Assemble a grounded prompt, generate an answer and keep source traces.',
      ],
      sections: [
        {
          title: 'What I did',
          body:
            'I translated a professional documentation problem into an assistant architecture: identify the knowledge sources, prepare them for retrieval, and define how a language model should use retrieved context before answering.',
          items: [
            'Structured the end-to-end pipeline from documents to answers.',
            'Separated retrieval concerns from generation concerns.',
            'Focused on traceability so answers could point back to their sources.',
          ],
        },
        {
          title: 'RAG architecture',
          body:
            'The core idea was to keep the model grounded. Instead of asking an LLM to improvise, the system retrieves context first, injects it into the prompt, then produces an answer constrained by the available evidence.',
          items: [
            'Ingestion and preprocessing for heterogeneous project material.',
            'Chunking strategy designed around answerable units of knowledge.',
            'Retriever plus prompt layer to connect vector search with generation.',
          ],
        },
        {
          title: 'ReAct layer',
          body:
            'The ReAct angle adds an agent loop on top of retrieval: reason about the task, choose an action, observe retrieved evidence, then continue until the final answer is grounded enough.',
          items: [
            'Reasoning steps make the assistant decide what to retrieve next.',
            'Tool actions expose search, notes and document lookup as explicit operations.',
            'Observations keep the response connected to verifiable context.',
          ],
        },
      ],
      predictions: [
        'Internal search would move from keyword lookup to conversational, source-grounded assistants.',
        'Personal knowledge bases such as Obsidian would become graph interfaces for AI memory and retrieval.',
        'RAG would evolve toward agentic workflows: retrieve, inspect, act, verify and cite.',
        'Trust would depend less on raw generation quality and more on provenance, evaluation and human-readable traces.',
      ],
    },
  },
];

export const DEFAULT_PROJECTS_FRAME: WindowFrame = {
  x: 120,
  y: 64,
  width: 900,
  height: 640,
};
