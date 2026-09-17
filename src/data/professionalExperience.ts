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
    imageSrc: '/assets/profesional_experience/sncf.svg.webp',
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
      'RFIs, video calls and in-room meetings generated hours of audio that teams had no time to review.',
      'Processed 90% of audio in under 5 minutes, including transcription, speaker diarization and summarization.',
      'Detected key slides and used vision-language models to inject visual context automatically into generated summaries.',
      'Built the product from prototype to production with React, Python, Azure AI Services, Docker and Jenkins.',
      'Served as the team’s technical reference for AI direction: led an RFI across 15 AI vendors (Mistral AI, IBM, LinkUp and Vespa) and the internal rollout of Mistral Code.',
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
      'Manual, expert-dependent FMEA risk analysis limited the number of workflows that could be covered.',
      'Built an AI-augmented collaborative whiteboard to generate and structure FMEAs at scale.',
      'Combined LLMs and RAG to propose risks, causes and actions while keeping expert validation in the loop.',
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
    imageSrc: '/assets/profesional_experience/esncf.jpg',
    monogram: 'SNCF',
    period: 'Sep. 2023 - Feb. 2024 · Lyon',
    role: 'AI Engineer · Internship',
    summary:
      'Generative AI assistant automating first-line DevOps support.',
    highlights: [
      'Identified the opportunity in L1 DevOps support, where repetitive ServiceNow tickets were handled manually.',
      'Scoped the use case and built the RAG assistant solo from architecture to deployment, delivering an MVP in three months.',
      'Automatically resolved 82% of L1 ServiceNow tickets, eliminating most manual first-line handling.',
      'The product reached 3,000+ monthly users and a 25-person team and was featured on BFM Business.',
      'The product then grew group-wide into SNCF GPT, still running on the architecture I designed, as described in my CV.',
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
