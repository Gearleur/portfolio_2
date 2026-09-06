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
    },
    {
      name: 'desktop-chromium',
      testMatch: '**/desktop-*.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
