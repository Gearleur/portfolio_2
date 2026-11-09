import { expect, test } from '@playwright/test';

// The Vitrine's filmed thumbnails (journal n° 105 and 106): the page opens without an error, each card
// has its poster, its video and the canvas its frames are copied onto, and Synthèse de réunions draws its live voices over its film.
test('the home thumbnails show their films and the meeting voices', async ({ page }) => {
  const erreurs: string[] = [];
  page.on('pageerror', (error) => erreurs.push(error.message));
  await page.goto('/');

  const reunions = page.locator('.reunions');
  await reunions.scrollIntoViewIfNeeded();
  for (const film of await page.locator('.film').all()) {
    await expect(film.locator('img.film__affiche')).toHaveCount(1);
    await expect(film.locator('video.film__video')).toHaveCount(1);
    await expect(film.locator('canvas.film__image')).toHaveCount(1);
  }

  // the voices' canvas covers the glass and has ink on it
  await expect
    .poll(() =>
      reunions.locator('canvas.reunions__voix').evaluate((canvas: HTMLCanvasElement) => {
        const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
        let ink = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i] > 40) ink += 1;
        return ink;
      }),
    )
    .toBeGreaterThan(1000);
  expect(erreurs).toEqual([]);
});

// The phone's notch (journal n° 107): at the top of the home and of an article, « Menu » opens a menu
// that holds the nav and the contact, with no table of contents.
test('the phone notch is at the top, and Menu opens the nav only', async ({ page }) => {
  await page.goto('/');
  const notch = page.locator('.m-strip');
  const boite = await notch.boundingBox();
  expect(boite && boite.y < 30 && boite.width < 340).toBe(true);
  await page.locator('.m-strip > button').click();
  await expect(page.locator('.m-menu[data-open]')).toBeVisible();
  await expect(page.locator('.m-menu .p-sommaire')).toHaveCount(0);
});

test('an article has the notch too, with the back link and no table of contents', async ({ page }) => {
  await page.goto('/#synthese-reunions');
  await expect(page.locator('.m-strip .p-notch__retour')).toBeVisible();
  await page.locator('.m-strip > button', { hasText: 'Menu' }).click();
  await expect(page.locator('.m-menu[data-open]')).toBeVisible();
  await expect(page.locator('.m-menu .p-sommaire')).toHaveCount(0);
});
