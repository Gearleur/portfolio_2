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

test('remains usable while the Projects screen is open', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Projects' }).click();
  await expect(page.locator('.yc-projects')).toBeVisible();

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
