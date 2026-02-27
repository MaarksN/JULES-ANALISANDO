import { LIMITS } from '../config.js';
import { cleanUrl, normalizeToken, sanitizeText } from '../utils/sanitize.js';
import { withJson } from './shared.js';

function getUserKey(request) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const auth = request.headers.get('Authorization') || '';
  const safeAuth = auth ? auth.slice(-12) : 'anon';
  return `favorites:${ip}:${safeAuth}`;
}

function favoriteKey(item) {
  return normalizeToken(`${item.url}|${item.title}|${item.company}`);
}

function sanitizeFavorite(body = {}) {
  return {
    id: sanitizeText(String(body.id || crypto.randomUUID()), 100),
    title: sanitizeText(body.title, LIMITS.favoriteTextMaxChars),
    company: sanitizeText(body.company, LIMITS.favoriteTextMaxChars),
    location: sanitizeText(body.location, 120),
    url: cleanUrl(body.url),
    site: sanitizeText(body.site, 50),
    savedAt: new Date().toISOString()
  };
}

export async function handleGetFavorites(request, env, requestId) {
  const favorites = (await env.KV_FAVORITES?.get(getUserKey(request), 'json')) || [];
  return withJson({ favorites }, 200, requestId);
}

export async function handlePostFavorites(request, env, requestId) {
  const body = await request.json();
  const favorites = (await env.KV_FAVORITES?.get(getUserKey(request), 'json')) || [];
  const item = sanitizeFavorite(body);

  if (!item.title || !item.url) {
    return withJson({ error: 'title e url são obrigatórios para favoritar' }, 400, requestId);
  }

  const incomingKey = favoriteKey(item);
  const merged = [item, ...favorites.filter((fav) => favoriteKey(fav) !== incomingKey)].slice(0, LIMITS.favoritesMaxItems);
  await env.KV_FAVORITES?.put(getUserKey(request), JSON.stringify(merged));
  return withJson({ ok: true, favorite: item }, 200, requestId);
}

export async function handleDeleteFavorite(request, env, requestId, favoriteId) {
  const key = getUserKey(request);
  if (!favoriteId) {
    await env.KV_FAVORITES?.put(key, JSON.stringify([]));
    return withJson({ ok: true, cleared: true }, 200, requestId);
  }

  const favorites = (await env.KV_FAVORITES?.get(key, 'json')) || [];
  const filtered = favorites.filter((item) => item.id !== favoriteId);
  await env.KV_FAVORITES?.put(key, JSON.stringify(filtered));
  return withJson({ ok: true, removed: favoriteId }, 200, requestId);
}
