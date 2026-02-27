import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { PrismaService } from '../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn().mockReturnValue({
  generateContent: mockGenerateContent,
});
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

describe('SalesService', () => {
  let service: SalesService;
  let cacheManager: any;
  let prismaService: any;
  let eventEmitter: any;

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    prismaService = {
      contact: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-key'),
          },
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    mockGenerateContent.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateText', () => {
    it('should return cached response if available', async () => {
      const prompt = 'test prompt';
      const cachedResponse = 'Cached response';
      cacheManager.get.mockResolvedValue(cachedResponse);

      const result = await service.generateText(prompt);

      expect(cacheManager.get).toHaveBeenCalled();
      expect(mockGenerateContent).not.toHaveBeenCalled();
      expect(result).toBe(cachedResponse);
    });

    it('should call API and cache response if not cached', async () => {
      const prompt = 'test prompt';
      const apiResponse = 'API response';
      cacheManager.get.mockResolvedValue(null);
      mockGenerateContent.mockResolvedValue({
        response: { text: () => apiResponse },
      });

      const result = await service.generateText(prompt);

      expect(cacheManager.get).toHaveBeenCalled();
      expect(mockGenerateContent).toHaveBeenCalledWith(prompt);
      expect(cacheManager.set).toHaveBeenCalledWith(expect.any(String), apiResponse, expect.any(Number));
      expect(result).toBe(apiResponse);
    });
  });

  describe('getLeads', () => {
    const orgId = 'org-123';
    const leads = [{ id: '1', name: 'Lead 1' }];

    it('should return cached leads if available', async () => {
      // Mock version lookup and then data lookup
      cacheManager.get.mockImplementation((key) => {
        if (key === `leads:${orgId}:version`) return Promise.resolve(0);
        if (key === `leads:${orgId}:v0:p1:l1000`) return Promise.resolve(leads);
        return Promise.resolve(null);
      });

      const result = await service.getLeads(orgId);

      expect(cacheManager.get).toHaveBeenCalledWith(`leads:${orgId}:version`);
      expect(cacheManager.get).toHaveBeenCalledWith(`leads:${orgId}:v0:p1:l1000`);
      expect(prismaService.contact.findMany).not.toHaveBeenCalled();
      expect(result).toBe(leads);
    });

    it('should fetch from DB and cache if not cached', async () => {
      cacheManager.get.mockResolvedValue(null);
      prismaService.contact.findMany.mockResolvedValue(leads);

      const result = await service.getLeads(orgId);

      expect(cacheManager.get).toHaveBeenCalledWith(`leads:${orgId}:version`);
      expect(cacheManager.get).toHaveBeenCalledWith(`leads:${orgId}:v0:p1:l1000`);
      expect(prismaService.contact.findMany).toHaveBeenCalledWith({
        where: { orgId },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 1000,
      });
      // 600000 = 10 minutes
      expect(cacheManager.set).toHaveBeenCalledWith(`leads:${orgId}:v0:p1:l1000`, leads, 600000);
      expect(result).toBe(leads);
    });
  });

  describe('createLead', () => {
    const orgId = 'org-123';
    const leadData = { name: 'New Lead' };
    const createdLead = { id: '2', ...leadData, orgId };

    it('should create lead and increment cache version', async () => {
      prismaService.contact.create.mockResolvedValue(createdLead);
      cacheManager.get.mockResolvedValue(1); // current version

      const result = await service.createLead(orgId, leadData);

      expect(prismaService.contact.create).toHaveBeenCalledWith({
        data: { ...leadData, orgId },
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('sales.lead.created', {
        leadId: createdLead.id,
        orgId,
      });
      expect(cacheManager.get).toHaveBeenCalledWith(`leads:${orgId}:version`);
      expect(cacheManager.set).toHaveBeenCalledWith(`leads:${orgId}:version`, 2, 86400000);
      expect(cacheManager.del).toHaveBeenCalledWith(`leads:${orgId}`);
      expect(result).toBe(createdLead);
    });
  });
});
