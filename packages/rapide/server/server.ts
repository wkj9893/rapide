import http from 'http'
import path from 'path'
import {
    readFileBuffer,
    readFileString,
    writeFileString,
    copyFile,
} from './utils/file'
import fs from 'fs'
import importAnalysis from './utils/importAnalysis'
import transform from './utils/transform'
import { cachePath, rootPath, MEDIA_TYPES, updateMap, loaderMap } from '.'

export function createHttpServer() {
    const server = http.createServer(async (req, res) => {
        let { url } = req
        if (!url) {
            res.writeHead(404)
            res.write(404)
            res.end()
            return
        }

        //  page
        if (!path.extname(url)) {
            //  index.html
            if (url === '/') {
                const cacheFilePath = path.resolve(cachePath, 'index.html')
                if (fs.existsSync(cacheFilePath)) {
                    const data =
                        (await readFileString(cacheFilePath)) +
                        `<script type="module" src="node_modules/rapide/client.js"></script>`
                    res.writeHead(200, {
                        'Content-Type': 'text/html',
                    })
                    return res.end(data)
                }
                try {
                    await copyFile(
                        path.resolve(rootPath, 'index.html'),
                        cacheFilePath
                    )
                    const data =
                        (await readFileString(cacheFilePath)) +
                        `<script type="module" src="node_modules/rapide/client.js"></script>`
                    res.writeHead(200, {
                        'Content-Type': 'text/html',
                    })
                    return res.end(data)
                } catch (error) {
                    res.writeHead(404)
                    return res.end(error.message)
                }
            }
        }

        const cacheFilePath = path.join(cachePath, url)
        const codePath = path.join(rootPath, url)

        if (fs.existsSync(cacheFilePath) && !updateMap.get(codePath)) {
            const data = await readFileBuffer(cacheFilePath)
            res.writeHead(200, {
                'Content-Type':
                    MEDIA_TYPES[path.extname(cacheFilePath)] ?? 'text/plain',
            })
            return res.end(data)
        }

        try {
            let code = await readFileString(codePath)
            const ext = path.extname(codePath)
            const loader = loaderMap[ext] ?? 'default'
            code = (await transform(code, loader)).code
            if (
                ext === '.ts' ||
                ext === '.js' ||
                ext === '.tsx' ||
                ext === '.jsx'
            ) {
                code = await importAnalysis(code, codePath)
            }
            await writeFileString(cacheFilePath, code)
            updateMap.set(cacheFilePath, false)
            const data = await readFileBuffer(cacheFilePath)
            res.writeHead(200, {
                'Content-Type':
                    MEDIA_TYPES[path.extname(cacheFilePath)] ?? 'text/plain',
            })
            return res.end(data)
        } catch (error) {
            res.writeHead(404)
            return res.end(error.message)
        }
    })
    return server
}
