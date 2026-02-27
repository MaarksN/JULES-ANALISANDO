import { normalizeToken } from '../utils/sanitize.js';

export function locationScore(jobLocation, locations = []) {
  const current = normalizeToken(jobLocation || '');
  return locations.some((loc) => current.includes(normalizeToken(loc))) ? 15 : 0;
}
