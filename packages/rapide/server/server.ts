import http from 'http'
import path from 'path'
import { readFileBuffer, readFileString, writeFileString } from './utils/file'
import fs from 'fs'
import importAnalysis from './utils/importAnalysis'
import { esbuildTransform } from './utils/transform'
import {
    RapideConfig,
    cachePath,
    rootPath,
    MEDIA_TYPES,
    updateMap,
    loaderMap,
} from '.'

export async function transform(
    code: string,
    codePath: string,
    config: RapideConfig
): Promise<string> {
    const ext = path.extname(codePath)
    if (ext === '.html') {
        code +=
            '<script type="module" src="node_modules/rapide/client.js"></script>'
    }

    if (loaderMap[ext]) {
        code = (await esbuildTransform(code, loaderMap[ext])).code
    }

    for (const plugin of config.plugins) {
        code = await plugin.transform(code, codePath)
    }

    if (ext === '.ts' || ext === '.js' || ext === '.tsx' || ext === '.jsx') {
        code = await importAnalysis(code, codePath)
        if (ext === '.jsx' || ext === '.tsx') {
            code =
                `import {createHotContext} from '/node_modules/rapide/client.js';
            import.meta.hot = createHotContext(import.meta.url);` + code
        }
    }
    return code
}

export function createHttpServer(config: RapideConfig) {
    const server = http.createServer(async (req, res) => {
        let { url } = req
        if (url?.startsWith('/App.tsx')) {
            let code = await readFileString(path.resolve(rootPath, 'App.tsx'))
            code = await transform(
                code,
                path.resolve(rootPath, 'App.tsx'),
                config
            )
            res.writeHead(200, {
                'Content-Type': 'application/javascript',
            })
            return res.end(code)
        }

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
            return res.end(
                await readFileBuffer(path.resolve(__dirname, 'client.js'))
            )
        } else {
            subPath = url.slice(1)
        }
        const codePath = path.resolve(rootPath, subPath)
        const cacheFilePath = path.resolve(cachePath, subPath)
        const ext = path.extname(codePath)

        if (fs.existsSync(cacheFilePath) && !updateMap.get(codePath)) {
            res.writeHead(200, {
                'Content-Type': MEDIA_TYPES[ext] ?? 'text/plain',
            })
            return res.end(await readFileBuffer(cacheFilePath))
        }

        try {
            let code = await readFileString(codePath)
            code = await transform(code, codePath, config)
            await writeFileString(cacheFilePath, code)
            updateMap.set(cacheFilePath, false)
            res.writeHead(200, {
                'Content-Type': MEDIA_TYPES[ext] ?? 'text/plain',
            })
            return res.end(code)
        } catch (error) {
            res.writeHead(404)
            return res.end(error.message)
        }
    })
    return server
}
