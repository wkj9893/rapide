import { Server } from 'http'
import { Server as WebSocketServer } from 'ws'

export function createWebsocketServer(server: Server) {
    return new WebSocketServer({ server })
}
