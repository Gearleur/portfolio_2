import type { ExperienceStageName } from '../stage/experienceStageMachine';

export type RoomRenderer = 'webgl' | 'fallback' | 'none';

export function pickRoomRenderer(input: {
  stage: ExperienceStageName;
  hasWebgl: boolean;
}): RoomRenderer {
  if (input.stage === 'desktop') {
    return 'none';
  }

  return input.hasWebgl ? 'webgl' : 'fallback';
}

export function detectWebgl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
