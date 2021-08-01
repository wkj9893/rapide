import { Loader } from './utils/transform'
import { resolveRoot } from './utils/path'
import { createHttpServer, transform } from './server'
import path from 'path'
import { createWatcher } from './watcher'
import { Server } from 'http'
import WebSocket, { Server as WebSocketServer } from 'ws'
import { createWebsocketServer } from './wss'
import { FSWatcher } from 'chokidar'
import { HMRMessage } from '../client/index'
import { preCreateServer } from './preCreateServer'

export interface RapideConfig {
    plugins: RapidePlugin[]
}

export interface RapidePlugin {
    name: string
    transform: ((code: string, codePath: string) => string) | ((code: string, codePath: string) => Promise<string>)
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

    constructor(config: RapideConfig) {
        this.httpServer = createHttpServer(config)
        this.wss = createWebsocketServer(this.httpServer)
        this.watcher = createWatcher(rootPath)
        this.updateMap = new Map()
        this.watcher.on('change', filePath => {
            if (filePath.includes('App.tsx')) {
                const currentTime = new Date().getTime()
                this.send({ type: 'update', update: `/App.tsx/${currentTime}` })
                return
            }
            updateMap.set(filePath, true)
            // updateMap.set(filePath, false)
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
