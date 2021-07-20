import { Loader } from './utils/transform'
import { resolveRoot } from './utils/path'
import { createHttpServer } from './server'
import path from 'path'
import { createWatcher } from './watcher'
import { Server } from 'http'
import WebSocket, { Server as WebSocketServer } from 'ws'
import { createWebsocketServer } from './wss'
import { FSWatcher } from 'chokidar'
import { HMRMessage } from '../client/index'
import { preCreateServer } from './preCreateServer'

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
    '.css': 'text/css',
    '.wasm': 'application/wasm',
    '.mjs': 'application/javascript',
    '.svg': 'image/svg+xml',
}

const loaderMap: Record<string, Loader> = {
    '.js': 'js',
    '.jsx': 'jsx',
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.css': 'css',
    '.json': 'json',
}

const updateMap: Map<string, boolean> = new Map()

const cachePath = path.resolve(__dirname, 'cache')

export const rootPath = resolveRoot()

class RapideServer {
    httpServer: Server
    wss: WebSocketServer
    watcher: FSWatcher
    updateMap: Map<string, boolean>

    constructor() {
        this.httpServer = createHttpServer()
        this.wss = createWebsocketServer(this.httpServer)
        this.watcher = createWatcher(rootPath)
        this.updateMap = new Map()
        this.watcher.on('change', filePath => {
            updateMap.set(filePath, true)
            console.log(updateMap)
            this.send({ type: 'reload' })
        })
    }

    listen(port: number) {
        this.httpServer.listen(port)
    }

    close() {
        this.httpServer.close()
    }

    send(data: HMRMessage, wss = this.wss) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data))
            }
        })
    }
}

export {
    createHttpServer as createServer,
    updateMap,
    cachePath,
    loaderMap,
    MEDIA_TYPES,
    preCreateServer,
    RapideServer,
}
