import { useEffect, useState } from 'react';
import { DesktopShell, MobileShell } from './components';
import { MachineResume } from './components/machine/MachineResume';
import { PortfolioModeToggle } from './components/machine/PortfolioModeToggle';
import type { PortfolioMode } from './components/machine/PortfolioModeToggle';
import { CinematicOverlay } from './experience/cinematic/CinematicOverlay';
import { PortalButton } from './experience/portal/PortalButton';
import { RoomLayer, prefetchRoomScene } from './experience/room/RoomLayer';
import { ExperienceStageProvider } from './experience/stage/ExperienceStageContext';
import { useMediaQuery } from './hooks/useMediaQuery';

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
        <div className="experience-viewport">
          <div className="experience-camera">
            <div className="experience-screen">
              <div id="portfolio-content">
                {mode === 'machine' ? (
                  <MachineResume />
                ) : isMobile ? (
                  <MobileShell />
                ) : (
                  <DesktopShell />
                )}
              </div>
            </div>
          </div>
        </div>
        <PortalButton onActivate={prefetchRoomScene} />
        <RoomLayer />
        <CinematicOverlay />
        <PortfolioModeToggle mode={mode} onChange={setMode} />
      </div>
    </ExperienceStageProvider>
  );
}
