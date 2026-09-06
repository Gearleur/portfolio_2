import { describe, expect, it, vi } from 'vitest';
import {
  ONBOARDING_STORAGE_KEY,
  hasSeenOnboarding,
  markOnboardingSeen,
} from './onboardingStorage';

function fakeStorage(initial: string | null) {
  return {
    getItem: vi.fn(() => initial),
    setItem: vi.fn(),
  };
}

describe('onboarding storage', () => {
  it('treats a missing storage as never seen', () => {
    expect(hasSeenOnboarding(null)).toBe(false);
  });

  it('reads the versioned key', () => {
    const storage = fakeStorage('seen');
    expect(hasSeenOnboarding(storage)).toBe(true);
    expect(storage.getItem).toHaveBeenCalledWith(ONBOARDING_STORAGE_KEY);
  });

  it('treats an empty value as never seen', () => {
    expect(hasSeenOnboarding(fakeStorage(null))).toBe(false);
  });

  it('writes the versioned key', () => {
    const storage = fakeStorage(null);
    markOnboardingSeen(storage);
    expect(storage.setItem).toHaveBeenCalledWith(ONBOARDING_STORAGE_KEY, 'seen');
  });

  it('survives a storage that throws in private mode', () => {
    const storage = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
    };

    expect(hasSeenOnboarding(storage)).toBe(false);
    expect(() => markOnboardingSeen(storage)).not.toThrow();
  });
});
