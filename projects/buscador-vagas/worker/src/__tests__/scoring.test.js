import { describe, expect, it, vi } from 'vitest';

import { filterJobs } from '../filters/index.js';
import { scoreJob } from '../scoring/index.js';
import { seniorityScore } from '../scoring/seniority.js';
import { dedupeJobs } from '../utils/dedupe.js';

vi.mock('../scrapers/index.js', () => ({
  runAllScrapers: vi.fn(async () => ([
    {
      site: 'linkedin',
      success: true,
      results: [{
        id: 'lk_1',
        title: 'Desenvolvedor Senior Node',
        company: 'ACME',
        location: 'Remoto',
        url: 'https://example.com/jobs/1',
        description: 'Node.js e cloud',
        postedAt: new Date().toISOString(),
        remote: true,
        site: 'linkedin',
        salary: 'R$ 8.000 - R$ 12.000',
        tags: ['node']
      }]
    }
  ]))
}));

describe('scoring and filtering', () => {
  it('scoreJob com payload completo retorna score entre 0-100', () => {
    const scored = scoreJob({
      id: '1',
      title: 'Desenvolvedor Senior Node',
      company: 'ACME',
      location: 'Remoto',
      url: 'https://example.com/jobs/1',
      description: 'Node.js, AWS, remoto',
      postedAt: new Date().toISOString(),
      remote: true,
      site: 'linkedin',
      salary: 'R$ 8.000 - R$ 12.000',
      tags: ['node', 'aws']
    }, {
      query: 'desenvolvedor node',
      locations: ['Remoto'],
      remoteOnly: true,
      seniority: 'senior',
      expectedSalaryRange: { min: 7000, max: 12000 },
      language: 'pt'
    });

    expect(scored.score).toBeGreaterThanOrEqual(0);
    expect(scored.score).toBeLessThanOrEqual(100);
  });

  it('dedupeJobs com URLs idênticas retorna item único', () => {
    const deduped = dedupeJobs([
      { url: 'https://example.com/jobs/1', title: 'Dev', score: 10 },
      { url: 'https://example.com/jobs/1', title: 'Dev', score: 20 }
    ]);
    expect(deduped).toHaveLength(1);
    expect(deduped[0].score).toBe(20);
  });

  it('filterJobs com remoteOnly=true exclui vagas presenciais', () => {
    const filtered = filterJobs([
      { id: '1', remote: true, score: 50, title: 'A', description: '' },
      { id: '2', remote: false, score: 80, title: 'B', description: '' }
    ], { remoteOnly: true, minScore: 0, excludeKeywords: '' });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('seniorityScore retorna -20 para mismatch e +15 para match', () => {
    const mismatch = seniorityScore({ title: 'Desenvolvedor Junior', description: '' }, 'senior');
    const match = seniorityScore({ title: 'Engenheiro Senior', description: '' }, 'senior');

    expect(mismatch).toBe(-20);
    expect(match).toBe(15);
  });
});
