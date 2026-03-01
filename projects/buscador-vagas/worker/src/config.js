// Configurações centrais do Worker.
export const DEFAULT_VERSION = '5.1.0';

export const LIMITS = Object.freeze({
  queryMaxChars: 200,
  pageSizeDefault: 20,
  pageSizeMax: 50,
  locationsMax: 5,
  maxResultsPerSiteDefault: 10,
  cacheTtlSeconds: 300,
  rateLimitRequests: 10,
  rateLimitWindowSeconds: 60,
  scraperTimeoutMs: 5000,
  favoritesMaxItems: 200,
  favoriteTextMaxChars: 180
});

export const SITES = [
  { key: 'remotivo', name: 'Remotive' },
  { key: 'arbeitnow', name: 'Arbeitnow' },
  { key: 'gupy', name: 'Gupy' },
  { key: 'vagas', name: 'Vagas.com' },
  { key: 'indeed', name: 'Indeed' },
  { key: 'linkedin', name: 'LinkedIn' },
  { key: 'infojobs', name: 'InfoJobs' },
  { key: 'catho', name: 'Catho' }
];

export function getRuntimeConfig(env) {
  return {
    version: env.WORKER_VERSION || DEFAULT_VERSION,
    cacheTtlSeconds: Number(env.CACHE_TTL_SECONDS || LIMITS.cacheTtlSeconds),
    rateLimitRequests: Number(env.RATE_LIMIT_REQUESTS || LIMITS.rateLimitRequests),
    rateLimitWindowSeconds: Number(env.RATE_LIMIT_WINDOW_SECONDS || LIMITS.rateLimitWindowSeconds),
    scraperTimeoutMs: Number(env.SCRAPER_TIMEOUT_MS || LIMITS.scraperTimeoutMs)
  };
}

export function sampleRequest() {
  return {
    query: 'desenvolvedor react',
    locations: ['São Paulo', 'Remoto'],
    remoteOnly: false,
    seniority: 'pleno',
    contractType: 'clt',
    language: 'pt',
    includeKeywords: 'node,typescript',
    excludeKeywords: 'estágio',
    includeSites: 'remotivo,arbeitnow,gupy',
    excludeSites: '',
    minScore: 30,
    sortBy: 'score',
    sortDir: 'desc',
    page: 1,
    pageSize: 20,
    keywordLimit: 50
  };
}
