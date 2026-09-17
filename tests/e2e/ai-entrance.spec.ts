import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });

test('opens the AI scene and restores the desktop and keyboard focus', async ({ page }) => {
  await page.goto('/');
  const launch = page.getByRole('button', { name: 'Parlons de l’IA' });
  await expect(launch).toBeVisible();
  await page.screenshot({ path: '/tmp/ai-desktop.png' });
  await launch.click();
  const title = page.getByRole('heading', { name: 'Parlons de l’IA.' });
  await expect(title).toBeFocused();
  await page.mouse.move(100, 300);
  await expect(page.locator('.ai-ascii__fragment').first()).toBeAttached();
  await expect(page.locator('.ai-ascii')).toHaveCSS('pointer-events', 'none');
  await expect(page.locator('.ai-origin')).toHaveAttribute('inert', '');
  await expect(page.locator('.ai-page')).toHaveCSS('background-color', 'rgb(255, 248, 241)');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/ai-scene.png' });
  await page.keyboard.press('Escape');
  await expect(launch).toBeFocused();
  await expect(page.locator('.ai-ascii')).toHaveCount(0);
  await launch.click();
  await expect(title).toBeFocused();
  await page.getByRole('button', { name: 'Retour au bureau' }).click();
  await expect(launch).toBeFocused();
});

test('can return while the entrance is still moving', async ({ page }) => {
  await page.goto('/');
  const launch = page.getByRole('button', { name: 'Parlons de l’IA' });
  await launch.click();
  await page.waitForTimeout(250);
  await page.keyboard.press('Escape');
  await expect(launch).toBeFocused();
  await expect(page.locator('.ai-origin')).toHaveCSS('transform', 'none');
  await expect(page.locator('.ai-origin')).toHaveCSS('scale', 'none');
});

test('supports reduced motion without a long transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Parlons de l’IA' }).click();
  await expect(page.getByRole('heading', { name: 'Parlons de l’IA.' })).toBeFocused({ timeout: 1000 });
  await page.getByRole('button', { name: 'Retour au bureau' }).click();
  await expect(page.getByRole('button', { name: 'Parlons de l’IA' })).toBeFocused({ timeout: 1000 });
});
