import { preact } from '@preact/preset-vite';
import { defineConfig } from 'vite';
import { agentPages } from './scripts/agentPages';
import { publicAssetsGuard } from './scripts/publicAssets';
import { vercelRoutes } from './scripts/vercelRoutes';
import vercelConfig from './vercel.json';

export default defineConfig(({ isSsrBuild }) => ({
  // Preact runs the React code (its compat layer): the same components, a tenth of the runtime.
  plugins: [vercelRoutes(vercelConfig), preact(), agentPages(), publicAssetsGuard()],
  // Exercise the production browser policy when checking a local build.
  preview: { headers: Object.fromEntries(vercelConfig.headers[0].headers.map(({ key, value }) => [key, value])) },
  build: {
    sourcemap: false,
    // The pages; the server build (scripts/prerendre.mjs) has its own entry.
    rolldownOptions: isSsrBuild ? {} : { input: ['index.html', 'desktop/index.html', 'cv/fr/index.html', 'cv/en/index.html', 'atelier/index.html'] },
  },
}));
