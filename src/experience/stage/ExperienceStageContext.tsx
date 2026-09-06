import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import {
  INITIAL_EXPERIENCE_STAGE_STATE,
  experienceStageReducer,
  selectIsPortalReady,
} from './experienceStageMachine';
import type { ExperienceStageName } from './experienceStageMachine';
import { PORTAL_DELAY_MS } from './portalTrigger';
import { transitionDurationMs } from './transitionTimings';
import './experience.css';

export type ExperienceStageValue = {
  stage: ExperienceStageName;
  isPortalReady: boolean;
  prefersReducedMotion: boolean;
  isMobile: boolean;
  notifyWindowOpened: (windowId: string) => void;
  enterRoom: () => void;
  skipTransition: () => void;
  returnToDesktop: () => void;
};

const ExperienceStageContext = createContext<ExperienceStageValue | null>(null);

export function useExperienceStageContext(): ExperienceStageValue {
  const value = useContext(ExperienceStageContext);
  if (!value) {
    throw new Error('useExperienceStageContext must be used inside ExperienceStageProvider');
  }

  return value;
}

export function ExperienceStageProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(experienceStageReducer, INITIAL_EXPERIENCE_STAGE_STATE);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isMobile = useMediaQuery('(max-width: 640px)');

  const notifyWindowOpened = useCallback((windowId: string) => {
    dispatch({ type: 'WINDOW_OPENED', windowId });
  }, []);
  const enterRoom = useCallback(() => dispatch({ type: 'ENTER_ROOM' }), []);
  const skipTransition = useCallback(() => dispatch({ type: 'SKIP_TRANSITION' }), []);
  const returnToDesktop = useCallback(() => dispatch({ type: 'RETURN_TO_DESKTOP' }), []);

  useEffect(() => {
    const timer = window.setTimeout(
      () => dispatch({ type: 'PORTAL_DELAY_ELAPSED' }),
      PORTAL_DELAY_MS,
    );

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const duration = transitionDurationMs(state.stage, { prefersReducedMotion, isMobile });
    if (duration === 0) {
      return;
    }

    const timer = window.setTimeout(() => dispatch({ type: 'TRANSITION_ENDED' }), duration);
    return () => window.clearTimeout(timer);
  }, [isMobile, prefersReducedMotion, state.stage]);

  useEffect(() => {
    const onEnterRoom = () => dispatch({ type: 'ENTER_ROOM' });
    window.addEventListener('experience:enter-room', onEnterRoom);
    return () => window.removeEventListener('experience:enter-room', onEnterRoom);
  }, []);

  const isPortalReady = selectIsPortalReady(state);

  const value = useMemo<ExperienceStageValue>(
    () => ({
      stage: state.stage,
      isPortalReady,
      prefersReducedMotion,
      isMobile,
      notifyWindowOpened,
      enterRoom,
      skipTransition,
      returnToDesktop,
    }),
    [
      enterRoom,
      isMobile,
      isPortalReady,
      notifyWindowOpened,
      prefersReducedMotion,
      returnToDesktop,
      skipTransition,
      state.stage,
    ],
  );

  return (
    <ExperienceStageContext.Provider value={value}>
      <div
        className="experience-root"
        data-stage={state.stage}
        data-portal-ready={isPortalReady ? 'true' : 'false'}
      >
        {children}
      </div>
    </ExperienceStageContext.Provider>
  );
}
