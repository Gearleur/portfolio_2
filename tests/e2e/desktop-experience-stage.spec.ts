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
