import { SmoothActionButton } from '../ai/SmoothMatrixButton';
import { BrandLogo } from './BrandLogo';
import './menuBar.css';

export function MenuBar({ onOpenAi }: { onOpenAi?: () => void }) {
  return (
    <nav className="menu-bar" aria-label="Navigation principale">
      <div className="menu-bar__left">
        <BrandLogo />
        <span className="menu-bar__brand">Portfolio OS</span>
        <span>Fichier</span>
        <span>Edition</span>
        <span>Fenetre</span>
      </div>
      <div className="menu-bar__right">
        {onOpenAi ? (
          <SmoothActionButton className="ai-launch" onClick={onOpenAi}>
            Parlons de l’IA <span aria-hidden="true">↗</span>
          </SmoothActionButton>
        ) : <span>Portfolio HD</span>}
      </div>
    </nav>
  );
}
