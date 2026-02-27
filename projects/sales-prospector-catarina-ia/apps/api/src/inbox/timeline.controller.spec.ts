import { Test, TestingModule } from '@nestjs/testing';
import { TimelineController } from './timeline.controller';
import { PrismaService } from '../database/prisma.service';

describe('TimelineController', () => {
  let controller: TimelineController;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimelineController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            communication: {
              findMany: jest.fn().mockResolvedValue([]),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<TimelineController>(TimelineController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should return all communications if no page/limit provided', async () => {
    const contactId = '123';
    // @ts-ignore
    await controller.getTimeline(contactId);
    expect(prismaService.communication.findMany).toHaveBeenCalledWith({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
      take: undefined,
      skip: undefined,
    });
  });

  it('should paginate if valid page and limit are provided', async () => {
    const contactId = '123';
    await controller.getTimeline(contactId, 2, 50);
    expect(prismaService.communication.findMany).toHaveBeenCalledWith({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      skip: 50,
    });
  });

  it('should handle negative inputs by ignoring them (fallback to default/first page)', async () => {
    const contactId = '123';
    // Case 1: Negative limit -> fetch all
    await controller.getTimeline(contactId, 1, -10);
    expect(prismaService.communication.findMany).toHaveBeenCalledWith({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
      take: undefined,
      skip: undefined,
    });

    // Case 2: Negative page, valid limit -> fetch first page
    await controller.getTimeline(contactId, -5, 20);
    expect(prismaService.communication.findMany).toHaveBeenCalledWith({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: undefined, // undefined skip means start from 0
    });
  });
});
