import { extraBoosts } from './boosts.js';
import { keywordScore } from './keywords.js';
import { locationScore } from './location.js';
import { recencyScore } from './recency.js';
import { salaryScore } from './salary.js';
import { seniorityScore } from './seniority.js';

export function scoreJob(job, payload) {
  const kw = keywordScore(job, payload.query);
  const location = locationScore(job.location, payload.locations || []);
  const recency = recencyScore(job.postedAt);
  const boosts = extraBoosts(job, payload);
  const seniority = seniorityScore(job, payload.seniority);
  const salary = salaryScore(job, payload.expectedSalaryRange);
  const score = Math.max(0, Math.min(100, kw.points + location + recency + boosts + seniority + salary));

  return {
    ...job,
    score,
    scoreBreakdown: {
      keywordMatches: kw.points,
      titleMatches: kw.matches,
      locationBoost: location,
      remoteBoost: job.remote ? 5 : 0,
      recencyBoost: recency,
      seniorityBoost: seniority,
      contractBoost: 0,
      salaryBoost: salary,
      includeBoost: boosts,
      excludePenalty: 0
    }
  };
}
