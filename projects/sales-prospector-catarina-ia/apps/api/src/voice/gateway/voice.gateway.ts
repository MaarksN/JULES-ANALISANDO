import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ namespace: "/voice", cors: true })
export class VoiceGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage("call:start")
  handleCallStart(client: Socket, payload: { phoneNumber: string }) {
    // Start XState machine instance
    client.emit("call:status", { status: "dialing" });
    // Mock connecting to VAPI/Twilio
    setTimeout(() => {
      client.emit("call:status", { status: "speaking" });
    }, 2000);
  }

  @SubscribeMessage("audio:chunk")
  handleAudio(client: Socket, payload: Buffer) {
    // Process audio buffer
  }
}
