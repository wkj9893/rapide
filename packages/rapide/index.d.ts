/// <reference types="node" />
/// <reference types="ws" />
import { Server } from 'http'
import WebSocket = require('ws')
import { FSWatcher } from 'chokidar'

interface RapideConfig {
  plugins: RapidePlugin[]
  ESModuleMap: Map<string, string>
  port: number
}
interface RapidePlugin {
  name: string
  transform:
    | ((code: string, codePath: string) => string)
    | ((code: string, codePath: string) => Promise<string>)
}

interface RapideServer {
  httpServer: Server
  port: number
  wss: WebSocket.Server
  watcher: FSWatcher
}
declare function createServer(config: RapideConfig): Promise<RapideServer>
