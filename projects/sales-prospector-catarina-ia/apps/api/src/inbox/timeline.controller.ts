import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Controller('timeline')
export class TimelineController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getTimeline(
    @Query('contactId') contactId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const validLimit = limit && limit > 0 ? limit : undefined;
    const validPage = page && page > 0 ? page : undefined;

    const take = validLimit;
    const skip = validPage && validLimit ? (validPage - 1) * validLimit : undefined;

    return this.prisma.communication.findMany({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }
}
