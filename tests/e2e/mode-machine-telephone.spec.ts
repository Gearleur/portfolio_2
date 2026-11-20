import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

// The Machine mode on the real Vitrine, on a phone (src/apps/portfolio/machine/Telephone.tsx, what
// was retained at step M6): below 721 px the switch comes in the notch of glass once the page is
// idle; a touch throws it, and the terminal works under a finger; thrown back, the page is as it
// was left. The project's own screen is a phone, 390 px wide, with touch.

test.use({ locale: 'fr-FR' });

const scene = (page: Page) => page.locator('.m6-scene');
const interrupteur = (page: Page) => page.locator('.m6-scene [role="switch"]');
const etat = (page: Page) => page.locator('.m6-scene .m6-etat');
const champ = (page: Page) => page.locator('.m6-scene .m5-champ');
/** A row of the listing that answers: the last one printed. */
const rang = (page: Page, nom: string) => page.locator('.m6-scene [data-liste="vive"]', { hasText: nom });

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

/** The screen one has entered or gone back to has slid in and stands still (a touch on a line that still moves is not what is tested). */
const pose = (page: Page) => expect.poll(() => page.locator('.m6-scene .m5-defile').evaluate((el) => el.getAnimations().length)).toBe(0);

/** The notch's pieces from left to right and the pill, px: [left, right, middle line]. */
const encoche = (page: Page) =>
  page.evaluate(() => {
    const boite = (el: Element) => {
      const r = el.getBoundingClientRect();
      return [r.left, r.right, (r.top + r.bottom) / 2];
    };
    const pieces = [...document.querySelectorAll('.mobile .m-strip > *')].filter((el) => el.getBoundingClientRect().width > 0).map(boite);
    return { avant: pieces[0], apres: pieces[pieces.length - 1], pilule: boite(document.querySelector('.m6-scene .m3-pilule')!) };
  });

/** The pill stands in the notch, between its first piece and its last, on their line. */
async function dansEncoche(page: Page) {
  await expect
    .poll(async () => {
      const { avant, apres, pilule } = await encoche(page);
      return pilule[0] - avant[1] >= 8 && apres[0] - pilule[1] >= 8 && Math.abs(pilule[2] - avant[2]) <= 2;
    })
    .toBe(true);
}

/** A finger that slides from (x, y) by (dx, dy). */
async function glisser(page: Page, x: number, y: number, dx: number, dy: number) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let i = 1; i <= 8; i += 1) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (dx * i) / 8, y: y + (dy * i) / 8 }] });
    await page.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

