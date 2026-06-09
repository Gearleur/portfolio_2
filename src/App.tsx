import { DesktopShell, MobileShell } from './components';
import { useMediaQuery } from './hooks/useMediaQuery';

export default function App() {
  const isMobile = useMediaQuery('(max-width: 640px)');

  return isMobile ? <MobileShell /> : <DesktopShell />;
}
