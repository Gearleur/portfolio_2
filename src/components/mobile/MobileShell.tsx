import { useState } from 'react';
import { MobileAppContent } from './MobileAppContent';
import { MobileIcon } from './MobileIcon';
import { MobileStatusBar } from './MobileStatusBar';
import { dockApps, homeApps, mobileIconSources } from './mobileApps';
import type { LaunchableMobileApp, MobileAppId } from './mobileApps';
import { usePreloadImages } from './usePreloadImages';
import { useStandaloneDisplayMode } from './useStandaloneDisplayMode';
import './mobile.css';

export function MobileShell() {
  usePreloadImages(mobileIconSources);

  const [activeAppId, setActiveAppId] = useState<MobileAppId | null>(null);
  const isStandalone = useStandaloneDisplayMode();
  const activeApp =
    homeApps.find((app): app is LaunchableMobileApp => app.action === activeAppId) ?? null;
  const shellClassName = [
    'mobile-shell',
    activeApp ? 'mobile-shell--app-open' : '',
    isStandalone ? 'mobile-shell--standalone' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <main className={shellClassName}>
      <div className="mobile-wallpaper" aria-hidden="true" />

      {activeApp ? (
        <section className="mobile-app" aria-label={activeApp.label}>
          <div className="mobile-app__content">
            <MobileAppContent appId={activeApp.action} onClose={() => setActiveAppId(null)} />
          </div>

          <button
            className="mobile-home-button"
            type="button"
            onClick={() => setActiveAppId(null)}
            aria-label="Retour a l'ecran d'accueil"
          />
        </section>
      ) : (
        <section className="mobile-home" aria-label="Applications portfolio">
          <MobileStatusBar />

          <div className="mobile-home__grid">
            {homeApps.map((app) => (
              <MobileIcon
                app={app}
                onOpen={app.action ? () => setActiveAppId(app.action ?? null) : undefined}
                key={app.id}
              />
            ))}
          </div>

          <nav className="mobile-dock" aria-label="Applications fixes">
            {dockApps.map((app) => (
              <MobileIcon app={app} key={app.id} />
            ))}
          </nav>
        </section>
      )}
    </main>
  );
}
