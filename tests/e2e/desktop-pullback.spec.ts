import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const PORTAL_NAME = 'Sortir de l\'ecran';

/*
 * Le portail n'apparait qu'apres deux fenetres ouvertes, mais l'icone Projects
 * ouvre un plein ecran qui recouvre le bouton et intercepterait le clic. On le
 * referme avec Escape : la machine d'etat ne retire jamais une fenetre de sa
 * liste, donc le portail reste visible.
 */
async function revealPortal(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Education' }).click();
  await page.getByRole('button', { name: 'Projects' }).click();

  await page.keyboard.press('Escape');
  await expect(page.locator('.yc-projects')).toBeHidden();

  const portal = page.getByRole('button', { name: PORTAL_NAME });
  await expect(portal).toBeVisible();
  return portal;
}

test('pulls back into the room while the rig drives the desktop', async ({ page }) => {
  const portal = await revealPortal(page);
  const root = page.locator('.experience-root');

  await portal.click();
  await expect(root).toHaveAttribute('data-stage', 'pullback');

  // Preuve mecanique que le rig pilote bien le DOM : la dalle porte une matrice
  // 3D et ne couvre plus le cadre. L'alignement au pixel avec le maillage reste
  // une verification humaine.
  await page.waitForFunction(
    () => {
      const screen = document.querySelector('.experience-screen');
      if (!screen) {
        return false;
      }

      const box = screen.getBoundingClientRect();
      return (
        getComputedStyle(screen).transform.startsWith('matrix3d(') &&
        box.width < window.innerWidth &&
        box.height < window.innerHeight
      );
    },
    undefined,
    { timeout: 4000 },
  );

  const glued = await page.evaluate(() => {
    const screen = document.querySelector('.experience-screen');
    const box = screen?.getBoundingClientRect();

    return {
      stage: document.querySelector('.experience-root')?.getAttribute('data-stage') ?? null,
      transform: screen ? getComputedStyle(screen).transform : 'none',
      width: box?.width ?? 0,
      height: box?.height ?? 0,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });

  expect(glued.stage).toBe('pullback');
  expect(glued.transform).toMatch(/^matrix3d\(/);
  expect(glued.width).toBeLessThan(glued.viewportWidth);
  expect(glued.height).toBeLessThan(glued.viewportHeight);

  await expect(root).toHaveAttribute('data-stage', 'room', { timeout: 6000 });
  await expect(page.locator('.room-canvas')).toBeVisible();
});

test('skips the pullback on escape', async ({ page }) => {
  const portal = await revealPortal(page);
  const root = page.locator('.experience-root');

  await portal.click();
  await expect(root).toHaveAttribute('data-stage', 'pullback');

  await page.keyboard.press('Escape');
  await expect(root).toHaveAttribute('data-stage', 'room');
});

/*
 * Spec section 14 : sans WebGL, `RoomFallback` doit jouer la meme cinematique.
 * Le bureau DOM ne peut plus se coller a rien, il doit donc s'effacer au lieu de
 * recouvrir la piece de repli.
 */
test('clears the desktop off the fallback room when WebGL is refused', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    const blocked = new Set(['webgl', 'webgl2', 'experimental-webgl']);

    HTMLCanvasElement.prototype.getContext = function patched(
      this: HTMLCanvasElement,
      ...args: Parameters<HTMLCanvasElement['getContext']>
    ) {
      return blocked.has(args[0]) ? null : original.apply(this, args);
    } as HTMLCanvasElement['getContext'];
  });

  const portal = await revealPortal(page);
  await portal.click();

  await expect(page.locator('.room-layer[data-renderer="fallback"]')).toBeVisible();
  await expect(page.locator('.room-fallback')).toBeVisible();
  await expect(page.locator('.experience-screen')).toHaveCSS('opacity', '0');
});
