import { normalizeToken } from '../utils/sanitize.js';

const MAP = {
  junior: ['jr', 'junior', 'entry', 'trainee'],
  pleno: ['mid', 'pleno', 'intermediario', 'intermediário'],
  senior: ['sr', 'senior', 'staff', 'lead'],
  any: null
};

function inferSeniority(job) {
  const text = normalizeToken(`${job.title || ''} ${job.description || ''}`);
  if (MAP.senior.some((token) => text.includes(token))) return 'senior';
  if (MAP.pleno.some((token) => text.includes(token))) return 'pleno';
  if (MAP.junior.some((token) => text.includes(token))) return 'junior';
  return 'unknown';
}

export function seniorityScore(job, requestedSeniority = 'any') {
  const requested = normalizeToken(requestedSeniority || 'any');
  if (requested === 'any' || !MAP[requested]) return 0;

  const inferred = inferSeniority(job);
  if (inferred === requested) return 15;
  if (inferred === 'unknown') return 0;
  return -20;
}
