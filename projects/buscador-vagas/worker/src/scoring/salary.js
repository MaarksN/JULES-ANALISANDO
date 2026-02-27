function parseCurrencyNumber(value) {
  const cleaned = String(value || '')
    .toLowerCase()
    .replace(/r\$|usd|\$/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .trim();

  const match = cleaned.match(/(\d+(?:\.\d+)?)(\s*k)?/i);
  if (!match) return null;
  const num = Number(match[1]);
  if (Number.isNaN(num)) return null;
  return match[2] ? num * 1000 : num;
}

function parseSalaryRange(raw) {
  const text = String(raw || '').toLowerCase();
  if (!text) return null;

  const between = text.match(/(\d[\d\.,k\s]*)\s*(?:-|a|até|to)\s*(\d[\d\.,k\s]*)/i);
  if (between) {
    return { min: parseCurrencyNumber(between[1]), max: parseCurrencyNumber(between[2]) };
  }

  const upTo = text.match(/(?:ate|até|up to)\s*(\d[\d\.,k\s]*)/i);
  if (upTo) {
    const max = parseCurrencyNumber(upTo[1]);
    return { min: null, max };
  }

  const direct = text.match(/(\d[\d\.,k\s]*)/);
  if (!direct) return null;
  const value = parseCurrencyNumber(direct[1]);
  return { min: value, max: value };
}

export function salaryScore(job, expectedSalaryRange) {
  const expected = expectedSalaryRange || {};
  if ((!expected.min && !expected.max) || !job?.salary) return 0;

  const parsed = parseSalaryRange(job.salary);
  if (!parsed || (!parsed.min && !parsed.max)) return 0;

  const jobMax = parsed.max || parsed.min;
  const jobMin = parsed.min || parsed.max;

  if (expected.max && jobMin > expected.max) return 10;
  if ((expected.min ? jobMax >= expected.min : true) && (expected.max ? jobMin <= expected.max : true)) return 5;
  if (expected.min && jobMax < expected.min) return -5;
  return 0;
}
