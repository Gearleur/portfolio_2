import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const PORTAL_NAME = 'Sortir de l\'écran';

/*
 * Meme sequence que les autres specs de bureau : l'icone Projects ouvre un
 * plein ecran qui recouvre le portail, on le referme avec Escape sans que ca
 * ne retire les deux fenetres ouvertes qui rendent le portail visible.
 */
async function enterRoom(page: Page) {
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
}

test('reveals the pitch and offers a way back', async ({ page }) => {
  await enterRoom(page);

  await expect(page.locator('.cinematic-act').first()).toHaveAttribute('data-active', 'true');
  await expect(page.locator('.cinematic-a11y')).toContainText('Je construis ce qui va autour.');

  // Deux boutons partagent le nom accessible "Revenir au bureau" -- celui du
  // dernier acte (a opacity: 0 tant qu'il n'est pas actif) et celui-ci, en
  // haut a gauche, toujours visible. On cible la classe pour ne pas dependre
  // de l'ordre du DOM.
  await page.locator('.cinematic-back').click();
  await expect(page.locator('.experience-root')).toHaveAttribute('data-stage', 'desktop', {
    timeout: 6000,
  });
});

test('advances between acts with the keyboard', async ({ page }) => {
  await enterRoom(page);

  await page.keyboard.press('PageDown');
  await expect(page.locator('.cinematic-act').nth(1)).toHaveAttribute('data-active', 'true', {
    timeout: 4000,
  });
});
