import { RetroWindow } from '../../components/desktop/RetroWindow';
import type { DesktopWindowControllerProps } from '../../components/desktop/RetroWindow';
import './onboarding.css';

export function ReadmeWindow(props: DesktopWindowControllerProps) {
  return (
    <RetroWindow
      {...props}
      ariaLabel="Lisez-moi"
      bodyClassName="onboarding-readme"
      title="Lisez-moi"
    >
      <p className="onboarding-readme__line">
        Cliquez sur les fichiers du bureau pour ouvrir mon parcours.
      </p>
      <p className="onboarding-readme__hint">Cette fenêtre se déplace, comme les autres.</p>
    </RetroWindow>
  );
}
