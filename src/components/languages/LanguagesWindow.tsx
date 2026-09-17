import { RetroWindow } from '../desktop/RetroWindow';
import type { DesktopWindowControllerProps } from '../desktop/RetroWindow';
import { LanguagesPanel } from './LanguagesPanel';

type LanguagesWindowProps = DesktopWindowControllerProps;

export function LanguagesWindow(props: LanguagesWindowProps) {
  return (
    <RetroWindow
      iconSelector=".system-file--languages img"
      {...props}
      ariaLabel="Fenetre Languages"
      bodyClassName="retro-window__body--languages"
      title="Languages"
    >
      <LanguagesPanel />
    </RetroWindow>
  );
}
