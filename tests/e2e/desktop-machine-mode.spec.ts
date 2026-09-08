import { expect, test } from '@playwright/test';

const PORTAL_NAME = 'Sortir de l\'écran';

/*
 * Ruling R27. Le mode machine est le rendu simple et analysable du CV, et les
 * sections 3 et 16 de la specification mettent toute modification de ce mode
 * hors perimetre. Les trois calques de l'experience s'y rendaient pourtant
 * sans condition : le portail apparaissait au-dessus du CV ATS -- au bout de
 * 40 s sans aucun geste du visiteur -- et son clic tirait ce CV dans la
 * cinematique 3D.
 *
 * Le declencheur est satisfait en mode humain (deux fenetres distinctes) puis
 * on bascule : la machine d'etat vit au-dessus du mode et ne perd pas son
 * compte, `data-portal-ready` reste donc a `true` de l'autre cote. C'est bien
 * le rendu qui est coupe, pas le declencheur qui n'a jamais tire.
 */
test('keeps the experience layers out of machine mode', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Education' }).click();
  await page.getByRole('button', { name: 'Projects' }).click();
  await expect(page.locator('.yc-projects')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.yc-projects')).toBeHidden();

  const portal = page.getByRole('button', { name: PORTAL_NAME });
  await expect(portal).toBeVisible();
  await expect(page.locator('.cinematic')).toHaveCount(1);

  await page.getByRole('button', { name: 'Machine' }).click();
  await expect(page.locator('.machine-resume')).toBeVisible();
  await expect(page.locator('.experience-root')).toHaveAttribute('data-portal-ready', 'true');

  await expect(portal).toHaveCount(0);
  await expect(page.locator('.cinematic')).toHaveCount(0);
  await expect(page.locator('.room-layer')).toHaveCount(0);

  // La coupure n'est pas definitive : le retour en mode humain rend le
  // portail, sans repasser par les deux fenetres.
  await page.getByRole('button', { name: 'Human' }).click();
  await expect(portal).toBeVisible();
});
