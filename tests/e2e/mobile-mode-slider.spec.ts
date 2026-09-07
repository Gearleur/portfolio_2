import { expect, test } from '@playwright/test';

async function dragModeSlider(page: import('@playwright/test').Page, direction: 'left' | 'right') {
  const slider = page.getByRole('slider');
  const box = await slider.boundingBox();
  if (!box) {
    throw new Error('Mode slider is not visible');
  }

  const startX = direction === 'right' ? box.x + 24 : box.x + box.width - 24;
  const endX = direction === 'right' ? box.x + box.width - 24 : box.x + 24;
  const y = box.y + box.height / 2;

  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(endX, y, { steps: 18 });
  await page.mouse.up();
}

test('reuses the Human slider without lag and shows classic controls in Machine mode', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.mobile-shell')).toBeVisible();

  for (let cycle = 0; cycle < 3; cycle += 1) {
    await dragModeSlider(page, 'right');
    await expect(page.locator('.machine-resume')).toBeVisible();
    await expect(page.getByRole('slider')).toBeHidden();

    await page.getByRole('button', { name: 'Human' }).click();
    await expect(page.locator('.mobile-shell')).toBeVisible();
    await expect(page.getByRole('slider')).toBeVisible();
  }
});

/*
 * Le rideau de `.yc-projects` glisse pendant 620 ms (`useCurtainExit`) avant
 * de couvrir tout l'ecran. Glisser des l'ouverture "visible" (avant la fin
 * de cette transition) ne prouve rien de fiable : le bouton reste
 * atteignable tant que le rideau n'est pas encore arrive, meme si un bug
 * d'empilement le cache une fois l'ouverture reellement terminee -- c'est
 * exactement ce qui masquait le bug reel de `PortfolioModeToggle` (tache 10,
 * round 3) derriere un test qui passait par chance a la vitesse habituelle
 * des tests. On attend donc `transform: none` (classe `is-open` etablie)
 * avant de glisser.
 */
test('remains usable while the Projects screen is open', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Projects' }).click();
  await expect(page.locator('.yc-projects')).toBeVisible();

  await page.waitForFunction(() => {
    const projects = document.querySelector('.yc-projects');
    return Boolean(projects) && getComputedStyle(projects).transform === 'none';
  });

  await dragModeSlider(page, 'right');
  await expect(page.locator('.machine-resume')).toBeVisible();
});

test('closes nested project dialogs one level at a time with Escape', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Projects' }).click();
  await page.getByRole('button', { name: /Open project/ }).first().click();
  await expect(page.locator('.yc-immersive')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('.yc-immersive')).toBeHidden();
  await expect(page.locator('.yc-projects')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('.yc-projects')).toBeHidden();
  await expect(page.locator('.mobile-shell')).toBeVisible();
});
