import { DEFAULT_EDUCATION_FRAME } from '../../data/education';
import { DEFAULT_PROFESSIONAL_FRAME } from '../../data/professionalExperience';
import { DEFAULT_PROJECTS_FRAME } from '../../data/projects';
import { systemItems } from '../../data/systemItems';
import { useDesktopWindow } from '../../hooks/useDesktopWindow';
import { useWindowStack } from '../../hooks/useWindowStack';
import { EducationIcon } from '../education/EducationIcon';
import { EducationWindow } from '../education/EducationWindow';
import { ProfessionalExperienceWindow } from '../professional-experience/ProfessionalExperienceWindow';
import { ProjectsWindow } from '../projects/ProjectsWindow';
import { MenuBar } from './MenuBar';
import { SystemIcon } from './SystemIcon';
import './desktop.css';

const DESKTOP_WINDOW_IDS = ['education', 'professional', 'projects'] as const;
type DesktopWindowId = (typeof DESKTOP_WINDOW_IDS)[number];

export function DesktopShell() {
  const educationWindow = useDesktopWindow(DEFAULT_EDUCATION_FRAME);
  const professionalWindow = useDesktopWindow(DEFAULT_PROFESSIONAL_FRAME);
  const projectsWindow = useDesktopWindow(DEFAULT_PROJECTS_FRAME);
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

        {projectsWindow.isOpen ? (
          <ProjectsWindow
            frame={projectsWindow.frame}
            isMaximized={projectsWindow.isMaximized}
            onClose={projectsWindow.close}
            onFrameChange={projectsWindow.updateFrame}
            onMinimize={projectsWindow.minimize}
            onToggleMaximize={projectsWindow.toggleMaximize}
            onActivate={() => windowStack.bringToFront('projects')}
            zIndex={windowStack.getZIndex('projects')}
          />
        ) : null}
      </div>
    </main>
  );
}
