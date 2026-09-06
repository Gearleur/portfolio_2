# Sortie de l'ecran et cinematique IA -- Plan d'implementation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un onboarding diegetique au bureau retro, puis un bouton portail qui fait reculer la camera hors de l'ecran cathodique vers une piece vide ou se joue une cinematique IA pilotee au scroll.

**Architecture:** Une machine a etats pure (`desktop | pullback | room | pushin`) au-dessus des shells existants, exposee par un contexte React. La scene 3D (`three` + `@react-three/fiber`) est chargee en `React.lazy` et prechargee a l'apparition du bouton. Pendant le recul, le bureau reste du DOM interactif aligne sur la camera par les matrices de `CSS3DRenderer`. Le texte de la cinematique est du DOM superpose au canvas ; son contenu vit dans un fichier de donnees isole.

**Tech Stack:** React 19, TypeScript, Vite, `three`, `@react-three/fiber`, Vitest (environnement `node`), Playwright.

**Spec:** `docs/superpowers/specs/2026-09-06-sortie-ecran-cinematique-design.md`

## Global Constraints

- Branche de travail : `feat/sortie-ecran-cinematique`.
- **Dependances runtime ajoutees : exactement `three` et `@react-three/fiber`.** Rien d'autre. Pas de `drei`, pas de `postprocessing`, pas de `html2canvas`, pas de `@testing-library/*`.
- **Vitest tourne en environnement `node`** (aucun `environment` configure dans `vite.config.ts`). Tout test unitaire doit porter sur des fonctions pures, sans `document`, sans `window`, sans `localStorage` global. Les acces navigateur passent par des parametres injectes.
- Playwright : le projet `mobile-chromium` existant emule un iPhone 13 et ne doit pas executer les specs desktop. Chaque projet recoit son propre `testMatch`.
- Toutes les nouvelles sources vivent sous `src/experience/`. La seule modification du bureau existant est l'appel a `notifyWindowOpened` dans `DesktopShell.openWindow` et dans `MobileShell`.
- Le code source du depot n'utilise pas d'accents dans les identifiants ni les commentaires ; les chaines affichees a l'utilisateur sont en francais accentue.
- Seuil de bascule DOM vers shader : **20 %** de la largeur du viewport.
- Declencheur du portail : **2 fenetres distinctes ouvertes OU 40 000 ms**, au premier des deux.
- Durees : `pullback` 2500 ms, `pushin` 1600 ms, mode reduit et mobile 400 ms.
- Boucles maximum du curseur fantome : **3**. Delai avant curseur fantome : **4000 ms**. Ouverture du `Lisez-moi` : **800 ms**.
- Cle de persistance : `portfolio.onboarding.v1`.
- Verification a chaque fin de tache : `pnpm lint` et `pnpm test` doivent passer.

---

## File Structure

| Fichier | Responsabilite |
|---|---|
| `src/experience/stage/portalTrigger.ts` | Regle pure de revelation du bouton |
| `src/experience/stage/experienceStageMachine.ts` | Reducteur pur des 4 phases |
| `src/experience/stage/transitionTimings.ts` | Durees des transitions |
| `src/experience/stage/easing.ts` | `clamp01`, `easeOutExpo`, `lerp` |
| `src/experience/stage/ExperienceStageContext.tsx` | Provider, timers, API consommee par les shells |
| `src/experience/onboarding/onboardingStorage.ts` | Persistance, `Storage` injecte |
| `src/experience/onboarding/onboardingPhase.ts` | Phase du tuto, pure |
| `src/experience/onboarding/readmeFrame.ts` | Cadre par defaut de la fenetre Lisez-moi |
| `src/experience/onboarding/ReadmeWindow.tsx` | Fenetre Lisez-moi sur `RetroWindow` |
| `src/experience/onboarding/GhostCursor.tsx` | Curseur fantome decoratif |
| `src/experience/onboarding/useOnboarding.ts` | Cablage horloge + phase + persistance |
| `src/experience/onboarding/onboarding.css` | Styles tuto |
| `src/experience/portal/PortalButton.tsx` | Bouton portail |
| `src/experience/portal/portal.css` | Styles bouton portail |
| `src/experience/room/roomRenderer.ts` | Choix pur du rendu (3D ou repli) |
| `src/experience/room/RoomLayer.tsx` | Montage/demontage lazy, prefetch, dispose |
| `src/experience/room/RoomScene.tsx` | Canvas R3F, brouillard, composition |
| `src/experience/room/Floor.tsx` | Sol + reflet miroir |
| `src/experience/room/CrtMonitor.tsx` | Moniteur cathodique |
| `src/experience/room/PhoneDevice.tsx` | Telephone (variante mobile) |
| `src/experience/room/ScreenMaterial.ts` | Shader de dalle |
| `src/experience/room/ScreenGlow.tsx` | Halo additif en billboard |
| `src/experience/room/screenProjection.ts` | Maths camera vers CSS |
| `src/experience/room/cameraPath.ts` | Trajectoire de camera |
| `src/experience/room/CameraRig.tsx` | Pilotage camera par phase et progression |
| `src/experience/room/RoomFallback.tsx` | Piece en degrade CSS sans WebGL |
| `src/experience/room/room.css` | Styles couche piece |
| `src/experience/cinematic/cinematicScript.ts` | DONNEES : actes et lignes |
| `src/experience/cinematic/scrollTimeline.ts` | Maths scroll vers acte |
| `src/experience/cinematic/useScrollTimeline.ts` | Cablage scroll, ref + acte |
| `src/experience/cinematic/CinematicOverlay.tsx` | Couche texte DOM |
| `src/experience/cinematic/CinematicA11yArticle.tsx` | Actes complets, masques visuellement |
| `src/experience/cinematic/cinematic.css` | Motion design du texte |
| `public/assets/cursors/ghost-pointer.svg` | Asset curseur fantome |
| `src/App.tsx` | Montage du provider et des couches |
| `src/components/desktop/DesktopShell.tsx` | Appel `notifyWindowOpened`, fenetre Lisez-moi |
| `src/components/mobile/MobileShell.tsx` | Appel `notifyWindowOpened`, bouton portail |
| `playwright.config.ts` | Projet desktop + `testMatch` par projet |

---

### Task 1: Logique pure de la machine a etats

**Files:**
- Create: `src/experience/stage/portalTrigger.ts`
- Create: `src/experience/stage/portalTrigger.test.ts`
- Create: `src/experience/stage/experienceStageMachine.ts`
- Create: `src/experience/stage/experienceStageMachine.test.ts`
- Create: `src/experience/stage/transitionTimings.ts`
- Create: `src/experience/stage/transitionTimings.test.ts`
- Create: `src/experience/stage/easing.ts`
- Create: `src/experience/stage/easing.test.ts`

**Interfaces:**
- Consumes: rien.
- Produces:
  - `PORTAL_WINDOW_THRESHOLD: number`, `PORTAL_DELAY_MS: number`
  - `shouldRevealPortal(input: { openedWindowCount: number; elapsedMs: number }): boolean`
  - `type ExperienceStageName = 'desktop' | 'pullback' | 'room' | 'pushin'`
  - `type ExperienceStageState = { stage: ExperienceStageName; openedWindowIds: string[]; hasPortalDelayElapsed: boolean }`
  - `type ExperienceStageAction` (union, voir code)
  - `INITIAL_EXPERIENCE_STAGE_STATE: ExperienceStageState`
  - `experienceStageReducer(state: ExperienceStageState, action: ExperienceStageAction): ExperienceStageState`
  - `selectIsPortalReady(state: ExperienceStageState): boolean`
  - `PULLBACK_MS`, `PUSHIN_MS`, `REDUCED_MS`
  - `transitionDurationMs(stage: ExperienceStageName, options: { prefersReducedMotion: boolean; isMobile: boolean }): number`
  - `clamp01(value: number): number`, `lerp(from: number, to: number, t: number): number`, `easeOutExpo(t: number): number`

- [ ] **Step 1: Ecrire les tests du declencheur**

Creer `src/experience/stage/portalTrigger.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { PORTAL_DELAY_MS, PORTAL_WINDOW_THRESHOLD, shouldRevealPortal } from './portalTrigger';

describe('shouldRevealPortal', () => {
  it('stays hidden at the start of the visit', () => {
    expect(shouldRevealPortal({ openedWindowCount: 0, elapsedMs: 0 })).toBe(false);
  });

  it('stays hidden with a single opened window before the delay', () => {
    expect(shouldRevealPortal({ openedWindowCount: 1, elapsedMs: PORTAL_DELAY_MS - 1 })).toBe(false);
  });

  it('reveals once the window threshold is reached', () => {
    expect(
      shouldRevealPortal({ openedWindowCount: PORTAL_WINDOW_THRESHOLD, elapsedMs: 0 }),
    ).toBe(true);
  });

  it('reveals once the delay elapsed even without any window', () => {
    expect(shouldRevealPortal({ openedWindowCount: 0, elapsedMs: PORTAL_DELAY_MS })).toBe(true);
  });
});
```

- [ ] **Step 2: Lancer le test et verifier l'echec**

Run: `pnpm vitest run src/experience/stage/portalTrigger.test.ts`
Expected: FAIL, `Failed to resolve import "./portalTrigger"`.

- [ ] **Step 3: Implementer le declencheur**

Creer `src/experience/stage/portalTrigger.ts` :

```ts
export const PORTAL_WINDOW_THRESHOLD = 2;
export const PORTAL_DELAY_MS = 40_000;

export function shouldRevealPortal(input: {
  openedWindowCount: number;
  elapsedMs: number;
}): boolean {
  return (
    input.openedWindowCount >= PORTAL_WINDOW_THRESHOLD || input.elapsedMs >= PORTAL_DELAY_MS
  );
}
```

- [ ] **Step 4: Verifier que le test passe**

Run: `pnpm vitest run src/experience/stage/portalTrigger.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Ecrire les tests du reducteur**

Creer `src/experience/stage/experienceStageMachine.test.ts` :

```ts
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
```

- [ ] **Step 6: Lancer le test et verifier l'echec**

Run: `pnpm vitest run src/experience/stage/experienceStageMachine.test.ts`
Expected: FAIL, module introuvable.

- [ ] **Step 7: Implementer le reducteur**

Creer `src/experience/stage/experienceStageMachine.ts` :

```ts
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
```

- [ ] **Step 8: Verifier que les tests passent**

Run: `pnpm vitest run src/experience/stage/experienceStageMachine.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 9: Ecrire les tests des durees et de l'easing**

Creer `src/experience/stage/transitionTimings.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { PULLBACK_MS, PUSHIN_MS, REDUCED_MS, transitionDurationMs } from './transitionTimings';

describe('transitionDurationMs', () => {
  const full = { prefersReducedMotion: false, isMobile: false };

  it('uses the full durations on desktop', () => {
    expect(transitionDurationMs('pullback', full)).toBe(PULLBACK_MS);
    expect(transitionDurationMs('pushin', full)).toBe(PUSHIN_MS);
  });

  it('collapses to a fade on mobile', () => {
    expect(transitionDurationMs('pullback', { ...full, isMobile: true })).toBe(REDUCED_MS);
  });

  it('collapses to a fade with reduced motion', () => {
    expect(transitionDurationMs('pushin', { ...full, prefersReducedMotion: true })).toBe(REDUCED_MS);
  });

  it('returns zero for stable stages', () => {
    expect(transitionDurationMs('desktop', full)).toBe(0);
    expect(transitionDurationMs('room', full)).toBe(0);
  });
});
```

Creer `src/experience/stage/easing.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { clamp01, easeOutExpo, lerp } from './easing';

describe('easing helpers', () => {
  it('clamps outside the unit range', () => {
    expect(clamp01(-3)).toBe(0);
    expect(clamp01(0.42)).toBe(0.42);
    expect(clamp01(9)).toBe(1);
  });

  it('interpolates linearly', () => {
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 0.5)).toBe(15);
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('eases out from 0 to exactly 1', () => {
    expect(easeOutExpo(0)).toBe(0);
    expect(easeOutExpo(1)).toBe(1);
    expect(easeOutExpo(0.5)).toBeGreaterThan(0.9);
  });
});
```

- [ ] **Step 10: Lancer les tests et verifier l'echec**

Run: `pnpm vitest run src/experience/stage`
Expected: FAIL sur `transitionTimings` et `easing`, PASS sur les deux modules deja ecrits.

