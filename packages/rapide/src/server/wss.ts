import { Server } from "http";
import { WebSocketServer } from "ws";

export function createWebsocketServer(server: Server) {
  return new WebSocketServer({ server });
}
