import type { WindowFrame } from '../types/window';

export type ProfessionalExperience = {
  company: string;
  duration: string;
  highlights: string[];
  impact?: string[];
  imageSrc?: string;
  monogram: string;
  period: string;
  role: string;
  summary: string;
  technologies: string[];
};

export const professionalExperiences: ProfessionalExperience[] = [
  {
    company: 'SNCF',
    duration: '1 year',
    impact: [
      "Contributed to one of SNCF's first internal generative AI solutions.",
      'Platform reused as a foundation for additional internal use cases.',
      'Solution used by 3,000+ users per day.',
    ],
    monogram: 'SNCF',
    period: 'Sep. 2023 - Feb. 2024 | Sep. 2025 - Feb. 2026',
    role: 'AI Engineer & Developer Intern',
    summary:
      'Built industrial AI platforms for audio processing, knowledge retrieval and generative AI support workflows.',
    highlights: [
      'Designed a platform turning meetings and audio content into structured, reusable knowledge.',
      'Developed React and FastAPI applications integrating Azure OpenAI in a secure industrial environment.',
      'Built RAG pipelines over internal documentation and ServiceNow incidents with Azure Blob Storage and Azure Cognitive Search.',
      'Integrated Microsoft Bot Framework, Azure Bot Service, Microsoft Graph and Teams webhooks into business workflows.',
      'Industrialized delivery through GitLab, Jenkins, Docker, Ansible, Azure CLI and Vault with SonarQube and Checkmarx quality gates.',
      'Experimented with ReAct agents, tool calling, Langfuse, LangChain, LangGraph, VLM, realtime WebRTC, speech-to-text and text-to-speech models.',
    ],
    technologies: [
      'Azure AI Services',
      'Azure OpenAI',
      'RAG',
      'Python',
      'FastAPI',
      'React',
      'Docker',
      'Kubernetes',
      'Jenkins',
      'Terraform',
      'Ansible',
      'ServiceNow API',
      'Microsoft Graph',
      'LangChain',
      'LangGraph',
      'Langfuse',
      'Go',
      'C',
      'C++',
    ],
  },
  {
    company: 'Renault / Nissan / Alpine',
    duration: '4 months',
    monogram: 'RNA',
    period: 'Mar. 2025 - Jun. 2025',
    role: 'AI Engineer Intern',
    summary:
      'Designed an AI-assisted tool for FMEA creation and deployed LLM inference on multi-GPU infrastructure.',
    highlights: [
      'Designed and developed an AI-augmented tool to accelerate FMEA creation.',
      'Built LLM, vector database and document-processing components for knowledge structuring and risk analysis.',
      'Deployed open-source LLMs on an 8x NVIDIA A100 multi-GPU infrastructure with vLLM.',
      'Optimized serving, batching, memory usage and model/user allocation across GPU resources.',
      'Exposed models through an OpenAI-compatible API and monitored GPU availability, load and saturation.',
    ],
    technologies: [
      'Python',
      'LangChain',
      'Ollama',
      'vLLM',
      'PostgreSQL',
      'Docker',
      'Vector databases',
      'NVIDIA A100',
    ],
  },
  {
    company: 'Personal SaaS Project',
    duration: '4 months',
    monogram: 'AI',
    period: 'Mar. 2025 - Jun. 2025',
    role: 'AI Engineer',
    summary:
      'Built a SaaS platform for automated technical drawing analysis in the metallurgy sector.',
    highlights: [
      'Developed a web platform to process and exploit technical drawings automatically.',
      'Implemented computer vision and deep learning workflows to extract structured data from drawings.',
      'Contributed to a machine-learning estimation system for manufacturing time prediction.',
      'Structured the full value chain from extraction and processing to storage and web-based restitution.',
    ],
    technologies: ['Python', 'PyTorch', 'CNN', 'YOLOv8', 'Transformers', 'PostgreSQL', 'Next.js'],
  },
];

export const DEFAULT_PROFESSIONAL_FRAME: WindowFrame = {
  x: 144,
  y: 72,
  width: 820,
  height: 580,
};
