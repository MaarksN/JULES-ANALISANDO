import { withJson } from './shared.js';

export function handleVersion(_request, env, requestId) {
  return withJson({ version: env.WORKER_VERSION || '5.0.0', schemaVersion: '5.0.0' }, 200, requestId);
}