- [ ] **Step 11: Implementer les durees et l'easing**

Creer `src/experience/stage/transitionTimings.ts` :

```ts
import type { ExperienceStageName } from './experienceStageMachine';

export const PULLBACK_MS = 2500;
export const PUSHIN_MS = 1600;
export const REDUCED_MS = 400;

export function transitionDurationMs(
  stage: ExperienceStageName,
  options: { prefersReducedMotion: boolean; isMobile: boolean },
): number {
  if (stage !== 'pullback' && stage !== 'pushin') {
    return 0;
  }

  if (options.prefersReducedMotion || options.isMobile) {
    return REDUCED_MS;
  }

  return stage === 'pullback' ? PULLBACK_MS : PUSHIN_MS;
}
```

Creer `src/experience/stage/easing.ts` :

```ts
export function clamp01(value: number): number {
  if (value < 0) {
    return 0;
  }

  return value > 1 ? 1 : value;
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - 2 ** (-10 * t);
}
```

- [ ] **Step 12: Verifier que tout passe**

Run: `pnpm test && pnpm lint`
Expected: PASS, aucun avertissement ESLint.

- [ ] **Step 13: Commit**

```bash
git add src/experience/stage
git commit -m "feat(experience): machine a etats et regle de revelation du portail"
```

---

### Task 2: Provider, cablage des shells et harnais e2e desktop

Cette tache rend la machine observable de bout en bout sans aucun visuel nouveau : le DOM porte des attributs que Playwright peut lire, et `pullback` se resout tout seul en `room` grace au minuteur de transition. Les taches suivantes ne feront qu'habiller ce squelette.

**Files:**
- Create: `src/experience/stage/ExperienceStageContext.tsx`
- Create: `src/experience/stage/experience.css`
- Modify: `src/App.tsx`
- Modify: `src/components/desktop/DesktopShell.tsx:47-50`
- Modify: `src/components/mobile/MobileShell.tsx:15-16`
- Modify: `playwright.config.ts`
- Create: `tests/e2e/desktop-experience-stage.spec.ts`

**Interfaces:**
- Consumes: `experienceStageReducer`, `INITIAL_EXPERIENCE_STAGE_STATE`, `selectIsPortalReady`, `ExperienceStageName`, `transitionDurationMs`, `PORTAL_DELAY_MS`.
- Produces:
  - `ExperienceStageProvider(props: { children: ReactNode }): JSX.Element`
  - `useExperienceStageContext(): ExperienceStageValue`
  - `type ExperienceStageValue = { stage: ExperienceStageName; isPortalReady: boolean; prefersReducedMotion: boolean; isMobile: boolean; notifyWindowOpened: (windowId: string) => void; enterRoom: () => void; skipTransition: () => void; returnToDesktop: () => void }`
  - Attributs DOM sur `.experience-root` : `data-stage`, `data-portal-ready`.

- [ ] **Step 1: Ecrire le test e2e desktop**

Creer `tests/e2e/desktop-experience-stage.spec.ts` :

```ts
import { expect, test } from '@playwright/test';

test('becomes portal ready after two distinct windows', async ({ page }) => {
  await page.goto('/');

  const root = page.locator('.experience-root');
  await expect(root).toHaveAttribute('data-portal-ready', 'false');

  await page.getByRole('button', { name: 'Education' }).click();
  await expect(root).toHaveAttribute('data-portal-ready', 'false');

  await page.getByRole('button', { name: 'Projects' }).click();
  await expect(root).toHaveAttribute('data-portal-ready', 'true');
});

test('resolves a pullback into the room stage', async ({ page }) => {
  await page.goto('/');

  const root = page.locator('.experience-root');
  await expect(root).toHaveAttribute('data-stage', 'desktop');

  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('experience:enter-room'));
  });

  await expect(root).toHaveAttribute('data-stage', 'room', { timeout: 6000 });
});
```

Note : l'evenement `experience:enter-room` est un crochet de test volontaire, ecoute par le provider. Il reste utile en production comme point d'entree unique pour toute autre commande d'ouverture.

- [ ] **Step 2: Ajouter le projet Playwright desktop**

Modifier `playwright.config.ts`. Remplacer le bloc `projects` par :

```ts
  projects: [
    {
      name: 'mobile-chromium',
      testMatch: '**/mobile-*.spec.ts',
      use: { ...devices['iPhone 13'], browserName: 'chromium' },
    },
    {
      name: 'desktop-chromium',
      testMatch: '**/desktop-*.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
```

Le fichier existant `tests/e2e/mobile-mode-slider.spec.ts` continue de correspondre a `mobile-*`. Sans ce `testMatch`, il s'executerait aussi en desktop et echouerait sur `.mobile-shell`.

- [ ] **Step 3: Lancer le test et verifier l'echec**

Run: `pnpm test:e2e --project=desktop-chromium`
Expected: FAIL, `.experience-root` introuvable.

- [ ] **Step 4: Implementer le provider**

Creer `src/experience/stage/ExperienceStageContext.tsx` :

```tsx
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
```

- [ ] **Step 5: Creer la structure de couches CSS**

Creer `src/experience/stage/experience.css` :

```css
.experience-root {
  position: relative;
  isolation: isolate;
}

.experience-viewport {
  position: relative;
  z-index: 3001;
  transform-style: flat;
}

.experience-camera,
.experience-screen {
  transform-style: preserve-3d;
}

/*
 * En phase desktop, aucune perspective ni transform n'est appliquee :
 * la mise en page reste strictement celle d'aujourd'hui, cout nul.
 */
.experience-root[data-stage="desktop"] .experience-viewport,
.experience-root[data-stage="desktop"] .experience-camera,
.experience-root[data-stage="desktop"] .experience-screen {
  perspective: none;
  transform: none;
  transform-style: flat;
}

.experience-root:not([data-stage="desktop"]) .experience-viewport {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
```

- [ ] **Step 6: Monter le provider dans App**

Modifier `src/App.tsx`. Remplacer le `return` par :

```tsx
  return (
    <ExperienceStageProvider>
      <div className={`portfolio-app portfolio-app--${mode}`}>
        <div className="experience-viewport">
          <div className="experience-camera">
            <div className="experience-screen">
              <div id="portfolio-content">
                {mode === 'machine' ? (
                  <MachineResume />
                ) : isMobile ? (
                  <MobileShell />
                ) : (
                  <DesktopShell />
                )}
              </div>
            </div>
          </div>
        </div>
        <PortfolioModeToggle mode={mode} onChange={setMode} />
      </div>
    </ExperienceStageProvider>
  );
```

Ajouter l'import : `import { ExperienceStageProvider } from './experience/stage/ExperienceStageContext';`

- [ ] **Step 7: Cabler DesktopShell**

Modifier `src/components/desktop/DesktopShell.tsx`. Ajouter l'import :

```ts
import { useExperienceStageContext } from '../../experience/stage/ExperienceStageContext';
```

Dans le corps de `DesktopShell`, ajouter avant `openWindow` :

```ts
  const { notifyWindowOpened } = useExperienceStageContext();
```

Puis remplacer `openWindow` :

```ts
  const openWindow = (windowId: DesktopWindowId, open: () => void) => {
    windowStack.bringToFront(windowId);
    notifyWindowOpened(windowId);
    open();
  };
```

- [ ] **Step 8: Cabler MobileShell**

Modifier `src/components/mobile/MobileShell.tsx`. Ajouter l'import :

```ts
import { useExperienceStageContext } from '../../experience/stage/ExperienceStageContext';
```

Dans le corps, remplacer la declaration d'etat par :

```ts
  const { notifyWindowOpened } = useExperienceStageContext();
  const [activeAppId, setActiveAppId] = useState<MobileAppId | null>(null);

  const openApp = (appId: MobileAppId) => {
    notifyWindowOpened(appId);
    setActiveAppId(appId);
  };
```

