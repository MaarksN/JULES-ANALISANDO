import { Test, TestingModule } from '@nestjs/testing';
import { PlaybookController } from './playbooks.controller';
import { AIGateway } from '../ai/gateway/ai.gateway';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('PlaybookController Benchmark', () => {
  let controller: PlaybookController;
  const cacheStore = new Map<string, any>();

  const mockCacheManager = {
    get: jest.fn().mockImplementation((key) => Promise.resolve(cacheStore.get(key))),
    set: jest.fn().mockImplementation((key, value) => {
      cacheStore.set(key, value);
      return Promise.resolve();
    }),
  };

  const mockAIGateway = {
    generate: jest.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate 500ms delay
      return 'Generated Playbook Content';
    }),
  };

  beforeEach(async () => {
    cacheStore.clear();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaybookController],
      providers: [
        {
          provide: AIGateway,
          useValue: mockAIGateway,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<PlaybookController>(PlaybookController);
  });

  it('should measure execution time of generatePlaybook and verify caching', async () => {
    const body = { goal: 'increase sales', industry: 'tech' };

    const start1 = Date.now();
    await controller.generatePlaybook(body);
    const duration1 = Date.now() - start1;

    console.log(`First call duration: ${duration1}ms`);

    const start2 = Date.now();
    await controller.generatePlaybook(body);
    const duration2 = Date.now() - start2;

    console.log(`Second call duration: ${duration2}ms`);

    expect(duration1).toBeGreaterThanOrEqual(490); // Allow some small margin
    expect(duration2).toBeLessThan(100); // Should be very fast
  });
});
