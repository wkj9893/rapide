import { Server } from 'http'
// @ts-ignore:need new types/ws
import { WebSocketServer } from 'ws'

export function createWebsocketServer(server: Server) {
  return new WebSocketServer({ server })
}
