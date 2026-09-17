import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });

test('shows the PDF on arrival, closes to its icon and reopens in either language', async ({ page }) => {
  await page.goto('/');
  const resume = page.getByRole('dialog', { name: 'Curriculum Vitae' });
  await expect(resume).toHaveAttribute('data-window-phase', 'open');
  await expect(resume.getByRole('img', { name: 'CV — Français, page 1' })).toBeVisible();
  await resume.getByLabel('Langue du CV').selectOption('en');
  await expect(resume.getByRole('img', { name: 'CV — English, page 1' })).toBeVisible();
  await expect(resume.locator('a[download]')).toHaveAttribute('href', '/CV_en.pdf');
  await expect(resume.getByRole('link', { name: 'Voir la page du CV' })).toHaveAttribute('href', '/cv/en/');
  await page.screenshot({ path: '/tmp/portfolio-desktop-cv.png' });
  await resume.getByRole('button', { name: 'Fermer la fenetre' }).click();
  await expect(resume).toHaveAttribute('data-window-phase', 'closing');
  await expect(resume).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Download CV' })).toBeFocused();
  await page.getByRole('button', { name: 'Download CV' }).click();
  await expect(resume).toHaveAttribute('data-window-phase', 'opening');
  await expect(resume).toHaveAttribute('data-window-phase', 'open');
});

test('all desktop windows open and minimize back to their own icons', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('dialog', { name: 'Curriculum Vitae' }).getByRole('button', { name: 'Fermer la fenetre' }).click();
  await expect(page.locator('.retro-window')).toHaveCount(0);
  for (const name of ['Education', 'Professional Experience', 'Technical Skills', 'Languages', 'Extracurricular Experience']) {
    const icon = page.getByRole('button', { name, exact: true });
    await icon.click();
    const dialog = page.getByRole('dialog', { name, exact: true });
    await expect(dialog).toHaveAttribute('data-window-phase', 'opening');
    await expect(dialog).toHaveAttribute('data-window-phase', 'open');
    await dialog.getByRole('button', { name: 'Reduire la fenetre' }).click();
    await expect(dialog).toHaveAttribute('data-window-phase', 'closing');
    await expect(dialog).toHaveCount(0);
    await expect(icon).toBeFocused();
  }
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await expect(page.locator('.yc-projects')).toHaveAttribute('data-window-phase', 'open');
  await page.keyboard.press('Escape');
  await expect(page.locator('.yc-projects')).toHaveAttribute('data-window-phase', 'closing');
  await expect(page.locator('.yc-projects')).toHaveCount(0);
});

test('keeps the small flat AI button clear of windows on a shorter desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 640 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const launch = page.getByRole('button', { name: 'Parlons de l’IA' });
  const box = await launch.boundingBox();
  expect(box!.width).toBeLessThan(150);
  expect(box!.y + box!.height).toBeLessThanOrEqual(34);
  expect(box!.x).toBeGreaterThan(800);
  await expect(launch).toHaveCSS('box-shadow', 'none');
  await expect(page.getByRole('dialog', { name: 'Curriculum Vitae' })).toBeInViewport({ ratio: 1 });
  await page.getByRole('button', { name: 'Fermer la fenetre' }).click();
  await expect(page.locator('.retro-window')).toHaveCount(0);
  await launch.click();
  await expect(page.getByRole('heading', { name: 'Parlons de l’IA.' })).toBeVisible();
  await expect(page.locator('.ai-finale, .ai-launch-film, .document-globe')).toHaveCount(0);
});

test('Machine displays and copies the updated CV', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: 'Machine', exact: true }).click();
  await expect(page.locator('.machine-resume')).toContainText('SNCF GPT');
  await expect(page.locator('.machine-resume')).toContainText('Psychology of Learning');
  await expect(page.locator('.machine-resume')).not.toContainText('TensorFlow');
  await page.getByRole('button', { name: 'Copy the complete CV as Markdown' }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('SNCF GPT');
  expect(copied).toContain('Psychology of Learning');
  expect(copied).not.toContain('TensorFlow');
});
