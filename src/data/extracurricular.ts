import type { WindowFrame } from '../types/window';

export type ExtracurricularExperience = {
  id: string;
  role: string;
  organization: string;
  location: string;
  period: string;
  summary: string;
  bullets: string[];
  tags: string[];
  tone: 'founder' | 'festival';
};

export const extracurricularExperiences: ExtracurricularExperience[] = [
  {
    id: 'founder-breakfast-shanghai',
    role: 'Participant',
    organization: 'Founder Breakfast',
    location: 'Shanghai',
    period: 'Sept. 2024 - Jan. 2025',
    summary:
      "Regular exposure to Shanghai's entrepreneurial ecosystem through conversations with founders, startup operators and innovation-driven profiles.",
    bullets: [
      'Engaged with early-stage venture creation, AI-driven product ideas, market positioning and international business development.',
      'Built a stronger understanding of startup strategy in China, including partnerships, customer discovery and go-to-market challenges.',
      'Developed a more practical perspective on founder decision-making in fast-moving international environments.',
    ],
    tags: ['Startups', 'AI products', 'China market', 'Go-to-market'],
    tone: 'founder',
  },
  {
    id: 'imaginarium-festival',
    role: 'Partnership Manager',
    organization: 'Imaginarium Festival',
    location: 'Compiegne, France',
    period: 'Sept. 2022 - Jun. 2023',
    summary:
      'Partnership and sponsor work for a large-scale student festival with a total budget of EUR600K.',
    bullets: [
      'Sourced, negotiated and managed partnerships with sponsors and external stakeholders.',
      'Aligned partner expectations with festival needs through clear value propositions and relationship management.',
      'Contributed to sponsor outreach, partnership strategy and coordination with internal teams to support event financing.',
    ],
    tags: ['Partnerships', 'Sponsorship', 'EUR600K budget', 'Event financing'],
    tone: 'festival',
  },
];

export const DEFAULT_EXTRACURRICULAR_FRAME: WindowFrame = {
  x: 154,
  y: 78,
  width: 940,
  height: 620,
};
