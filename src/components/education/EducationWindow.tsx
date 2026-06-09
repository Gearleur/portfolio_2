import type { WindowFrame } from '../../types/window';
import { RetroWindow } from '../desktop/RetroWindow';
import { EducationResume } from './EducationResume';

type EducationWindowProps = {
  frame: WindowFrame;
  isMaximized: boolean;
  onClose: () => void;
  onFrameChange: (frame: WindowFrame) => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onActivate: () => void;
  zIndex: number;
};

export function EducationWindow({
  frame,
  isMaximized,
  onClose,
  onFrameChange,
  onMinimize,
  onToggleMaximize,
  onActivate,
  zIndex,
}: EducationWindowProps) {
  return (
    <RetroWindow
      ariaLabel="Fenetre Education"
      frame={frame}
      isMaximized={isMaximized}
      onClose={onClose}
      onFrameChange={onFrameChange}
      onMinimize={onMinimize}
      onToggleMaximize={onToggleMaximize}
      onActivate={onActivate}
      title="Education"
      zIndex={zIndex}
    >
      <EducationResume />
    </RetroWindow>
  );
}