Puis remplacer chaque appel `onClick={() => setActiveAppId(app.action)}` (dans la grille d'accueil et dans le dock) par `onClick={() => openApp(app.action)}`. Les appels `setActiveAppId(null)` de fermeture restent inchanges.

- [ ] **Step 9: Verifier que le test e2e passe**

Run: `pnpm test:e2e --project=desktop-chromium`
Expected: PASS, 2 tests.

- [ ] **Step 10: Verifier la non-regression mobile**

Run: `pnpm test:e2e --project=mobile-chromium`
Expected: PASS, les specs existantes de `mobile-mode-slider.spec.ts`.

- [ ] **Step 11: Commit**

```bash
git add src/App.tsx src/experience/stage src/components/desktop/DesktopShell.tsx src/components/mobile/MobileShell.tsx playwright.config.ts tests/e2e/desktop-experience-stage.spec.ts
git commit -m "feat(experience): provider de phase, cablage des shells et projet e2e desktop"
```

---

### Task 3: Onboarding diegetique

**Files:**
- Create: `src/experience/onboarding/onboardingStorage.ts`
- Create: `src/experience/onboarding/onboardingStorage.test.ts`
- Create: `src/experience/onboarding/onboardingPhase.ts`
- Create: `src/experience/onboarding/onboardingPhase.test.ts`
- Create: `src/experience/onboarding/readmeFrame.ts`
- Create: `src/experience/onboarding/useOnboarding.ts`
- Create: `src/experience/onboarding/ReadmeWindow.tsx`
- Create: `src/experience/onboarding/GhostCursor.tsx`
- Create: `src/experience/onboarding/onboarding.css`
- Create: `public/assets/cursors/ghost-pointer.svg`
- Modify: `src/components/desktop/DesktopShell.tsx`
- Create: `tests/e2e/desktop-onboarding.spec.ts`

**Interfaces:**
- Consumes: `useExperienceStageContext`, `RetroWindow`, `useDesktopWindow`, `useWindowStack`, `WindowFrame`.
- Produces:
  - `ONBOARDING_STORAGE_KEY: string`
  - `hasSeenOnboarding(storage: Pick<Storage, 'getItem'> | null): boolean`
  - `markOnboardingSeen(storage: Pick<Storage, 'setItem'> | null): void`
  - `type OnboardingPhase = 'hidden' | 'readme' | 'readme-and-ghost' | 'done'`
  - `READ_ME_DELAY_MS`, `GHOST_DELAY_MS`, `GHOST_MAX_LOOPS`
  - `nextOnboardingPhase(input: { hasSeenBefore: boolean; hasInteracted: boolean; elapsedMs: number; prefersReducedMotion: boolean; isPortalReady: boolean }): OnboardingPhase`
  - `useOnboarding(): { phase: OnboardingPhase; dismiss: () => void }`
  - `DEFAULT_README_FRAME: WindowFrame`

- [ ] **Step 1: Ecrire les tests de persistance et de phase**

Creer `src/experience/onboarding/onboardingStorage.test.ts` :

```ts
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
```

Creer `src/experience/onboarding/onboardingPhase.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { GHOST_DELAY_MS, READ_ME_DELAY_MS, nextOnboardingPhase } from './onboardingPhase';

const base = {
  hasSeenBefore: false,
  hasInteracted: false,
  elapsedMs: 0,
  prefersReducedMotion: false,
  isPortalReady: false,
};

describe('nextOnboardingPhase', () => {
  it('stays hidden before the readme delay', () => {
    expect(nextOnboardingPhase({ ...base, elapsedMs: READ_ME_DELAY_MS - 1 })).toBe('hidden');
  });

  it('shows the readme once the delay passed', () => {
    expect(nextOnboardingPhase({ ...base, elapsedMs: READ_ME_DELAY_MS })).toBe('readme');
  });

  it('adds the ghost cursor after the inactivity delay', () => {
    expect(
      nextOnboardingPhase({ ...base, elapsedMs: READ_ME_DELAY_MS + GHOST_DELAY_MS }),
    ).toBe('readme-and-ghost');
  });

  it('never shows the ghost cursor with reduced motion', () => {
    expect(
      nextOnboardingPhase({
        ...base,
        elapsedMs: READ_ME_DELAY_MS + GHOST_DELAY_MS,
        prefersReducedMotion: true,
      }),
    ).toBe('readme');
  });

  it('is done once the visitor interacted', () => {
    expect(nextOnboardingPhase({ ...base, elapsedMs: 99_000, hasInteracted: true })).toBe('done');
  });

  it('is done for a returning visitor', () => {
    expect(nextOnboardingPhase({ ...base, elapsedMs: 99_000, hasSeenBefore: true })).toBe('done');
  });

  it('is done as soon as the portal is ready', () => {
    expect(nextOnboardingPhase({ ...base, elapsedMs: 99_000, isPortalReady: true })).toBe('done');
  });
});
```

- [ ] **Step 2: Lancer les tests et verifier l'echec**

Run: `pnpm vitest run src/experience/onboarding`
Expected: FAIL, modules introuvables.

- [ ] **Step 3: Implementer la persistance et la phase**

Creer `src/experience/onboarding/onboardingStorage.ts` :

```ts
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
```

Creer `src/experience/onboarding/onboardingPhase.ts` :

```ts
export type OnboardingPhase = 'hidden' | 'readme' | 'readme-and-ghost' | 'done';

export const READ_ME_DELAY_MS = 800;
export const GHOST_DELAY_MS = 4000;
export const GHOST_MAX_LOOPS = 3;

export function nextOnboardingPhase(input: {
  hasSeenBefore: boolean;
  hasInteracted: boolean;
  elapsedMs: number;
  prefersReducedMotion: boolean;
  isPortalReady: boolean;
}): OnboardingPhase {
  if (input.hasSeenBefore || input.hasInteracted || input.isPortalReady) {
    return 'done';
  }

  if (input.elapsedMs < READ_ME_DELAY_MS) {
    return 'hidden';
  }

  if (input.prefersReducedMotion || input.elapsedMs < READ_ME_DELAY_MS + GHOST_DELAY_MS) {
    return 'readme';
  }

  return 'readme-and-ghost';
}
```

- [ ] **Step 4: Verifier que les tests passent**

Run: `pnpm vitest run src/experience/onboarding`
Expected: PASS, 12 tests.

- [ ] **Step 5: Ecrire le test e2e du tuto**

Creer `tests/e2e/desktop-onboarding.spec.ts` :

```ts
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});

test('opens the readme window then dismisses it on the first icon click', async ({ page }) => {
  await page.goto('/');

  const readme = page.locator('.onboarding-readme');
  await expect(readme).toBeVisible();

  await page.getByRole('button', { name: 'Education' }).click();
  await expect(readme).toBeHidden();
});

test('shows the ghost cursor after inactivity and hides it on interaction', async ({ page }) => {
  await page.goto('/');

  const ghost = page.locator('.ghost-cursor');
  await expect(ghost).toBeVisible({ timeout: 8000 });

  await page.getByRole('button', { name: 'Education' }).click();
  await expect(ghost).toBeHidden();
});
```

- [ ] **Step 6: Lancer le test et verifier l'echec**

Run: `pnpm test:e2e --project=desktop-chromium desktop-onboarding`
Expected: FAIL, `.onboarding-readme` introuvable.

- [ ] **Step 7: Creer l'asset du curseur fantome**

Creer `public/assets/cursors/ghost-pointer.svg`. Les `.cur` de `src/styles.css:4` sont au format ICO et ne s'affichent pas de facon fiable dans un `<img>` : cet asset est une replique vectorielle.

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="34" viewBox="0 0 28 34">
  <path
    d="M3 2 L3 27 L9.5 21.5 L13.8 31.5 L18.4 29.4 L14.2 19.8 L22.5 19.2 Z"
    fill="#f7f7f2"
    stroke="#151515"
    stroke-width="2"
    stroke-linejoin="round"
  />
</svg>
```

- [ ] **Step 8: Implementer le cadre et le hook**

Creer `src/experience/onboarding/readmeFrame.ts` :

```ts
import type { WindowFrame } from '../../types/window';

export const DEFAULT_README_FRAME: WindowFrame = {
  x: 420,
  y: 132,
  width: 372,
  height: 196,
};
```

Creer `src/experience/onboarding/useOnboarding.ts` :

```ts
import { useEffect, useMemo, useRef, useState } from 'react';
import { useExperienceStageContext } from '../stage/ExperienceStageContext';
import { hasSeenOnboarding, markOnboardingSeen } from './onboardingStorage';
import { nextOnboardingPhase } from './onboardingPhase';
import type { OnboardingPhase } from './onboardingPhase';

const TICK_MS = 200;

function readStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function useOnboarding(): { phase: OnboardingPhase; dismiss: () => void } {
  const { isPortalReady, prefersReducedMotion } = useExperienceStageContext();
  const [elapsedMs, setElapsedMs] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const hasSeenBefore = useRef(hasSeenOnboarding(readStorage())).current;

  useEffect(() => {
    if (hasSeenBefore || hasInteracted) {
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => setElapsedMs(Date.now() - startedAt), TICK_MS);
    return () => window.clearInterval(timer);
  }, [hasInteracted, hasSeenBefore]);

  const phase = useMemo(
    () =>
      nextOnboardingPhase({
        hasSeenBefore,
        hasInteracted,
        elapsedMs,
        prefersReducedMotion,
        isPortalReady,
      }),
    [elapsedMs, hasInteracted, hasSeenBefore, isPortalReady, prefersReducedMotion],
  );

  const dismiss = () => {
    if (hasInteracted) {
      return;
    }

    setHasInteracted(true);
    markOnboardingSeen(readStorage());
  };

  return { phase, dismiss };
}
```

- [ ] **Step 9: Implementer les composants du tuto**

Creer `src/experience/onboarding/ReadmeWindow.tsx` :

```tsx
import { RetroWindow } from '../../components/desktop/RetroWindow';
import type { DesktopWindowControllerProps } from '../../components/desktop/RetroWindow';
import './onboarding.css';

export function ReadmeWindow(props: DesktopWindowControllerProps) {
  return (
    <RetroWindow
      {...props}
      ariaLabel="Lisez-moi"
      bodyClassName="onboarding-readme"
      title="Lisez-moi"
    >
      <p className="onboarding-readme__line">
        Cliquez sur les fichiers du bureau pour ouvrir mon parcours.
      </p>
      <p className="onboarding-readme__hint">Cette fenetre se deplace, comme les autres.</p>
    </RetroWindow>
  );
}
```

Creer `src/experience/onboarding/GhostCursor.tsx` :

```tsx
import { GHOST_MAX_LOOPS } from './onboardingPhase';
import './onboarding.css';

export function GhostCursor() {
  return (
    <img
      className="ghost-cursor"
      src="/assets/cursors/ghost-pointer.svg"
      alt=""
      aria-hidden="true"
      style={{ animationIterationCount: GHOST_MAX_LOOPS }}
    />
  );
}
```

Creer `src/experience/onboarding/onboarding.css` :

```css
.onboarding-readme {
  display: grid;
  gap: 10px;
  padding: 14px 16px;
}

.onboarding-readme__line {
  font-size: 13px;
  line-height: 1.45;
}

.onboarding-readme__hint {
  font-size: 11px;
  opacity: 0.62;
}

.ghost-cursor {
  position: absolute;
  z-index: 4;
  top: 0;
  left: 0;
  width: 28px;
  pointer-events: none;
  opacity: 0;
  animation: ghost-cursor-demo 3.4s ease-in-out infinite;
}

@keyframes ghost-cursor-demo {
  0% {
    opacity: 0;
    transform: translate3d(46vw, 42vh, 0) scale(1);
  }

  14% {
    opacity: 0.9;
  }

  58% {
    opacity: 0.9;
    transform: translate3d(88px, 108px, 0) scale(1);
  }

  66% {
    transform: translate3d(88px, 108px, 0) scale(0.86);
  }

  74% {
    transform: translate3d(88px, 108px, 0) scale(1);
  }

  100% {
    opacity: 0;
    transform: translate3d(88px, 108px, 0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ghost-cursor {
    display: none;
  }
}
```

- [ ] **Step 10: Brancher le tuto dans DesktopShell**

Modifier `src/components/desktop/DesktopShell.tsx`.

Ajouter `'readme'` a la fin du tableau `DESKTOP_WINDOW_IDS` pour que la fenetre entre dans la pile de z-index existante.

Ajouter les imports :

```ts
import { GhostCursor } from '../../experience/onboarding/GhostCursor';
import { ReadmeWindow } from '../../experience/onboarding/ReadmeWindow';
import { DEFAULT_README_FRAME } from '../../experience/onboarding/readmeFrame';
import { useOnboarding } from '../../experience/onboarding/useOnboarding';
```

Dans le corps du composant, ajouter :

```ts
  const readmeWindow = useDesktopWindow(DEFAULT_README_FRAME);
  const { phase, dismiss } = useOnboarding();

  useEffect(() => {
    if (phase === 'readme' || phase === 'readme-and-ghost') {
      readmeWindow.open();
    } else {
      readmeWindow.close();
    }
  }, [phase, readmeWindow]);
```

Ajouter `useEffect` a l'import React en tete de fichier.

Modifier `openWindow` pour eteindre le tuto :

```ts
  const openWindow = (windowId: DesktopWindowId, open: () => void) => {
    windowStack.bringToFront(windowId);
    notifyWindowOpened(windowId);
    dismiss();
    open();
  };
```

Dans le JSX, a l'interieur de `.desktop-surface`, ajouter avant les autres fenetres :

```tsx
        {readmeWindow.isOpen ? (
          <ReadmeWindow
            frame={readmeWindow.frame}
            isMaximized={readmeWindow.isMaximized}
            onClose={() => {
              dismiss();
              readmeWindow.close();
            }}
            onFrameChange={readmeWindow.updateFrame}
            onMinimize={readmeWindow.minimize}
            onToggleMaximize={readmeWindow.toggleMaximize}
            onActivate={() => windowStack.bringToFront('readme')}
            zIndex={windowStack.getZIndex('readme')}
          />
        ) : null}

        {phase === 'readme-and-ghost' ? <GhostCursor /> : null}
```

- [ ] **Step 11: Verifier les tests e2e**

Run: `pnpm test:e2e --project=desktop-chromium`
Expected: PASS, 4 tests (2 de la tache 2, 2 du tuto).

- [ ] **Step 12: Verifier lint et tests unitaires**

Run: `pnpm lint && pnpm test`
Expected: PASS.

- [ ] **Step 13: Commit**

```bash
git add src/experience/onboarding public/assets/cursors/ghost-pointer.svg src/components/desktop/DesktopShell.tsx tests/e2e/desktop-onboarding.spec.ts
git commit -m "feat(onboarding): fenetre Lisez-moi et curseur fantome diegetiques"
```

---

### Task 4: Bouton portail

**Files:**
- Create: `src/experience/portal/PortalButton.tsx`
- Create: `src/experience/portal/portal.css`
- Modify: `src/App.tsx`
- Create: `tests/e2e/desktop-portal.spec.ts`

**Interfaces:**
- Consumes: `useExperienceStageContext`.
- Produces: `PortalButton(props: { onActivate?: () => void }): JSX.Element | null` -- rend `null` tant que `isPortalReady` est faux ou que la phase n'est pas `desktop`. `onActivate` est un crochet optionnel appele juste avant `enterRoom`, utilise en tache 5 pour declencher le prefetch.

- [ ] **Step 1: Ecrire le test e2e**

Creer `tests/e2e/desktop-portal.spec.ts` :

```ts
import { expect, test } from '@playwright/test';

test('reveals the portal after two windows and enters the room', async ({ page }) => {
  await page.goto('/');

  const portal = page.getByRole('button', { name: 'Sortir de l\'ecran' });
  await expect(portal).toBeHidden();

  await page.getByRole('button', { name: 'Education' }).click();
  await page.getByRole('button', { name: 'Projects' }).click();
  await expect(portal).toBeVisible();

  await portal.click();
  await expect(page.locator('.experience-root')).toHaveAttribute('data-stage', 'room', {
    timeout: 6000,
  });
  await expect(portal).toBeHidden();
});
```

- [ ] **Step 2: Lancer le test et verifier l'echec**

Run: `pnpm test:e2e --project=desktop-chromium desktop-portal`
Expected: FAIL, le bouton n'existe pas.

- [ ] **Step 3: Implementer le bouton**

Creer `src/experience/portal/PortalButton.tsx` :

```tsx
import { useEffect, useRef } from 'react';
import { useExperienceStageContext } from '../stage/ExperienceStageContext';
import './portal.css';

export function PortalButton({ onActivate }: { onActivate?: () => void }) {
  const { stage, isPortalReady, enterRoom } = useExperienceStageContext();
  const hasAnnounced = useRef(false);
  const isVisible = isPortalReady && stage === 'desktop';

  useEffect(() => {
    if (isVisible) {
      hasAnnounced.current = true;
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="portal-slot">
      <p className="portal-slot__live" role="status" aria-live="polite">
        {hasAnnounced.current ? '' : 'Une suite est disponible.'}
      </p>
      <button
        className="portal-button"
        type="button"
        onClick={() => {
          onActivate?.();
          enterRoom();
        }}
      >
        <span className="portal-button__halo" aria-hidden="true" />
        <span className="portal-button__label">Sortir de l&apos;ecran</span>
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Ecrire les styles du bouton**

Creer `src/experience/portal/portal.css`. Les garde-fous de direction artistique tiennent en deux regles : pastille et non carte, et aucune ombre portee -- sinon le bouton lit comme un bandeau cookies.

```css
.portal-slot {
  position: fixed;
  z-index: 900;
  bottom: 34px;
  left: 50%;
  transform: translateX(-50%);
}

.portal-slot__live {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.portal-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 13px 30px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  background: rgba(10, 12, 16, 0.62);
  backdrop-filter: blur(14px) saturate(1.5);
  color: #f4f6fb;
  isolation: isolate;
  animation: portal-materialize 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.portal-button__label {
  position: relative;
  z-index: 1;
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  transition: letter-spacing 420ms cubic-bezier(0.16, 1, 0.3, 1);
}

.portal-button__halo {
  position: absolute;
  z-index: 0;
  inset: -1px;
  border-radius: inherit;
  background: conic-gradient(
    from 0deg,
    rgba(120, 200, 255, 0),
    rgba(120, 200, 255, 0.55),
    rgba(196, 140, 255, 0.45),
    rgba(120, 200, 255, 0)
  );
  opacity: 0.75;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
  padding: 1px;
  animation: portal-halo-spin 8s linear infinite;
}

.portal-button:hover .portal-button__label,
.portal-button:focus-visible .portal-button__label {
  letter-spacing: 0.34em;
}

.portal-button:hover .portal-button__halo {
  animation-duration: 3.4s;
}

@keyframes portal-materialize {
  from {
    filter: blur(12px);
    opacity: 0;
    transform: scale(0.94);
  }

  to {
    filter: blur(0);
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes portal-halo-spin {
  to {
    rotate: 360deg;
  }
}

@media (prefers-reduced-motion: reduce) {
  .portal-button {
    animation: none;
  }

  .portal-button__halo {
    animation: none;
  }
}

/* Mobile : le bouton se place au-dessus du dock, sans chevaucher une icone. */
@media (max-width: 640px) {
  .portal-slot {
    bottom: calc(env(safe-area-inset-bottom, 0px) + 116px);
  }
}
```

- [ ] **Step 5: Monter le bouton dans App**

Modifier `src/App.tsx` : ajouter `import { PortalButton } from './experience/portal/PortalButton';` et inserer `<PortalButton />` juste avant `<PortfolioModeToggle ... />`.

- [ ] **Step 6: Verifier le test e2e**

Run: `pnpm test:e2e --project=desktop-chromium`
Expected: PASS, 5 tests.

- [ ] **Step 7: Commit**

```bash
git add src/experience/portal src/App.tsx tests/e2e/desktop-portal.spec.ts
git commit -m "feat(portal): bouton de sortie de l'ecran en rupture stylistique"
```

---

### Task 5: Socle 3D -- dependances, piece vide, chargement differe

**Files:**
- Create: `src/experience/room/roomRenderer.ts`
- Create: `src/experience/room/roomRenderer.test.ts`
- Create: `src/experience/room/RoomScene.tsx`
- Create: `src/experience/room/Floor.tsx`
- Create: `src/experience/room/CrtMonitor.tsx`
- Create: `src/experience/room/RoomFallback.tsx`
- Create: `src/experience/room/RoomLayer.tsx`
- Create: `src/experience/room/room.css`
- Modify: `src/App.tsx`
- Modify: `package.json`

**Interfaces:**
- Consumes: `useExperienceStageContext`, `ExperienceStageName`.
- Produces:
  - `type RoomRenderer = 'webgl' | 'fallback' | 'none'`
  - `pickRoomRenderer(input: { stage: ExperienceStageName; hasWebgl: boolean }): RoomRenderer`
  - `prefetchRoomScene(): void`
  - `RoomLayer(): JSX.Element | null`
  - `RoomScene(props: { device: 'crt' | 'phone' }): JSX.Element`
  - `CrtMonitor(props: { position: [number, number, number]; rotation: [number, number, number] }): JSX.Element`

- [ ] **Step 1: Installer les dependances**

```bash
pnpm add three @react-three/fiber
pnpm add -D @types/three
```

`@react-three/fiber` v9 cible React 19, deja present dans `package.json`. Aucune autre dependance ne doit apparaitre dans le diff de `package.json`.

- [ ] **Step 2: Ecrire le test du choix de rendu**

Creer `src/experience/room/roomRenderer.test.ts` :

```ts
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
```

- [ ] **Step 3: Lancer le test et verifier l'echec**

Run: `pnpm vitest run src/experience/room/roomRenderer.test.ts`
Expected: FAIL, module introuvable.

- [ ] **Step 4: Implementer le choix de rendu et le prefetch**

Creer `src/experience/room/roomRenderer.ts` :

```ts
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
```

- [ ] **Step 5: Verifier que le test passe**

Run: `pnpm vitest run src/experience/room/roomRenderer.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 6: Implementer la piece**

Creer `src/experience/room/Floor.tsx` :

```tsx
export function Floor() {
  return (
    <mesh position={[0, -1.4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={false}>
      <planeGeometry args={[220, 220]} />
      <meshStandardMaterial color="#0a0c10" roughness={0.62} metalness={0.18} />
    </mesh>
  );
}
```

Creer `src/experience/room/CrtMonitor.tsx` :

```tsx
export function CrtMonitor({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[2.32, 1.92, 2.05]} />
        <meshStandardMaterial color="#c9c3b2" roughness={0.78} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0.08, 1.035]} name="crt-screen">
        <planeGeometry args={[1.78, 1.34]} />
        <meshBasicMaterial color="#8fb2a8" toneMapped={false} />
      </mesh>
    </group>
  );
}
```

Creer `src/experience/room/RoomScene.tsx` :

```tsx
import { Canvas } from '@react-three/fiber';
import { CrtMonitor } from './CrtMonitor';
import { Floor } from './Floor';

export default function RoomScene({ device }: { device: 'crt' | 'phone' }) {
  const dpr: [number, number] = device === 'phone' ? [1, 1.5] : [1, 1.75];

  return (
    <Canvas
      className="room-canvas"
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 45, near: 0.1, far: 220, position: [0, 0, 3.4] }}
    >
      <color attach="background" args={['#05060a']} />
      <fogExp2 attach="fog" args={['#05060a', 0.042]} />
      <ambientLight intensity={0.06} />
      <pointLight position={[-3.1, 0.2, 1.4]} intensity={9} distance={26} color="#9fd8c8" />
      <Floor />
      <CrtMonitor position={[-3.1, 0, 0]} rotation={[0, 0.62, 0]} />
    </Canvas>
  );
}
```

Note : `device` n'a pas encore d'effet sur la geometrie ; la variante telephone arrive en tache 9. Le parametre existe des maintenant pour figer la signature attendue par `RoomLayer`.

Creer `src/experience/room/RoomFallback.tsx` :

```tsx
export function RoomFallback() {
  return <div className="room-fallback" aria-hidden="true" />;
}
```

Creer `src/experience/room/RoomLayer.tsx` :

```tsx
import { Suspense, lazy, useEffect, useState } from 'react';
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
  const [hasWebgl, setHasWebgl] = useState(true);

  useEffect(() => {
    setHasWebgl(detectWebgl());
  }, []);

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
```

Creer `src/experience/room/room.css` :

```css
.room-layer {
  position: fixed;
  z-index: 3000;
  inset: 0;
  background: #05060a;
}

.room-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.room-fallback {
  width: 100%;
  height: 100%;
  background:
    radial-gradient(120% 70% at 18% 52%, rgba(159, 216, 200, 0.22), transparent 58%),
    linear-gradient(180deg, #05060a 0%, #05060a 62%, #0b0f14 100%);
}
```

- [ ] **Step 7: Monter la couche et brancher le prefetch**

Modifier `src/App.tsx` : ajouter les imports

```ts
import { PortalButton } from './experience/portal/PortalButton';
import { RoomLayer, prefetchRoomScene } from './experience/room/RoomLayer';
```

Remplacer `<PortalButton />` par `<PortalButton onActivate={prefetchRoomScene} />` et inserer `<RoomLayer />` juste apres, avant `<PortfolioModeToggle ... />`.

Ajouter dans `App`, pour precharger des l'apparition du bouton plutot qu'au clic :

```tsx
  useEffect(() => {
    const root = document.querySelector('.experience-root');
    if (!root) {
      return;
    }

    const observer = new MutationObserver(() => {
      if (root.getAttribute('data-portal-ready') === 'true') {
        prefetchRoomScene();
        observer.disconnect();
      }
    });

    observer.observe(root, { attributeFilter: ['data-portal-ready'] });
    return () => observer.disconnect();
  }, []);
```

- [ ] **Step 8: Verifier le decoupage du bundle**

Run: `pnpm build`
Expected: la sortie liste un chunk separe contenant `three` (nom de type `RoomScene-*.js`), et le chunk d'entree ne le reference pas statiquement. Verifier ensuite :

```bash
grep -rl "three" dist/assets/*.js | head
```
Expected: le nom du chunk `RoomScene`, pas le chunk d'entree `index-*.js`.

- [ ] **Step 9: Verifier le parcours e2e**

Run: `pnpm test:e2e --project=desktop-chromium && pnpm lint && pnpm test`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add package.json pnpm-lock.yaml src/experience/room src/App.tsx
git commit -m "feat(room): piece 3D vide chargee en lazy avec repli sans webgl"
```

---

### Task 6: Ecran vivant -- shader, halo et reflet

**Files:**
- Create: `src/experience/room/ScreenMaterial.ts`
- Create: `src/experience/room/ScreenGlow.tsx`
- Modify: `src/experience/room/CrtMonitor.tsx`
- Modify: `src/experience/room/Floor.tsx`
- Modify: `src/experience/room/RoomScene.tsx`

**Interfaces:**
- Consumes: rien de nouveau.
- Produces:
  - `createScreenMaterial(): ShaderMaterial`
  - `ScreenGlow(props: { position: [number, number, number]; scale: number }): JSX.Element`
  - `CrtMonitor` accepte desormais `screenRef?: RefObject<Mesh | null>` pour que la tache 7 puisse lire la matrice monde de la dalle.

- [ ] **Step 1: Implementer le shader de dalle**

Creer `src/experience/room/ScreenMaterial.ts` :

```ts
import { AdditiveBlending, ShaderMaterial } from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    float scanline = 0.5 + 0.5 * sin((vUv.y + uTime * 0.06) * 620.0);
    float drift = 0.5 + 0.5 * sin(uTime * 0.5);
    vec3 phosphor = mix(vec3(0.42, 0.72, 0.64), vec3(0.30, 0.52, 0.74), drift);
    float vignette = smoothstep(1.05, 0.24, distance(vUv, vec2(0.5)));
    vec3 color = phosphor * (0.78 + 0.22 * scanline) * vignette;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function createScreenMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader,
    fragmentShader,
    toneMapped: false,
  });
}

export const SCREEN_GLOW_BLENDING = AdditiveBlending;
```

- [ ] **Step 2: Implementer le halo additif**

Creer `src/experience/room/ScreenGlow.tsx` :

```tsx
import { AdditiveBlending, CanvasTexture } from 'three';
import { useMemo } from 'react';

function createRadialTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, 'rgba(159, 216, 200, 0.85)');
    gradient.addColorStop(0.42, 'rgba(120, 176, 200, 0.28)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }

  return new CanvasTexture(canvas);
}

export function ScreenGlow({
  position,
  scale,
}: {
  position: [number, number, number];
  scale: number;
}) {
  const texture = useMemo(createRadialTexture, []);

  return (
    <sprite position={position} scale={[scale, scale, 1]}>
      <spriteMaterial
        map={texture}
        blending={AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  );
}
```

- [ ] **Step 3: Brancher le shader et exposer la dalle**

Modifier `src/experience/room/CrtMonitor.tsx` :

```tsx
import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import type { RefObject } from 'react';
import type { Mesh } from 'three';
import { createScreenMaterial } from './ScreenMaterial';
import { ScreenGlow } from './ScreenGlow';

export function CrtMonitor({
  position,
  rotation,
  screenRef,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  screenRef?: RefObject<Mesh | null>;
}) {
  const material = useMemo(createScreenMaterial, []);

  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta;
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[2.32, 1.92, 2.05]} />
        <meshStandardMaterial color="#c9c3b2" roughness={0.78} metalness={0.04} />
      </mesh>

      <mesh ref={screenRef} position={[0, 0.08, 1.035]} material={material} name="crt-screen">
        <planeGeometry args={[1.78, 1.34]} />
      </mesh>

      <ScreenGlow position={[0, 0.08, 1.16]} scale={3.4} />
    </group>
  );
}
```

- [ ] **Step 4: Ajouter le reflet au sol**

Modifier `src/experience/room/Floor.tsx` :

```tsx
import type { ReactNode } from 'react';

export function Floor({ reflection }: { reflection?: ReactNode }) {
  return (
    <group>
      <mesh position={[0, -1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#0a0c10" roughness={0.62} metalness={0.18} />
      </mesh>

      {/*
       * Reflet : copie miroir sous le sol, assombrie, puis masquee par le sol
       * lui-meme qui est legerement transparent. Pas de materiau reflectif.
       */}
      <group position={[0, -2.8, 0]} scale={[1, -1, 1]}>
        {reflection}
      </group>
    </group>
  );
}
```

Modifier `src/experience/room/RoomScene.tsx` pour passer le reflet et rendre le sol semi-transparent :

```tsx
      <Floor reflection={<CrtMonitor position={[-3.1, 0, 0]} rotation={[0, 0.62, 0]} />} />
      <CrtMonitor position={[-3.1, 0, 0]} rotation={[0, 0.62, 0]} />
```

Et dans `Floor.tsx`, ajouter `transparent opacity={0.86}` au `meshStandardMaterial` du sol pour laisser transparaitre le reflet.

- [ ] **Step 5: Verifier a l'oeil**

Run: `pnpm dev`
Ouvrir `http://localhost:5173`, ouvrir deux fenetres, cliquer le bouton portail.
Expected: la piece affiche un moniteur eclaire dont l'ecran scintille, un halo autour de la dalle, un reflet attenue sous le sol, et un brouillard qui avale l'horizon.

- [ ] **Step 6: Verifier lint, tests et build**

Run: `pnpm lint && pnpm test && pnpm build`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/experience/room
git commit -m "feat(room): dalle animee, halo additif et reflet au sol"
```

---

### Task 7: Dezoom -- camera et synchronisation DOM

**Files:**
- Create: `src/experience/room/screenProjection.ts`
- Create: `src/experience/room/screenProjection.test.ts`
- Create: `src/experience/room/cameraPath.ts`
- Create: `src/experience/room/cameraPath.test.ts`
- Create: `src/experience/room/CameraRig.tsx`
- Modify: `src/experience/room/RoomScene.tsx`
- Modify: `src/experience/stage/ExperienceStageContext.tsx`
- Modify: `src/experience/stage/experience.css`
- Modify: `src/components/desktop/desktop.css`
- Create: `tests/e2e/desktop-pullback.spec.ts`

**Interfaces:**
- Consumes: `clamp01`, `lerp`, `easeOutExpo`, `transitionDurationMs`, `useExperienceStageContext`.
- Produces:
  - `cssPerspectiveFromFov(fovDeg: number, viewportHeight: number): number`
  - `SHADER_SWAP_RATIO: number`
  - `shouldSwapToShader(projectedWidthRatio: number): boolean`
  - `getCameraCssMatrix(elements: ArrayLike<number>): string`
  - `getObjectCssMatrix(elements: ArrayLike<number>): string`
  - `type CameraKeyframe = { t: number; position: [number, number, number]; lookAt: [number, number, number] }`
  - `PULLBACK_PATH: CameraKeyframe[]`
  - `sampleCameraPath(path: CameraKeyframe[], t: number): { position: [number, number, number]; lookAt: [number, number, number] }`
  - Nouvelle valeur de contexte : `transitionProgressRef: RefObject<number>` -- progression 0 a 1 de la transition en cours, mise a jour hors React.

- [ ] **Step 1: Ecrire les tests des maths de projection**

Creer `src/experience/room/screenProjection.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import {
  SHADER_SWAP_RATIO,
  cssPerspectiveFromFov,
  getCameraCssMatrix,
  getObjectCssMatrix,
  shouldSwapToShader,
} from './screenProjection';

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

describe('cssPerspectiveFromFov', () => {
  it('matches the three.js perspective for a 90 degree field of view', () => {
    expect(cssPerspectiveFromFov(90, 1000)).toBeCloseTo(500, 5);
  });

  it('grows as the field of view narrows', () => {
    expect(cssPerspectiveFromFov(30, 1000)).toBeGreaterThan(cssPerspectiveFromFov(60, 1000));
  });

  it('scales linearly with the viewport height', () => {
    expect(cssPerspectiveFromFov(45, 2000)).toBeCloseTo(cssPerspectiveFromFov(45, 1000) * 2, 5);
  });
});

describe('shouldSwapToShader', () => {
  it('keeps the DOM while the screen is readable', () => {
    expect(shouldSwapToShader(0.55)).toBe(false);
  });

  it('swaps once below the threshold', () => {
    expect(shouldSwapToShader(SHADER_SWAP_RATIO - 0.01)).toBe(true);
  });
});

describe('css matrix formatting', () => {
  it('flips the Y axis for the camera matrix', () => {
    expect(getCameraCssMatrix(IDENTITY)).toBe('matrix3d(1,0,0,0,0,-1,0,0,0,0,1,0,0,0,0,1)');
  });

  it('flips the second column for the object matrix', () => {
    expect(getObjectCssMatrix(IDENTITY)).toBe(
      'translate(-50%,-50%) matrix3d(1,0,0,0,0,-1,0,0,0,0,1,0,0,0,0,1)',
    );
  });
});
```

- [ ] **Step 2: Lancer le test et verifier l'echec**

Run: `pnpm vitest run src/experience/room/screenProjection.test.ts`
Expected: FAIL, module introuvable.

- [ ] **Step 3: Implementer les maths de projection**

Creer `src/experience/room/screenProjection.ts`. Les deux formateurs reprennent la convention de `CSS3DRenderer` de three.js : c'est ce qui garantit un alignement exact entre le DOM et la scene.

```ts
export const SHADER_SWAP_RATIO = 0.2;

export function cssPerspectiveFromFov(fovDeg: number, viewportHeight: number): number {
  return (0.5 * viewportHeight) / Math.tan(((fovDeg * Math.PI) / 180) / 2);
}

export function shouldSwapToShader(projectedWidthRatio: number): boolean {
  return projectedWidthRatio < SHADER_SWAP_RATIO;
}

function epsilon(value: number): number {
  return Math.abs(value) < 1e-10 ? 0 : value;
}

export function getCameraCssMatrix(e: ArrayLike<number>): string {
  return `matrix3d(${[
    epsilon(e[0]),
    epsilon(-e[1]),
    epsilon(e[2]),
    epsilon(e[3]),
    epsilon(e[4]),
    epsilon(-e[5]),
    epsilon(e[6]),
    epsilon(e[7]),
    epsilon(e[8]),
    epsilon(-e[9]),
    epsilon(e[10]),
    epsilon(e[11]),
    epsilon(e[12]),
    epsilon(-e[13]),
    epsilon(e[14]),
    epsilon(e[15]),
  ].join(',')})`;
}

export function getObjectCssMatrix(e: ArrayLike<number>): string {
  return `translate(-50%,-50%) matrix3d(${[
    epsilon(e[0]),
    epsilon(e[1]),
    epsilon(e[2]),
    epsilon(e[3]),
    epsilon(-e[4]),
    epsilon(-e[5]),
    epsilon(-e[6]),
    epsilon(-e[7]),
    epsilon(e[8]),
    epsilon(e[9]),
    epsilon(e[10]),
    epsilon(e[11]),
    epsilon(e[12]),
    epsilon(e[13]),
    epsilon(e[14]),
    epsilon(e[15]),
  ].join(',')})`;
}
```

- [ ] **Step 4: Ecrire les tests de la trajectoire**

Creer `src/experience/room/cameraPath.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { PULLBACK_PATH, sampleCameraPath } from './cameraPath';

describe('sampleCameraPath', () => {
  it('returns the first keyframe at t = 0', () => {
    expect(sampleCameraPath(PULLBACK_PATH, 0).position).toEqual(PULLBACK_PATH[0].position);
  });

  it('returns the last keyframe at t = 1', () => {
    const last = PULLBACK_PATH[PULLBACK_PATH.length - 1];
    expect(sampleCameraPath(PULLBACK_PATH, 1).position).toEqual(last.position);
  });

  it('clamps outside the unit range', () => {
    expect(sampleCameraPath(PULLBACK_PATH, -4).position).toEqual(PULLBACK_PATH[0].position);
    expect(sampleCameraPath(PULLBACK_PATH, 4).position).toEqual(
      PULLBACK_PATH[PULLBACK_PATH.length - 1].position,
    );
  });

  it('interpolates between two keyframes', () => {
    const path = [
      { t: 0, position: [0, 0, 0] as [number, number, number], lookAt: [0, 0, 0] as [number, number, number] },
      { t: 1, position: [10, 0, 0] as [number, number, number], lookAt: [0, 0, 0] as [number, number, number] },
    ];

    expect(sampleCameraPath(path, 0.5).position[0]).toBeCloseTo(5, 5);
  });

  it('moves the camera backwards along Z during the pullback', () => {
    const start = sampleCameraPath(PULLBACK_PATH, 0).position[2];
    const end = sampleCameraPath(PULLBACK_PATH, 1).position[2];
    expect(end).toBeGreaterThan(start);
  });
});
```

- [ ] **Step 5: Lancer le test et verifier l'echec**

Run: `pnpm vitest run src/experience/room/cameraPath.test.ts`
Expected: FAIL, module introuvable.

- [ ] **Step 6: Implementer la trajectoire**

Creer `src/experience/room/cameraPath.ts`. La camera ne suit pas une ligne droite : elle derive lateralement, ce qui fait tourner l'angle du moniteur pendant le recul.

```ts
import { clamp01, lerp } from '../stage/easing';

export type Vector3Tuple = [number, number, number];

export type CameraKeyframe = {
  t: number;
  position: Vector3Tuple;
  lookAt: Vector3Tuple;
};

export const PULLBACK_PATH: CameraKeyframe[] = [
  { t: 0, position: [-3.1, 0.08, 1.28], lookAt: [-3.1, 0.08, 0] },
  { t: 0.36, position: [-2.85, 0.12, 4.2], lookAt: [-3.05, 0.06, 0] },
  { t: 0.72, position: [-0.9, 0.35, 8.1], lookAt: [-2.6, 0.02, 0] },
  { t: 1, position: [0.85, 0.55, 10.4], lookAt: [-2.2, -0.05, 0] },
];

function lerpTuple(from: Vector3Tuple, to: Vector3Tuple, t: number): Vector3Tuple {
  return [lerp(from[0], to[0], t), lerp(from[1], to[1], t), lerp(from[2], to[2], t)];
}

export function sampleCameraPath(
  path: CameraKeyframe[],
  t: number,
): { position: Vector3Tuple; lookAt: Vector3Tuple } {
  const clamped = clamp01(t);

  for (let index = 0; index < path.length - 1; index += 1) {
    const current = path[index];
    const next = path[index + 1];

    if (clamped <= next.t) {
      const span = next.t - current.t;
      const local = span === 0 ? 0 : (clamped - current.t) / span;

      return {
        position: lerpTuple(current.position, next.position, local),
        lookAt: lerpTuple(current.lookAt, next.lookAt, local),
      };
    }
  }

  const last = path[path.length - 1];
  return { position: [...last.position], lookAt: [...last.lookAt] };
}
```

- [ ] **Step 7: Verifier que les tests passent**

Run: `pnpm vitest run src/experience/room`
Expected: PASS.

- [ ] **Step 8: Exposer la progression de transition dans le contexte**

Modifier `src/experience/stage/ExperienceStageContext.tsx`.

Ajouter `useRef` a l'import React et etendre le type :

```ts
export type ExperienceStageValue = {
  stage: ExperienceStageName;
  isPortalReady: boolean;
  prefersReducedMotion: boolean;
  isMobile: boolean;
  transitionProgressRef: RefObject<number>;
  notifyWindowOpened: (windowId: string) => void;
  enterRoom: () => void;
  skipTransition: () => void;
  returnToDesktop: () => void;
};
```

Ajouter `import type { ReactNode, RefObject } from 'react';`.

Remplacer l'effet de minuterie de transition par une animation par frame qui remplit la ref :

```tsx
  const transitionProgressRef = useRef(0);

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
    return () => cancelAnimationFrame(frame);
  }, [isMobile, prefersReducedMotion, state.stage]);
