import { RetroWindow } from '../desktop/RetroWindow';
import type { DesktopWindowControllerProps } from '../desktop/RetroWindow';
import { ResumeWindowsPanel } from './ResumeWindowsPanel';

type ResumeWindowProps = DesktopWindowControllerProps;

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
