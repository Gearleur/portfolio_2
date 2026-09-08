import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const PORTAL_NAME = 'Sortir de l\'écran';

/*
 * Meme sequence que desktop-cinematic.spec.ts : entre dans la piece par le
 * portail, puis en ressort par le bouton de retour du recit. C'est ce retour
 * qui bascule `renderer` sur `'none'` et fait entrer `.room-layer` dans le
 * delai de grace de `useKeepAlive` (`data-idle="true"`) que ces deux tests
 * verifient -- le canvas WebGL reste monte, cache, pendant dix secondes.
 */
async function leaveRoomOnceEntered(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Education' }).click();
  await page.getByRole('button', { name: 'Projects' }).click();

  await expect(page.locator('.yc-projects')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.yc-projects')).toBeHidden();

  await page.getByRole('button', { name: PORTAL_NAME }).click();
  await expect(page.locator('.experience-root')).toHaveAttribute('data-stage', 'room', {
    timeout: 6000,
  });

  await page.locator('.cinematic-back').click();
  await expect(page.locator('.experience-root')).toHaveAttribute('data-stage', 'desktop', {
    timeout: 6000,
  });

  await expect(page.locator('.room-layer[data-idle="true"]')).toBeVisible();
}

type RoomRigProbe = { __cameraRigProbe?: { frame: number } };

/*
 * Preuve mecanique que la boucle de rendu s'arrete reellement pendant le
 * delai de grace, pas seulement que le canvas est masque par le CSS. Le
 * compteur d'images que `CameraRig` republie a chaque frame (developpement
 * uniquement) est le seul signal fiable ici : la matrice de vue et
 * `roomProgress` restent constants pendant l'immobilite du bureau meme si la
 * boucle continue de tourner (rien n'anime alors dans la piece), donc les
 * comparer ne prouverait rien. Sans la composition de `resolveFrameloop`, la
 * boucle continuerait a ~60 images par seconde et le compteur avancerait.
 */
test('freezes the render loop while the canvas is kept warm but idle', async ({ page }) => {
  await leaveRoomOnceEntered(page);

  const readFrame = () =>
    page.evaluate(() => (window as unknown as RoomRigProbe).__cameraRigProbe?.frame ?? null);

  const first = await readFrame();
  expect(first).not.toBeNull();

  await page.waitForTimeout(1000);
  const second = await readFrame();

  expect(second).toBe(first);
});

/*
 * Preuve mecanique que le bureau redevient utilisable pendant ce meme delai :
 * `@react-three/fiber` pose `pointer-events: auto` en style inline sur le
 * conteneur du canvas, qu'aucune regle heritee ne peut battre -- si le
 * correctif `!important` de room.css disparait, le canvas idle continue
 * d'intercepter les clics et `elementFromPoint` renvoie le CANVAS plutot que
 * le bouton, exactement le symptome qui a fait echouer
 * desktop-cinematic.spec.ts:70 avant sa correction.
 */
test('lets clicks pass through the idle canvas to the desktop underneath', async ({ page }) => {
  await leaveRoomOnceEntered(page);

  const portal = page.getByRole('button', { name: PORTAL_NAME });
  const box = await portal.boundingBox();
  if (!box) {
    throw new Error('the portal button has no bounding box');
  }

  const hit = await page.evaluate(
    ({ x, y, name }) => {
      const button = Array.from(document.querySelectorAll('button')).find((candidate) =>
        candidate.textContent?.includes(name),
      );
      const topElement = document.elementFromPoint(x, y);
      return {
        tag: topElement?.tagName ?? null,
        isPortalOrInside: Boolean(
          button && topElement && (topElement === button || button.contains(topElement)),
        ),
      };
    },
    { x: box.x + box.width / 2, y: box.y + box.height / 2, name: PORTAL_NAME },
  );

  expect(hit.tag).not.toBe('CANVAS');
  expect(hit.isPortalOrInside).toBe(true);
});

/*
 * Le bureau doit redevenir une page ordinaire des le retour, pas dix secondes
 * plus tard quand le canvas se demonte. `CameraRig` ecrit `transform`,
 * `width`, `height` et `opacity` en styles en ligne sur `.experience-camera`
 * et `.experience-screen` a chaque image : un style en ligne bat la feuille de
 * style quelle que soit la specificite, la derniere `matrix3d` survivait donc
 * a la phase et laissait le bureau en parallelogramme, a moitie hors cadre et
 * hors d'atteinte du curseur, pendant tout le delai de grace de
 * `useKeepAlive`. La mesure est prise dans cette fenetre exactement --
 * `leaveRoomOnceEntered` vient de verifier que `data-idle="true"` est encore
 * la.
 */
test('gives the desktop back its own geometry while the canvas is kept warm', async ({ page }) => {
  await leaveRoomOnceEntered(page);

  const icon = page.locator('.education-file');
  const box = await icon.boundingBox();
  if (!box) {
    throw new Error('the Education icon has no bounding box');
  }

  const measured = await page.evaluate(
    ({ x, y }) => {
      const screen = document.querySelector('.experience-screen');
      const iconElement = document.querySelector('.education-file');
      if (!screen || !iconElement) {
        return null;
      }

      const rect = screen.getBoundingClientRect();
      const topElement = document.elementFromPoint(x, y);

      return {
        transform: getComputedStyle(screen).transform,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        hitsIcon: Boolean(
          topElement && (topElement === iconElement || iconElement.contains(topElement)),
        ),
        hit: topElement ? `${topElement.tagName}.${topElement.className}` : null,
      };
    },
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
  );

  if (!measured) {
    throw new Error('the desktop plane or the Education icon is missing');
  }

  expect(measured.transform).toBe('none');
  expect(Math.abs(measured.left)).toBeLessThan(1);
  expect(Math.abs(measured.top)).toBeLessThan(1);
  expect(measured.width).toBe(measured.viewportWidth);
  expect(measured.height).toBeGreaterThanOrEqual(measured.viewportHeight);
  expect(measured.hitsIcon, `elementFromPoint returned ${measured.hit}`).toBe(true);

  // La mesure devait bien tomber dans le delai de grace : sans ca, le test se
  // contenterait de verifier le nettoyage de demontage, qui n'a jamais ete en
  // cause.
  await expect(page.locator('.room-layer[data-idle="true"]')).toBeVisible();
});
