import type { WindowFrame } from '../types/window';

export type TechnicalSkillCategory = {
  id: string;
  description: string;
  iconSrc: string;
  mobileIconSrc: string;
  treeLabel: string;
  skills: string[];
  tone: 'blue' | 'green' | 'pink' | 'violet' | 'amber';
  title: string;
};

export const technicalSkillCategories: TechnicalSkillCategory[] = [
  {
    id: 'ai-llm-engineering',
    title: 'AI / LLM Engineering',
    iconSrc: '/assets/icons/desktop/technical-skills.ico',
    mobileIconSrc: '/assets/icons/mobile/technical-skills.png',
    treeLabel: 'AI / LLM',
    description: 'Production-oriented tooling for language models, embeddings and inference.',
    skills: [
      'PyTorch',
      'TensorFlow',
      'Hugging Face',
      'vLLM',
      'Vector databases',
      'Embeddings',
      'LLM deployment',
    ],
    tone: 'violet',
  },
  {
    id: 'data-science',
    title: 'Data Science & Scientific Computing',
    iconSrc: '/assets/icons/desktop/notes.ico',
    mobileIconSrc: '/assets/icons/mobile/education.png',
    treeLabel: 'Data',
    description: 'Python-based analysis workflows, data processing and scientific visualization.',
    skills: [
      'Python',
      'Pandas',
      'NumPy',
      'Matplotlib',
      'Data processing',
      'Statistical analysis',
    ],
    tone: 'blue',
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning / Deep Learning',
    iconSrc: '/assets/icons/desktop/professional-experience.ico',
    mobileIconSrc: '/assets/icons/mobile/experience.png',
    treeLabel: 'ML / DL',
    description: 'Model design, training, evaluation and preprocessing pipelines.',
    skills: [
      'CNNs',
      'Transformers',
      'ResNet architectures',
      'Scikit-learn',
      'Model training',
      'Model evaluation',
      'Feature engineering',
      'Data preprocessing',
    ],
    tone: 'pink',
  },
  {
    id: 'cloud-devops',
    title: 'Cloud / DevOps',
    iconSrc: '/assets/icons/desktop/projects.ico',
    mobileIconSrc: '/assets/icons/mobile/projects.png',
    treeLabel: 'Cloud',
    description: 'Deployment and delivery stack for AI systems and internal platforms.',
    skills: [
      'Azure AI Services',
      'Azure OpenAI',
      'Docker',
      'Kubernetes',
      'Jenkins',
      'Harbor',
      'Artifactory',
      'GitLab CI/CD',
    ],
    tone: 'green',
  },
  {
    id: 'web-backend',
    title: 'Web / Backend',
    iconSrc: '/assets/icons/desktop/internet-explorer.ico',
    mobileIconSrc: '/assets/icons/mobile/internet-explorer.png',
    treeLabel: 'Backend',
    description: 'API, backend and interface development for data-heavy products.',
    skills: ['React', 'FastAPI', 'Flask', 'Pydantic', 'PostgreSQL', 'REST APIs', 'SQL'],
    tone: 'amber',
  },
];

export const DEFAULT_TECHNICAL_SKILLS_FRAME: WindowFrame = {
  x: 184,
  y: 92,
  width: 820,
  height: 560,
};
