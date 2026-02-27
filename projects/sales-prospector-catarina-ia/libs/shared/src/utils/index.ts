export const calculateTokens = (text: string): number => {
  // Simple approximation: 1 token ~= 4 chars
  return Math.ceil(text.length / 4);
};
