import { profile } from '../../data/profile';

export type MobileAppId =
  | 'education'
  | 'professional'
  | 'projects'
  | 'skills'
  | 'languages'
  | 'extracurricular'
  | 'resume';

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
    action: 'resume',
    id: 'resume',
    iconSrc: '/assets/icons/mobile/CV.png',
    label: 'CV',
  },
  {
    id: 'browser',
    href: profile.linkedinUrl,
    iconSrc: '/assets/icons/mobile/internet-explorer.png',
    label: 'Linkedin',
  },
];

export const dockApps: MobileApp[] = [
  {
    href: profile.phoneHref,
    id: 'phone',
    iconSrc: '/assets/icons/mobile/Phone.png',
    label: 'Phone',
  },
  {
    href: profile.smsHref,
    id: 'messages',
    iconSrc: '/assets/icons/mobile/Messages.png',
    label: 'Messages',
  },
  {
    href: `mailto:${profile.email}`,
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
