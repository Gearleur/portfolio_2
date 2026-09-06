import { PORTAL_DELAY_MS, shouldRevealPortal } from './portalTrigger';

export type ExperienceStageName = 'desktop' | 'pullback' | 'room' | 'pushin';

export type ExperienceStageState = {
  stage: ExperienceStageName;
  openedWindowIds: string[];
  hasPortalDelayElapsed: boolean;
};

export type ExperienceStageAction =
  | { type: 'WINDOW_OPENED'; windowId: string }
  | { type: 'PORTAL_DELAY_ELAPSED' }
  | { type: 'ENTER_ROOM' }
  | { type: 'TRANSITION_ENDED' }
  | { type: 'SKIP_TRANSITION' }
  | { type: 'RETURN_TO_DESKTOP' };

export const INITIAL_EXPERIENCE_STAGE_STATE: ExperienceStageState = {
  stage: 'desktop',
  openedWindowIds: [],
  hasPortalDelayElapsed: false,
};

const RESOLVED_STAGE: Partial<Record<ExperienceStageName, ExperienceStageName>> = {
  pullback: 'room',
  pushin: 'desktop',
};

export function selectIsPortalReady(state: ExperienceStageState): boolean {
  return shouldRevealPortal({
    openedWindowCount: state.openedWindowIds.length,
    elapsedMs: state.hasPortalDelayElapsed ? PORTAL_DELAY_MS : 0,
  });
}

export function experienceStageReducer(
  state: ExperienceStageState,
  action: ExperienceStageAction,
): ExperienceStageState {
  switch (action.type) {
    case 'WINDOW_OPENED': {
      if (state.openedWindowIds.includes(action.windowId)) {
        return state;
      }

      return { ...state, openedWindowIds: [...state.openedWindowIds, action.windowId] };
    }

    case 'PORTAL_DELAY_ELAPSED': {
      return state.hasPortalDelayElapsed ? state : { ...state, hasPortalDelayElapsed: true };
    }

    case 'ENTER_ROOM': {
      return state.stage === 'desktop' ? { ...state, stage: 'pullback' } : state;
    }

    case 'TRANSITION_ENDED':
    case 'SKIP_TRANSITION': {
      const resolved = RESOLVED_STAGE[state.stage];
      return resolved ? { ...state, stage: resolved } : state;
    }

    case 'RETURN_TO_DESKTOP': {
      return state.stage === 'room' ? { ...state, stage: 'pushin' } : state;
    }

    default: {
      return state;
    }
  }
}
