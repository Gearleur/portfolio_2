import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const PORTAL_NAME = 'Sortir de l\'écran';

/*
 * Meme sequence que les autres specs de bureau : l'icone Projects ouvre un
 * plein ecran qui recouvre le portail, on le referme avec Escape sans que ca
 * ne retire les deux fenetres ouvertes qui rendent le portail visible.
 */
async function enterRoom(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Education' }).click();
  await page.getByRole('button', { name: 'Projects' }).click();

  await expect(page.locator('.yc-projects')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.yc-projects')).toBeHidden();

  await page.getByRole('button', { name: PORTAL_NAME }).click();
  await expect(page.locator('.experience-root')).toHaveAttribute('data-stage', 'room', {
    timeout: 6000,
  });
}

test('reveals the pitch and offers a way back', async ({ page }) => {
  await enterRoom(page);

  await expect(page.locator('.cinematic-act').first()).toHaveAttribute('data-active', 'true');
  await expect(page.locator('.cinematic-a11y')).toContainText('Je construis ce qui va autour.');

  // Deux boutons partagent le nom accessible "Revenir au bureau" -- celui du
  // dernier acte (a opacity: 0 tant qu'il n'est pas actif) et celui-ci, en
  // haut a gauche, toujours visible. On cible la classe pour ne pas dependre
  // de l'ordre du DOM.
  await page.locator('.cinematic-back').click();
  await expect(page.locator('.experience-root')).toHaveAttribute('data-stage', 'desktop', {
    timeout: 6000,
  });
});

test('advances between acts with the keyboard', async ({ page }) => {
  await enterRoom(page);

  await page.keyboard.press('PageDown');
  await expect(page.locator('.cinematic-act').nth(1)).toHaveAttribute('data-active', 'true', {
    timeout: 4000,
  });
});

test('keeps keyboard focus in place while scrolling to a new act', async ({ page }) => {
  await enterRoom(page);

  // Un visiteur au clavier a tabule jusqu'au bouton de retour ; faire
  // defiler vers un nouvel acte ne doit pas lui voler ce focus.
  const backButton = page.locator('.cinematic-back');
  await backButton.focus();
  await expect(backButton).toBeFocused();

  await page.keyboard.press('PageDown');
  await expect(page.locator('.cinematic-act').nth(1)).toHaveAttribute('data-active', 'true', {
    timeout: 4000,
  });

  await expect(backButton).toBeFocused();
});

type RoomProgressProbe = { __cameraRigProbe?: { roomProgress: number } };

test('resyncs the camera and the act on a second room visit', async ({ page }) => {
  await enterRoom(page);

  // Va directement au dernier acte : pas de sequence de PageDown animee
  // (behavior: 'smooth') dont le minutage serait fragile a enchainer.
  await page.evaluate(() => {
    const element = document.querySelector('.cinematic-scroll');
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  });

  await expect(page.locator('.cinematic-act').nth(4)).toHaveAttribute('data-active', 'true', {
    timeout: 4000,
  });
  await page.waitForFunction(() => {
    const probe = (window as unknown as RoomProgressProbe).__cameraRigProbe;
    return Boolean(probe && probe.roomProgress > 0.5);
  });

  // Quitte la piece, puis y revient par le portail -- sans repasser par
  // Education/Projects : les deux fenetres restent ouvertes d'un bout a
  // l'autre du test (la machine d'etat ne retire jamais une fenetre de sa
  // liste), le portail est donc deja pret.
  await page.locator('.cinematic-back').click();
  await expect(page.locator('.experience-root')).toHaveAttribute('data-stage', 'desktop', {
    timeout: 6000,
  });

  await page.getByRole('button', { name: PORTAL_NAME }).click();
  await expect(page.locator('.experience-root')).toHaveAttribute('data-stage', 'room', {
    timeout: 6000,
  });

  // Le texte et la camera reprennent ensemble, au meme endroit qu'a la
  // sortie -- ni l'un ni l'autre n'est retombe a l'acte ou la position
  // d'entree.
  await expect(page.locator('.cinematic-act').nth(4)).toHaveAttribute('data-active', 'true');
  await page.waitForFunction(() => {
    const probe = (window as unknown as RoomProgressProbe).__cameraRigProbe;
    return Boolean(probe && probe.roomProgress > 0.5);
  });
});

/*
 * Le scroll est le seul moyen d'avancer dans la cinematique (section 5 de la
 * specification). Les cinq actes partagent la meme cellule de grille : celui
 * du dernier, invisible mais dernier dans le DOM donc au-dessus, posait sa
 * rangee d'appels a l'action en travers du centre de l'ecran et avalait la
 * molette -- `.cinematic-cta` reprend `pointer-events: auto` et vit dans
 * `.cinematic-stage`, un frere du conteneur scrollable, donc la molette ne
 * remontait vers aucun ancetre defilable. Un visiteur dont le curseur repose
 * au milieu de l'ecran, sous le texte qu'il lit, trouvait le pitch fige.
 * On vise exactement cette bande : `visibility: hidden` conserve la mise en
 * page, elle reste donc mesurable apres correction.
 */
test('advances the cinematic on a wheel over the invisible CTA row', async ({ page }) => {
  await enterRoom(page);
  await expect(page.locator('.cinematic-act').first()).toHaveAttribute('data-active', 'true');

  const band = await page.evaluate(() => {
    const cta = document.querySelector('.cinematic-cta');
    if (!cta) {
      return null;
    }

    const rect = cta.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  });

  if (!band) {
    throw new Error('the cinematic CTA row was not found');
  }

  await page.mouse.move(band.x, band.y);
  for (let notch = 0; notch < 8; notch += 1) {
    await page.mouse.wheel(0, 320);
  }

  await expect(page.locator('.cinematic-act').first()).toHaveAttribute('data-active', 'false', {
    timeout: 4000,
  });

  const scrollTop = await page.evaluate(
    () => document.querySelector('.cinematic-scroll')?.scrollTop ?? 0,
  );
  expect(scrollTop).toBeGreaterThan(0);
});

/*
 * Section 15 : "Escape ramene au bureau". `desktop-pullback.spec.ts` teste
 * Escape pendant le recul, ou il saute la transition -- c'est un autre
 * comportement, et depuis la piece rien ne couvrait celui-ci.
 */
test('returns to the desktop on escape from the room', async ({ page }) => {
  await enterRoom(page);

  await page.keyboard.press('Escape');
  await expect(page.locator('.experience-root')).toHaveAttribute('data-stage', 'desktop', {
    timeout: 6000,
  });
});

/*
 * Le bureau existe toujours dans le document pendant la piece -- c'est lui
 * qu'on recule, il ne peut pas etre demonte -- mais il est sous un calque a
 * `opacity: 0`. Une marche au clavier depuis la region cinematique atteignait
 * les icones du bureau et les activait : une fenetre s'ouvrait et notifiait la
 * machine d'etat pendant que le visiteur etait dans la piece.
 * `pointer-events: none` ne couvrait que la souris.
 */
test('keeps the tab order out of the desktop while in the room', async ({ page }) => {
  await enterRoom(page);

  const walk: string[] = [];
  for (let step = 0; step < 12; step += 1) {
    await page.keyboard.press('Tab');
    walk.push(
      await page.evaluate(() => {
        const active = document.activeElement;
        if (!active) {
          return 'none';
        }

        const where = active.closest('#portfolio-content') ? 'desktop' : 'outside';
        return `${where}:${active.tagName}.${active.className}`;
      }),
    );
  }

  expect(walk.filter((stop) => stop.startsWith('desktop:'))).toEqual([]);
});
