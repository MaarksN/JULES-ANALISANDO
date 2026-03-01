import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

async function main() {
  const prisma = new PrismaClient();
  await prisma.$connect();

  console.log('Connected to database.');

  // Create temporary organization
  const org = await prisma.organization.create({
    data: {
      name: 'Benchmark Org',
      slug: `benchmark-org-${Date.now()}`,
    },
  });

  // Create temporary contact
  const contact = await prisma.contact.create({
    data: {
      orgId: org.id,
      name: 'Benchmark Contact',
      email: `benchmark-contact-${Date.now()}@example.com`,
    },
  });

  console.log(`Created Org: ${org.id}, Contact: ${contact.id}`);

  // Seed 10,000 communications
  console.log('Seeding 10,000 communications... this might take a moment.');
  const communicationsData = Array.from({ length: 10000 }).map((_, i) => ({
    id: crypto.randomUUID(),
    orgId: org.id,
    contactId: contact.id,
    type: 'EMAIL',
    direction: i % 2 === 0 ? 'INBOUND' : 'OUTBOUND',
    status: 'SENT',
    content: `Benchmark communication ${i}`,
    createdAt: new Date(Date.now() - i * 60000), // Spaced by 1 minute
  }));

  // Prisma createMany is faster
  await prisma.communication.createMany({
    data: communicationsData,
  });

  console.log('Seeding complete.');

  // Measure ALL
  console.log('Benchmarking Fetch ALL...');
  const startAll = performance.now();
  const all = await prisma.communication.findMany({
    where: { contactId: contact.id },
    orderBy: { createdAt: 'desc' },
  });
  const endAll = performance.now();
  console.log(`Fetched ${all.length} records in ${(endAll - startAll).toFixed(2)}ms`);

  // Measure PAGE 1 (50 items)
  console.log('Benchmarking Fetch Page 1 (Limit 50)...');
  const startPage = performance.now();
  const page = await prisma.communication.findMany({
    where: { contactId: contact.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    skip: 0,
  });
  const endPage = performance.now();
  console.log(`Fetched ${page.length} records in ${(endPage - startPage).toFixed(2)}ms`);

  // Cleanup
  console.log('Cleaning up...');
  await prisma.communication.deleteMany({
    where: { contactId: contact.id },
  });
  await prisma.contact.delete({
    where: { id: contact.id },
  });
  await prisma.organization.delete({
    where: { id: org.id },
  });

  console.log('Cleanup complete.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
