import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AIProvider {
  generateText(prompt: string): Promise<string>;
  generateStream(prompt: string): AsyncGenerator<string>;
}

@Injectable()
export class GeminiAdapter implements AIProvider {
  private model: any;

  constructor(private config: ConfigService) {
    const genAI = new GoogleGenerativeAI(config.get("GEMINI_API_KEY")!);
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateText(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  async *generateStream(prompt: string): AsyncGenerator<string> {
    const result = await this.model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }
}

import { VectorService } from "../vector.service";

@Injectable()
export class AIGateway {
  private provider: AIProvider;

  constructor(
    private gemini: GeminiAdapter,
    private vectorService: VectorService,
  ) {
    this.provider = gemini;
  }

  async generate(prompt: string, orgId?: string) {
    let context = "";
    if (orgId) {
      try {
        const results = await this.vectorService.similaritySearch(
          prompt,
          orgId,
        );
        if (results.length > 0) {
          context = `CONTEXT:\n${results.map((r) => r.content).join("\n\n")}\n\n`;
        }
      } catch (e) {
        console.error("RAG Retrieval failed", e);
      }
    }

    return this.provider.generateText(context + prompt);
  }

  async *stream(prompt: string) {
    yield* this.provider.generateStream(prompt);
  }
}
