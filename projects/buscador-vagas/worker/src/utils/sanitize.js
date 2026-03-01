// Sanitização de texto e URL.
export function sanitizeText(value, max = 500) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.slice(0, max);
}

export function cleanUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    const blocked = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    blocked.forEach((param) => url.searchParams.delete(param));
    return url.toString();
  } catch {
    return '';
  }
}

export function normalizeToken(value) {
  return sanitizeText(value, 200).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
