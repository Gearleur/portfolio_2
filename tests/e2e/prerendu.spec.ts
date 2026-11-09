import { expect, test } from '@playwright/test';

// The Vitrine rendered at build time (journal n° 107): its copy shows before any script, in the
// visitor's layout, and the live page takes its place. Only a production build has it.
test('the home shows before its script, then the live page replaces the copy', async ({ browser, request }) => {
  const page0 = await (await request.get('/')).text();
  test.skip(!page0.includes('id="vitrine-statique"'), 'rendered at build time only (pnpm build)');

  const sansScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const p = await sansScript.newPage();
  await p.goto('/');
  await expect(p.locator('#vitrine-statique > [data-ecran="telephone"][data-langue="fr"] .m-title')).toBeVisible();
  await expect(p.locator('#vitrine-statique > [data-ecran="bureau"]').first()).toBeHidden();
  await sansScript.close();

  const vivant = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const q = await vivant.newPage();
  const erreurs: string[] = [];
  q.on('pageerror', (error) => erreurs.push(error.message));
  await q.goto('/');
  await expect(q.locator('#vitrine .vitrine')).toBeVisible();
  await expect(q.locator('#vitrine-statique')).toHaveCount(0);
  expect(erreurs).toEqual([]);
  await vivant.close();
});
