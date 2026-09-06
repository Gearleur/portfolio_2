import { describe, expect, it } from 'vitest';
import {
  INITIAL_EXPERIENCE_STAGE_STATE,
  experienceStageReducer,
  selectIsPortalReady,
} from './experienceStageMachine';
import type { ExperienceStageState } from './experienceStageMachine';

function stateWith(overrides: Partial<ExperienceStageState>): ExperienceStageState {
  return { ...INITIAL_EXPERIENCE_STAGE_STATE, ...overrides };
}

describe('experienceStageReducer', () => {
  it('counts each window only once', () => {
    const afterFirst = experienceStageReducer(INITIAL_EXPERIENCE_STAGE_STATE, {
      type: 'WINDOW_OPENED',
      windowId: 'education',
    });
    const afterDuplicate = experienceStageReducer(afterFirst, {
      type: 'WINDOW_OPENED',
      windowId: 'education',
    });

    expect(afterDuplicate.openedWindowIds).toEqual(['education']);
  });

  it('becomes portal ready after two distinct windows', () => {
    const afterFirst = experienceStageReducer(INITIAL_EXPERIENCE_STAGE_STATE, {
      type: 'WINDOW_OPENED',
      windowId: 'education',
    });
    const afterSecond = experienceStageReducer(afterFirst, {
      type: 'WINDOW_OPENED',
      windowId: 'projects',
    });

    expect(selectIsPortalReady(afterSecond)).toBe(true);
  });

  it('becomes portal ready when the delay elapses', () => {
    const elapsed = experienceStageReducer(INITIAL_EXPERIENCE_STAGE_STATE, {
      type: 'PORTAL_DELAY_ELAPSED',
    });

    expect(selectIsPortalReady(elapsed)).toBe(true);
  });

  it('enters pullback only from the desktop', () => {
    expect(
      experienceStageReducer(INITIAL_EXPERIENCE_STAGE_STATE, { type: 'ENTER_ROOM' }).stage,
    ).toBe('pullback');
    expect(
      experienceStageReducer(stateWith({ stage: 'room' }), { type: 'ENTER_ROOM' }).stage,
    ).toBe('room');
  });

  it('resolves pullback into room and pushin into desktop', () => {
    expect(
      experienceStageReducer(stateWith({ stage: 'pullback' }), { type: 'TRANSITION_ENDED' }).stage,
    ).toBe('room');
    expect(
      experienceStageReducer(stateWith({ stage: 'pushin' }), { type: 'TRANSITION_ENDED' }).stage,
    ).toBe('desktop');
  });

  it('skips a transition to its resolved stage', () => {
    expect(
      experienceStageReducer(stateWith({ stage: 'pullback' }), { type: 'SKIP_TRANSITION' }).stage,
    ).toBe('room');
  });

  it('ignores a skip while on a stable stage', () => {
    expect(
      experienceStageReducer(stateWith({ stage: 'room' }), { type: 'SKIP_TRANSITION' }).stage,
    ).toBe('room');
  });

  it('returns to the desktop only from the room', () => {
    expect(
      experienceStageReducer(stateWith({ stage: 'room' }), { type: 'RETURN_TO_DESKTOP' }).stage,
    ).toBe('pushin');
    expect(
      experienceStageReducer(stateWith({ stage: 'pullback' }), { type: 'RETURN_TO_DESKTOP' }).stage,
    ).toBe('pullback');
  });

  it('returns the same reference when nothing changes', () => {
    const state = stateWith({ stage: 'room' });
    expect(experienceStageReducer(state, { type: 'ENTER_ROOM' })).toBe(state);
  });
});
