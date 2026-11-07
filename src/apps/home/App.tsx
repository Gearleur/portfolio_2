import { useEffect, useState } from 'react';
import { DesktopShell } from './features/desktop/DesktopShell';
import { MobileShell } from './features/mobile/MobileShell';
import { MachineResume } from './features/machine/MachineResume';
import { PortfolioModeToggle } from './features/machine/PortfolioModeToggle';
import type { PortfolioMode } from './features/machine/PortfolioModeToggle';
import { useMediaQuery } from '../../shared/hooks/useMediaQuery';
import { AiEntrance } from './features/ai/AiEntrance';

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

  return (
    <AiEntrance>
      {(openAi) => (
        <div className={`portfolio-app portfolio-app--${mode}`}>
          <div id="portfolio-content">
            {mode === 'machine' ? <MachineResume /> : isMobile ? <MobileShell onOpenAi={openAi} /> : <DesktopShell onOpenAi={openAi} />}
          </div>
          <PortfolioModeToggle mode={mode} onChange={setMode} />
        </div>
      )}
    </AiEntrance>
  );
}
