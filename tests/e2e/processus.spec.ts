import { expect, test } from '@playwright/test';

// « Comment je dessine un produit avec l'IA » (journal n° 109). Its first version jumped while it was
// read: its pictures had no size, so the page grew by half as they loaded, and a film scrolled in it.
// Now every picture declares its size, nothing moves in the page, and a figure opens large.
test('the method article keeps its place while its pictures load', async ({ page }) => {
  const erreurs: string[] = [];
  page.on('pageerror', (error) => erreurs.push(error.message));
  await page.goto('/#processus-design');

  const article = page.locator('.p-contenu');
  await expect(article.locator('h1')).toContainText('Comment je dessine');
  await expect(article.locator('video')).toHaveCount(0);
  const sansTaille = await article
    .locator('img')
    .evaluateAll((images) => images.filter((image) => !image.getAttribute('width') || !image.getAttribute('height')).length);
  expect(sansTaille).toBe(0);

  // as tall before its pictures have loaded as after
  const page_ = page.locator('.projet');
  await page.evaluate(() => document.fonts.ready);
  const avant = await page_.evaluate((el) => el.scrollHeight);
  await page_.evaluate(async (el) => {
    for (let y = 0; y < el.scrollHeight; y += el.clientHeight) {
      el.scrollTop = y;
      await new Promise((suite) => setTimeout(suite, 120));
    }
    await Promise.all([...el.querySelectorAll('img')].map((image) => image.decode().catch(() => {})));
  });
  const apres = await page_.evaluate((el) => el.scrollHeight);
  expect(Math.abs(apres - avant)).toBeLessThan(4);
  expect(erreurs).toEqual([]);
});

test('a plate of the method article opens large, and closes', async ({ page }) => {
  await page.goto('/#processus-design');
  const planche = page.locator('.p-visuel__image:has(> .p-planche)').first();
  await planche.scrollIntoViewIfNeeded();
  await planche.click();
  const ouverte = page.locator('dialog.p-zoom[open]');
  await expect(ouverte.locator('.p-planche img').first()).toBeVisible();
  // the hint to open a figure belongs to the page's caption, not to the opened one
  const indice = await ouverte.locator('figcaption').evaluate((legende) => getComputedStyle(legende, '::after').content);
  expect(indice).toBe('none');
  await ouverte.locator('.p-zoom__fermer').click();
  await expect(page.locator('dialog.p-zoom[open]')).toHaveCount(0);
});

// Its card on the home: the embossed sheet, printed under two lights that fade into each other.
test('the method card is the embossed sheet under its two lights', async ({ page }) => {
  await page.goto('/');
  const carte = page.locator('.m-visuals .gaufrage');
  await carte.scrollIntoViewIfNeeded();
  await expect(carte.locator('img')).toHaveCount(2);
  await expect
    .poll(() => carte.locator('img').evaluateAll((images: HTMLImageElement[]) => images.every((image) => image.complete && image.naturalWidth > 0)))
    .toBe(true);
  // the second print fades in over the first: the light has begun to turn
  const jour = () => carte.locator('.gaufrage__jour').evaluate((image) => Number(getComputedStyle(image).opacity));
  await expect.poll(jour, { timeout: 15_000 }).toBeGreaterThan(0);
  expect(await jour()).toBeLessThan(1);
});
