import { Loader } from './utils/transform'
import { resolveRoot, normalize } from './utils/path'
import { createHttpServer } from './server'
import path from 'path'
import { createWatcher } from './watcher'
import { Server } from 'http'
import WebSocket, { Server as WebSocketServer } from 'ws'
import { createWebsocketServer } from './wss'
import { FSWatcher } from 'chokidar'
import { preCreateServer } from './preCreateServer'

type HMRMessage = ConnectedMessage | ReloadMessage | UpdateMessage

interface ConnectedMessage {
  type: 'connected'
}

interface ReloadMessage {
  type: 'reload'
}

interface UpdateMessage {
  type: 'update'
  update: string
}

interface RapideConfig {
  plugins: RapidePlugin[]
  ESModuleMap: Map<string, string>
}

interface RapidePlugin {
  name: string
  transform:
    | ((code: string, codePath: string) => string)
    | ((code: string, codePath: string) => Promise<string>)
}

const MEDIA_TYPES: Record<string, string> = {
  '.md': 'text/markdown',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.json': 'application/json',
  '.map': 'application/json',
  '.txt': 'text/plain',
  '.ts': 'application/javascript',
  '.tsx': 'application/javascript',
  '.js': 'application/javascript',
  '.jsx': 'application/javascript',
  '.gz': 'application/gzip',
  '.css': 'application/javascript',
  '.wasm': 'application/wasm',
  '.mjs': 'application/javascript',
  '.svg': 'image/svg+xml'
}

const loaderMap: Record<string, Loader> = {
  '.js': 'js',
  '.jsx': 'jsx',
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.css': 'css',
  '.json': 'json'
}

interface CacheFile {
  content: string
  needUpdate: boolean
}

const cacheSet: Set<string> = new Set()

const cachePath = path.resolve(__dirname, 'cache')

const rootPath = resolveRoot()

class RapideServer {
  server: Server
  wss: WebSocketServer
  watcher: FSWatcher

  constructor(config: RapideConfig) {
    this.server = createHttpServer(config)
    this.wss = createWebsocketServer(this.server)
    this.watcher = createWatcher(rootPath)
    this.watcher.on('change', (filePath) => {
      const ext = path.extname(filePath)
      if (ext === '.jsx' || ext === '.tsx' || ext === '.css') {
        const currentTime = new Date().getTime()
        this.send({
          type: 'update',
          update: `${normalize(filePath)}/${currentTime}`
        })
        return
      }
      cacheSet.delete(filePath)
      this.send({ type: 'reload' })
    })
  }

  listen(port: number) {
    this.server.listen(port)
  }

  close() {
    this.server.close()
  }

  send(data: HMRMessage, wss = this.wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data))
      }
    })
  }
}

export {
  createHttpServer as createServer,
  cacheSet,
  cachePath,
  rootPath,
  loaderMap,
  MEDIA_TYPES,
  preCreateServer,
  RapideServer
}

export type { RapideConfig, RapidePlugin, HMRMessage }
