import { expect, test } from '@playwright/test';
import type { Browser, BrowserContextOptions, Page } from '@playwright/test';

// The Machine mode on the real Vitrine (journal n° 115, src/apps/portfolio/machine): on a desktop
// a switch comes at the bottom of the page once it is idle; thrown, the page gives way to a
// terminal that works, and comes back as it was left. Below 721 px the phone has its own
// (mode-machine-telephone.spec.ts), and neither fetches the other's.

const BUREAU: BrowserContextOptions = { viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 };

async function ouvrir(browser: Browser, adresse: string, options: BrowserContextOptions = {}) {
  const contexte = await browser.newContext({ ...BUREAU, locale: 'fr-FR', ...options });
  const page = await contexte.newPage();
  const erreurs: string[] = [];
  page.on('pageerror', (error) => erreurs.push(error.message));
  await page.goto(adresse);
  return { contexte, page, erreurs };
}

const interrupteur = (page: Page) => page.locator('.machine [role="switch"]');
const scene = (page: Page) => page.locator('.machine');

/** The passage has ended on the Machine side: the terminal is there and can be reached. */
async function attendreMachine(page: Page) {
  await expect(scene(page)).toHaveAttribute('data-terminal', '', { timeout: 15_000 });
  await expect(scene(page)).not.toHaveAttribute('data-passage', '', { timeout: 15_000 });
}

/** The passage has ended on the human side: the page shows and can be reached. */
async function attendreHumain(page: Page) {
  await expect(scene(page)).not.toHaveAttribute('data-couvert', '', { timeout: 15_000 });
  await expect(scene(page)).not.toHaveAttribute('data-passage', '', { timeout: 15_000 });
  await expect(page.locator('.specimen')).not.toHaveAttribute('data-machine', '');
}

test('the switch comes once the home is idle; thrown, a terminal answers; thrown back, the page is as it was left', async ({ browser }) => {
  const { contexte, page, erreurs } = await ouvrir(browser, '/');
  await expect(interrupteur(page)).toBeVisible({ timeout: 15_000 });
  await expect(interrupteur(page)).toHaveAttribute('aria-checked', 'false');
  // at the bottom in the middle, 16 px from the edge, over the page
  const boite = await interrupteur(page).boundingBox();
  expect(Math.round(boite!.x + boite!.width / 2)).toBe(720);
  expect(Math.round(900 - boite!.y - boite!.height)).toBe(16);
  // the terminal is not there before a gesture towards the switch
  await expect(page.locator('.machine .m4-terminal')).toHaveCount(0);

  const defil = await page.locator('.maquette').evaluate((el) => {
    el.scrollTo(0, 300);
    return el.scrollTop;
  });
  expect(defil).toBeGreaterThan(0);

  await interrupteur(page).click();
  await attendreMachine(page);
  await expect(interrupteur(page)).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('.machine .m5-champ')).toBeFocused();
  // under the black the page is hidden and out of reach, and its films have stopped
  await expect(page.locator('.maquette')).toBeHidden();
  expect(await page.locator('.maquette').evaluate((el: HTMLElement) => el.inert)).toBe(true);
  await expect.poll(() => page.locator('video').evaluateAll((films: HTMLVideoElement[]) => films.every((film) => film.paused))).toBe(true);

  // the terminal opens in the page's language, at the root, and answers a command
  const sortie = page.locator('.machine [role="log"]');
  await expect(sortie).toContainText('tel qu’une machine le lit');
  await expect(sortie).toContainText('README.md');
  await page.keyboard.type('help');
  await page.keyboard.press('Enter');
  await expect(sortie).toContainText('lister un dossier');
  // Escape empties the line and breaks nothing
  await page.keyboard.type('abc');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(page.locator('.machine .m5-champ')).toHaveValue('');
  await expect(scene(page)).toHaveAttribute('data-terminal', '');

  await interrupteur(page).click();
  await attendreHumain(page);
  await expect(interrupteur(page)).toHaveAttribute('aria-checked', 'false');
  await expect(interrupteur(page)).toBeFocused();
  await expect(page.locator('.maquette .m-title')).toBeVisible();
  expect(await page.locator('.maquette').evaluate((el: HTMLElement) => [el.scrollTop, el.inert])).toEqual([defil, false]);
  expect(erreurs).toEqual([]);
  await contexte.close();
});

test('from a project page the terminal opens on that project’s file, in the page’s language; the back button gives the human page back', async ({ browser }) => {
  const { contexte, page, erreurs } = await ouvrir(browser, '/', { locale: 'en-US' });
  await expect(interrupteur(page)).toBeVisible({ timeout: 15_000 });
  await page.evaluate(() => {
    window.location.hash = 'sncf-gpt';
  });
  await expect(page.locator('.maquette.projet')).toBeVisible({ timeout: 15_000 });
  const defil = await page.locator('.maquette.projet').evaluate((el) => {
    el.scrollTo(0, 900);
    return el.scrollTop;
  });

  await interrupteur(page).click();
  await attendreMachine(page);
  const sortie = page.locator('.machine [role="log"]');
  await expect(sortie).toContainText('$ cat 02-sncf-gpt.md');
  // the project pages only exist in French: the English file says so
  await expect(sortie).toContainText('Not translated yet');
  await expect(page.locator('.machine .m5-bas')).toContainText('~/en/projects');

  // back to the page, where it was left
  await interrupteur(page).click();
  await attendreHumain(page);
  expect(await page.locator('.maquette.projet').evaluate((el) => el.scrollTop)).toBe(defil);

  // on the Machine side again, the browser's back button changes the address: the human page is there at once
  await interrupteur(page).click();
  await attendreMachine(page);
  await page.goBack();
  await expect(page.locator('.maquette .m-title')).toBeVisible();
  await expect(scene(page)).toHaveAttribute('data-mode', 'humain');
  await attendreHumain(page);
  await expect(interrupteur(page)).toHaveAttribute('aria-checked', 'false');
  expect(erreurs).toEqual([]);
  await contexte.close();
});

