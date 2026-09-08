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

/*
 * Le portail est le seul chemin d'entree dans la piece, et ce test le prend
 * comme les quatre autres specs de bureau. Il passait avant par un evenement
 * `experience:enter-room` ecoute en permanence sur `window` : une porte
 * derobee de test laissee en production, que n'importe quel script de la page
 * pouvait pousser pour projeter le visiteur dans la piece.
 */
test('resolves a pullback into the room stage', async ({ page }) => {
  await page.goto('/');

  const root = page.locator('.experience-root');
  await expect(root).toHaveAttribute('data-stage', 'desktop');

  await page.getByRole('button', { name: 'Education' }).click();
  await page.getByRole('button', { name: 'Projects' }).click();
  await expect(page.locator('.yc-projects')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.yc-projects')).toBeHidden();

  await page.getByRole('button', { name: 'Sortir de l\'écran' }).click();
  await expect(root).toHaveAttribute('data-stage', 'pullback');
  await expect(root).toHaveAttribute('data-stage', 'room', { timeout: 6000 });
});
