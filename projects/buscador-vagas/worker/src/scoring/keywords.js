import { normalizeToken } from '../utils/sanitize.js';

export function keywordScore(job, query) {
  const text = normalizeToken(`${job.title} ${job.description} ${job.tags?.join(' ')}`);
  const tokens = normalizeToken(query).split(/\s+/).filter(Boolean);
  const matches = tokens.filter((token) => text.includes(token)).length;
  return { matches, points: matches * 10 };
}
