import { useEffect, useState } from 'react';
import { useExperienceStageContext } from '../stage/ExperienceStageContext';
import './portal.css';

export function PortalButton({ onActivate }: { onActivate?: () => void }) {
  const { stage, isPortalReady, enterRoom } = useExperienceStageContext();
  const [announcement, setAnnouncement] = useState('');
  const isVisible = isPortalReady && stage === 'desktop';

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const revealTimer = window.setTimeout(
      () => setAnnouncement('Une suite est disponible.'),
      0,
    );
    const clearTimer = window.setTimeout(() => setAnnouncement(''), 1000);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(clearTimer);
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="portal-slot">
      <p className="portal-slot__live" role="status" aria-live="polite">
        {announcement}
      </p>
      <button
        className="portal-button"
        type="button"
        onClick={() => {
          onActivate?.();
          enterRoom();
        }}
      >
        <span className="portal-button__halo" aria-hidden="true" />
        <span className="portal-button__label">Sortir de l&apos;écran</span>
      </button>
    </div>
  );
}
