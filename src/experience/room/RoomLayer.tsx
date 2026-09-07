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

  if (!isMounted) {
    return null;
  }

  return (
    <div className="room-layer" data-renderer={renderer} data-idle={renderer === 'none'}>
      {/*
       * Le choix du contenu suit `hasWebgl`, pas `renderer` : pendant le
       * delai de grace, `renderer` vaut `none` alors que `hasWebgl` ne change
       * jamais dans la duree de vie du composant. Comparer a `renderer ===
       * 'fallback'` ferait basculer un appareil sans WebGL sur le Canvas des
       * qu'il redevient inactif -- exactement ce que `hasWebgl` evite.
       */}
      {hasWebgl ? (
        <Suspense fallback={<RoomFallback />}>
          <RoomScene device={isMobile ? 'phone' : 'crt'} />
        </Suspense>
      ) : (
        <RoomFallback />
      )}
    </div>
  );
}
