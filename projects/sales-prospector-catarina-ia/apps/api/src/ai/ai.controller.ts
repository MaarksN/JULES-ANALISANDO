import { Controller, Post, Body, Sse } from "@nestjs/common";
import { AIGateway } from "./gateway/ai.gateway";
import { Observable } from "rxjs";

@Controller("ai")
export class AIController {
  constructor(private gateway: AIGateway) {}

  @Post("generate")
  async generate(@Body() body: { prompt: string }) {
    return { text: await this.gateway.generate(body.prompt) };
  }

  @Sse("stream")
  stream(@Body() body: { prompt: string }): Observable<MessageEvent> {
    return new Observable((observer) => {
      (async () => {
        try {
          for await (const chunk of this.gateway.stream(body.prompt)) {
            observer.next({ data: { text: chunk } } as MessageEvent);
          }
          observer.complete();
        } catch (e) {
          observer.error(e);
        }
      })();
    });
  }
}
