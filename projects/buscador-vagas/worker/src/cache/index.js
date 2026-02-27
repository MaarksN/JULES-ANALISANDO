const CACHE_PREFIX = 'search:v5:';

export async function getCachedSearch(env, cacheKey) {
  try {
    return await env.KV_CACHE?.get(CACHE_PREFIX + cacheKey, 'json');
  } catch {
    return null;
  }
}

export async function setCachedSearch(env, cacheKey, data, ttlSeconds = 300) {
  try {
    await env.KV_CACHE?.put(CACHE_PREFIX + cacheKey, JSON.stringify(data), { expirationTtl: ttlSeconds });
  } catch (err) {
    console.error('Falha ao salvar cache KV:', err);
  }
}