```

Ajouter `transitionProgressRef` a l'objet `value` et a ses dependances `useMemo`.

Ajouter enfin le saut de transition au clavier et au clic :

```tsx
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

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [state.stage]);
```

- [ ] **Step 9: Implementer le rig camera et la synchronisation DOM**

Creer `src/experience/room/CameraRig.tsx` :

```tsx
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { Matrix4, Vector3 } from 'three';
import type { Mesh } from 'three';
import { easeOutExpo } from '../stage/easing';
import { useExperienceStageContext } from '../stage/ExperienceStageContext';
import { PULLBACK_PATH, sampleCameraPath } from './cameraPath';
import {
  cssPerspectiveFromFov,
  getCameraCssMatrix,
  getObjectCssMatrix,
  shouldSwapToShader,
} from './screenProjection';

const lookAtTarget = new Vector3();
const relativeMatrix = new Matrix4();

export function CameraRig({ screenRef }: { screenRef: RefObject<Mesh | null> }) {
  const { camera, size } = useThree();
  const { transitionProgressRef, stage } = useExperienceStageContext();
  const elementsRef = useRef<{
    viewport: HTMLElement | null;
    cameraLayer: HTMLElement | null;
    screen: HTMLElement | null;
  }>({ viewport: null, cameraLayer: null, screen: null });

  useEffect(() => {
    elementsRef.current = {
      viewport: document.querySelector<HTMLElement>('.experience-viewport'),
      cameraLayer: document.querySelector<HTMLElement>('.experience-camera'),
      screen: document.querySelector<HTMLElement>('.experience-screen'),
    };
  }, []);

  useFrame(() => {
    const eased = easeOutExpo(transitionProgressRef.current);
    const sample = sampleCameraPath(PULLBACK_PATH, eased);

    camera.position.set(sample.position[0], sample.position[1], sample.position[2]);
    lookAtTarget.set(sample.lookAt[0], sample.lookAt[1], sample.lookAt[2]);
    camera.lookAt(lookAtTarget);
    camera.updateMatrixWorld();

    const { viewport, cameraLayer, screen } = elementsRef.current;
    const screenMesh = screenRef.current;
    if (!viewport || !cameraLayer || !screen || !screenMesh) {
      return;
    }

    const fov = 'fov' in camera ? (camera.fov as number) : 45;
    const perspective = cssPerspectiveFromFov(fov, size.height);
    viewport.style.perspective = `${perspective}px`;

    cameraLayer.style.transform = `translateZ(${perspective}px) ${getCameraCssMatrix(
      camera.matrixWorldInverse.elements,
    )} translate(${size.width / 2}px, ${size.height / 2}px)`;

    screenMesh.updateMatrixWorld();
    relativeMatrix.copy(screenMesh.matrixWorld);
    screen.style.transform = getObjectCssMatrix(relativeMatrix.elements);

    // Le rapport de largeur projetee decide du raccord DOM vers shader.
    const worldWidth = 1.78;
    const distance = camera.position.distanceTo(screenMesh.getWorldPosition(new Vector3()));
    const visibleWidth =
      2 * Math.tan(((fov * Math.PI) / 180) / 2) * distance * (size.width / size.height);
    const ratio = worldWidth / visibleWidth;

    const swapped = shouldSwapToShader(ratio);
    screen.style.opacity = swapped ? '0' : '1';
    screen.style.pointerEvents = stage === 'desktop' ? 'auto' : 'none';
  });

  return null;
}
```

Modifier `src/experience/room/RoomScene.tsx` pour creer la ref de dalle, la passer au moniteur et monter le rig :

```tsx
import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh } from 'three';
import { CameraRig } from './CameraRig';
import { CrtMonitor } from './CrtMonitor';
import { Floor } from './Floor';

