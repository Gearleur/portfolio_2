import { DEFAULT_EDUCATION_FRAME } from '../../data/education';
import { DEFAULT_EXTRACURRICULAR_FRAME } from '../../data/extracurricular';
import { DEFAULT_LANGUAGES_FRAME } from '../../data/languages';
import { DEFAULT_PROFESSIONAL_FRAME } from '../../data/professionalExperience';
import { DEFAULT_PROJECTS_FRAME } from '../../data/projects';
import { DEFAULT_RESUME_FRAME } from '../../data/resume';
import { systemItems } from '../../data/systemItems';
import { DEFAULT_TECHNICAL_SKILLS_FRAME } from '../../data/technicalSkills';
import { useDesktopWindow } from '../../hooks/useDesktopWindow';
import { useWindowStack } from '../../hooks/useWindowStack';
import { EducationIcon } from '../education/EducationIcon';
import { EducationWindow } from '../education/EducationWindow';
import { ExtracurricularWindow } from '../extracurricular/ExtracurricularWindow';
import { LanguagesWindow } from '../languages/LanguagesWindow';
import { ProfessionalExperienceWindow } from '../professional-experience/ProfessionalExperienceWindow';
import { ProjectsLanding } from '../projects/ProjectsLanding';
import { ResumeWindow } from '../resume/ResumeWindow';
import { TechnicalSkillsWindow } from '../technical-skills/TechnicalSkillsWindow';
import { MenuBar } from './MenuBar';
import { SystemIcon } from './SystemIcon';
import './desktop.css';

const DESKTOP_WINDOW_IDS = [
  'education',
  'professional',
  'projects',
  'skills',
  'languages',
  'extracurricular',
  'resume',
] as const;
type DesktopWindowId = (typeof DESKTOP_WINDOW_IDS)[number];

export function DesktopShell() {
  const educationWindow = useDesktopWindow(DEFAULT_EDUCATION_FRAME);
  const professionalWindow = useDesktopWindow(DEFAULT_PROFESSIONAL_FRAME);
  const projectsWindow = useDesktopWindow(DEFAULT_PROJECTS_FRAME);
  const skillsWindow = useDesktopWindow(DEFAULT_TECHNICAL_SKILLS_FRAME);
  const languagesWindow = useDesktopWindow(DEFAULT_LANGUAGES_FRAME);
  const extracurricularWindow = useDesktopWindow(DEFAULT_EXTRACURRICULAR_FRAME);
  const resumeWindow = useDesktopWindow(DEFAULT_RESUME_FRAME);
  const windowStack = useWindowStack<DesktopWindowId>(DESKTOP_WINDOW_IDS);

  const openWindow = (windowId: DesktopWindowId, open: () => void) => {
    windowStack.bringToFront(windowId);
    open();
  };

  return (
    <main className="app-shell">
      <div className="wallpaper-layer" aria-hidden="true" />

      <MenuBar />

      <div className="desktop-surface" aria-label="Bureau portfolio">
        <EducationIcon onOpen={() => openWindow('education', educationWindow.open)} />

        {systemItems.map((item) => (
          <SystemIcon
            item={item}
            key={item.variant}
            onOpen={
              item.variant === 'professional'
                ? () => openWindow('professional', professionalWindow.open)
                : item.variant === 'projects'
                  ? () => openWindow('projects', projectsWindow.open)
                  : item.variant === 'skills'
                    ? () => openWindow('skills', skillsWindow.open)
                    : item.variant === 'languages'
                      ? () => openWindow('languages', languagesWindow.open)
                      : item.variant === 'extracurricular'
                        ? () => openWindow('extracurricular', extracurricularWindow.open)
                        : item.variant === 'resume'
                          ? () => openWindow('resume', resumeWindow.open)
                          : undefined
            }
          />
        ))}

        {educationWindow.isOpen ? (
          <EducationWindow
            frame={educationWindow.frame}
            isMaximized={educationWindow.isMaximized}
            onClose={educationWindow.close}
            onFrameChange={educationWindow.updateFrame}
            onMinimize={educationWindow.minimize}
            onToggleMaximize={educationWindow.toggleMaximize}
            onActivate={() => windowStack.bringToFront('education')}
            zIndex={windowStack.getZIndex('education')}
          />
        ) : null}

        {professionalWindow.isOpen ? (
          <ProfessionalExperienceWindow
            frame={professionalWindow.frame}
            isMaximized={professionalWindow.isMaximized}
            onClose={professionalWindow.close}
            onFrameChange={professionalWindow.updateFrame}
            onMinimize={professionalWindow.minimize}
            onToggleMaximize={professionalWindow.toggleMaximize}
            onActivate={() => windowStack.bringToFront('professional')}
            zIndex={windowStack.getZIndex('professional')}
          />
        ) : null}

        {projectsWindow.isOpen ? <ProjectsLanding onBack={projectsWindow.close} /> : null}

        {skillsWindow.isOpen ? (
          <TechnicalSkillsWindow
            frame={skillsWindow.frame}
            isMaximized={skillsWindow.isMaximized}
            onClose={skillsWindow.close}
            onFrameChange={skillsWindow.updateFrame}
            onMinimize={skillsWindow.minimize}
            onToggleMaximize={skillsWindow.toggleMaximize}
            onActivate={() => windowStack.bringToFront('skills')}
            zIndex={windowStack.getZIndex('skills')}
          />
        ) : null}

        {languagesWindow.isOpen ? (
          <LanguagesWindow
            frame={languagesWindow.frame}
            isMaximized={languagesWindow.isMaximized}
            onClose={languagesWindow.close}
            onFrameChange={languagesWindow.updateFrame}
            onMinimize={languagesWindow.minimize}
            onToggleMaximize={languagesWindow.toggleMaximize}
            onActivate={() => windowStack.bringToFront('languages')}
            zIndex={windowStack.getZIndex('languages')}
          />
        ) : null}

        {extracurricularWindow.isOpen ? (
          <ExtracurricularWindow
            frame={extracurricularWindow.frame}
            isMaximized={extracurricularWindow.isMaximized}
            onClose={extracurricularWindow.close}
            onFrameChange={extracurricularWindow.updateFrame}
            onMinimize={extracurricularWindow.minimize}
            onToggleMaximize={extracurricularWindow.toggleMaximize}
            onActivate={() => windowStack.bringToFront('extracurricular')}
            zIndex={windowStack.getZIndex('extracurricular')}
          />
        ) : null}

        {resumeWindow.isOpen ? (
          <ResumeWindow
            frame={resumeWindow.frame}
            isMaximized={resumeWindow.isMaximized}
            onClose={resumeWindow.close}
            onFrameChange={resumeWindow.updateFrame}
            onMinimize={resumeWindow.minimize}
            onToggleMaximize={resumeWindow.toggleMaximize}
            onActivate={() => windowStack.bringToFront('resume')}
            zIndex={windowStack.getZIndex('resume')}
          />
        ) : null}
      </div>
    </main>
  );
}
