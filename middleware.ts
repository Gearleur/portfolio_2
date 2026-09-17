import { checkRateLimit } from '@vercel/firewall';
import { ipAddress, next } from '@vercel/functions';

export const config = { matcher: ['/agent/:path*'] };

const publicPageAssets = new Set([
  '/agent', '/agent/', '/agent/index.html', '/agent/style.css', '/agent/copy.js',
]);

export default async function middleware(request: Request) {
  if (publicPageAssets.has(new URL(request.url).pathname)) return next();

  const reject = (status: number, error: string, extra: Record<string, string> = {}) =>
    new Response(request.method === 'HEAD' ? null : JSON.stringify({ error }), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra },
    });

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return reject(405, 'Method not allowed', { Allow: 'GET, HEAD' });
  }

  // The SDK permits requests in development and when a rule is missing.
  // Neither is acceptable for these exports: fail closed in both cases.
  const host = process.env.VERCEL_URL;
  const ip = ipAddress(request);
  if (process.env.VERCEL !== '1' || process.env.NODE_ENV !== 'production' ||
      !host || !/^[a-z0-9.-]+\.vercel\.app$/i.test(host) || !ip) {
    return reject(503, 'Profile exports temporarily unavailable', { 'Retry-After': '60' });
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      checkRateLimit('public-profile-downloads', {
        // Use the deployment host, never a caller-controlled Host or forwarding URL.
        headers: new Headers({ host, 'x-real-ip': ip, 'x-forwarded-for': ip }),
        rateLimitKey: ip,
      }),
      new Promise<never>((_, rejectTimeout) => {
        timer = setTimeout(() => rejectTimeout(new Error('Firewall timeout')), 5000);
      }),
    ]);
    if (result.error === 'blocked') return reject(403, 'Access denied');
    if (result.error) return reject(503, 'Profile exports temporarily unavailable', { 'Retry-After': '60' });
    if (result.rateLimited) return reject(429, 'Too many requests', { 'Retry-After': '60' });
    if (result.rateLimited !== false) return reject(503, 'Profile exports temporarily unavailable');
    return next({ headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return reject(503, 'Profile exports temporarily unavailable', { 'Retry-After': '60' });
  } finally {
    clearTimeout(timer);
  }
}
