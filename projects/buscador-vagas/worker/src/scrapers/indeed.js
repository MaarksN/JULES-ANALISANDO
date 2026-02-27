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

function extractXmlTag(block, tag) {
  return block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1]?.trim() || null;
}

function decodeHtml(text) {
  return String(text || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractSalary(text) {
  const salary = decodeHtml(text).match(/((R\$|\$|USD)\s?\d[\d\.,kK\s]*(?:\-|a|to|até)?\s?\d*[\d\.,kK\s]*)/i)?.[1];
  return salary ? sanitizeText(salary, 80) : null;
}

function inferLocationFromDescription(description, fallback) {
  const loc = description.match(/(?:local|location)\s*:\s*([^\n\r.;]+)/i)?.[1];
  return sanitizeText(loc || fallback || 'Brasil', 120);
}

export async function searchIndeed(query, options = {}) {
  const timeout = withTimeoutSignal(4000);

  try {
    const safeQuery = normalizeQuery(query);
    const url = new URL('https://www.indeed.com/rss');
    url.searchParams.set('q', safeQuery);
    url.searchParams.set('l', options.locations?.[0] || options.location || 'Brasil');
    url.searchParams.set('sort', 'date');

    const response = await fetch(url.toString(), {
      headers: buildBaseHeaders({
        accept: 'application/rss+xml,application/xml,text/xml',
        referer: 'https://www.indeed.com/jobs'
      }),
      signal: timeout.signal
    });

    if (response.status === 429 || response.status === 503) {
      return { success: false, error: `Indeed indisponível (${response.status})`, results: [] };
    }

    if (!response.ok) throw new Error(`Indeed RSS: ${response.status}`);

    const xml = await response.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

    const jobs = items.map((item, index) => {
      const titleRaw = stripHtml(decodeHtml(extractXmlTag(item, 'title') || ''));
      const splitTitle = titleRaw.split(' - ').map((part) => part.trim()).filter(Boolean);
      const title = splitTitle[0] || titleRaw;
      const company = stripHtml(decodeHtml(extractXmlTag(item, 'source') || splitTitle[1] || 'Indeed'));
      const rawDescription = decodeHtml(extractXmlTag(item, 'description') || '');
      const description = ensureDescription(rawDescription, title);
      const pubDate = normalizeDate(extractXmlTag(item, 'pubDate'));
      const link = stripHtml(decodeHtml(extractXmlTag(item, 'link') || ''));
      const guid = stripHtml(decodeHtml(extractXmlTag(item, 'guid') || ''));
      const inferredLocation = splitTitle.length > 2 ? splitTitle.at(-1) : '';
      const location = inferLocationFromDescription(
        description,
        inferredLocation || options.locations?.[0] || options.location || 'Brasil'
      );
      const salary = extractSalary(`${titleRaw} ${rawDescription}`);
      const tags = ['indeed', ...inferTags(`${title} ${description}`)];

      return {
        id: `indeed_${guid || Date.now() + index}`,
        title: sanitizeText(title, 160),
        company: sanitizeText(company, 120),
        location,
        url: cleanUrl(link),
        description,
        postedAt: pubDate,
        remote: /remote|remoto|home office|work from home/i.test(`${title} ${location} ${description}`),
        site: 'indeed',
        salary,
        tags: [...new Set(tags)]
      };
    }).filter((job) => job.url && job.title).slice(0, options.maxResultsPerSite || 10);

    return { success: true, results: jobs, error: null };
  } catch (error) {
    if (String(error?.name || '').includes('Abort') || String(error).includes('timeout')) {
      return { success: false, error: 'Indeed timeout', results: [] };
    }
    return { success: false, error: error.message || 'Indeed erro inesperado', results: [] };
  } finally {
    timeout.clear();
  }
}
