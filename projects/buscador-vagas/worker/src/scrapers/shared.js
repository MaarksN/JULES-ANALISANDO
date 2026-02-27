import { sanitizeText } from '../utils/sanitize.js';

export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
];

export function randomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export function stripHtml(text) {
  return String(text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function withTimeoutSignal(ms = 4000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('timeout'), ms);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId)
  };
}

export function buildBaseHeaders({ accept, referer }) {
  return {
    Accept: accept,
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'User-Agent': randomUserAgent(),
    Referer: referer
  };
}

export function ensureDescription(text, title) {
  const normalized = sanitizeText(stripHtml(text), 500);
  if (normalized) return normalized;
  return sanitizeText(`Vaga de ${title || 'desenvolvedor'}`, 500);
}

export function normalizeDate(dateLike) {
  if (!dateLike) return null;
  const parsed = new Date(dateLike);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function inferTags(text = '') {
  const hay = String(text).toLowerCase();
  const tags = [];
  if (/javascript|node|typescript/.test(hay)) tags.push('javascript');
  if (/react|frontend|front-end/.test(hay)) tags.push('frontend');
  if (/python|django|flask/.test(hay)) tags.push('python');
  if (/aws|gcp|azure|cloud/.test(hay)) tags.push('cloud');
  if (/remoto|remote|home office/.test(hay)) tags.push('remote');
  return tags;
}

export function normalizeQuery(query) {
  return sanitizeText(query || '', 160);
}
