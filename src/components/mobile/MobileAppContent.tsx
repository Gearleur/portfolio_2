import { EducationResume } from '../education/EducationResume';
import { ProfessionalExperiencePanel } from '../professional-experience/ProfessionalExperiencePanel';
import { ProjectsPanel } from '../projects/ProjectsPanel';
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

  return <ProjectsPanel />;
}
