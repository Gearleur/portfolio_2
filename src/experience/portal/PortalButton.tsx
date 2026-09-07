import { useEffect, useRef, useState } from 'react';
import { useExperienceStageContext } from '../stage/ExperienceStageContext';
import './portal.css';

export function PortalButton({ onActivate }: { onActivate?: () => void }) {
  const { stage, isPortalReady, enterRoom } = useExperienceStageContext();
  const [announcement, setAnnouncement] = useState('');
  const isVisible = isPortalReady && stage === 'desktop';
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const hasLeftRoom = useRef(false);

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

  // Le focus doit revenir sur le portail quand le visiteur quitte la piece :
  // sans ca, le clavier retomberait au debut du document apres un retour.
  useEffect(() => {
    if (stage === 'room') {
      hasLeftRoom.current = true;
      return;
    }

    if (isVisible && hasLeftRoom.current) {
      hasLeftRoom.current = false;
      buttonRef.current?.focus();
    }
  }, [isVisible, stage]);

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
        ref={buttonRef}
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
