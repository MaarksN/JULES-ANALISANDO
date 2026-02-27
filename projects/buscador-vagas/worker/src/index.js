import { handleConfig } from './handlers/config.js';
import { handleDeleteFavorite, handleGetFavorites, handlePostFavorites } from './handlers/favorites.js';
import { handleHealth } from './handlers/health.js';
import { handleMetrics, handleMetricsReset } from './handlers/metrics.js';
import { handleNormalize } from './handlers/normalize.js';
import { handleSample } from './handlers/sample.js';
import { handleSearch } from './handlers/search.js';
import { withProblem, withJson } from './handlers/shared.js';
import { handleSites } from './handlers/sites.js';
import { handleValidate } from './handlers/validate.js';
import { handleVersion } from './handlers/version.js';
import { requireAdminAuth } from './middleware/auth.js';
import { requireJson } from './middleware/contentType.js';
import { checkRateLimit } from './middleware/rateLimit.js';
import { corsMiddleware, withCors } from './middleware/cors.js';
import { incrementMetric } from './metrics/index.js';
import { createRequestId } from './utils/requestId.js';

function matchRoute(pathname, routes, request, env, requestId) {
  for (const route of routes) {
    if (route.path instanceof RegExp) {
      const match = pathname.match(route.path);
      if (match) return route.handler(request, env, requestId, match);
      continue;
    }
    if (route.path === pathname) return route.handler(request, env, requestId);
  }
  return null;
}

async function routeJson(request, env, requestId, handler) {
  try {
    return withCors(await handler(request, env, requestId), request, env);
  } catch (error) {
    return withCors(withProblem({
      status: 500,
      title: 'Erro interno',
      detail: error?.message || 'Erro interno',
      code: 'internal_error'
    }, requestId), request, env);
  }
}

export default {
  async fetch(request, env) {
    const requestId = createRequestId();
    const { pathname } = new URL(request.url);
    const method = request.method;

    if (method === 'OPTIONS') return corsMiddleware(request, env);
    await incrementMetric(env, 'requests', 1);

    const routes = {
      GET: [
        { path: '/health', handler: (req, runtimeEnv, rid) => handleHealth(req, runtimeEnv, rid) },
        { path: '/version', handler: (req, runtimeEnv, rid) => handleVersion(req, runtimeEnv, rid) },
        { path: '/config', handler: (req, runtimeEnv, rid) => handleConfig(req, runtimeEnv, rid) },
        { path: '/sites', handler: (req, runtimeEnv, rid) => handleSites(req, runtimeEnv, rid) },
        { path: '/sample-request', handler: (req, runtimeEnv, rid) => handleSample(req, runtimeEnv, rid) },
        { path: '/metrics', handler: (req, runtimeEnv, rid) => routeJson(req, runtimeEnv, rid, handleMetrics) },
        { path: '/favorites', handler: (req, runtimeEnv, rid) => routeJson(req, runtimeEnv, rid, handleGetFavorites) }
      ],
      POST: [
        {
          path: '/metrics/reset',
          handler: (req, runtimeEnv, rid) => {
            const unauthorized = requireAdminAuth(req, runtimeEnv, rid);
            if (unauthorized) return withCors(unauthorized, req, runtimeEnv);
            return routeJson(req, runtimeEnv, rid, handleMetricsReset);
          }
        },
        { path: '/normalize', handler: (req, runtimeEnv, rid) => routeJson(req, runtimeEnv, rid, handleNormalize) },
        { path: '/validate', handler: (req, runtimeEnv, rid) => routeJson(req, runtimeEnv, rid, handleValidate) },
        { path: '/favorites', handler: (req, runtimeEnv, rid) => routeJson(req, runtimeEnv, rid, handlePostFavorites) },
        {
          path: '/search',
          handler: async (req, runtimeEnv, rid) => {
            const typeError = requireJson(req);
            if (typeError) return withCors(typeError, req, runtimeEnv);
            const rate = await checkRateLimit(req, runtimeEnv);
            if (rate.limited) {
              await incrementMetric(runtimeEnv, 'rateLimited', 1);
              return withCors(withJson({ error: 'Rate limit excedido' }, 429, rid, { 'Retry-After': String(rate.retryAfter) }), req, runtimeEnv);
            }
            return routeJson(req, runtimeEnv, rid, handleSearch);
          }
        }
      ],
      DELETE: [
        { path: '/favorites', handler: (req, runtimeEnv, rid) => routeJson(req, runtimeEnv, rid, handleDeleteFavorite) },
        {
          path: /^\/favorites\/([^/]+)$/,
          handler: (req, runtimeEnv, rid, match) => routeJson(req, runtimeEnv, rid, (rq, e, id) => handleDeleteFavorite(rq, e, id, match[1]))
        }
      ]
    };

    const resolved = await matchRoute(pathname, routes[method] || [], request, env, requestId);
    if (resolved) return withCors(resolved, request, env);

    return withCors(withProblem({ status: 404, title: 'Not Found', detail: 'Rota não encontrada', code: 'route_not_found' }, requestId), request, env);
  }
};
