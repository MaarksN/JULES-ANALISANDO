import { normalizeToken } from '../utils/sanitize.js';

function splitKeywords(raw) {
  return String(raw || '').split(',').map((v) => normalizeToken(v)).filter(Boolean);
}

export function filterJobs(jobs, payload) {
  const include = splitKeywords(payload.includeKeywords);
  const exclude = splitKeywords(payload.excludeKeywords);

  return jobs.filter((job) => {
    if ((job.score || 0) < (payload.minScore || 0)) return false;
    if (payload.remoteOnly && !job.remote) return false;

    const text = normalizeToken(`${job.title} ${job.description} ${(job.tags || []).join(' ')}`);

    if (include.length && !include.every((kw) => text.includes(kw))) return false;
    if (exclude.length && exclude.some((kw) => text.includes(kw))) return false;

    return true;
  });
}
