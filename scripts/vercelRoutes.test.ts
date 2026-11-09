import { existsSync } from 'node:fs';
import type { ServerResponse } from 'node:http';
import type { Connect } from 'vite';
import { describe, expect, it, vi } from 'vitest';
import { getAgentFiles } from '../src/agent/agentDocument';
import vercelConfig from '../vercel.json';
import { routeMiddleware } from './vercelRoutes';

const visit = (url: string) => {
  const request = { url } as Connect.IncomingMessage;
  const headers = new Map<string, string>();
  const response = { statusCode: 200, setHeader: (name: string, value: string) => headers.set(name, value), end: vi.fn() };
  const next = vi.fn();
  routeMiddleware(vercelConfig)(request, response as unknown as ServerResponse, next);
  return { url: request.url, status: response.statusCode, location: headers.get('Location'), passedOn: next.mock.calls.length === 1 };
};

describe('vercel.json routes in the dev and preview servers', () => {
  it.each([
    ['/desktop', '/desktop/index.html'],
    ['/desktop/?source=pwa', '/desktop/index.html?source=pwa'],
    ['/cv/fr', '/cv/fr/index.html'],
    ['/atelier', '/atelier/index.html'],
  ])('opens %s from %s', (url, page) => {
    expect(visit(url)).toMatchObject({ url: page, status: 200, passedOn: true });
  });

  it('leaves the home page and other files alone', () => {
    expect(visit('/')).toMatchObject({ url: '/', passedOn: true });
    expect(visit('/desktop/manifest.webmanifest')).toMatchObject({ url: '/desktop/manifest.webmanifest', passedOn: true });
  });

  it('sends the old Vitrine address to the home page, keeping the query', () => {
    expect(visit('/portfolio')).toMatchObject({ status: 307, location: '/', passedOn: false });
    expect(visit('/portfolio/?lang=en')).toMatchObject({ status: 307, location: '/?lang=en', passedOn: false });
  });

  it('rewrites only to pages that exist', () => {
    const agentPages = getAgentFiles('');
    for (const { destination } of vercelConfig.rewrites) {
      expect(existsSync(new URL(`..${destination}`, import.meta.url)) || destination in agentPages, destination).toBe(true);
    }
  });
});
