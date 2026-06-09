import type { WindowFrame } from '../../types/window';
import { RetroWindow } from '../desktop/RetroWindow';
import { LanguagesPanel } from './LanguagesPanel';

type LanguagesWindowProps = {
  frame: WindowFrame;
  isMaximized: boolean;
  onClose: () => void;
  onFrameChange: (frame: WindowFrame) => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onActivate: () => void;
  zIndex: number;
};

export function LanguagesWindow(props: LanguagesWindowProps) {
  return (
    <RetroWindow
      {...props}
      ariaLabel="Fenetre Languages"
      bodyClassName="retro-window__body--languages"
      title="Languages"
    >
      <LanguagesPanel />
    </RetroWindow>
  );
}
