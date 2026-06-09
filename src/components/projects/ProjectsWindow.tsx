import type { WindowFrame } from '../../types/window';
import { RetroWindow } from '../desktop/RetroWindow';
import { ProjectsPanel } from './ProjectsPanel';

type ProjectsWindowProps = {
  frame: WindowFrame;
  isMaximized: boolean;
  onClose: () => void;
  onFrameChange: (frame: WindowFrame) => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onActivate: () => void;
  zIndex: number;
};

export function ProjectsWindow(props: ProjectsWindowProps) {
  return (
    <RetroWindow
      {...props}
      ariaLabel="Fenetre Projects"
      bodyClassName="retro-window__body--projects"
      title="Projects"
    >
      <ProjectsPanel />
    </RetroWindow>
  );
}
