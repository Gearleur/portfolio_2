export type MobileAppId =
  | 'education'
  | 'professional'
  | 'projects'
  | 'skills'
  | 'languages'
  | 'extracurricular';

export type MobileApp = {
  action?: MobileAppId;
  href?: string;
  id: string;
  iconSrc: string;
  label: string;
};

export type LaunchableMobileApp = MobileApp & {
  action: MobileAppId;
};

export const homeApps: MobileApp[] = [
  {
    action: 'education',
    id: 'education',
    iconSrc: '/assets/icons/mobile/education.png',
    label: 'Education',
  },
  {
    action: 'projects',
    id: 'projects',
    iconSrc: '/assets/icons/mobile/projects.png',
    label: 'Projects',
  },
  {
    action: 'professional',
    id: 'professional',
    iconSrc: '/assets/icons/mobile/experience.png',
    label: 'Experience',
  },
  {
    action: 'skills',
    id: 'guestbook',
    iconSrc: '/assets/icons/mobile/technical-skills.png',
    label: 'Skills',
  },
  {
    action: 'languages',
    id: 'languages',
    iconSrc: '/assets/icons/mobile/languages.png',
    label: 'Languages',
  },
  {
    action: 'extracurricular',
    id: 'extracurricular',
    iconSrc: '/assets/icons/mobile/extracurricular-experience.png',
    label: 'Activities',
  },
  {
    id: 'browser',
    href: 'https://www.linkedin.com/in/alexandre-teixeira-639636214/',
    iconSrc: '/assets/icons/mobile/internet-explorer.png',
    label: 'Linkedin',
  },
];

export const dockApps: MobileApp[] = [
  {
    href: 'tel:+33786015504',
    id: 'phone',
    iconSrc: '/assets/icons/mobile/Phone.png',
    label: 'Phone',
  },
  {
    href: 'sms:+33786015504',
    id: 'messages',
    iconSrc: '/assets/icons/mobile/Messages.png',
    label: 'Messages',
  },
  {
    href: 'mailto:alexandretei13@gmail.com',
    id: 'mail',
    iconSrc: '/assets/icons/mobile/Mail.png',
    label: 'Mail',
  },
  {
    id: 'music',
    iconSrc: '/assets/icons/mobile/Apple-Music.png',
    label: 'Music',
  },
];

export const mobileIconSources = [...homeApps, ...dockApps].map((app) => app.iconSrc);
