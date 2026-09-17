import type { Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getAgentFiles } from '../src/agent/agentDocument';

/** Publish real files so agents do not need the React app or a client router. */
export function agentPages(): Plugin {
  const stylePaths = [
    fileURLToPath(new URL('../src/components/machine/machineMode.css', import.meta.url)),
    fileURLToPath(new URL('../src/agent/agent.css', import.meta.url)),
  ];
  const files = () => getAgentFiles(stylePaths.map((path) => readFileSync(path, 'utf8')).join('\n'));
  return {
    name: 'agent-pages',
    buildStart() {
      stylePaths.forEach((path) => this.addWatchFile(path));
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = (request.url ?? '/').split('?')[0];
        if (path !== '/agent' && path !== '/agent.html' && !path.startsWith('/agent/') && path !== '/llms.txt') return next();
        const file = files()[path === '/agent' || path === '/agent/' ? '/agent/index.html' : path];
        if (!file) return next();
        response.setHeader('Content-Type', `${file.type}; charset=utf-8`);
        response.end(file.content);
      });
    },
    generateBundle() {
      for (const [path, file] of Object.entries(files())) {
        this.emitFile({ type: 'asset', fileName: path.slice(1), source: file.content });
      }
    },
  };
}
