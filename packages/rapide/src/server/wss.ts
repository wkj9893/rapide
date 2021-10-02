import { Server } from "http";
// @ts-ignore @types/ws
import { WebSocketServer } from "ws";

export function createWebsocketServer(server: Server) {
  return new WebSocketServer({ server });
}
