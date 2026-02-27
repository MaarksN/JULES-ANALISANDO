import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';

@Injectable()
export class VectorService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
    }
  }

  async createEmbedding(text: string): Promise<number[]> {
    if (!this.model) return new Array(768).fill(0); // Mock if no key

    // ⚡ Bolt Optimization: Cache embedding result using SHA-256 hash of text
    const hash = crypto.createHash('sha256').update(text).digest('hex');
    const cacheKey = `embedding:${hash}`;

    try {
      const cached = await this.cacheManager.get<number[]>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (e) {
      // Fail open on cache error
      console.warn('Cache error:', e);
    }

    const result = await this.model.embedContent(text);
    const embedding = result.embedding.values;

    try {
      // Cache for 1 hour (3600000 ms)
      await this.cacheManager.set(cacheKey, embedding, 3600000);
    } catch (e) {
      console.warn('Cache set error:', e);
    }

    return embedding;
  }

  async storeDocument(orgId: string, title: string, content: string) {
    const embedding = await this.createEmbedding(content);
    const vectorString = `[${embedding.join(',')}]`;

    // Transaction to store Document and Embedding
    return this.prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          orgId,
          title,
          content,
        }
      });

      // Use raw query for pgvector insertion
      await tx.$executeRaw`
        INSERT INTO "Embedding" ("id", "documentId", "chunk", "vector")
        VALUES (gen_random_uuid(), ${doc.id}, ${content.substring(0, 100)}, ${vectorString}::vector)
      `;

      return doc;
    });
  }

  async similaritySearch(query: string, orgId: string, limit = 3) {
    const embedding = await this.createEmbedding(query);
    const vectorString = `[${embedding.join(',')}]`;

    // Query pgvector
    const results = await this.prisma.$queryRaw`
      SELECT d.content, 1 - (e.vector <=> ${vectorString}::vector) as similarity
      FROM "Embedding" e
      JOIN "Document" d ON e."documentId" = d.id
      WHERE d."orgId" = ${orgId}
      ORDER BY e.vector <=> ${vectorString}::vector
      LIMIT ${limit}
    `;

    return results as any[];
  }
}
