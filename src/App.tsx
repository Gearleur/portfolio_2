import { useEffect, useState } from 'react';
import { DesktopShell, MobileShell } from './components';
import { MachineResume } from './components/machine/MachineResume';
import { PortfolioModeToggle } from './components/machine/PortfolioModeToggle';
import type { PortfolioMode } from './components/machine/PortfolioModeToggle';
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

  return (
    <div className={`portfolio-app portfolio-app--${mode}`}>
      {mode === 'machine' ? <MachineResume /> : isMobile ? <MobileShell /> : <DesktopShell />}
      <PortfolioModeToggle mode={mode} onChange={setMode} />
    </div>
  );
}
