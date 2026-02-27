import { cleanUrl, sanitizeText } from '../utils/sanitize.js';

export async function searchArbeitnow(query, options = {}) {
  const url = new URL('https://arbeitnow.com/api/job-board-api');
  url.searchParams.set('search', query);
  if (options.page) url.searchParams.set('page', String(options.page));
  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Arbeitnow API: ${response.status}`);
  const data = await response.json();
  return (data.data || []).map((job) => ({
    id: `arbeitnow_${job.slug}`,
    title: sanitizeText(job.title, 140),
    company: sanitizeText(job.company_name, 120),
    location: sanitizeText(job.location, 120),
    url: cleanUrl(job.url),
    description: sanitizeText(job.description, 500),
    postedAt: job.created_at ? new Date(job.created_at * 1000).toISOString() : null,
    remote: Boolean(job.remote),
    site: 'arbeitnow',
    salary: null,
    tags: job.tags || []
  }));
}
