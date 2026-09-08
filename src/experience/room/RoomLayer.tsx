import { Suspense, lazy, useState } from 'react';
import { useExperienceStageContext } from '../stage/ExperienceStageContext';
import { RoomFallback } from './RoomFallback';
import { detectWebgl, pickRoomRenderer } from './roomRenderer';
import { useKeepAlive } from './useKeepAlive';
import './room.css';

const RoomScene = lazy(() => import('./RoomScene'));

export function prefetchRoomScene(): void {
  void import('./RoomScene');
}

export function RoomLayer() {
  const { stage, isMobile } = useExperienceStageContext();
  const [hasWebgl] = useState(() => detectWebgl());

  const renderer = pickRoomRenderer({ stage, hasWebgl });
  const isMounted = useKeepAlive(renderer);
  const isIdle = renderer === 'none';
  const device = isMobile ? 'phone' : 'crt';

  if (!isMounted) {
    return null;
  }

  return (
    // `data-device` expose l'appareil choisi : sans lui, rien dans le DOM ne
    // distingue le parcours mobile du parcours bureau, et un test bout en bout
    // ne peut pas verifier que le telephone est bien celui qui est monte.
    <div className="room-layer" data-renderer={renderer} data-idle={isIdle} data-device={device}>
      {/*
       * Le choix du contenu suit `hasWebgl`, pas `renderer` : pendant le
       * delai de grace, `renderer` vaut `none` alors que `hasWebgl` ne change
       * jamais dans la duree de vie du composant. Comparer a `renderer ===
       * 'fallback'` ferait basculer un appareil sans WebGL sur le Canvas des
       * qu'il redevient inactif -- exactement ce que `hasWebgl` evite.
       */}
      {hasWebgl ? (
        <Suspense fallback={<RoomFallback />}>
          <RoomScene device={device} idle={isIdle} />
        </Suspense>
      ) : (
        <RoomFallback />
      )}
    </div>
  );
}
