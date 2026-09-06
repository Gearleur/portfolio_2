export const ONBOARDING_STORAGE_KEY = 'portfolio.onboarding.v1';

export function hasSeenOnboarding(storage: Pick<Storage, 'getItem'> | null): boolean {
  if (!storage) {
    return false;
  }

  try {
    return storage.getItem(ONBOARDING_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function markOnboardingSeen(storage: Pick<Storage, 'setItem'> | null): void {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(ONBOARDING_STORAGE_KEY, 'seen');
  } catch {
    // Mode prive ou stockage refuse : le tuto se rejouera, ce n'est pas bloquant.
  }
}
