export type MachineProject = {
  id: string;
  period: string;
  title: string;
  affiliation?: string;
  summary: string;
  highlights: string[];
  stack: string[];
  system: { component: string; implementation: string }[];
};

export const machineProjects: MachineProject[] = [
  {
    id: 'ucl-medical-imaging',
    period: 'Feb. 2026 - Present',
    title: 'CNN vs. Transformer Architectures for 3D Medical Imaging',
    affiliation: 'University College London (UCL)',
    summary:
      'Benchmarking CNN and Transformer models across predictive performance, architectural complexity and inference constraints.',
    highlights: [
      'Compared convolutional and Transformer-based approaches for volumetric medical imaging.',
      'Evaluated model performance alongside compute cost, memory use and deployment constraints.',
      'Documented architectural trade-offs for accuracy-sensitive medical imaging workflows.',
    ],
    stack: ['PyTorch', 'CNN', 'Transformers', '3D medical imaging', 'Model evaluation'],
    system: [
      { component: 'Input', implementation: 'Volumetric 3D medical images' },
      { component: 'Models', implementation: 'CNN and Transformer architectures' },
      { component: 'Evaluation', implementation: 'Performance, complexity and inference constraints' },
      { component: 'Collaboration', implementation: 'University College London' },
    ],
  },
  {
    id: 'utc-llm-platform',
    period: 'Feb. - Jul. 2025',
    title: 'On-Prem LLM Platform for UTC Students',
    affiliation: 'University of Technology of Compiègne (UTC)',
    summary:
      "A self-hosted language-model platform deployed on UTC infrastructure and made available to the university's students.",
    highlights: [
      'Deployed an on-premise LLM service designed for shared student access.',
      'Combined OpenWebUI and Ollama into a simple interface for discovering and using local models.',
      'Hosted inference on an NVIDIA RTX 5090 while keeping data and model execution on university infrastructure.',
    ],
    stack: ['OpenWebUI', 'Ollama', 'NVIDIA RTX 5090', 'On-premise inference', 'LLM serving'],
    system: [
      { component: 'Interface', implementation: 'OpenWebUI' },
      { component: 'Model runtime', implementation: 'Ollama' },
      { component: 'Compute', implementation: 'NVIDIA RTX 5090' },
      { component: 'Access', implementation: 'Shared platform for UTC students' },
    ],
  },
  {
    id: 'alphazero-gopher-dodo',
    period: '2024',
    title: 'AlphaZero from Scratch — Gopher & Dodo Games',
    summary:
      'A from-scratch AlphaZero-inspired agent combining tree search, self-play and deep reinforcement learning.',
    highlights: [
      'Combined Monte Carlo Tree Search, self-play and deep reinforcement learning.',
      'Designed matrix encodings for game states and legal actions.',
      'Built a PyTorch residual network with separate policy and value heads.',
    ],
    stack: ['Python', 'PyTorch', 'MCTS', 'Self-play', 'Deep RL', 'Residual network'],
    system: [
      { component: 'Search', implementation: 'Monte Carlo Tree Search' },
      { component: 'Training signal', implementation: 'Self-play trajectories' },
      { component: 'Network', implementation: 'PyTorch ResNet with policy + value heads' },
      { component: 'Environments', implementation: 'Gopher and Dodo board games' },
    ],
  },
];

export const machineSkillGroups = [
  {
    label: 'AI / LLM Engineering',
    values: [
      'PyTorch',
      'TensorFlow',
      'Hugging Face',
      'vLLM',
      'LangChain',
      'RAG',
      'embeddings',
      'vector databases',
      'VLMs',
    ],
  },
  {
    label: 'Machine Learning',
    values: ['CNNs', 'Transformers', 'ResNet', 'Scikit-learn', 'model training', 'evaluation'],
  },
  {
    label: 'Cloud / DevOps',
    values: [
      'Azure AI Services',
      'Azure OpenAI',
      'Docker',
      'Kubernetes',
      'Jenkins',
      'Harbor',
      'Artifactory',
      'GitLab CI/CD',
    ],
  },
  {
    label: 'Software',
    values: [
      'Python',
      'React',
      'FastAPI',
      'Flask',
      'Pydantic',
      'PostgreSQL',
      'REST APIs',
      'SQL',
      'Pandas',
      'NumPy',
    ],
  },
];
