import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import type { ReactNode, RefObject } from 'react';
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
  transitionProgressRef: RefObject<number>;
  roomProgressRef: RefObject<number>;
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

  // Progression 0 -> 1 de la transition en cours. Elle est ecrite frame par
  // frame hors de React : la camera et la synchronisation DOM la lisent dans
  // une boucle a 60 Hz, ou un rendu React par frame serait ruineux.
  const transitionProgressRef = useRef(0);

  // Progression 0 -> 1 du scroll de la cinematique une fois dans la piece.
  // `CinematicOverlay` l'ecrit depuis son gestionnaire de scroll, `CameraRig`
  // la lit dans sa boucle a 60 Hz : meme raison d'etre qu'une ref plutot
  // qu'un etat React que `transitionProgressRef` juste au-dessus.
  const roomProgressRef = useRef(0);

  useEffect(() => {
    const duration = transitionDurationMs(state.stage, { prefersReducedMotion, isMobile });
    if (duration === 0) {
      transitionProgressRef.current = state.stage === 'room' ? 1 : 0;
      return;
    }

    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      transitionProgressRef.current = state.stage === 'pushin' ? 1 - progress : progress;

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }

      dispatch({ type: 'TRANSITION_ENDED' });
    };

    frame = requestAnimationFrame(tick);

    // Filet de securite : un onglet en arriere-plan gele requestAnimationFrame,
    // et la phase resterait bloquee. Le minuteur resout la transition meme si
    // aucune frame n'a ete peinte.
    const safety = window.setTimeout(() => {
      transitionProgressRef.current = state.stage === 'pushin' ? 0 : 1;
      dispatch({ type: 'TRANSITION_ENDED' });
    }, duration + 400);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(safety);
    };
  }, [isMobile, prefersReducedMotion, state.stage]);

  useEffect(() => {
    if (state.stage !== 'pullback' && state.stage !== 'pushin') {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dispatch({ type: 'SKIP_TRANSITION' });
      }
    };
    const onPointerDown = () => dispatch({ type: 'SKIP_TRANSITION' });

    // Le clic qui ouvre la transition emet son pointerdown avant que cet effet
    // ne soit branche, mais on arme quand meme l'ecoute a la frame suivante :
    // le geste declencheur ne doit jamais pouvoir annuler ce qu'il vient de
    // lancer, quel que soit l'ordonnancement des effets.
    let armed = 0;
    const arm = () => window.addEventListener('pointerdown', onPointerDown);
    armed = requestAnimationFrame(arm);

    window.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(armed);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [state.stage]);

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
      transitionProgressRef,
      roomProgressRef,
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
