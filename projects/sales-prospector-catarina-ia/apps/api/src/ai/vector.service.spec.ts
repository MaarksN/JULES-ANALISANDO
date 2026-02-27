import { VectorService } from './vector.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';

// Mock dependencies before imports to avoid module resolution issues
jest.mock('@nestjs/common', () => ({
  Injectable: () => (target: any) => target,
  Inject: () => (target: any, key: any, index: any) => {},
}));

jest.mock('@nestjs/config', () => ({
  ConfigService: class {
    get(key: string) {
      if (key === 'GEMINI_API_KEY') return 'test-key';
      return null;
    }
  },
}));

jest.mock('@nestjs/cache-manager', () => ({
  CACHE_MANAGER: 'CACHE_MANAGER_TOKEN',
}));

jest.mock('../database/prisma.service', () => ({
  PrismaService: class {},
}));

// Mock Google Generative AI
const mockEmbedContent = jest.fn();
const mockGetGenerativeModel = jest.fn().mockReturnValue({
  embedContent: mockEmbedContent,
});
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

describe('VectorService', () => {
  let service: VectorService;
  let cacheManager: any;
  let prisma: PrismaService;
  let config: ConfigService;

  beforeEach(() => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };
    prisma = new PrismaService();
    config = new ConfigService();

    // Instantiate manually with mocked dependencies
    service = new VectorService(prisma, config, cacheManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEmbedding', () => {
    it('should check cache and return cached value if present', async () => {
      const text = 'test text';
      const cachedEmbedding = [0.1, 0.2, 0.3];

      cacheManager.get.mockResolvedValueOnce(cachedEmbedding);

      const result = await service.createEmbedding(text);

      expect(cacheManager.get).toHaveBeenCalled();
      expect(mockEmbedContent).not.toHaveBeenCalled();
      expect(result).toEqual(cachedEmbedding);
    });

    it('should call model and set cache if cache miss', async () => {
      const text = 'test text';
      const embedding = [0.1, 0.2, 0.3];

      mockEmbedContent.mockResolvedValueOnce({
        embedding: { values: embedding },
      });
      cacheManager.get.mockResolvedValueOnce(null);

      const result = await service.createEmbedding(text);

      expect(cacheManager.get).toHaveBeenCalled();
      expect(mockEmbedContent).toHaveBeenCalledWith(text);
      expect(cacheManager.set).toHaveBeenCalled();
      expect(result).toEqual(embedding);
    });
  });
});
