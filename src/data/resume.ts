import type { WindowFrame } from '../types/window';

export type ResumeDownload = {
  id: string;
  description: string;
  fileName: string;
  href?: string;
  language: string;
  meta: string;
  status: 'available' | 'missing';
};

export const resumeDownloads: ResumeDownload[] = [
  {
    id: 'english',
    language: 'English',
    fileName: 'Alexandre_Teixeira_CV_EN.pdf',
    href: '/CV_en.pdf',
    meta: 'PDF document - English version',
    description: 'Finance-ready resume with education, experience, projects and technical skills.',
    status: 'available',
  },
  {
    id: 'french',
    language: 'Français',
    fileName: 'Alexandre_Teixeira_CV_FR.pdf',
    href: '/CV_fr.pdf',
    meta: 'PDF document - French version',
    description: 'Version francaise du CV, prete pour les candidatures et partages rapides.',
    status: 'available',
  },
];

export const DEFAULT_RESUME_FRAME: WindowFrame = {
  x: 188,
  y: 94,
  width: 680,
  height: 470,
};