export default function RoomScene({ device }: { device: 'crt' | 'phone' }) {
  const screenRef = useRef<Mesh | null>(null);
  const dpr: [number, number] = device === 'phone' ? [1, 1.5] : [1, 1.75];

  return (
    <Canvas
      className="room-canvas"
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 45, near: 0.1, far: 220, position: [-3.1, 0.08, 1.28] }}
    >
      <color attach="background" args={['#05060a']} />
      <fogExp2 attach="fog" args={['#05060a', 0.042]} />
      <ambientLight intensity={0.06} />
      <pointLight position={[-3.1, 0.2, 1.4]} intensity={9} distance={26} color="#9fd8c8" />
      <Floor reflection={<CrtMonitor position={[-3.1, 0, 0]} rotation={[0, 0.62, 0]} />} />
      <CrtMonitor position={[-3.1, 0, 0]} rotation={[0, 0.62, 0]} screenRef={screenRef} />
      <CameraRig screenRef={screenRef} />
    </Canvas>
  );
}
```

- [ ] **Step 10: Mettre en pause les animations du fond pendant la transition**

Modifier `src/components/desktop/desktop.css`, ajouter en fin de fichier :

```css
/*
 * Une animation infinie sur un calque transforme en 3D est du repaint
 * pur perdu : on la coupe des que le bureau quitte sa phase stable.
 */
