const { Worker } = require('bullmq');
const Redis = require('ioredis');

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const emailWorker = new Worker('email', async job => {
  console.log('Processing email job:', job.id);
  // Mock email sending
  return { status: 'sent' };
}, { connection });

const enrichWorker = new Worker('enrich', async job => {
  console.log('Enriching lead:', job.data.leadId);
  // Mock API call to Clearbit
  return { company: 'Acme Inc', revenue: '10M' };
}, { connection });

const highPriorityWorker = new Worker('high-priority', async job => {
  console.log('Processing High Priority job:', job.id);
  // Fast track processing
}, { connection });

const ragWorker = new Worker('rag', async job => {
  console.log('Processing RAG Ingestion:', job.id);
  // In a real implementation, this would call VectorService via API or shared code
  // For now, it's a stub worker receiving file uploads
}, { connection });

console.log('Workers started: email, enrich, high-priority, rag');
