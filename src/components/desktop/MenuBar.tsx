import { BrandLogo } from './BrandLogo';
import './menuBar.css';

export function MenuBar() {
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
        <span>Portfolio HD</span>
      </div>
    </nav>
  );
}
