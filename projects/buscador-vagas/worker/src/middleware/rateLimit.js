// Rate limit persistente em KV por IP e janela de tempo.
const memoryRate = new Map();

function checkMemoryRate(key, now, windowMs) {
  const current = memoryRate.get(key) || { count: 0, expiresAt: now + windowMs };
  if (now > current.expiresAt) {
    current.count = 0;
    current.expiresAt = now + windowMs;
  }
  current.count += 1;
  memoryRate.set(key, current);
  return current.count;
}

function resolveClientKey(request) {
  const tenant = request.headers.get('X-Tenant-Id') || 'public';
  const apiKey = request.headers.get('X-Api-Key') || request.headers.get('Authorization') || 'anon';
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  return `${tenant}:${ip}:${apiKey.slice(-16)}`;
}

export async function checkRateLimit(request, env) {
  const now = Date.now();
  const limit = Number.parseInt(env.RATE_LIMIT_REQUESTS || '10', 10);
  const windowSeconds = Number.parseInt(env.RATE_LIMIT_WINDOW_SECONDS || '60', 10);
  const windowMs = Math.max(10, windowSeconds * 1000);
  const bucket = Math.floor(now / windowMs);
  const clientKey = resolveClientKey(request);
  const key = `ratelimit:${clientKey}:${bucket}`;

  try {
    if (!env.KV_CACHE) {
      const count = checkMemoryRate(key, now, windowMs);
      return { limited: count > limit, current: count, limit, retryAfter: windowSeconds - Math.floor((now / 1000) % windowSeconds) };
    }

    const current = Number.parseInt((await env.KV_CACHE.get(key)) || '0', 10);
    if (current >= limit) {
      return { limited: true, current, limit, retryAfter: windowSeconds - Math.floor((now / 1000) % windowSeconds) };
    }

    await env.KV_CACHE.put(key, String(current + 1), { expirationTtl: Math.max(windowSeconds * 2, 120) });
    return { limited: false, current: current + 1, limit, retryAfter: 0 };
  } catch {
    const count = checkMemoryRate(key, now, windowMs);
    return { limited: count > limit, current: count, limit, retryAfter: windowSeconds - Math.floor((now / 1000) % windowSeconds) };
  }
}
