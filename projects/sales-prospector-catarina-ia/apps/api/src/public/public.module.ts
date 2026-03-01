import { Module } from "@nestjs/common";
import { PublicController } from "./public.controller";
import { PrismaService } from "../database/prisma.service";

@Module({
  controllers: [PublicController],
  providers: [PrismaService],
})
export class PublicModule {}
