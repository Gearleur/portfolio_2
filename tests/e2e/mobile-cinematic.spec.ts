import { expect, test } from '@playwright/test';

test('fades straight into the room from the mobile home screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.mobile-shell')).toBeVisible();

  await page.getByRole('button', { name: 'Education' }).click();
  await page.locator('.mobile-home-button').click();

  // Projects s'ouvre dans un dialogue plein ecran monte via un portail React,
  // qui recouvre le bouton d'accueil de MobileShell : contrairement a
  // Education, on en sort par Echap, comme desktop-cinematic.spec.ts le fait
  // pour le meme dialogue.
  await page.getByRole('button', { name: 'Projects' }).click();
  await expect(page.locator('.yc-projects')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.yc-projects')).toBeHidden();

  const portal = page.getByRole('button', { name: 'Sortir de l\'écran' });
  await expect(portal).toBeVisible();
  await portal.click();

  await expect(page.locator('.experience-root')).toHaveAttribute('data-stage', 'room', {
    timeout: 4000,
  });
  await expect(page.locator('.cinematic-act').first()).toHaveAttribute('data-active', 'true');
});
