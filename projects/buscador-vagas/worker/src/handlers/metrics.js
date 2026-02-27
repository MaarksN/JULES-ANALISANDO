import { getMetrics, resetMetrics } from '../metrics/index.js';
import { withJson } from './shared.js';

export async function handleMetrics(_request, env, requestId) {
  const metrics = await getMetrics(env);
  return withJson({ metrics }, 200, requestId);
}

export async function handleMetricsReset(_request, env, requestId) {
  await resetMetrics(env);
  return withJson({ ok: true, message: 'Métricas resetadas.' }, 200, requestId);
}
