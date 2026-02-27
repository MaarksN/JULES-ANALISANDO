import { cleanUrl, sanitizeText } from '../utils/sanitize.js';
import {
  buildBaseHeaders,
  ensureDescription,
  inferTags,
  normalizeDate,
  normalizeQuery,
  stripHtml,
  withTimeoutSignal
} from './shared.js';

function parsePostedAt(cardHtml) {
  const absolute = cardHtml.match(/<time[^>]*datetime="([^"]+)"/i)?.[1];
  if (absolute) return normalizeDate(absolute);

  const relative = stripHtml(cardHtml.match(/<time[^>]*>([^<]+)<\/time>/i)?.[1] || '');
  const days = relative.match(/(\d+)\s*d/i)?.[1];
  if (days) return new Date(Date.now() - (Number(days) * 24 * 60 * 60 * 1000)).toISOString();
  return null;
}

function parseLinkedinCard(cardHtml, index) {
  const title = cardHtml.match(/<h3[^>]*base-search-card__title[^>]*>([\s\S]*?)<\/h3>/i)?.[1];
  const company = cardHtml.match(/<h4[^>]*base-search-card__subtitle[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i)?.[1]
    || cardHtml.match(/<h4[^>]*base-search-card__subtitle[^>]*>([\s\S]*?)<\/h4>/i)?.[1];
  const location = cardHtml.match(/<span[^>]*job-search-card__location[^>]*>([\s\S]*?)<\/span>/i)?.[1];
  const url = cardHtml.match(/<a[^>]*base-card__full-link[^>]*href="([^"]+)"/i)?.[1]
    || cardHtml.match(/<a[^>]*href="([^"]*\/jobs\/view\/[^"]+)"/i)?.[1];
  const id = cardHtml.match(/data-entity-urn="urn:li:jobPosting:(\d+)"/i)?.[1]
    || cardHtml.match(/currentJobId=(\d+)/i)?.[1]
    || cardHtml.match(/\/jobs\/view\/(\d+)/i)?.[1];
  const snippet = cardHtml.match(/<p[^>]*base-search-card__metadata[^>]*>([\s\S]*?)<\/p>/i)?.[1]
    || cardHtml.match(/<span[^>]*job-search-card__snippet[^>]*>([\s\S]*?)<\/span>/i)?.[1]
    || '';

  const normalizedUrl = !url ? '' : (url.startsWith('http') ? url : `https://www.linkedin.com${url}`);
  const titleText = sanitizeText(stripHtml(title), 160);
  const description = ensureDescription(snippet, titleText);
  const tags = ['linkedin', ...inferTags(`${titleText} ${description}`)];

  return {
    id: id ? `linkedin_${id}` : `linkedin_fallback_${Date.now()}_${index}`,
    title: titleText,
    company: sanitizeText(stripHtml(company), 120),
    location: sanitizeText(stripHtml(location) || 'Remoto', 120),
    url: cleanUrl(normalizedUrl),
    description,
    postedAt: parsePostedAt(cardHtml),
    remote: /remote|remoto|anywhere|home office/i.test(`${location || ''} ${titleText} ${description}`),
    site: 'linkedin',
    salary: null,
    tags: [...new Set(tags)]
  };
}

export async function searchLinkedin(query, options = {}) {
  const timeout = withTimeoutSignal(4000);

  try {
    const safeQuery = normalizeQuery(query);
    const url = new URL('https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search');
    url.searchParams.set('keywords', safeQuery);
    url.searchParams.set('location', options.locations?.[0] || options.location || 'Brasil');
    url.searchParams.set('start', String(Math.max(0, ((Number(options.page || 1) - 1) * Number(options.maxResultsPerSite || 10)))));

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: buildBaseHeaders({
        accept: 'text/html,application/xhtml+xml',
        referer: 'https://www.linkedin.com/jobs/search/'
      }),
      signal: timeout.signal
    });

    if (response.status === 429 || response.status === 503) {
      return { success: false, error: `LinkedIn indisponível (${response.status})`, results: [] };
    }

    if (!response.ok) throw new Error(`LinkedIn API: ${response.status}`);

    const html = await response.text();
    const cards = html.match(/<li[\s\S]*?<\/li>/gi) || [];
    const jobs = cards
      .map((card, index) => parseLinkedinCard(card, index))
      .filter((job) => job.url && job.title)
      .slice(0, options.maxResultsPerSite || 10);

    return { success: true, results: jobs, error: null };
  } catch (error) {
    if (String(error?.name || '').includes('Abort') || String(error).includes('timeout')) {
      return { success: false, error: 'LinkedIn timeout', results: [] };
    }
    return { success: false, error: error.message || 'LinkedIn erro inesperado', results: [] };
  } finally {
    timeout.clear();
  }
}
