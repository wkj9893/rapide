import { Loader } from './utils/transform'
import { resolveRoot } from './utils/path'
import { createServer } from './server'
import path from "path"
import watch from './watch'

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

const cachePath = path.resolve(__dirname,'cache')

export const rootPath = resolveRoot()

export {createServer,watch,updateMap,cachePath,loaderMap,MEDIA_TYPES}

