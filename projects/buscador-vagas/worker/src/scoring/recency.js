export function recencyScore(postedAt) {
  if (!postedAt) return 0;
  const ageDays = (Date.now() - new Date(postedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 3) return 20;
  if (ageDays <= 7) return 12;
  if (ageDays <= 30) return 5;
  return 0;
}
