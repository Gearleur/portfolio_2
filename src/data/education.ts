import type { WindowFrame } from '../types/window';

export type EducationEntry = {
  degree: string;
  institution: string;
  location?: string;
  period: string;
  logoAlt: string;
  logoSrc: string;
  coursework: string[];
};

export const educationEntries: EducationEntry[] = [
  {
    degree: "Master's-level Engineering Degree in Computer Science",
    institution: 'University of Technology of Compiègne (UTC)',
    period: '2026',
    logoAlt: 'University of Technology of Compiègne logo',
    logoSrc: '/assets/education/utc.png',
    coursework: [
      'Linear and Nonlinear Optimization',
      'Operations Research',
      'Artificial Intelligence',
      'Logic and Search-Based Problem Solving',
      'Linear Programming',
      'Cybersecurity',
    ],
  },
  {
    degree: 'Exchange Program in Artificial Intelligence',
    institution: 'Shanghai University - UTSEUS',
    location: 'China',
    period: 'Sep. 2024 - Jan. 2025',
    logoAlt: 'Shanghai University logo',
    logoSrc: '/assets/education/universite-shanghai.jpg',
    coursework: [
      'Natural Language Processing',
      'Generative AI',
      'Data Analysis',
      'Data Visualization',
    ],
  },
];

export const DEFAULT_EDUCATION_FRAME: WindowFrame = {
  x: 96,
  y: 96,
  width: 650,
  height: 500,
};
