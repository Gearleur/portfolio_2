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
