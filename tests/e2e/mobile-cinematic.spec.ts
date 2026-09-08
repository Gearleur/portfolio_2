import { expect, test } from '@playwright/test';
import { PHONE_POSITION } from '../../src/experience/room/phonePlacement';

// La sonde d'alignement de `CameraRig`, publiee en developpement seulement.
// Elle n'est ecrite que lorsqu'un maillage de dalle existe vraiment dans la
// scene : sa presence prouve deja qu'un appareil a monte sa geometrie.
type RigProbe = { __cameraRigProbe?: { screenCenter: [number, number, number] } };

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

  /*
   * La phase et l'acte actif sont pilotes par la machine d'etat, sans rien
   * demander a WebGL : un `PhoneDevice` qui ne monterait pas laisserait les
   * deux assertions ci-dessus entierement vertes. On descend donc jusqu'a la
   * scene reelle -- le calque annonce bien le rendu WebGL et le telephone, le
   * canvas est la, et le centre monde de la dalle que le rig a trouvee est
   * celui du telephone (le moniteur cathodique est a x = -3.1, deux unites
   * plus loin).
   */
  await expect(page.locator('.room-layer[data-renderer="webgl"][data-device="phone"]')).toBeVisible();
  await expect(page.locator('.room-canvas')).toBeVisible();

  const handle = await page.waitForFunction(
    () => (window as unknown as RigProbe).__cameraRigProbe?.screenCenter ?? null,
    undefined,
    { timeout: 8000 },
  );

  const screenCenter = await handle.jsonValue();
  expect(screenCenter[0]).toBeGreaterThan(PHONE_POSITION[0] - 0.25);
  expect(screenCenter[0]).toBeLessThan(PHONE_POSITION[0] + 0.25);
});
