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
