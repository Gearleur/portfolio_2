import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { DesktopShell, MobileShell } from './components';
import { MachineResume } from './components/machine/MachineResume';
import { PortfolioModeToggle } from './components/machine/PortfolioModeToggle';
import type { PortfolioMode } from './components/machine/PortfolioModeToggle';
import { CinematicOverlay } from './experience/cinematic/CinematicOverlay';
import { PortalButton } from './experience/portal/PortalButton';
import { RoomLayer, prefetchRoomScene } from './experience/room/RoomLayer';
import {
  ExperienceStageProvider,
  useExperienceStageContext,
} from './experience/stage/ExperienceStageContext';
import { useMediaQuery } from './hooks/useMediaQuery';

/*
 * Les trois calques que `CameraRig` pilote. Hors phase `desktop`, ils sont
 * rendus `inert` : le bureau continue d'exister dans le document (c'est lui
 * qu'on recule, il ne peut pas etre demonte) mais il sort de l'ordre de
 * tabulation. Sans ca, un visiteur au clavier dans la piece finissait par
 * tabuler jusqu'aux icones du bureau -- invisibles sous un calque a
 * `opacity: 0` -- et les activait, ce qui ouvrait une fenetre et notifiait la
 * machine d'etat pendant la cinematique. `pointer-events: none` (experience.css)
 * ne couvrait que la souris.
 */
function ExperienceViewport({ children }: { children: ReactNode }) {
  const { stage } = useExperienceStageContext();

  return (
    <div className="experience-viewport" inert={stage !== 'desktop'}>
      <div className="experience-camera">
        <div className="experience-screen">
          <div id="portfolio-content">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [mode, setMode] = useState<PortfolioMode>('human');

  useEffect(() => {
    document.documentElement.dataset.portfolioMode = mode;
    window.scrollTo(0, 0);

    return () => {
      delete document.documentElement.dataset.portfolioMode;
    };
  }, [mode]);

  useEffect(() => {
    const root = document.querySelector('.experience-root');
    if (!root) {
      return;
    }

    const observer = new MutationObserver(() => {
      if (root.getAttribute('data-portal-ready') === 'true') {
        prefetchRoomScene();
        observer.disconnect();
      }
    });

    observer.observe(root, { attributeFilter: ['data-portal-ready'] });
    return () => observer.disconnect();
  }, []);

  return (
    <ExperienceStageProvider>
      <div className={`portfolio-app portfolio-app--${mode}`}>
        <ExperienceViewport>
          {mode === 'machine' ? (
            <MachineResume />
          ) : isMobile ? (
            <MobileShell />
          ) : (
            <DesktopShell />
          )}
        </ExperienceViewport>

        {/*
         * Le mode machine est le rendu simple et analysable du CV : les
         * sections 3 et 16 de la specification mettent toute modification de
         * ce mode hors perimetre. Le portail y apparaissait pourtant au bout
         * de 40 s sans aucun geste du visiteur, et son clic tirait le CV ATS
         * dans la cinematique 3D. Les trois calques de l'experience
         * n'existent donc qu'en mode humain.
         */}
        {mode === 'human' ? (
          <>
            <PortalButton onActivate={prefetchRoomScene} />
            <RoomLayer />
            <CinematicOverlay />
          </>
        ) : null}

        <PortfolioModeToggle mode={mode} onChange={setMode} />
      </div>
    </ExperienceStageProvider>
  );
}
