import type { WindowFrame } from '../../types/window';
import { RetroWindow } from '../desktop/RetroWindow';
import { TechnicalSkillsPanel } from './TechnicalSkillsPanel';

type TechnicalSkillsWindowProps = {
  frame: WindowFrame;
  isMaximized: boolean;
  onClose: () => void;
  onFrameChange: (frame: WindowFrame) => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onActivate: () => void;
  zIndex: number;
};

export function TechnicalSkillsWindow(props: TechnicalSkillsWindowProps) {
  return (
    <RetroWindow
      {...props}
      ariaLabel="Fenetre Technical Skills"
      bodyClassName="retro-window__body--technical-skills"
      title="Technical Skills"
    >
      <TechnicalSkillsPanel />
    </RetroWindow>
  );
}
