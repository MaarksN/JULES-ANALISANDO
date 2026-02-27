
const { performance } = require('perf_hooks');

// Mock data generator
const generateContacts = (count) => {
  const contacts = [];
  for (let i = 0; i < count; i++) {
    contacts.push({
      id: `contact-${i}`,
      orgId: 'org-1',
      name: `Contact ${i}`,
      email: `contact${i}@example.com`,
      createdAt: new Date(),
      updatedAt: new Date(),
      score: Math.floor(Math.random() * 100),
      status: 'NEW',
    });
  }
  return contacts;
};

// Mock Prisma Service
class MockPrismaService {
  constructor(count) {
    console.log(`Generating ${count} mock contacts...`);
    this.contacts = generateContacts(count);
    console.log('Mock data ready.');
  }

  async findMany(args) {
    // Simulate DB latency
    await new Promise(resolve => setTimeout(resolve, 5));

    if (args.skip !== undefined && args.take !== undefined) {
      // Simulate index scan: O(1) or O(log N) + K
      // We assume the DB uses the @@index([orgId, createdAt]) to jump to the right spot
      return this.contacts.slice(args.skip, args.skip + args.take);
    }

    // Simulate full table scan/filter: O(N)
    return this.contacts.filter(c => c.orgId === args.where.orgId);
  }
}

async function runBenchmark() {
  const TOTAL_CONTACTS = 1000000;
  const prisma = new MockPrismaService(TOTAL_CONTACTS);

  // Baseline: Fetch All
  console.log('\n--- Baseline: Fetch All ---');
  const startAll = performance.now();
  const allContacts = await prisma.findMany({
    where: { orgId: 'org-1' },
    orderBy: { createdAt: 'desc' }
  });
  const endAll = performance.now();
  console.log(`Fetched ${allContacts.length} contacts.`);
  console.log(`Time taken: ${(endAll - startAll).toFixed(2)} ms`);

  if (global.gc) {
      global.gc();
  }

  // Optimized: Fetch Page (50)
  console.log('\n--- Optimized: Pagination (Take 50) ---');
  const startPage = performance.now();
  const pageContacts = await prisma.findMany({
    where: { orgId: 'org-1' },
    orderBy: { createdAt: 'desc' },
    skip: 0,
    take: 50
  });
  const endPage = performance.now();
  console.log(`Fetched ${pageContacts.length} contacts.`);
  console.log(`Time taken: ${(endPage - startPage).toFixed(2)} ms`);

  const improvement = (endAll - startAll) / (endPage - startPage);
  console.log(`\nSpeedup Factor: ${improvement.toFixed(1)}x`);
}

runBenchmark().catch(console.error);
