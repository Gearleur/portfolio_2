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

// The phone strip (journal n° 70): each word's accent copy lies exactly over it, and lets « Menu » be clicked.
test('the phone strip keeps its accent copies on the words, and Menu opens', async ({ page }) => {
  await page.goto('/');
  for (const mot of await page.locator('.m-strip > *').all()) {
    const boite = await mot.boundingBox();
    const copie = await mot.locator('.m-accent').boundingBox();
    expect(copie).toEqual(boite);
  }
  await page.locator('.m-strip > button').click();
  await expect(page.locator('.m-menu[data-open]')).toBeVisible();
});
