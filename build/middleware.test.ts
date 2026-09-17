import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import middleware from '../middleware';

const firewallFetch = vi.fn();
beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('VERCEL', '1');
  vi.stubEnv('VERCEL_URL', 'portfolio-test.vercel.app');
  vi.stubGlobal('fetch', firewallFetch);
  firewallFetch.mockReset();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function request(path = '/agent/profile.json', method = 'GET') {
  return new Request(`https://portfolio.example${path}`, {
    method,
    headers: { host: 'untrusted.example', 'x-real-ip': '192.0.2.1', 'x-forwarded-for': 'fake-client' },
  });
}

it.each(['/agent/profile.json', '/agent/profile.md', '/agent/context.txt', '/agent/profile.json/'])('only serves %s after a successful firewall check', async (path) => {
  firewallFetch.mockResolvedValue(new Response(null, { status: 204 }));
  const response = await middleware(request(path));
  expect(response.headers.get('x-middleware-next')).toBe('1');
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(firewallFetch.mock.calls[0][0]).toBe('https://portfolio-test.vercel.app/.well-known/vercel/rate-limit-api/public-profile-downloads');
  const headers = firewallFetch.mock.calls[0][1].headers as Headers;
  expect(headers.get('x-real-ip')).toBe('192.0.2.1');
  expect(headers.get('x-forwarded-for')).toBe('192.0.2.1');
});

it.each(['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])('rejects %s before contacting the firewall', async (method) => {
  const response = await middleware(request('/agent/profile.json', method));
  expect(response.status).toBe(405);
  expect(response.headers.get('allow')).toBe('GET, HEAD');
  expect(firewallFetch).not.toHaveBeenCalled();
});

it.each([[404, 503], [403, 403], [429, 429], [500, 503]])('fails closed for firewall status %i, returning %i', async (upstream, expected) => {
  firewallFetch.mockResolvedValue(new Response(null, { status: upstream }));
  const response = await middleware(request());
  expect(response.status).toBe(expected);
  expect(response.headers.get('x-middleware-next')).toBeNull();
  expect(response.headers.get('cache-control')).toBe('no-store');
});

it('counts HEAD requests and does not return a response body on rejection', async () => {
  firewallFetch.mockResolvedValue(new Response(null, { status: 429 }));
  const response = await middleware(request('/agent/context.txt', 'HEAD'));
  expect(response.status).toBe(429);
  expect(response.headers.get('retry-after')).toBe('60');
  expect(await response.text()).toBe('');
  expect(firewallFetch).toHaveBeenCalledOnce();
});

it('fails closed on network failure', async () => {
  firewallFetch.mockRejectedValue(new Error('offline'));
  expect((await middleware(request())).status).toBe(503);
});

it('fails closed when the firewall never responds', async () => {
  vi.useFakeTimers();
  firewallFetch.mockImplementation(() => new Promise(() => {}));
  const pending = middleware(request());
  await vi.advanceTimersByTimeAsync(5000);
  expect((await pending).status).toBe(503);
});

it.each(['NODE_ENV', 'VERCEL', 'VERCEL_URL'])('fails closed if %s is unavailable', async (name) => {
  vi.stubEnv(name, '');
  expect((await middleware(request())).status).toBe(503);
  expect(firewallFetch).not.toHaveBeenCalled();
});

it('fails closed without a platform client IP', async () => {
  expect((await middleware(new Request('https://portfolio.example/agent/profile.json'))).status).toBe(503);
  expect(firewallFetch).not.toHaveBeenCalled();
});

it.each(['/agent', '/agent/', '/agent/index.html', '/agent/style.css', '/agent/copy.js'])('keeps the readable page and assets available: %s', async (path) => {
  expect((await middleware(request(path))).headers.get('x-middleware-next')).toBe('1');
  expect(firewallFetch).not.toHaveBeenCalled();
});
