import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm dev --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'mobile-chromium',
      testMatch: '**/mobile-*.spec.ts',
      use: { ...devices['iPhone 13'], browserName: 'chromium' },
      // Chaque contexte iPhone 13 rend son canvas WebGL en logiciel
      // (SwiftShader) : plusieurs contextes en parallele saturent le CPU
      // partage avec l'unique serveur `pnpm dev`, et des assertions sensibles
      // au temps (transitions CSS, boucle de rendu) se mettent a expirer de
      // facon aleatoire. Toujours vrai apres correction des deux vraies
      // regressions (useCurtainExit, echantillonnage RAF) : sans ce plafond,
      // mobile-chromium seul a echoue 2 fois sur 8 en parallelisme normal.
      // Un seul worker pour ce projet supprime cette contention interne.
      workers: 1,
    },
    {
      name: 'desktop-chromium',
      testMatch: '**/desktop-*.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      // Le plafond a 1 worker ci-dessus protege mobile-chromium de sa propre
      // contention interne, pas de celle que desktop-chromium lui impose en
      // tournant a cote sur la meme machine et le meme `pnpm dev` : sans ce
      // second plafond, `pnpm test:e2e` (les deux projets ensemble) a echoue
      // sur mobile-mode-slider.spec.ts:35 dans 3 des 4 executions mesurees.
      // 3 est empirique et relatif a cette machine a 12 coeurs -- mesure a
      // 8/8 executions combinees propres avant l'ajout de
      // desktop-room-idle.spec.ts, puis 4/5 apres (les deux specs qu'il
      // ajoute allongent la suite desktop d'environ 15 s et elargissent
      // d'autant la fenetre de recouvrement avec le seul worker mobile).
      // Teste aussi a 2 : meme taux de reussite (4/5), suite ~40 % plus
      // lente -- ce plafond n'ameliore donc plus la fiabilite au-dela de 3
      // sur cette machine, seule la duree se degrade. La contention
      // residuelle a ce taux tient au geste de glisser-deposer de
      // mobile-mode-slider.spec.ts:35 (dragModeSlider), sensible a
      // l'ordonnancement systeme sous charge -- hors perimetre de ce
      // correctif. Une CI avec un nombre de coeurs different devra
      // remesurer plutot que reprendre ce 3 tel quel.
      workers: 3,
    },
  ],
});
