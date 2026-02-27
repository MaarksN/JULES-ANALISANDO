import { cleanUrl, sanitizeText } from '../utils/sanitize.js';

export async function searchRemotivo(query, options = {}) {
  const url = new URL('https://remotive.com/api/remote-jobs');
  url.searchParams.set('search', query);
  if (options.category) url.searchParams.set('category', options.category);
  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Remotivo API: ${response.status}`);
  const data = await response.json();
  return (data.jobs || []).map((raw) => ({
    id: `remotivo_${raw.id}`,
    title: sanitizeText(raw.title, 140),
    company: sanitizeText(raw.company_name, 120),
    location: sanitizeText(raw.candidate_required_location || 'Remoto', 120),
    url: cleanUrl(raw.url),
    description: sanitizeText(raw.description, 500),
    postedAt: raw.publication_date || null,
    remote: true,
    site: 'remotivo',
    salary: raw.salary || null,
    tags: raw.tags || []
  }));
}
