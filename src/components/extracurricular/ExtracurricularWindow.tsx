import type { WindowFrame } from '../../types/window';
import { RetroWindow } from '../desktop/RetroWindow';
import { ExtracurricularPanel } from './ExtracurricularPanel';

type ExtracurricularWindowProps = {
  frame: WindowFrame;
  isMaximized: boolean;
  onClose: () => void;
  onFrameChange: (frame: WindowFrame) => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onActivate: () => void;
  zIndex: number;
};

export function ExtracurricularWindow(props: ExtracurricularWindowProps) {
  return (
    <RetroWindow
      {...props}
      ariaLabel="Fenetre Extracurricular Experience"
      bodyClassName="retro-window__body--extracurricular"
      title="Extracurricular Experience"
    >
      <ExtracurricularPanel />
    </RetroWindow>
  );
}
