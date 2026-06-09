import { EducationResume } from '../education/EducationResume';
import { LanguagesPanel } from '../languages/LanguagesPanel';
import { ProfessionalExperiencePanel } from '../professional-experience/ProfessionalExperiencePanel';
import { ProjectsPanel } from '../projects/ProjectsPanel';
import { TechnicalSkillsMobilePanel } from '../technical-skills/TechnicalSkillsMobilePanel';
import type { MobileAppId } from './mobileApps';

type MobileAppContentProps = {
  appId: MobileAppId;
};

export function MobileAppContent({ appId }: MobileAppContentProps) {
  if (appId === 'education') {
    return <EducationResume />;
  }

  if (appId === 'professional') {
    return <ProfessionalExperiencePanel />;
  }

  if (appId === 'skills') {
    return <TechnicalSkillsMobilePanel />;
  }

  if (appId === 'languages') {
    return <LanguagesPanel />;
  }

  return <ProjectsPanel />;
}
