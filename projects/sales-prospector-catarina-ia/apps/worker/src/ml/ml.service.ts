export const calculatePropensity = (lead: any) => {
  // Simple heuristic: Score = 0-100
  // Factors: Email domain, Title, Interaction count
  let score = 50; // Base
  if (lead.email && !lead.email.includes("gmail.com")) score += 20; // B2B domain
  if (lead.title && lead.title.includes("CTO")) score += 15;
  return Math.min(100, score);
};
