import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { agentPages } from './scripts/agentPages';
import { publicAssetsGuard } from './scripts/publicAssets';
import { vercelRoutes } from './scripts/vercelRoutes';
import vercelConfig from './vercel.json';

export default defineConfig({
  plugins: [vercelRoutes(vercelConfig), react(), agentPages(), publicAssetsGuard()],
  // Exercise the production browser policy when checking a local build.
  preview: { headers: Object.fromEntries(vercelConfig.headers[0].headers.map(({ key, value }) => [key, value])) },
  build: {
    sourcemap: false,
    rolldownOptions: { input: ['index.html', 'desktop/index.html', 'cv/fr/index.html', 'cv/en/index.html', 'atelier/index.html'] },
  },
});
