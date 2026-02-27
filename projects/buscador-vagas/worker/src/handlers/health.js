import { withJson } from './shared.js';

export function handleHealth(_request, env, requestId) {
  return withJson({ status: 'ok', service: 'buscador-vagas-worker', version: env.WORKER_VERSION || '5.0.0' }, 200, requestId);
}
