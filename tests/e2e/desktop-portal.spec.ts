import { expect, test } from '@playwright/test';

test('reveals the portal after two windows and enters the room', async ({ page }) => {
  await page.goto('/');

  const portal = page.getByRole('button', { name: 'Sortir de l\'écran' });
  await expect(portal).toBeHidden();

  await page.getByRole('button', { name: 'Education' }).click();
  await page.getByRole('button', { name: 'Projects' }).click();
  await expect(portal).toBeVisible();

  // The Projects icon opens a fullscreen takeover (not a windowed panel like
  // Education); close it so it stops intercepting clicks on the portal,
  // which sits underneath it. Escape lands on the dialog, which auto-focuses
  // itself on mount. Closing does not undo the "two windows opened" state
  // that made the portal visible.
  await page.keyboard.press('Escape');
  await expect(page.locator('.yc-projects')).toBeHidden();

  await portal.click();
  await expect(page.locator('.experience-root')).toHaveAttribute('data-stage', 'room', {
    timeout: 6000,
  });
  await expect(portal).toBeHidden();
});

/*
 * Le bouton portail et le curseur Human/Machine sont tous les deux fixes en
 * bas au centre, et ils ne peuvent pas s'arbitrer par le z-index : le curseur
 * est porte vers `document.body`, le portail reste sous `.experience-root` et
 * son `isolation: isolate`, qui plafonne tout ce qu'il contient. Le curseur
 * mordait donc de 16 px sur le bas du bouton. Aucun test ne le voyait parce
 * que Playwright clique au centre d'un element : c'est le bord bas qu'il faut
 * interroger.
 */
test('keeps the portal button clear of the mode toggle', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Education' }).click();
  await page.getByRole('button', { name: 'Projects' }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.yc-projects')).toBeHidden();

  const portal = page.getByRole('button', { name: 'Sortir de l\'écran' });
  await expect(portal).toBeVisible();

  const portalBox = await portal.boundingBox();
  const toggleBox = await page.locator('.portfolio-mode-toggle').boundingBox();
  if (!portalBox || !toggleBox) {
    throw new Error('the portal button or the mode toggle has no bounding box');
  }

  // Les deux boites ne se recouvrent pas du tout.
  expect(portalBox.y + portalBox.height).toBeLessThanOrEqual(toggleBox.y);

  const hit = await page.evaluate(
    ({ x, y }) => {
      const button = document.querySelector('.portal-button');
      const topElement = document.elementFromPoint(x, y);

      return {
        isPortalOrInside: Boolean(
          button && topElement && (topElement === button || button.contains(topElement)),
        ),
        hit: topElement ? `${topElement.tagName}.${topElement.className}` : null,
      };
    },
    { x: portalBox.x + portalBox.width / 2, y: portalBox.y + portalBox.height - 1 },
  );

  expect(hit.isPortalOrInside, `elementFromPoint returned ${hit.hit}`).toBe(true);
});
