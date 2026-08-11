import { RetroWindow } from '../desktop/RetroWindow';
import type { DesktopWindowControllerProps } from '../desktop/RetroWindow';
import { TechnicalSkillsPanel } from './TechnicalSkillsPanel';

type TechnicalSkillsWindowProps = DesktopWindowControllerProps;

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
