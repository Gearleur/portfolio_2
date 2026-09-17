import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';

for (const [status, message] of [[429, 'Too many requests'], [503, 'Profile export temporarily unavailable']] as const) {
  test(`explains export rejection ${status} while keeping the page readable`, async ({ page }) => {
    await page.route('**/agent/context.txt', (route) => route.fulfill({ status, body: 'Unavailable' }));
    await page.goto('/agent/');
    await page.getByRole('button', { name: 'Copy prompt and complete profile' }).click();
    await expect(page.getByRole('status')).toContainText(message);
    await expect(page.getByRole('button', { name: 'Copy prompt and complete profile' })).toBeEnabled();
    await expect(page.locator('main')).toContainText('SNCF GPT');
    await expect(page.getByRole('textbox', { name: 'Text to copy manually' })).toBeHidden();
  });
}

test('serves the complete profile and formats to a client without JavaScript', async ({ browser, request, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/agent');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('# ALEXANDRE TEIXEIRA');
  await expect(page.getByRole('heading', { name: '## PROFESSIONAL_EXPERIENCE[]' })).toBeVisible();
  await expect(page.locator('main')).toContainText('SNCF GPT');
  await expect(page.locator('main')).toContainText('Psychology of Learning');
  await expect(page.locator('.machine-project[open]')).toHaveCount(3);
  await expect(page.locator('.machine-project__details').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy prompt and complete profile' })).toBeHidden();
  await expect(page.locator('a[href="/agent/context.txt"]')).toBeVisible();
  const raw = await request.get('/agent/');
  expect(raw.headers()['content-type']).toContain('text/html');
  expect(await raw.text()).toContain('SNCF GPT');
  expect(await raw.text()).not.toContain('/src/main.tsx');
  const markdown = await request.get('/agent/profile.md');
  expect(markdown.headers()['content-type']).toContain('text/markdown');
  expect(await markdown.text()).toContain('SNCF GPT');
  const json = await request.get('/agent/profile.json');
  expect(json.headers()['content-type']).toContain('application/json');
  const data = await json.json();
  expect(data.name).toBe('Alexandre Teixeira');
  expect(data.experience).toHaveLength(3);
  expect(data.provenance.sources).toEqual(['/CV_en.pdf', '/CV_fr.pdf']);
  await context.close();
});

test('copies the visible prompt before the complete profile', async ({ page, context, request }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/agent/?source=portfolio');
  await page.getByText('Read the introduction prompt').click();
  await expect(page.locator('.agent-prompt__text')).toBeVisible();
  await page.getByRole('button', { name: 'Copy prompt and complete profile' }).click();
  await expect(page.getByRole('status')).toContainText('complete profile copied');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(await (await request.get('/agent/context.txt')).text());
  expect(copied.indexOf('Use the following profile')).toBeLessThan(copied.indexOf('# ALEXANDRE TEIXEIRA'));
  expect(copied).toContain('SNCF GPT');
  expect(copied).toContain('LANGUAGES_AND_LEADERSHIP');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '/tmp/portfolio-agent-mobile.png', fullPage: true });
});

test('offers manual copy when clipboard permission is denied', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) } });
  });
  await page.goto('/agent/');
  await page.getByRole('button', { name: 'Copy prompt and complete profile' }).click();
  const text = page.getByRole('textbox', { name: 'Text to copy manually' });
  await expect(text).toBeVisible();
  await expect(text).toBeFocused();
  await expect(text).toHaveValue(/SNCF GPT/);
});

test('exposes discovery links and returns to the human portfolio', async ({ page, request }) => {
  const homepage = await request.get('/');
  expect(await homepage.text()).toContain('href="/agent/"');
  expect(await homepage.text()).toContain('href="/llms.txt"');
  expect(await (await request.get('/llms.txt')).text()).toContain('/agent/profile.md');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/agent');
  await page.screenshot({ path: '/tmp/portfolio-agent-desktop.png' });
  await page.getByRole('link', { name: 'Return to the human interface' }).click();
  await expect(page.getByRole('dialog', { name: 'Curriculum Vitae' })).toBeVisible();
  await page.getByRole('button', { name: 'Machine', exact: true }).click();
  await page.getByRole('link', { name: 'FOR AI AGENTS' }).click();
  await expect(page).toHaveURL(/\/agent\/$/);
});

test('copies working commands for the complete text and the JSON endpoint', async ({ page, context, request }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/agent/');
  const origin = new URL(page.url()).origin;
  for (const [name, path, selector] of [
    ['Copy text command', '/agent/context.txt', '#context-command'],
    ['Copy JSON command', '/agent/profile.json', '#json-command'],
  ]) {
    const command = `curl -fsSL '${origin}${path}'`;
    await expect(page.locator(selector)).toHaveText(command);
    await page.getByRole('button', { name }).click();
    await expect(page.getByRole('status')).toContainText('Command copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(command);
    // Run the displayed curl arguments without invoking a shell.
    const output = execFileSync('curl', ['-fsSL', `${origin}${path}`], { encoding: 'utf8' });
    expect(output).toBe(await (await request.get(path)).text());
    expect(output).toContain('SNCF GPT');
  }
});

test('shares Machine typography, colors and layout on desktop and mobile', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/agent/');
    await page.evaluate(() => document.fonts.ready);
    const styles = () => page.evaluate(() => {
      const selectors = ['.machine-resume', '.machine-resume__document', '.machine-resume h1', '.machine-json', '.machine-entry h3', '.machine-section h2'];
      return selectors.map((selector) => {
        const style = getComputedStyle(document.querySelector(selector)!);
        return [style.fontFamily, style.fontSize, style.lineHeight, style.color, style.backgroundColor, style.width, style.padding];
      });
    });
    const agentStyles = await styles();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goto('/');
    if (width > 640) {
      await page.getByRole('button', { name: 'Machine', exact: true }).click();
    } else {
      await page.getByRole('slider').focus();
      await page.keyboard.press('End');
    }
    await expect(page.locator('.machine-resume')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await styles()).toEqual(agentStyles);
  }
});
