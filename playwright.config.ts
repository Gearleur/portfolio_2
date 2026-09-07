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
      workers: 3,
    },
  ],
});
