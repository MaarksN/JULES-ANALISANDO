import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const CreateSessionSchema = z.object({
  summary: z.string().min(1),
  agent: z.string().min(1),
  status: z.string().min(1),
});

export class CreateSessionDto extends createZodDto(CreateSessionSchema) {}
