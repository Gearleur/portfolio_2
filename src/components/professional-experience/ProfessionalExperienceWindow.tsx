import type { WindowFrame } from '../../types/window';
import { RetroWindow } from '../desktop/RetroWindow';
import { ProfessionalExperiencePanel } from './ProfessionalExperiencePanel';

type ProfessionalExperienceWindowProps = {
  frame: WindowFrame;
  isMaximized: boolean;
  onClose: () => void;
  onFrameChange: (frame: WindowFrame) => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onActivate: () => void;
  zIndex: number;
};

export function ProfessionalExperienceWindow(props: ProfessionalExperienceWindowProps) {
  return (
    <RetroWindow
      {...props}
      ariaLabel="Fenetre Professional Experience"
      bodyClassName="retro-window__body--experience"
      title="Professional Experience"
    >
      <ProfessionalExperiencePanel />
    </RetroWindow>
  );
}
