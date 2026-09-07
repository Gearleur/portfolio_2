import { expect, test } from '@playwright/test';

/*
 * Specification section 12 : "Pas de dezoom. Le clic sur le bouton portail
 * fond directement (400 ms) dans la piece, sur un plan deja installe." La
 * camera ne doit donc jamais parcourir PULLBACK_PATH sur mobile -- seul un
 * fondu d'opacite doit se produire. On le prouve en interrogeant la meme
 * chaine CSS que `desktop-pullback.spec.ts` verifie deja pour le recul
 * complet : si la dalle DOM porte une jour une matrice `matrix3d(...)`
 * pendant la transition, c'est qu'elle a ete retrecie par la camera, donc
 * qu'un dezoom a bien eu lieu.
 */
test('crossfades into the room without a camera dezoom', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.mobile-shell')).toBeVisible();

  await page.getByRole('button', { name: 'Education' }).click();
  await page.locator('.mobile-home-button').click();

  await page.getByRole('button', { name: 'Projects' }).click();
  await expect(page.locator('.yc-projects')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.yc-projects')).toBeHidden();

  const portal = page.getByRole('button', { name: 'Sortir de l\'écran' });
  await expect(portal).toBeVisible();

  // Demarre la collecte avant le clic : la transition dure 400 ms, il ne faut
  // manquer aucune frame du debut. Le tableau est aussi expose sur `window`
  // pour qu'un `waitForFunction` puisse plus bas attendre que la collecte se
  // soit reellement stabilisee, au lieu de deviner un delai fixe.
  const samplesHandle = await page.evaluateHandle(() => {
    const samples: { transform: string; opacity: string }[] = [];
    (window as unknown as { __transitionSamples?: typeof samples }).__transitionSamples = samples;
    const collect = () => {
      const screen = document.querySelector('.experience-screen');
      if (screen) {
        const style = getComputedStyle(screen);
        samples.push({ transform: style.transform, opacity: style.opacity });
      }
      if (samples.length < 90) {
        requestAnimationFrame(collect);
      }
    };
    requestAnimationFrame(collect);
    return samples;
  });

  await portal.click();
  await expect(page.locator('.experience-root')).toHaveAttribute('data-stage', 'room', {
    timeout: 4000,
  });

  // La collecte s'arrete quand le plafond de 90 images est atteint ou quand le
  // fondu a reellement atteint son etat final (l'opacite que la derniere
  // assertion attend) : un `waitForTimeout` fixe ne garantissait ni l'un ni
  // l'autre sous contention (voir `desktop-pullback.spec.ts` pour l'idiome).
  await page.waitForFunction(
    () => {
      const samples = (
        window as unknown as { __transitionSamples?: { opacity: string }[] }
      ).__transitionSamples;
      if (!samples || samples.length < 2) {
        return false;
      }
      const last = Number(samples[samples.length - 1].opacity);
      return samples.length >= 90 || last < 0.1;
    },
    undefined,
    { timeout: 4000 },
  );

  const samples = await samplesHandle.jsonValue();
  expect(samples.length).toBeGreaterThan(10);

  // Aucune frame ne doit exhiber la matrice 3D que le rig applique pendant le
  // recul complet du bureau -- c'est exactement ce signal que
  // desktop-pullback.spec.ts encaisse pour prouver le recul reel.
  for (const sample of samples) {
    expect(sample.transform).not.toMatch(/^matrix3d\(/);
  }

  // Le bureau DOM doit malgre tout s'estomper : visible au debut, invisible a
  // l'arrivee en piece.
  expect(Number(samples[0].opacity)).toBeGreaterThan(0.9);
  expect(Number(samples[samples.length - 1].opacity)).toBeLessThan(0.1);
});