test('with reduced motion and without WebGL 2 the mode still changes, at once, and the black side shows the number', async ({ browser }) => {
  const { contexte, page, erreurs } = await ouvrir(browser, 'about:blank', { reducedMotion: 'reduce' });
  await contexte.addInitScript(() => {
    const contexteDe = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...reste: unknown[]) {
      return type === 'webgl2' ? null : (contexteDe as (...a: unknown[]) => unknown).call(this, type, ...reste);
    } as typeof contexteDe;
  });
  await page.goto('/');
  await expect(interrupteur(page)).toBeVisible({ timeout: 15_000 });
  await interrupteur(page).click();
  await attendreMachine(page);
  await expect(scene(page)).toHaveAttribute('data-nu', '');
  // the number, drawn as a picture under the terminal, with ink on it
  const nombre = page.locator('.machine canvas.m4-secours');
  await expect(nombre).toBeVisible();
  const encre = await nombre.evaluate((toile: HTMLCanvasElement) => {
    const pixels = toile.getContext('2d')!.getImageData(0, 0, toile.width, toile.height).data;
    let n = 0;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 40) n += 1;
    return n;
  });
  expect(encre).toBeGreaterThan(1000);
  await expect(page.locator('.machine .m5-champ')).toBeFocused();

  await interrupteur(page).click();
  await attendreHumain(page);
  await expect(nombre).toHaveCount(0);
  await expect(page.locator('.maquette .m-title')).toBeVisible();
  expect(erreurs).toEqual([]);
  await contexte.close();
});

test('going under 721 px on the Machine side gives the human page back with the phone’s switch, and the desktop’s returns with the width', async ({ browser }) => {
  const { contexte, page, erreurs } = await ouvrir(browser, '/');
  await expect(interrupteur(page)).toBeVisible({ timeout: 15_000 });
  await interrupteur(page).click();
  await attendreMachine(page);

  // a narrower desktop window: still the Machine side
  await page.setViewportSize({ width: 1100, height: 700 });
  await expect(scene(page)).toHaveAttribute('data-terminal', '');
  await expect(page.locator('.machine .m5-champ')).toBeFocused();

  await page.setViewportSize({ width: 700, height: 900 });
  await expect(scene(page)).toHaveCount(0);
  await expect(page.locator('.mobile .m-title')).toBeVisible();
  await expect(page.locator('.specimen')).not.toHaveAttribute('data-machine', '');
  expect(await page.locator('.specimen > *').evaluateAll((enfants: HTMLElement[]) => enfants.some((enfant) => enfant.inert))).toBe(false);
  // the phone's own switch comes there, in the notch, on the human side
  await expect(page.locator('.m6-scene [role="switch"]')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.m6-scene [role="switch"]')).toHaveAttribute('aria-checked', 'false');

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('.m6-scene')).toHaveCount(0);
  await expect(page.locator('.specimen')).not.toHaveAttribute('data-m6-encoche', '');
  await expect(interrupteur(page)).toBeVisible();
  await expect(interrupteur(page)).toHaveAttribute('aria-checked', 'false');
  await expect(page.locator('.maquette .m-title')).toBeVisible();
  expect(erreurs).toEqual([]);
  await contexte.close();
});

// What is the desktop's own (its stage, its passage) and what is the phone's (its stage, the bench's
// phone pieces): the files as the dev server names them, and the chunks a build names after them.
const DU_BUREAU = /machine\/ModeMachine|portfolio\/machine\/Passage|machine\/machine\.css|\/ModeMachine-/;
// (a build gathers the phone's pieces of the bench in the chunks machine-tel…, vite.config.ts)
const DU_TELEPHONE = /machine\/Telephone|\/Telephone-|atelier-machine\/m6\/|\/machine-tel/;

// The project's own screen: a phone, 390 px wide.
test('a phone fetches the phone’s Machine mode and nothing of the desktop’s', async ({ page }) => {
  const demandes: string[] = [];
  page.on('request', (request) => demandes.push(request.url()));
  await page.goto('/');
  const tel = page.locator('.m6-scene [role="switch"]');
  await expect(tel).toBeVisible({ timeout: 15_000 });
  await tel.tap();
  await expect(page.locator('.m6-scene')).toHaveAttribute('data-terminal', '', { timeout: 15_000 });
  await expect(page.locator('.machine')).toHaveCount(0);
  expect(demandes.some((url) => DU_TELEPHONE.test(url))).toBe(true);
  expect(demandes.filter((url) => DU_BUREAU.test(url))).toEqual([]);
});

test('a desktop fetches the desktop’s Machine mode and nothing of the phone’s', async ({ browser }) => {
  const contexte = await browser.newContext({ ...BUREAU, locale: 'fr-FR' });
  const page = await contexte.newPage();
  const demandes: string[] = [];
  page.on('request', (request) => demandes.push(request.url()));
  await page.goto('/');
  await expect(interrupteur(page)).toBeVisible({ timeout: 15_000 });
  await interrupteur(page).click();
  await attendreMachine(page);
  await expect(page.locator('.m6-scene')).toHaveCount(0);
  expect(demandes.some((url) => DU_BUREAU.test(url))).toBe(true);
  expect(demandes.filter((url) => DU_TELEPHONE.test(url))).toEqual([]);
  await contexte.close();
});
