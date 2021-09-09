import { Server } from 'http'
// @ts-ignore
import { WebSocketServer } from 'ws'

export function createWebsocketServer(server: Server) {
  return new WebSocketServer({ server })
}
