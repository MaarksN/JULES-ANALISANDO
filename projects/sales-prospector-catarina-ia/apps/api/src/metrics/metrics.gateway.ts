import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { Interval } from "@nestjs/schedule";
import { Injectable } from "@nestjs/common";

@WebSocketGateway({ namespace: "/metrics", cors: true })
@Injectable()
export class MetricsGateway {
  @WebSocketServer()
  server!: Server;

  // Mock broadcasting metrics every 5 seconds
  @Interval(5000)
  broadcastMetrics() {
    const metrics = {
      activeCalls: Math.floor(Math.random() * 10),
      cpuUsage: Math.floor(Math.random() * 100),
      memoryUsage: Math.floor(Math.random() * 1024),
    };
    this.server.emit("metrics:update", metrics);
  }
}
