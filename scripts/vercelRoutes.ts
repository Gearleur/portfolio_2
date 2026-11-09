import type { Connect, Plugin } from 'vite';

type Route = { source: string; destination: string };
type Redirect = Route & { permanent?: boolean };

/**
 * Applies vercel.json's redirects and rewrites in `vite dev` and `vite preview`,
 * so an address opens the same page locally as in production. Without it Vite
 * only finds a page from its trailing slash, and `/desktop` or `/cv/fr` fell
 * back to the home page. Only exact sources are supported, as in vercel.json.
 */
export function routeMiddleware({ redirects = [], rewrites = [] }: { redirects?: Redirect[]; rewrites?: Route[] }): Connect.NextHandleFunction {
  const redirectBySource = new Map(redirects.map((redirect) => [redirect.source, redirect]));
  const rewriteBySource = new Map(rewrites.map((rewrite) => [rewrite.source, rewrite.destination]));
  return (request, response, next) => {
    const url = request.url ?? '/';
    const queryStart = url.search(/[?#]/);
    const path = queryStart === -1 ? url : url.slice(0, queryStart);
    const query = queryStart === -1 ? '' : url.slice(queryStart);
    const redirect = redirectBySource.get(path);
    if (redirect) {
      response.statusCode = redirect.permanent ? 308 : 307;
      response.setHeader('Location', redirect.destination + query);
      response.end();
      return;
    }
    const destination = rewriteBySource.get(path);
    if (destination) request.url = destination + query;
    next();
  };
}

export function vercelRoutes(config: { redirects?: Redirect[]; rewrites?: Route[] }): Plugin {
  const middleware = routeMiddleware(config);
  return {
    name: 'vercel-routes',
    // Added directly, so they run before Vite's own HTML fallback.
    configureServer(server) { server.middlewares.use(middleware); },
    configurePreviewServer(server) { server.middlewares.use(middleware); },
  };
}