.experience-root:not([data-stage="desktop"]) .wallpaper-layer::before,
.experience-root:not([data-stage="desktop"]) .wallpaper-layer::after {
  animation-play-state: paused;
}
```

Modifier `src/experience/stage/experience.css`, ajouter :

```css
.experience-root:not([data-stage="desktop"]) .experience-screen {
  width: 100vw;
  height: 100vh;
  transform-origin: 50% 50%;
  will-change: transform, opacity;
  transition: opacity 200ms linear;
}

.experience-root:not([data-stage="desktop"]) .experience-camera {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
}
```

- [ ] **Step 11: Ecrire et lancer le test e2e du dezoom**

Creer `tests/e2e/desktop-pullback.spec.ts` :

```ts
import { expect, test } from '@playwright/test';

test('pulls back into the room and returns on escape', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Education' }).click();
  await page.getByRole('button', { name: 'Projects' }).click();

  const root = page.locator('.experience-root');
  await page.getByRole('button', { name: 'Sortir de l\'ecran' }).click();

  await expect(root).toHaveAttribute('data-stage', 'pullback');
  await expect(root).toHaveAttribute('data-stage', 'room', { timeout: 6000 });
  await expect(page.locator('.room-canvas')).toBeVisible();
});

test('skips the pullback on escape', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Education' }).click();
  await page.getByRole('button', { name: 'Projects' }).click();
  await page.getByRole('button', { name: 'Sortir de l\'ecran' }).click();

  await page.keyboard.press('Escape');
  await expect(page.locator('.experience-root')).toHaveAttribute('data-stage', 'room');
});
```

Run: `pnpm test:e2e --project=desktop-chromium`
Expected: PASS.

- [ ] **Step 12: Verifier a l'oeil**

Run: `pnpm dev`
Expected: au clic sur le bouton, le bureau rapetisse en restant parfaitement aligne sur la dalle du moniteur, la piece se revele, le moniteur part en biais vers la gauche, et le raccord DOM vers shader ne se voit pas.

- [ ] **Step 13: Commit**

```bash
git add src/experience src/components/desktop/desktop.css tests/e2e/desktop-pullback.spec.ts
git commit -m "feat(room): recul de camera et synchronisation DOM sur la dalle"
```

---

### Task 8: Cinematique pilotee au scroll

**Files:**
- Create: `src/experience/cinematic/cinematicScript.ts`
- Create: `src/experience/cinematic/scrollTimeline.ts`
- Create: `src/experience/cinematic/scrollTimeline.test.ts`
- Create: `src/experience/cinematic/useScrollTimeline.ts`
- Create: `src/experience/cinematic/CinematicOverlay.tsx`
- Create: `src/experience/cinematic/CinematicA11yArticle.tsx`
- Create: `src/experience/cinematic/cinematic.css`
- Modify: `src/experience/room/CameraRig.tsx`
- Modify: `src/App.tsx`
- Create: `tests/e2e/desktop-cinematic.spec.ts`

**Interfaces:**
- Consumes: `useExperienceStageContext`, `clamp01`, `sampleCameraPath`.
- Produces:
  - `type LineEnter = 'mask-up' | 'blur-in' | 'track-in'`
  - `type CinematicLine = { text: string; enter: LineEnter }`
  - `type CinematicAct = { id: string; kind: 'text' | 'cta'; cameraDepth: number; lines: CinematicLine[] }`
  - `cinematicScript: CinematicAct[]`
  - `actIndexFromProgress(progress: number, actCount: number): number`
  - `actProgress(progress: number, actCount: number, actIndex: number): number`
  - `useScrollTimeline(actCount: number): { scrollRef: RefObject<HTMLDivElement | null>; progressRef: RefObject<number>; actIndex: number; goToAct: (index: number) => void }`
  - Nouvelle valeur de contexte : `roomProgressRef: RefObject<number>` -- progression 0 a 1 du scroll dans la piece, mise a jour hors React et lue par `CameraRig`.

- [ ] **Step 1: Ecrire les tests de la timeline**

Creer `src/experience/cinematic/scrollTimeline.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { actIndexFromProgress, actProgress } from './scrollTimeline';

describe('actIndexFromProgress', () => {
  it('starts on the first act', () => {
    expect(actIndexFromProgress(0, 5)).toBe(0);
  });

  it('ends on the last act', () => {
    expect(actIndexFromProgress(1, 5)).toBe(4);
  });

  it('splits the range evenly', () => {
    expect(actIndexFromProgress(0.25, 4)).toBe(1);
    expect(actIndexFromProgress(0.5, 4)).toBe(2);
  });

  it('clamps outside the unit range', () => {
    expect(actIndexFromProgress(-2, 4)).toBe(0);
    expect(actIndexFromProgress(7, 4)).toBe(3);
  });

  it('returns zero when there is no act', () => {
    expect(actIndexFromProgress(0.5, 0)).toBe(0);
  });
});

describe('actProgress', () => {
  it('reports the progress inside the current act', () => {
    expect(actProgress(0.25, 4, 1)).toBeCloseTo(0, 5);
    expect(actProgress(0.375, 4, 1)).toBeCloseTo(0.5, 5);
  });

  it('clamps for acts outside the current window', () => {
    expect(actProgress(0.9, 4, 0)).toBe(1);
    expect(actProgress(0.1, 4, 3)).toBe(0);
  });
});
```

- [ ] **Step 2: Lancer le test et verifier l'echec**

Run: `pnpm vitest run src/experience/cinematic`
Expected: FAIL, module introuvable.

- [ ] **Step 3: Implementer les maths de timeline**

Creer `src/experience/cinematic/scrollTimeline.ts` :

```ts
import { clamp01 } from '../stage/easing';

export function actIndexFromProgress(progress: number, actCount: number): number {
  if (actCount <= 0) {
    return 0;
  }

  const index = Math.floor(clamp01(progress) * actCount);
  return Math.min(index, actCount - 1);
}

export function actProgress(progress: number, actCount: number, actIndex: number): number {
  if (actCount <= 0) {
    return 0;
  }

  const span = 1 / actCount;
  return clamp01((clamp01(progress) - actIndex * span) / span);
}
```

- [ ] **Step 4: Verifier que les tests passent**

Run: `pnpm vitest run src/experience/cinematic`
Expected: PASS, 7 tests.

- [ ] **Step 5: Ecrire le script de la cinematique**

Creer `src/experience/cinematic/cinematicScript.ts`. Ce texte est une **premiere version fonctionnelle et remplacable** : c'est precisement le fichier isole pour etre reecrit sans toucher au rendu.

```ts
export type LineEnter = 'mask-up' | 'blur-in' | 'track-in';

export type CinematicLine = {
  text: string;
  enter: LineEnter;
};

export type CinematicAct = {
  id: string;
  kind: 'text' | 'cta';
  cameraDepth: number;
  lines: CinematicLine[];
};

