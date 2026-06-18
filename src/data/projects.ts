import type { WindowFrame } from '../types/window';

export type SelectedProject = {
  id: string;
  affiliation?: string;
  bullets: string[];
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
