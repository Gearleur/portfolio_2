export type SystemItemVariant =
  | 'professional'
  | 'projects'
  | 'skills'
  | 'languages'
  | 'extracurricular'
  | 'browser'
  | 'trash';

export type SystemItem = {
  href?: string;
  label: string;
  variant: SystemItemVariant;
  iconSrc: string;
  isDecorative?: boolean;
};

export const systemItems: SystemItem[] = [
  {
    label: 'Professional Experience',
    variant: 'professional',
    iconSrc: '/assets/icons/desktop/professional-experience.ico',
  },
  { label: 'Projects', variant: 'projects', iconSrc: '/assets/icons/desktop/projects.ico' },
  {
    label: 'Technical Skills',
    variant: 'skills',
    iconSrc: '/assets/icons/desktop/technical-skills.ico',
  },
  { label: 'Languages', variant: 'languages', iconSrc: '/assets/icons/desktop/languages.ico' },
  {
    label: 'Extracurricular Experience',
    variant: 'extracurricular',
    iconSrc: '/assets/icons/desktop/extracurricular-experience.ico',
  },
  {
    label: 'Internet Explorer',
    variant: 'browser',
    iconSrc: '/assets/icons/desktop/internet-explorer.ico',
    href: 'https://www.linkedin.com/in/alexandre-teixeira-639636214/',
  },
  {
    label: 'Trash',
    variant: 'trash',
    iconSrc: '/assets/icons/desktop/trash.ico',
    isDecorative: true,
  },
];