test('on a phone the switch comes in the notch once the home is idle; touched, a terminal answers under the finger; touched again, the page is as it was left', async ({ page }) => {
  const erreurs: string[] = [];
  page.on('pageerror', (error) => erreurs.push(error.message));
  await page.goto('/');
  await expect(interrupteur(page)).toBeVisible({ timeout: 15_000 });
  await expect(interrupteur(page)).toHaveAttribute('aria-checked', 'false');
  // in the notch, between the name and « Menu »: a pill of 59 × 28 px
  await dansEncoche(page);
  const pilule = await interrupteur(page).boundingBox();
  expect(Math.round(pilule!.width)).toBe(59);
  expect(Math.round(pilule!.height)).toBe(28);
  // nothing of the desktop's stage
  await expect(page.locator('.machine')).toHaveCount(0);

  const defil = await page.locator('.mobile').evaluate((el) => {
    el.scrollTo(0, 400);
    return el.scrollTop;
  });
  expect(defil).toBeGreaterThan(0);

  await interrupteur(page).tap();
  await attendreMachine(page);
  await expect(interrupteur(page)).toHaveAttribute('aria-checked', 'true');
  // the keyboard never comes out by itself: the line does not take the keys
  await expect(champ(page)).not.toBeFocused();
  // under the black the page is hidden and out of reach, and its films have stopped
  await expect(page.locator('.mobile')).toBeHidden();
  expect(await page.locator('.mobile').evaluate((el: HTMLElement) => el.inert)).toBe(true);
  await expect.poll(() => page.locator('video').evaluateAll((films: HTMLVideoElement[]) => films.every((film) => film.paused))).toBe(true);

  // the terminal opens in the page's language, at the root; its rows are a finger high
  const sortie = page.locator('.m6-scene [role="log"]');
  await expect(sortie).toContainText('README.md');
  await expect(rang(page, 'fr/')).toBeVisible();
  const ligne = await rang(page, 'fr/').boundingBox();
  expect(Math.round(ligne!.height)).toBe(48);
  // a row answers across the screen, and for itself: touched far from its name, fr/ opens
  await page.touchscreen.tap(ligne!.x + ligne!.width - 60, ligne!.y + ligne!.height / 2);
  await expect(etat(page)).toContainText('~/fr');
  await expect(rang(page, 'a-propos.md')).toBeVisible();
  await pose(page);
  // the first row is not taken by the last one's touch area
  await rang(page, 'a-propos.md').tap();
  await expect(etat(page)).toContainText('~/fr/a-propos.md');
  await expect(sortie).toContainText('$ cat a-propos.md');
  await expect(champ(page)).not.toBeFocused();

  // the last line stands clear of the text that scrolls above it
  const [zone, bas] = [await page.locator('.m6-scene .m5-defile').boundingBox(), await etat(page).boundingBox()];
  expect(bas!.y - (zone!.y + zone!.height)).toBeGreaterThanOrEqual(7.5);
  // the end of the file is the end of the scroll: the folder's menu at the bottom, nothing under it
  const fin = await page.locator('.m6-scene .m5-defile').evaluate((el) => {
    el.scrollTop = 99_999;
    return { defil: el.scrollTop, limite: el.scrollHeight - el.clientHeight, sous: el.querySelector('.m5-neuf')!.getBoundingClientRect().height };
  });
  expect(fin.defil).toBeGreaterThan(0);
  expect(fin.defil).toBe(fin.limite);
  expect(fin.sous).toBe(0);
  await expect(etat(page)).toContainText('100 %');

  // a swipe to the right goes back to the folder
  await glisser(page, 120, 420, 190, 6);
  await expect(etat(page)).not.toContainText('a-propos.md');
  await expect(etat(page)).toContainText('~/fr');

  // the folder has slid in and stands still, its command at the top of the screen
  await pose(page);
  expect(await page.locator('.m6-scene .m5-defile').evaluate((el) => el.scrollTop - [...el.querySelectorAll<HTMLElement>('[data-debut]')].pop()!.offsetTop)).toBe(0);

  // the line touched takes the keys; a touch elsewhere gives them back
  await page.locator('.m6-scene .m5-invite').tap();
  await expect(champ(page)).toBeFocused();
  await page.keyboard.type('help');
  await page.keyboard.press('Enter');
  await expect(sortie).toContainText('lister un dossier');
  await page.locator('.m6-scene .m5-fil').tap({ position: { x: 300, y: 20 } });
  await expect(champ(page)).not.toBeFocused();

  await interrupteur(page).tap();
  await attendreHumain(page);
  await expect(interrupteur(page)).toHaveAttribute('aria-checked', 'false');
  await expect(page.locator('.mobile .m-title')).toBeVisible();
  expect(await page.locator('.mobile').evaluate((el: HTMLElement) => [el.scrollTop, el.inert])).toEqual([defil, false]);
  await dansEncoche(page);
  expect(erreurs).toEqual([]);
});

test('on a phone, from a project page the terminal opens on that project’s file, in the page’s language; the back button and another # give the human page back', async ({ browser }) => {
  const contexte = await browser.newContext({ locale: 'en-US' });
  const page = await contexte.newPage();
  const erreurs: string[] = [];
  page.on('pageerror', (error) => erreurs.push(error.message));
  await page.goto('/');
  await expect(interrupteur(page)).toBeVisible({ timeout: 15_000 });
  await page.evaluate(() => {
    window.location.hash = 'sncf-gpt';
  });
  await expect(page.locator('.mobile.projet')).toBeVisible({ timeout: 15_000 });
  // the notch holds « ‹ Projects » and « Menu » there: the pill is between them
  await dansEncoche(page);
  const defil = await page.locator('.mobile.projet').evaluate((el) => {
    el.scrollTo(0, 700);
    return el.scrollTop;
  });

  await interrupteur(page).tap();
  await attendreMachine(page);
  const sortie = page.locator('.m6-scene [role="log"]');
  await expect(sortie).toContainText('$ cat 02-sncf-gpt.md');
  // the project pages only exist in French: the English file says so
  await expect(sortie).toContainText('Not translated yet');
  await expect(etat(page)).toContainText('~/en/projects/02-sncf-gpt.md');

  // back to the page, where it was left
  await interrupteur(page).tap();
  await attendreHumain(page);
  expect(await page.locator('.mobile.projet').evaluate((el) => el.scrollTop)).toBe(defil);

  // on the Machine side again, the browser's back button changes the address: the human page is there at once
  await interrupteur(page).tap();
  await attendreMachine(page);
  await page.goBack();
  await expect(page.locator('.mobile .m-title')).toBeVisible();
  await expect(scene(page)).toHaveAttribute('data-mode', 'humain');
  await attendreHumain(page);
  await expect(interrupteur(page)).toHaveAttribute('aria-checked', 'false');
  expect(await page.locator('.specimen > *').evaluateAll((enfants: HTMLElement[]) => enfants.some((enfant) => enfant.inert))).toBe(false);
  await dansEncoche(page);

  // and so does an address that changes by hand under the terminal
  await interrupteur(page).tap();
  await attendreMachine(page);
  await page.evaluate(() => {
    window.location.hash = 'ailleurs';
  });
  await expect(scene(page)).toHaveAttribute('data-mode', 'humain');
  await attendreHumain(page);
  await expect(page.locator('.mobile .m-title')).toBeVisible();
  expect(await page.locator('.mobile').evaluate((el: HTMLElement) => el.inert)).toBe(false);
  expect(erreurs).toEqual([]);
  await contexte.close();
});

