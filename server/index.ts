import { Loader } from './utils/transform'
import { resolveRoot } from './utils/path'
import { createServer } from './server'
import watch from './watch'
import fs from "fs"
import path from "path"

export const MEDIA_TYPES: Record<string, string> = {
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

export const loaderMap: Record<string, Loader> = {
    '.js': 'js',
    '.jsx': 'jsx',
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.css': 'css',
    '.json': 'json',
}

export const updateMap: Map<string, boolean> = new Map()

export const cachePath = __dirname
    .replace('dist', 'cache')
    .replace('server', '')

export const rootPath = resolveRoot()

require("assert")
require("assert/strict")
require("async_hooks")
require("buffer")

;(async function () {
    const server = await createServer()

    server.listen(3000)
})()

watch(rootPath, updateMap)

// open(`http://localhost:${PORT}`)
