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
    duration: '6 months',
    impact: [
      '90% of audio processed in under 5 minutes.',
      'RFI conducted across 15 AI vendors.',
      'Platform built from prototype to production.',
    ],
    monogram: 'SNCF',
    period: 'Sep. 2025 - Feb. 2026 · Paris',
    role: 'AI Engineer · Internship',
    summary:
      'Multimodal AI platform for meeting summarization across RFIs, video calls and in-room meetings.',
    highlights: [
      'Built an internal multimodal platform used across teams for RFIs, video calls and in-room meetings.',
      'Processed 90% of audio in under 5 minutes, including transcription, speaker diarization and summarization.',
      'Detected key slides and used vision-language models to inject visual context automatically into generated summaries.',
      'Built the product from prototype to production with React, Python, Azure AI Services, Docker and Jenkins.',
      'Led an RFI across 15 AI vendors, including Mistral AI, IBM, LinkUp and Vespa, and supported the internal rollout of Mistral Code for engineering teams.',
    ],
    technologies: [
      'Azure AI Services',
      'Python',
      'React',
      'Docker',
      'Jenkins',
      'VLMs',
      'Speaker diarization',
    ],
  },
  {
    company: 'Renault / Alpine',
    duration: '4 months',
    monogram: 'R/A',
    period: 'Mar. 2025 - Jun. 2025 · Compiègne',
    role: 'AI Engineer · Junior-Enterprise Mission',
    summary:
      'AI whiteboard for scaling Failure Mode and Effects Analysis workflows.',
    highlights: [
      'Built an AI-augmented collaborative whiteboard to generate and structure FMEAs at scale.',
      'Combined LLMs and RAG to propose risks, causes, effects and actions while keeping expert validation in the loop.',
      'Industrialized inference on an 8x NVIDIA A100 cluster using vLLM and load balancing.',
    ],
    technologies: ['LLMs', 'RAG', 'Python', 'vLLM', 'NVIDIA A100', 'Load balancing'],
  },
  {
    company: 'SNCF',
    duration: '6 months',
    impact: [
      '82% of L1 tickets resolved automatically.',
      '3,000+ monthly users.',
      'Featured on BFM Business.',
    ],
    monogram: 'SNCF',
    period: 'Sep. 2023 - Feb. 2024 · Lyon',
    role: 'AI Engineer · Internship',
    summary:
      'Generative AI assistant automating first-line DevOps support.',
    highlights: [
      'Built the RAG assistant independently from architecture to deployment and shipped a functional MVP in three months.',
      'Automatically resolved 82% of L1 ServiceNow tickets, eliminating most manual first-line handling.',
      'Helped industrialize the product, which grew to 3,000+ monthly users and a 25-person team and was featured on BFM Business.',
    ],
    technologies: ['Generative AI', 'RAG', 'Python', 'ServiceNow', 'DevOps'],
  },
];

export const DEFAULT_PROFESSIONAL_FRAME: WindowFrame = {
  x: 144,
  y: 72,
  width: 820,
  height: 580,
};
