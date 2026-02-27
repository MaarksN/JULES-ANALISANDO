export function extraBoosts(job, payload) {
  let points = 0;
  if (job.remote && payload.remoteOnly) points += 10;
  if (payload.language === 'en' && /english|international/i.test(job.description || '')) points += 5;
  return points;
}
