import { Controller, Post, Body, Req } from "@nestjs/common";
import { VectorService } from "../ai/vector.service";

@Controller("knowledge")
export class KnowledgeController {
  constructor(private vectorService: VectorService) {}

  @Post("add")
  async addDocument(
    @Body() body: { title: string; content: string },
    @Req() req,
  ) {
    const orgId = req.user?.companyId || "default_org"; // Mock auth for now
    await this.vectorService.storeDocument(orgId, body.title, body.content);
    return { status: "indexed" };
  }
}
