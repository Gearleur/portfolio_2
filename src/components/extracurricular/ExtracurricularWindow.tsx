import { RetroWindow } from '../desktop/RetroWindow';
import type { DesktopWindowControllerProps } from '../desktop/RetroWindow';
import { ExtracurricularPanel } from './ExtracurricularPanel';

type ExtracurricularWindowProps = DesktopWindowControllerProps;

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
