import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const PORTAL_NAME = 'Sortir de l\'écran';

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

  // Attendre l'ouverture avant d'envoyer Escape : sinon la touche part dans le
  // vide et la sequence depend de l'ordre de montage du plein ecran.
  await expect(page.locator('.yc-projects')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.yc-projects')).toBeHidden();

  const portal = page.getByRole('button', { name: PORTAL_NAME });
  await expect(portal).toBeVisible();
  return portal;
}

type GluedSample = {
  stage: string | null;
  transform: string;
  scanlineAnimation: string;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
};

test('pulls back into the room while the rig drives the desktop', async ({ page }) => {
  const portal = await revealPortal(page);
  const root = page.locator('.experience-root');

  await portal.click();
  await expect(root).toHaveAttribute('data-stage', 'pullback');

  /*
   * Preuve mecanique que le rig pilote bien le DOM : la dalle porte une matrice
   * 3D et ne couvre plus le cadre. Tout est lu dans le meme predicat, phase
   * comprise, pour qu'un changement de rythme ne puisse pas rendre le test
   * dependant du moment ou la mesure revient.
   */
  const handle = await page.waitForFunction(
    () => {
      const screen = document.querySelector('.experience-screen');
      const wallpaper = document.querySelector('.wallpaper-layer');
      if (!screen || !wallpaper) {
        return null;
      }

      const transform = getComputedStyle(screen).transform;
      const box = screen.getBoundingClientRect();
      if (
        !transform.startsWith('matrix3d(') ||
        box.width >= window.innerWidth ||
        box.height >= window.innerHeight
      ) {
        return null;
      }

      return {
        stage: document.querySelector('.experience-root')?.getAttribute('data-stage') ?? null,
        transform,
        scanlineAnimation: getComputedStyle(wallpaper, '::before').animationName,
        width: box.width,
        height: box.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      };
    },
    undefined,
    { timeout: 4000 },
  );

  const glued: GluedSample | null = await handle.jsonValue();
  if (!glued) {
    throw new Error('the rig never reported a transformed screen');
  }

  expect(glued.stage).toBe('pullback');
  expect(glued.transform).toMatch(/^matrix3d\(/);
  expect(glued.width).toBeLessThan(glued.viewportWidth);
  expect(glued.height).toBeLessThan(glued.viewportHeight);
  // Premier temps de la specification 9.1 : les scanlines encaissent la commande.
  expect(glued.scanlineAnimation).toBe('scanline-surge');

  await expect(root).toHaveAttribute('data-stage', 'room', { timeout: 6000 });
  await expect(page.locator('.room-canvas')).toBeVisible();
});

/*
 * Specification 9.2 : l'alignement entre le bureau DOM et la dalle est exact, pas
 * approxime. Le rig publie en developpement les matrices que la chaine CSS vient
 * de consommer ; on reprojette les quatre coins a la main, comme le ferait WebGL,
 * et on compare au rectangle que le navigateur a reellement peint. Les deux
 * cotes sont independants : l'un est le moteur CSS, l'autre de l'arithmetique.
 */
type RigProbe = {
  view: number[];
  object: number[];
  fovDeg: number;
  width: number;
  height: number;
};

test('keeps the DOM desktop on the projected screen mesh', async ({ page }) => {
  const portal = await revealPortal(page);
  await portal.click();

  await page.waitForFunction(() =>
    Boolean((window as unknown as { __cameraRigProbe?: unknown }).__cameraRigProbe),
  );

  const deltas: number[] = [];
  for (let sample = 0; sample < 4; sample += 1) {
    deltas.push(
      await page.evaluate(() => {
        const probe = (window as unknown as { __cameraRigProbe?: RigProbe }).__cameraRigProbe;
        const screen = document.querySelector('.experience-screen');
        if (!probe || !screen) {
          return Number.POSITIVE_INFINITY;
        }

        const apply = (m: number[], v: number[]) => [
          m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
          m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
          m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
          m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3],
        ];

        // Distance focale en pixels, la meme que la perspective CSS.
        const focal = probe.height / 2 / Math.tan(((probe.fovDeg * Math.PI) / 180) / 2);
        const xs: number[] = [];
        const ys: number[] = [];

        for (const localX of [-probe.width / 2, probe.width / 2]) {
          for (const localY of [-probe.height / 2, probe.height / 2]) {
            const world = apply(probe.object, [localX, localY, 0, 1]);
            const view = apply(probe.view, world);
            const depth = -view[2];
            xs.push(probe.width / 2 + (view[0] * focal) / depth);
            ys.push(probe.height / 2 - (view[1] * focal) / depth);
          }
        }

        const box = screen.getBoundingClientRect();
        return Math.max(
          Math.abs(Math.min(...xs) - box.left),
          Math.abs(Math.min(...ys) - box.top),
          Math.abs(Math.max(...xs) - box.right),
          Math.abs(Math.max(...ys) - box.bottom),
        );
      }),
    );

    await page.waitForTimeout(150);
  }

  expect(deltas).toHaveLength(4);
  for (const delta of deltas) {
    expect(delta).toBeLessThan(1);
  }
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
