import { EducationResume } from '../education/EducationResume';
import { ExtracurricularPanel } from '../extracurricular/ExtracurricularPanel';
import { LanguagesPanel } from '../languages/LanguagesPanel';
import { ProfessionalExperiencePanel } from '../professional-experience/ProfessionalExperiencePanel';
import { ProjectsPanel } from '../projects/ProjectsPanel';
import { ResumeIosPanel } from '../resume/ResumeIosPanel';
import { TechnicalSkillsMobilePanel } from '../technical-skills/TechnicalSkillsMobilePanel';
import type { MobileAppId } from './mobileApps';

type MobileAppContentProps = {
  appId: MobileAppId;
  onClose: () => void;
};

export function MobileAppContent({ appId, onClose }: MobileAppContentProps) {
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

  if (appId === 'extracurricular') {
    return <ExtracurricularPanel />;
  }

  if (appId === 'resume') {
    return <ResumeIosPanel onClose={onClose} />;
  }

  return <ProjectsPanel />;
}
