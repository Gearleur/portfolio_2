import { preact } from '@preact/preset-vite';
import { defineConfig } from 'vite';
import { agentPages } from './scripts/agentPages';
import { publicAssetsGuard } from './scripts/publicAssets';
import { vercelRoutes } from './scripts/vercelRoutes';
import vercelConfig from './vercel.json';

/*
 * The Machine mode's chunks. The Vitrine and the bench of /atelier-machine/ share its modules,
 * which left alone are cut into a dozen small files, each one a request. They are gathered by
 * the moment they are fetched: the switch (once the page is idle), what the phone's switch adds,
 * the passage and the terminal (at the first gesture, or ahead on a phone), what the phone's
 * passage adds. Only what the Vitrine fetches is named here: nothing of the bench's panels, and
 * neither the desktop's stage in the phone's chunks nor the phone's in the desktop's.
 */
const ETABLI = 'src/apps/atelier-machine/';
const MACHINE = [
  { name: 'machine-inter', test: new RegExp(`${ETABLI}(m2/retenu\\.ts|m3/(retenu\\.ts|Interrupteur\\.tsx|m3\\.css))$|src/apps/portfolio/machine/etat\\.ts$`) },
  { name: 'machine-tel-inter', test: new RegExp(`${ETABLI}m6/((Mobile|telephone|retenu)\\.tsx?|m6\\.css)$`) },
  { name: 'machine-terminal', test: new RegExp(`${ETABLI}(m1/(retenu\\.ts|verre\\.css)|m2/(plier\\.ts|m2\\.css)|m4/((meneur|passage|rendu|nombre|retenu)\\.ts|Terminal\\.tsx|m4\\.css)|m5/((shell|fichiers|markdown|retenu)\\.ts|Console\\.tsx|m5\\.css))$`) },
  { name: 'machine-tel', test: new RegExp(`${ETABLI}m6/(Passage\\.tsx|(derives|glisser|ranger|clavier)\\.ts)$`) },
];

export default defineConfig(({ isSsrBuild }) => ({
  // Preact runs the React code (its compat layer): the same components, a tenth of the runtime.
  plugins: [vercelRoutes(vercelConfig), preact(), agentPages(), publicAssetsGuard()],
  // Exercise the production browser policy when checking a local build.
  preview: { headers: Object.fromEntries(vercelConfig.headers[0].headers.map(({ key, value }) => [key, value])) },
  build: {
    sourcemap: false,
    // The pages; the server build (scripts/prerendre.mjs) has its own entry.
    rolldownOptions: isSsrBuild
      ? {}
      : {
          input: ['index.html', 'desktop/index.html', 'cv/fr/index.html', 'cv/en/index.html', 'atelier/index.html', 'atelier-machine/index.html'],
          // only the modules named: what they import in their turn stays where the pages already find it
          output: { codeSplitting: { includeDependenciesRecursively: false, groups: MACHINE } },
        },
  },
}));
