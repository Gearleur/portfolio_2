import type { WindowFrame } from '../types/window';

export type SelectedProject = {
  id: string;
  affiliation?: string;
  bullets: string[];
  period: string;
  stack: string[];
  summary: string;
  tone: 'cyan' | 'pink' | 'gold';
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
];

export const DEFAULT_PROJECTS_FRAME: WindowFrame = {
  x: 120,
  y: 64,
  width: 900,
  height: 640,
};