test('on a phone, when the keyboard comes out the terminal keeps to what it leaves in view', async ({ page }) => {
  await page.goto('/');
  await expect(interrupteur(page)).toBeVisible({ timeout: 15_000 });
  await interrupteur(page).tap();
  await attendreMachine(page);
  await page.locator('.m6-scene .m5-invite').tap();
  await expect(champ(page)).toBeFocused();
  // no keyboard in this browser: the visual viewport is made to say what a phone's says
  const visible = 380;
  await page.evaluate((hauteur) => {
    const vue = window.visualViewport!;
    Object.defineProperty(vue, 'height', { get: () => hauteur, configurable: true });
    vue.dispatchEvent(new Event('resize'));
  }, visible);
  await expect(scene(page)).toHaveAttribute('data-clavier', '');
  await expect
    .poll(() =>
      page.evaluate(() => {
        const bas = (selecteur: string) => Math.round(document.querySelector(selecteur)!.getBoundingClientRect().bottom);
        return [bas('.m6-scene .m4-couche[data-cote="machine"]'), bas('.m6-scene .m1-terminal'), bas('.m6-scene .m6-etat'), bas('.m6-scene .m5-invite')];
      }),
    )
    .toEqual([visible, visible, expect.any(Number), expect.any(Number)]);
  const [, , ligneEtat, invite] = await page.evaluate(() => {
    const bas = (selecteur: string) => Math.round(document.querySelector(selecteur)!.getBoundingClientRect().bottom);
    return [0, 0, bas('.m6-scene .m6-etat'), bas('.m6-scene .m5-invite')];
  });
  expect(ligneEtat).toBeLessThanOrEqual(visible);
  expect(invite).toBeLessThanOrEqual(ligneEtat);

  // thrown back with the keyboard out: the line gives the keys back
  await interrupteur(page).tap();
  await attendreHumain(page);
  await expect(champ(page)).not.toBeFocused();
  await page.evaluate(() => {
    const vue = window.visualViewport!;
    delete (vue as { height?: number }).height;
    vue.dispatchEvent(new Event('resize'));
  });
  await expect(scene(page)).not.toHaveAttribute('data-clavier', '');
});

test('on a phone, with reduced motion and without WebGL 2 the mode still changes, at once', async ({ browser }) => {
  const contexte = await browser.newContext({ locale: 'fr-FR', reducedMotion: 'reduce' });
  await contexte.addInitScript(() => {
    const contexteDe = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...reste: unknown[]) {
      return type === 'webgl2' ? null : (contexteDe as (...a: unknown[]) => unknown).call(this, type, ...reste);
    } as typeof contexteDe;
  });
  const page = await contexte.newPage();
  const erreurs: string[] = [];
  page.on('pageerror', (error) => erreurs.push(error.message));
  await page.goto('/');
  await expect(interrupteur(page)).toBeVisible({ timeout: 15_000 });
  await dansEncoche(page);
  await interrupteur(page).tap();
  await attendreMachine(page);
  await expect(scene(page)).toHaveAttribute('data-nu', '');
  await expect(page.locator('.m6-scene [role="log"]')).toContainText('README.md');
  await expect(champ(page)).not.toBeFocused();
  await interrupteur(page).tap();
  await attendreHumain(page);
  await expect(page.locator('.mobile .m-title')).toBeVisible();
  expect(erreurs).toEqual([]);
  await contexte.close();
});

test('growing past 720 px on the Machine side gives the human page back with the desktop’s switch, and the phone’s returns with the width', async ({ page }) => {
  const erreurs: string[] = [];
  page.on('pageerror', (error) => erreurs.push(error.message));
  await page.goto('/');
  await expect(interrupteur(page)).toBeVisible({ timeout: 15_000 });
  await interrupteur(page).tap();
  await attendreMachine(page);

  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(scene(page)).toHaveCount(0);
  await expect(page.locator('.maquette .m-title')).toBeVisible();
  await expect(page.locator('.specimen')).not.toHaveAttribute('data-machine', '');
  await expect(page.locator('.specimen')).not.toHaveAttribute('data-m6-encoche', '');
  expect(await page.locator('.specimen > *').evaluateAll((enfants: HTMLElement[]) => enfants.some((enfant) => enfant.inert))).toBe(false);
  await expect(page.locator('.machine [role="switch"]')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.machine [role="switch"]')).toHaveAttribute('aria-checked', 'false');

  await page.setViewportSize({ width: 390, height: 664 });
  await expect(page.locator('.machine')).toHaveCount(0);
  await expect(interrupteur(page)).toBeVisible();
  await expect(interrupteur(page)).toHaveAttribute('aria-checked', 'false');
  await expect(page.locator('.mobile .m-title')).toBeVisible();
  await dansEncoche(page);
  expect(erreurs).toEqual([]);
});
