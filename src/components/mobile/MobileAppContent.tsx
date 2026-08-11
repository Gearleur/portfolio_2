import { EducationResume } from '../education/EducationResume';
import { ExtracurricularPanel } from '../extracurricular/ExtracurricularPanel';
import { LanguagesPanel } from '../languages/LanguagesPanel';
import { ProfessionalExperiencePanel } from '../professional-experience/ProfessionalExperiencePanel';
import { ProjectsLanding } from '../projects/ProjectsLanding';
import { ResumeIosPanel } from '../resume/ResumeIosPanel';
import { TechnicalSkillsMobilePanel } from '../technical-skills/TechnicalSkillsMobilePanel';
import type { MobileAppId } from './mobileApps';

type MobileAppContentProps = {
  appId: MobileAppId;
  onClose: () => void;
};

export function MobileAppContent({ appId, onClose }: MobileAppContentProps) {
  const appRenderers: Record<MobileAppId, () => React.ReactNode> = {
    education: () => <EducationResume />,
    professional: () => <ProfessionalExperiencePanel />,
    projects: () => <ProjectsLanding onBack={onClose} />,
    skills: () => <TechnicalSkillsMobilePanel />,
    languages: () => <LanguagesPanel />,
    extracurricular: () => <ExtracurricularPanel />,
    resume: () => <ResumeIosPanel onClose={onClose} />,
  };

  return appRenderers[appId]();
}
