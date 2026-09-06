import { Suspense, lazy, useState } from 'react';
import { useExperienceStageContext } from '../stage/ExperienceStageContext';
import { RoomFallback } from './RoomFallback';
import { detectWebgl, pickRoomRenderer } from './roomRenderer';
import './room.css';

const RoomScene = lazy(() => import('./RoomScene'));

export function prefetchRoomScene(): void {
  void import('./RoomScene');
}

export function RoomLayer() {
  const { stage, isMobile } = useExperienceStageContext();
  const [hasWebgl] = useState(() => detectWebgl());

  const renderer = pickRoomRenderer({ stage, hasWebgl });

  if (renderer === 'none') {
    return null;
  }

  return (
    <div className="room-layer" data-renderer={renderer}>
      {renderer === 'fallback' ? (
        <RoomFallback />
      ) : (
        <Suspense fallback={<RoomFallback />}>
          <RoomScene device={isMobile ? 'phone' : 'crt'} />
        </Suspense>
      )}
    </div>
  );
}
