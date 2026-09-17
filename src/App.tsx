import { useEffect, useState } from 'react';
import { DesktopShell, MobileShell } from './components';
import { MachineResume } from './components/machine/MachineResume';
import { PortfolioModeToggle } from './components/machine/PortfolioModeToggle';
import type { PortfolioMode } from './components/machine/PortfolioModeToggle';
import { useMediaQuery } from './hooks/useMediaQuery';
import { AiEntrance } from './components/ai/AiEntrance';

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
