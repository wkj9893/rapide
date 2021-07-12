import { Loader } from './utils/transform'
import { resolveRoot } from './utils/path'
import { createServer } from './server'
import watch from './watch'

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

;(async function () {
    const server = await createServer()

    server.listen(3000)
})()

// const server = http.createServer(async (req, res) => {
//     let { url } = req
//     if (!url) {
//         res.writeHead(404)
//         res.write(404)
//         res.end()
//         return
//     }

//     //  page
//     if (!path.extname(url)) {
//         //  index.html
//         if (url === '/') {
//             const cacheFilePath = path.resolve(cachePath, 'index.html')
//             if (fs.existsSync(cacheFilePath)) {
//                 const data = await readFileBuffer(cacheFilePath)
//                 res.writeHead(200, {
//                     'Content-Type': 'text/html',
//                 })
//                 return res.end(data)
//             }
//             try {
//                 fs.copyFileSync(
//                     path.resolve(rootPath, 'index.html'),
//                     cacheFilePath
//                 )
//                 const data = await readFileBuffer(cacheFilePath)
//                 res.writeHead(200, {
//                     'Content-Type': 'text/html',
//                 })
//                 return res.end(data)
//             } catch (error) {
//                 res.writeHead(404)
//                 return res.end(error.message)
//             }
//         }
//     }

//     const cacheFilePath = path.join(cachePath, url)
//     const codePath = path.join(rootPath, url)
//     if (fs.existsSync(cacheFilePath) && !updateMap.get(codePath)) {
//         const data = await readFileBuffer(cacheFilePath)
//         res.writeHead(200, {
//             'Content-Type':
//                 MEDIA_TYPES[path.extname(cacheFilePath)] ?? 'text/plain',
//         })
//         return res.end(data)
//     }

//     try {
//         let code = await readFileString(path.join(rootPath, url))
//         const ext = path.extname(codePath)
//         if(ext === '.ts' || ext === '.js' ||ext === '.tsx' ||ext === '.jsx'){
//             code = await importAnalysis(code, codePath)
//         }
//         // console.log(code)
//         const loader = loaderMap[path.extname(codePath)] ?? 'default'
//         await writeFileString(
//             cacheFilePath,
//             (
//                 await transform(code, loader)
//             ).code
//         )
//         updateMap.set(cacheFilePath, false)
//         const data = await readFileBuffer(cacheFilePath)
//         res.writeHead(200, {
//             'Content-Type':
//                 MEDIA_TYPES[path.extname(cacheFilePath)] ?? 'text/plain',
//         })
//         return res.end(data)
//     } catch (error) {
//         res.writeHead(404)
//         return res.end(error.message)
//     }
// })

// const wss = new WebSocket.Server({ server })

// wss.on('connection', function connection(ws) {
//     ws.on('message', function incoming(message) {
//         console.log(`received: ${message}`)
//     })
// })

// const PORT = 3000

// server.listen(PORT)

watch(rootPath, updateMap)

// open(`http://localhost:${PORT}`)
