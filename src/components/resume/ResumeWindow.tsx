import type { WindowFrame } from '../../types/window';
import { RetroWindow } from '../desktop/RetroWindow';
import { ResumeWindowsPanel } from './ResumeWindowsPanel';

type ResumeWindowProps = {
  frame: WindowFrame;
  isMaximized: boolean;
  onClose: () => void;
  onFrameChange: (frame: WindowFrame) => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onActivate: () => void;
  zIndex: number;
};

export function ResumeWindow(props: ResumeWindowProps) {
  return (
    <RetroWindow
      {...props}
      ariaLabel="Fenetre Download CV"
      bodyClassName="retro-window__body--resume"
      title="Download CV"
    >
      <ResumeWindowsPanel />
    </RetroWindow>
  );
}
