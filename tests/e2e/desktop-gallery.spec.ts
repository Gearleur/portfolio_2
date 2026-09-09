import { expect, test } from '@playwright/test';

test('keeps rendering after reveal and restores the desktop after a deep scroll', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Education', exact: true }).click();
  await page.getByRole('button', { name: 'Languages', exact: true }).click();
  const root = page.locator('.experience-root');
  const portal = page.getByRole('button', { name: "Sortir de l'écran" });
  await portal.click();
  await expect(root).toHaveAttribute('data-stage', 'room', { timeout: 6000 });

  const frame = await page.evaluate(() =>
    (window as unknown as { __cameraRigProbe?: { frame: number } }).__cameraRigProbe?.frame ?? 0,
  );
  // Stage changes alone cannot prove the canvas survived asynchronous loading.
  await page.waitForFunction((previous) => {
    const probe = (window as unknown as { __cameraRigProbe?: { frame: number } }).__cameraRigProbe;
    return probe && probe.frame > previous + 5;
  }, frame);

  await page.locator('.cinematic-scroll').evaluate((element) => {
    element.scrollTop = element.scrollHeight - element.clientHeight;
  });
  await page.waitForFunction(() => {
    const probe = (window as unknown as { __cameraRigProbe?: { roomProgress: number } }).__cameraRigProbe;
    return probe && probe.roomProgress > 0.95;
  });
  await page.locator('.cinematic-back').click();
  await expect(root).toHaveAttribute('data-stage', 'desktop', { timeout: 6000 });
  await expect(portal).toBeFocused();
  for (const selector of ['.experience-camera', '.experience-screen']) {
    await expect(page.locator(selector)).toHaveCSS('transform', 'none');
  }
  const rect = await page.locator('.experience-screen').boundingBox();
  expect(rect?.x).toBeCloseTo(0, 0);
  expect(rect?.y).toBeCloseTo(0, 0);
  expect(rect?.width).toBe(page.viewportSize()?.width);
  await page.getByRole('button', { name: 'Education', exact: true }).click();
  await expect(page.locator('.education-resume')).toBeVisible();
});