export const cinematicScript: CinematicAct[] = [
  {
    id: 'constat',
    kind: 'text',
    cameraDepth: 10.4,
    lines: [
      { text: 'Chaque entreprise a deja ses donnees.', enter: 'mask-up' },
      { text: "Presque aucune n'en tire une decision.", enter: 'mask-up' },
    ],
  },
  {
    id: 'bascule',
    kind: 'text',
    cameraDepth: 18.2,
    lines: [
      { text: "L'IA n'a pas remplace les metiers.", enter: 'blur-in' },
      { text: "Elle a deplace l'endroit ou le travail a de la valeur.", enter: 'mask-up' },
    ],
  },
  {
    id: 'friction',
    kind: 'text',
    cameraDepth: 26.5,
    lines: [
      { text: "Le modele n'est jamais le probleme.", enter: 'track-in' },
      { text: "Le probleme, c'est tout ce qu'il y a autour.", enter: 'mask-up' },
    ],
  },
  {
    id: 'apport',
    kind: 'text',
    cameraDepth: 34.8,
    lines: [
      { text: 'Je construis ce qui va autour.', enter: 'mask-up' },
      {
        text: "De la donnee brute jusqu'a l'interface que quelqu'un utilise vraiment.",
        enter: 'blur-in',
      },
    ],
  },
  {
    id: 'contact',
    kind: 'cta',
    cameraDepth: 42.0,
    lines: [{ text: 'Parlons de ce que vous voulez deplacer.', enter: 'mask-up' }],
  },
];
```

- [ ] **Step 6: Implementer le hook de scroll**

Creer `src/experience/cinematic/useScrollTimeline.ts`. Le point cle : `progressRef` est mis a jour a chaque evenement de scroll sans declencher de rendu React ; seul le changement d'acte remonte en etat.

```ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { clamp01 } from '../stage/easing';
import { actIndexFromProgress } from './scrollTimeline';

export function useScrollTimeline(actCount: number) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const [actIndex, setActIndex] = useState(0);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const onScroll = () => {
      const max = element.scrollHeight - element.clientHeight;
      const progress = max <= 0 ? 0 : clamp01(element.scrollTop / max);
      progressRef.current = progress;
      setActIndex(actIndexFromProgress(progress, actCount));
    };

    onScroll();
    element.addEventListener('scroll', onScroll, { passive: true });
    return () => element.removeEventListener('scroll', onScroll);
  }, [actCount]);

  const goToAct = useCallback(
    (index: number) => {
      const element = scrollRef.current;
      if (!element || actCount <= 0) {
        return;
      }

      const target = Math.min(Math.max(index, 0), actCount - 1);
      const max = element.scrollHeight - element.clientHeight;
      element.scrollTo({ top: (max * target) / Math.max(actCount - 1, 1), behavior: 'smooth' });
    },
    [actCount],
  );

  return { scrollRef, progressRef, actIndex, goToAct };
}
```

- [ ] **Step 7: Implementer la couche texte et l'article accessible**

Creer `src/experience/cinematic/CinematicA11yArticle.tsx`. C'est la parade au risque principal d'accessibilite : les phrases en `opacity: 0` sont invisibles aux lecteurs d'ecran, donc le pitch complet existe en permanence ici.

```tsx
import { cinematicScript } from './cinematicScript';
import './cinematic.css';

export function CinematicA11yArticle() {
  return (
    <article className="cinematic-a11y">
      <h2>Ce que j&apos;apporte sur l&apos;IA en entreprise</h2>
      {cinematicScript.map((act) => (
        <section key={act.id}>
          {act.lines.map((line) => (
            <p key={line.text}>{line.text}</p>
          ))}
        </section>
      ))}
    </article>
  );
}
```

Creer `src/experience/cinematic/CinematicOverlay.tsx` :

```tsx
import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useExperienceStageContext } from '../stage/ExperienceStageContext';
import { CinematicA11yArticle } from './CinematicA11yArticle';
import { cinematicScript } from './cinematicScript';
import { useScrollTimeline } from './useScrollTimeline';
import './cinematic.css';

export function CinematicOverlay() {
  const { stage, returnToDesktop } = useExperienceStageContext();
  const { scrollRef, progressRef, actIndex, goToAct } = useScrollTimeline(cinematicScript.length);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (stage !== 'room') {
      return;
    }

    containerRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        returnToDesktop();
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault();
        goToAct(actIndex + 1);
        return;
      }

      if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        goToAct(actIndex - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [actIndex, goToAct, returnToDesktop, stage]);

  if (stage !== 'room') {
    return null;
  }

  return (
    <div className="cinematic" ref={containerRef} tabIndex={-1} aria-label="Cinematique">
      <CinematicA11yArticle />

      <div className="cinematic-scroll" ref={scrollRef}>
        <div
          className="cinematic-scroll__spacer"
          style={{ height: `${cinematicScript.length * 100}vh` }}
        />
      </div>

      <div className="cinematic-stage" aria-hidden="true">
        {cinematicScript.map((act, index) => (
          <div
            className="cinematic-act"
            key={act.id}
            data-active={index === actIndex ? 'true' : 'false'}
          >
            {act.lines.map((line, lineIndex) => (
              <p
                className="cinematic-line"
                key={line.text}
                data-enter={line.enter}
                style={{ '--line-delay': `${lineIndex * 60}ms` } as CSSProperties}
              >
                <span>{line.text}</span>
              </p>
            ))}

            {act.kind === 'cta' ? (
              <div className="cinematic-cta">
                <a className="cinematic-cta__link" href="mailto:alexandre.teixeira1303@gmail.com">
                  Me contacter
                </a>
                <button className="cinematic-cta__back" type="button" onClick={returnToDesktop}>
                  Revenir au bureau
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <button className="cinematic-back" type="button" onClick={returnToDesktop}>
        Revenir au bureau
      </button>
    </div>
  );
}
```

- [ ] **Step 8: Partager la progression du scroll avec le rig**

Modifier `src/experience/stage/ExperienceStageContext.tsx` : ajouter au type et a la valeur

```ts
  roomProgressRef: RefObject<number>;
```

initialise par `const roomProgressRef = useRef(0);` et expose dans `value`.

Modifier `src/experience/cinematic/CinematicOverlay.tsx` : recuperer `roomProgressRef` du contexte et synchroniser dans un effet

```tsx
  const { stage, returnToDesktop, roomProgressRef } = useExperienceStageContext();

  useEffect(() => {
    if (stage !== 'room') {
      return;
    }

    let frame = 0;
    const sync = () => {
      roomProgressRef.current = progressRef.current;
      frame = requestAnimationFrame(sync);
    };

    frame = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frame);
  }, [progressRef, roomProgressRef, stage]);
```

Modifier `src/experience/room/CameraRig.tsx` : dans `useFrame`, remplacer le calcul de `sample` par une avancee sur l'axe Z pilotee par le scroll une fois en phase `room`.

```tsx
  const { transitionProgressRef, roomProgressRef, stage } = useExperienceStageContext();
```

puis, dans `useFrame` :

```tsx
    const eased = easeOutExpo(transitionProgressRef.current);
    const sample = sampleCameraPath(PULLBACK_PATH, eased);
    const roomDepth = stage === 'room' ? roomProgressRef.current * 32 : 0;

    camera.position.set(
      sample.position[0] + roomProgressRef.current * 2.2,
      sample.position[1],
      sample.position[2] + roomDepth,
    );
```

Le decalage lateral fait tourner l'angle du moniteur pendant la progression : a la fin, il n'est plus qu'une lueur derriere le visiteur.

- [ ] **Step 9: Ecrire les styles du motion design**

Creer `src/experience/cinematic/cinematic.css` :

```css
.cinematic {
  position: fixed;
  z-index: 3002;
  inset: 0;
  outline: none;
}

.cinematic-a11y {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.cinematic-scroll {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.cinematic-scroll__spacer {
  width: 1px;
}

.cinematic-stage {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 0 8vw;
  pointer-events: none;
}

.cinematic-act {
  position: absolute;
  display: grid;
  gap: 18px;
  max-width: 780px;
  opacity: 0;
  transition: opacity 520ms ease;
}

.cinematic-act[data-active="true"] {
  opacity: 1;
}

.cinematic-line {
  overflow: hidden;
  color: #f4f6fb;
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  font-size: clamp(22px, 3.4vw, 44px);
  font-weight: 300;
  line-height: 1.28;
}

.cinematic-line > span {
  display: inline-block;
  transition:
    transform 760ms cubic-bezier(0.16, 1, 0.3, 1) var(--line-delay, 0ms),
    filter 760ms cubic-bezier(0.16, 1, 0.3, 1) var(--line-delay, 0ms),
    letter-spacing 760ms cubic-bezier(0.16, 1, 0.3, 1) var(--line-delay, 0ms),
    opacity 620ms ease var(--line-delay, 0ms);
}

.cinematic-act[data-active="false"] .cinematic-line[data-enter="mask-up"] > span {
  opacity: 0;
  transform: translateY(110%);
}

.cinematic-act[data-active="false"] .cinematic-line[data-enter="blur-in"] > span {
  opacity: 0;
  filter: blur(8px);
}

.cinematic-act[data-active="false"] .cinematic-line[data-enter="track-in"] > span {
  opacity: 0;
  letter-spacing: 0.3em;
}

.cinematic-act[data-active="true"] .cinematic-line > span {
  opacity: 1;
  filter: blur(0);
  letter-spacing: 0.02em;
  transform: translateY(0);
}

.cinematic-cta {
  display: flex;
  gap: 14px;
  margin-top: 12px;
  pointer-events: auto;
}

.cinematic-cta__link,
.cinematic-cta__back,
.cinematic-back {
  padding: 11px 22px;
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: #f4f6fb;
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-decoration: none;
  text-transform: uppercase;
}

.cinematic-back {
  position: absolute;
  z-index: 1;
  top: 26px;
  left: 26px;
  opacity: 0.62;
}

.cinematic-back:hover {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .cinematic-line > span {
    filter: none;
    letter-spacing: 0.02em;
    transform: none;
    transition: opacity 260ms ease;
  }
}
```

- [ ] **Step 10: Rendre le focus au bouton portail au retour**

La spec impose que le focus revienne sur le bouton portail quand le visiteur
quitte la piece. Modifier `src/experience/portal/PortalButton.tsx` : ajouter une
ref sur le bouton et lui rendre le focus des qu'il redevient visible apres un
retour.

```tsx
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const hasLeftRoom = useRef(false);

  useEffect(() => {
    if (stage === 'room') {
      hasLeftRoom.current = true;
      return;
    }

    if (isVisible && hasLeftRoom.current) {
      hasLeftRoom.current = false;
      buttonRef.current?.focus();
    }
  }, [isVisible, stage]);
```

Ajouter `ref={buttonRef}` sur l'element `<button className="portal-button">`.

- [ ] **Step 11: Monter la couche dans App**

Modifier `src/App.tsx` : ajouter `import { CinematicOverlay } from './experience/cinematic/CinematicOverlay';` et inserer `<CinematicOverlay />` juste apres `<RoomLayer />`.

- [ ] **Step 12: Ecrire et lancer le test e2e**

Creer `tests/e2e/desktop-cinematic.spec.ts` :

```ts
import { expect, test } from '@playwright/test';

test('reveals the pitch and offers a way back', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Education' }).click();
  await page.getByRole('button', { name: 'Projects' }).click();
  await page.getByRole('button', { name: 'Sortir de l\'ecran' }).click();
  await expect(page.locator('.experience-root')).toHaveAttribute('data-stage', 'room', {
    timeout: 6000,
  });

  await expect(page.locator('.cinematic-act').first()).toHaveAttribute('data-active', 'true');
  await expect(page.locator('.cinematic-a11y')).toContainText('Je construis ce qui va autour.');

  await page.getByRole('button', { name: 'Revenir au bureau' }).first().click();
  await expect(page.locator('.experience-root')).toHaveAttribute('data-stage', 'desktop', {
    timeout: 6000,
  });
});

test('advances between acts with the keyboard', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Education' }).click();
  await page.getByRole('button', { name: 'Projects' }).click();
  await page.getByRole('button', { name: 'Sortir de l\'ecran' }).click();
  await expect(page.locator('.experience-root')).toHaveAttribute('data-stage', 'room', {
    timeout: 6000,
  });

  await page.keyboard.press('PageDown');
  await expect(page.locator('.cinematic-act').nth(1)).toHaveAttribute('data-active', 'true', {
    timeout: 4000,
  });
});
```

Run: `pnpm test:e2e --project=desktop-chromium`
Expected: PASS.

- [ ] **Step 13: Verifier lint, tests et build**

Run: `pnpm lint && pnpm test && pnpm build`
Expected: PASS.

- [ ] **Step 14: Commit**

```bash
git add src/experience src/App.tsx tests/e2e/desktop-cinematic.spec.ts
git commit -m "feat(cinematic): timeline scroll, motion design du texte et article accessible"
```

---

### Task 9: Variante mobile

**Files:**
- Create: `src/experience/room/PhoneDevice.tsx`
- Modify: `src/experience/room/RoomScene.tsx`
- Modify: `src/experience/cinematic/cinematic.css`
- Create: `tests/e2e/mobile-cinematic.spec.ts`

**Interfaces:**
- Consumes: `createScreenMaterial`, `ScreenGlow`.
- Produces: `PhoneDevice(props: { position: [number, number, number]; rotation: [number, number, number]; screenRef?: RefObject<Mesh | null> }): JSX.Element`

- [ ] **Step 1: Ecrire le test e2e mobile**

Creer `tests/e2e/mobile-cinematic.spec.ts` :

```ts
import { expect, test } from '@playwright/test';

test('fades straight into the room from the mobile home screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.mobile-shell')).toBeVisible();

  await page.getByRole('button', { name: 'Education' }).click();
  await page.locator('.mobile-home-button').click();
  await page.getByRole('button', { name: 'Projects' }).click();
  await page.locator('.mobile-home-button').click();

  const portal = page.getByRole('button', { name: 'Sortir de l\'ecran' });
  await expect(portal).toBeVisible();
  await portal.click();

  await expect(page.locator('.experience-root')).toHaveAttribute('data-stage', 'room', {
    timeout: 4000,
  });
  await expect(page.locator('.cinematic-act').first()).toHaveAttribute('data-active', 'true');
});
```

- [ ] **Step 2: Lancer le test et verifier l'echec**

Run: `pnpm test:e2e --project=mobile-chromium mobile-cinematic`
Expected: PASS. Le parcours mobile fonctionne deja depuis la tache 8 ; ce test verrouille la non-regression avant de changer la scene. La difference visuelle -- un moniteur cathodique la ou il faut un telephone -- se constate a l'oeil a l'etape 6 et n'est pas assertee ici.

- [ ] **Step 3: Implementer le telephone**

Creer `src/experience/room/PhoneDevice.tsx` :

```tsx
import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import type { RefObject } from 'react';
import type { Mesh } from 'three';
import { createScreenMaterial } from './ScreenMaterial';
import { ScreenGlow } from './ScreenGlow';

