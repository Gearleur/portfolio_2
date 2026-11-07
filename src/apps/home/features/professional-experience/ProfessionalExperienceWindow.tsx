import { RetroWindow } from '../desktop/RetroWindow';
import type { DesktopWindowControllerProps } from '../desktop/RetroWindow';
import { ProfessionalExperiencePanel } from './ProfessionalExperiencePanel';

type ProfessionalExperienceWindowProps = DesktopWindowControllerProps;

export function ProfessionalExperienceWindow(props: ProfessionalExperienceWindowProps) {
  return (
    <RetroWindow
      iconSelector=".system-file--professional img"
      {...props}
      ariaLabel="Fenetre Professional Experience"
      bodyClassName="retro-window__body--experience"
      title="Professional Experience"
    >
      <ProfessionalExperiencePanel />
    </RetroWindow>
  );
}
