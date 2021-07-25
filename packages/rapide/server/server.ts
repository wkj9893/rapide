import http from 'http'
import path from 'path'
import {
    readFileBuffer,
    readFileString,
    writeFileString,
} from './utils/file'
import fs from 'fs'
import importAnalysis from './utils/importAnalysis'
import { esbuildTransform } from './utils/transform'
import { RapideConfig, cachePath, rootPath, MEDIA_TYPES, updateMap, loaderMap } from '.'

export function createHttpServer(config?: RapideConfig) {

    async function transform(code: string, ext: string, codePath: string): Promise<string> {
        let res = code
        if (ext === '.html') {
            res = res + '<script type="module" src="node_modules/rapide/client.js"></script>'
        } else {
            const loader = loaderMap[ext] ?? 'default'
            // console.log("extension", ext)
            // console.log("res", res)
            res = (await esbuildTransform(res, loader)).code
            console.log('wkj', res)
            if (
                ext === '.ts' ||
                ext === '.js' ||
                ext === '.tsx' ||
                ext === '.jsx'
            ) {
                res = await importAnalysis(res, codePath)
            }
        }

        if (config) {
            for (const plugin of config.plugins) {
                res = (await import(plugin)).transform(res, ext)
            }
        }
        return res
    }


    const server = http.createServer(async (req, res) => {
        let { url } = req
        if (!url) {
            res.writeHead(404)
            res.write(404)
            res.end()
            return
        }
        let subPath = ''
        // if url is '/' ,resolve to index.html
        if (url === '/') {
            subPath = 'index.html'
        }
        //  for path without extension resolve to html
        else if (!path.extname(url)) {
            subPath === path.resolve(url.slice(1), '.html')
        }
        //  client side code
        else if (url === '/node_modules/rapide/client.js') {
            res.writeHead(200, {
                'Content-Type': 'application/javascript',
            })
            return res.end(await readFileBuffer(path.resolve(__dirname, 'client.js')))
        }
        else {
            subPath = url.slice(1)
        }
        const codePath = path.resolve(rootPath, subPath)
        const cacheFilePath = path.resolve(cachePath, subPath)
        const ext = path.extname(codePath)

        if (fs.existsSync(cacheFilePath) && !updateMap.get(codePath)) {
            res.writeHead(200, {
                'Content-Type':
                    MEDIA_TYPES[ext] ?? 'text/plain',
            })
            return res.end(await readFileBuffer(cacheFilePath))
        }

        try {
            let code = await readFileString(codePath)
            code = await transform(code, ext, codePath)
            await writeFileString(cacheFilePath, code)
            updateMap.set(cacheFilePath, false)
            res.writeHead(200, {
                'Content-Type':
                    MEDIA_TYPES[ext] ?? 'text/plain',
            })
            return res.end(code)
        } catch (error) {
            res.writeHead(404)
            return res.end(error.message)
        }
    })
    return server
}