export function PhoneDevice({
  position,
  rotation,
  screenRef,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  screenRef?: RefObject<Mesh | null>;
}) {
  const material = useMemo(createScreenMaterial, []);

  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta;
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.78, 1.58, 0.09]} />
        <meshStandardMaterial color="#1b1d21" roughness={0.42} metalness={0.62} />
      </mesh>

      <mesh ref={screenRef} position={[0, 0, 0.047]} material={material} name="phone-screen">
        <planeGeometry args={[0.71, 1.5]} />
      </mesh>

      <ScreenGlow position={[0, 0, 0.2]} scale={2.1} />
    </group>
  );
}
```

- [ ] **Step 4: Brancher la variante dans la scene**

Modifier `src/experience/room/RoomScene.tsx` : ajouter `import type { RefObject } from 'react';`, importer `PhoneDevice`, puis remplacer les deux instanciations de `CrtMonitor` par un objet choisi selon `device`.

```tsx
  const isPhone = device === 'phone';
  const devicePosition: [number, number, number] = isPhone ? [-1.5, -0.35, 0] : [-3.1, 0, 0];
  const deviceRotation: [number, number, number] = isPhone ? [0, 0.48, 0.08] : [0, 0.62, 0];

  const renderDevice = (ref?: RefObject<Mesh | null>) =>
    isPhone ? (
      <PhoneDevice position={devicePosition} rotation={deviceRotation} screenRef={ref} />
    ) : (
      <CrtMonitor position={devicePosition} rotation={deviceRotation} screenRef={ref} />
    );
```

puis dans le JSX :

```tsx
      <Floor reflection={renderDevice()} />
      {renderDevice(screenRef)}
```

Ajuster egalement la position de depart de la camera quand `isPhone` est vrai : `position: isPhone ? [-1.5, -0.35, 3.6] : [-3.1, 0.08, 1.28]`.

- [ ] **Step 5: Adapter la typographie mobile**

Modifier `src/experience/cinematic/cinematic.css`, ajouter en fin de fichier :

```css
@media (max-width: 640px) {
  .cinematic-stage {
    padding: 0 24px;
    place-items: center start;
  }

  .cinematic-line {
    font-size: clamp(20px, 6.4vw, 30px);
  }

  .cinematic-cta {
    flex-direction: column;
  }

  .cinematic-back {
    top: calc(env(safe-area-inset-top, 0px) + 16px);
    left: 16px;
  }
}
```

- [ ] **Step 6: Verifier a l'oeil et en e2e**

Run: `pnpm test:e2e --project=mobile-chromium`
Expected: PASS, spec existante et nouvelle spec.

Puis `pnpm dev`, ouvrir en emulation iPhone.
Expected: pas de recul de camera, un fondu de 400 ms, et un telephone pose dans la piece a la place du moniteur.

- [ ] **Step 7: Commit**

```bash
git add src/experience tests/e2e/mobile-cinematic.spec.ts
git commit -m "feat(mobile): entree en fondu et telephone dans la piece"
```

---

### Task 10: Performance, liberation des ressources et verification finale

**Files:**
- Modify: `src/experience/room/RoomLayer.tsx`
- Modify: `src/experience/room/RoomScene.tsx`
- Create: `src/experience/room/useKeepAlive.ts`
- Create: `src/experience/room/useKeepAlive.test.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: `pickRoomRenderer`.
- Produces:
  - `KEEP_ALIVE_MS: number`
  - `shouldKeepCanvasMounted(input: { renderer: RoomRenderer; msSinceLeftRoom: number }): boolean`

- [ ] **Step 1: Ecrire le test de maintien du canvas**

Creer `src/experience/room/useKeepAlive.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { KEEP_ALIVE_MS, shouldKeepCanvasMounted } from './useKeepAlive';

describe('shouldKeepCanvasMounted', () => {
  it('keeps the canvas while the room is rendering', () => {
    expect(shouldKeepCanvasMounted({ renderer: 'webgl', msSinceLeftRoom: 99_000 })).toBe(true);
  });

  it('keeps the canvas warm right after leaving the room', () => {
    expect(shouldKeepCanvasMounted({ renderer: 'none', msSinceLeftRoom: 0 })).toBe(true);
    expect(shouldKeepCanvasMounted({ renderer: 'none', msSinceLeftRoom: KEEP_ALIVE_MS - 1 })).toBe(
      true,
    );
  });

  it('releases the canvas once the grace period elapsed', () => {
    expect(shouldKeepCanvasMounted({ renderer: 'none', msSinceLeftRoom: KEEP_ALIVE_MS })).toBe(
      false,
    );
  });

  it('keeps the fallback mounted while it renders', () => {
    expect(shouldKeepCanvasMounted({ renderer: 'fallback', msSinceLeftRoom: 99_000 })).toBe(true);
  });
});
```

- [ ] **Step 2: Lancer le test et verifier l'echec**

Run: `pnpm vitest run src/experience/room/useKeepAlive.test.ts`
Expected: FAIL, module introuvable.

- [ ] **Step 3: Implementer le maintien**

Creer `src/experience/room/useKeepAlive.ts` :

```ts
import { useEffect, useRef, useState } from 'react';
import type { RoomRenderer } from './roomRenderer';

export const KEEP_ALIVE_MS = 10_000;

export function shouldKeepCanvasMounted(input: {
  renderer: RoomRenderer;
  msSinceLeftRoom: number;
}): boolean {
  if (input.renderer !== 'none') {
    return true;
  }

  return input.msSinceLeftRoom < KEEP_ALIVE_MS;
}

export function useKeepAlive(renderer: RoomRenderer): boolean {
  const leftAtRef = useRef<number | null>(null);
  const [isMounted, setMounted] = useState(renderer !== 'none');

  useEffect(() => {
    if (renderer !== 'none') {
      leftAtRef.current = null;
      setMounted(true);
      return;
    }

    leftAtRef.current = Date.now();
    const timer = window.setTimeout(() => setMounted(false), KEEP_ALIVE_MS);
    return () => window.clearTimeout(timer);
  }, [renderer]);

  return isMounted;
}
```

- [ ] **Step 4: Verifier que les tests passent**

Run: `pnpm vitest run src/experience/room/useKeepAlive.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Brancher le maintien et masquer le canvas au repos**

Modifier `src/experience/room/RoomLayer.tsx` :

```tsx
  const renderer = pickRoomRenderer({ stage, hasWebgl });
  const isMounted = useKeepAlive(renderer);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="room-layer" data-renderer={renderer} data-idle={renderer === 'none'}>
      ...
    </div>
  );
```

Ajouter dans `src/experience/room/room.css` :

```css
.room-layer[data-idle="true"] {
  opacity: 0;
  pointer-events: none;
}
```

- [ ] **Step 6: Couper la boucle de rendu en arriere-plan**

Modifier `src/experience/room/RoomScene.tsx` : ajouter un composant interne qui suspend la boucle quand l'onglet passe en arriere-plan.

```tsx
import { Canvas, useThree } from '@react-three/fiber';

function VisibilityGuard() {
  const setFrameloop = useThree((state) => state.setFrameloop);

  useEffect(() => {
    const onVisibilityChange = () => {
      setFrameloop(document.hidden ? 'never' : 'always');
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [setFrameloop]);

  return null;
}
```

Monter `<VisibilityGuard />` dans le `Canvas`, et ajouter `useEffect` a l'import React.

- [ ] **Step 7: Mesurer les images par seconde**

Run: `pnpm dev`, ouvrir les outils de developpement, onglet Performance, enregistrer 5 s en phase `room` en scrollant.
Expected: 60 images par seconde en desktop. Puis relancer en emulation iPhone 13 avec ralentissement processeur x4.
Expected: au moins 30 images par seconde. Si le seuil n'est pas atteint sur mobile, abaisser le `dpr` telephone a `[1, 1.25]` et reduire `ScreenGlow` a `scale={1.6}`, puis remesurer.

- [ ] **Step 8: Documenter dans le README**

Modifier `README.md` : remplacer la section `## Prochaine etape` par

```markdown
## Experience de sortie de l'ecran

Apres deux fenetres ouvertes ou 40 secondes, un bouton portail apparait. Il fait
reculer la camera hors de l'ecran cathodique vers une piece vide ou se joue une
cinematique pilotee au scroll.

- Design : `docs/superpowers/specs/2026-09-06-sortie-ecran-cinematique-design.md`
- Plan : `docs/superpowers/plans/2026-09-06-sortie-ecran-cinematique.md`
- Le texte du pitch vit dans `src/experience/cinematic/cinematicScript.ts` et se
  reecrit sans toucher au rendu.
```

- [ ] **Step 9: Verification complete**

Run: `pnpm lint && pnpm test && pnpm build && pnpm test:e2e`
Expected: PASS sur les quatre commandes, les deux projets Playwright inclus.

- [ ] **Step 10: Commit**

```bash
git add src/experience README.md
git commit -m "perf(room): liberation du canvas, boucle suspendue en arriere-plan et documentation"
```

---

## Notes d'execution

**Contrainte connue et acceptee.** Pendant les phases `pullback`, `room` et `pushin`, `.experience-camera` porte une transformation : tout element `position: fixed` a l'interieur devient positionne par rapport a ce conteneur au lieu du viewport. C'est sans consequence ici parce que le bureau n'est pas interactif durant ces phases, et parce que `ProjectImmersive` monte son contenu via `createPortal` vers `document.body`, donc hors du conteneur transforme. En phase `desktop`, aucune transformation n'est appliquee et la mise en page reste strictement celle d'aujourd'hui.

**Ordre des taches.** Les taches 1 a 4 sont livrables et testables sans aucune dependance 3D : le parcours complet est deja observable en e2e avant que `three` ne soit installe. La tache 5 introduit les dependances. Les taches 6 a 9 habillent. La tache 10 mesure et nettoie.
