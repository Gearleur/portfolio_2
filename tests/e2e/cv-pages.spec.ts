import { expect, test } from '@playwright/test';

for (const language of ['fr', 'en']) {
  test(`dedicated ${language} CV renders its PDF and returns to the interface`, async ({ page, request }) => {
    await page.goto(`/cv/${language}/`);
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.getByRole('img', { name: `CV — ${language === 'fr' ? 'Français' : 'English'}, page 1` })).toBeVisible();
    await expect(page.locator('a[download]')).toHaveAttribute('href', `/CV_${language}.pdf`);
    const pdf = await request.get(`/CV_${language}.pdf`);
    expect(pdf.headers()['content-type']).toContain('application/pdf');
    expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/portfolio-cv-${language}.png`, fullPage: true });
    await page.locator('.cv-interface-link').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.cv-page-header')).toHaveCount(0);
  });
}

test('CV language navigation and PDF links work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/cv/fr/');
  await expect(page.getByRole('link', { name: 'Ouvrir le CV français au format PDF' })).toBeVisible();
  await page.getByRole('link', { name: 'English', exact: true }).click();
  await expect(page).toHaveURL(/\/cv\/en\/$/);
  await expect(page.getByRole('link', { name: 'Open the English CV as a PDF' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View the interface' })).toHaveAttribute('href', '/');
  await context.close();
});

test('production browser policy permits PDF rendering, profile copy and the desktop', async ({ page, context }) => {
  test.skip(process.env.PORTFOLIO_E2E_PREVIEW !== '1', 'Production headers are enabled on the preview server.');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.addInitScript(() => {
    const violations: string[] = [];
    Object.assign(window, { policyViolations: violations });
    document.addEventListener('securitypolicyviolation', (event) => violations.push(`${event.violatedDirective}: ${event.blockedURI}`));
  });
  for (const path of ['/cv/fr/', '/cv/en/', '/agent/', '/']) {
    const response = await page.goto(path);
    expect(response!.headers()['content-security-policy']).toContain("script-src 'self'");
    expect(response!.headers()['x-content-type-options']).toBe('nosniff');
    if (path.startsWith('/cv/')) await expect(page.locator('canvas')).toBeVisible();
    if (path === '/agent/') {
      await page.getByRole('button', { name: 'Copy prompt and complete profile' }).click();
      await expect(page.getByRole('status')).toContainText('complete profile copied');
    }
    expect(await page.evaluate(() => Reflect.get(window, 'policyViolations'))).toEqual([]);
  }
});
