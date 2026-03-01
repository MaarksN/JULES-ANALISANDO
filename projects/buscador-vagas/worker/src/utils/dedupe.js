// Deduplicação determinística por fingerprint semântica.
import { normalizeToken } from './sanitize.js';

function fingerprint(job) {
  const urlPath = String(job.url || '').split('?')[0];
  const core = [job.title, job.company, job.location, urlPath].map((part) => normalizeToken(part)).join('|');
  return core;
}

export function dedupeJobs(jobs) {
  const map = new Map();
  jobs.forEach((job) => {
    const key = fingerprint(job);
    const current = map.get(key);
    if (!current || (job.score || 0) > (current.score || 0)) map.set(key, job);
  });
  return [...map.values()];
}
