const METRICS_KEY = 'metrics:global';

export async function getMetrics(env) {
  return (await env.KV_METRICS?.get(METRICS_KEY, 'json')) || {};
}

export async function incrementMetric(env, metricName, amount = 1) {
  for (let i = 0; i < 3; i += 1) {
    try {
      const current = (await env.KV_METRICS?.get(METRICS_KEY, 'json')) || {};
      current[metricName] = (current[metricName] || 0) + amount;
      current.lastUpdated = new Date().toISOString();
      await env.KV_METRICS?.put(METRICS_KEY, JSON.stringify(current));
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 50 * (i + 1)));
    }
  }
}

export async function resetMetrics(env) {
  await env.KV_METRICS?.put(METRICS_KEY, JSON.stringify({ resetAt: new Date().toISOString() }));
}
