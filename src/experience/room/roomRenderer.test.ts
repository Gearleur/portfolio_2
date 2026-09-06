import { describe, expect, it } from 'vitest';
import { pickRoomRenderer } from './roomRenderer';

describe('pickRoomRenderer', () => {
  it('renders nothing while on the desktop', () => {
    expect(pickRoomRenderer({ stage: 'desktop', hasWebgl: true })).toBe('none');
  });

  it('renders webgl during a pullback', () => {
    expect(pickRoomRenderer({ stage: 'pullback', hasWebgl: true })).toBe('webgl');
  });

  it('renders webgl in the room', () => {
    expect(pickRoomRenderer({ stage: 'room', hasWebgl: true })).toBe('webgl');
  });

  it('falls back to CSS without webgl', () => {
    expect(pickRoomRenderer({ stage: 'room', hasWebgl: false })).toBe('fallback');
  });

  it('keeps rendering during the return transition', () => {
    expect(pickRoomRenderer({ stage: 'pushin', hasWebgl: true })).toBe('webgl');
  });
});
