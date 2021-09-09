import { Loader } from './utils/transform'
import { resolveRoot, normalize } from './utils/path'
import { createHttpServer } from './server'
import path = require('path')
import { createWatcher } from './watcher'
import { Server } from 'http'
import WebSocket = require('ws')
import { createWebsocketServer } from './wss'
import { FSWatcher } from 'chokidar'
import { preCreateServer } from './preCreateServer'
import { cyan, lightBlue } from './utils/color'
import { build } from './utils/build'

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
  port: number
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

const cacheSet: Set<string> = new Set()

const cachePath = path.resolve(__dirname, 'cache')

const rootPath = resolveRoot()

interface RapideServer {
  httpServer: Server
  port: number
  wss: WebSocket.Server
  watcher: FSWatcher
}

async function createServer(config: RapideConfig): Promise<RapideServer> {
  const { httpServer, port } = await createHttpServer(config)
  const wss = createWebsocketServer(httpServer)
  const watcher = createWatcher(rootPath)
  const send = (data: HMRMessage) => {
    // @ts-ignore
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data))
      }
    })
  }

  watcher.on('change', (filePath: string) => {
    const ext = path.extname(filePath)
    if (ext === '.jsx' || ext === '.tsx' || ext === '.css') {
      const currentTime = new Date().getTime()
      send({
        type: 'update',
        update: `${normalize(filePath)}/${currentTime}`
      })
      return
    }
    cacheSet.delete(filePath)
    send({ type: 'reload' })
  })
  return { httpServer, port, wss, watcher }
}

export {
  cacheSet,
  cachePath,
  rootPath,
  loaderMap,
  MEDIA_TYPES,
  preCreateServer,
  createServer,
  cyan,
  lightBlue,
  build
}

export type { RapideConfig, RapidePlugin, HMRMessage }
