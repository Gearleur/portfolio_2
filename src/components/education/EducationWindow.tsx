import { RetroWindow } from '../desktop/RetroWindow';
import type { DesktopWindowControllerProps } from '../desktop/RetroWindow';
import { EducationResume } from './EducationResume';

type EducationWindowProps = DesktopWindowControllerProps;

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
      bodyClassName="retro-window__body--education"
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
