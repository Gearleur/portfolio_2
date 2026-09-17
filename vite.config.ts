import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { agentPages } from './build/agentPages';
import { publicAssetsGuard } from './build/publicAssets';
import vercelConfig from './vercel.json';

export default defineConfig({
  plugins: [react(), agentPages(), publicAssetsGuard()],
  // Exercise the production browser policy when checking a local build.
  preview: { headers: Object.fromEntries(vercelConfig.headers[0].headers.map(({ key, value }) => [key, value])) },
  build: {
    sourcemap: false,
    rolldownOptions: { input: ['index.html', 'cv/fr/index.html', 'cv/en/index.html'] },
  },
});
