import http from 'http'
import path from 'path'
import fs from 'fs'
import { readFile } from 'fs/promises'
import { writeFileString } from './utils/file'
import importAnalysis from './utils/importAnalysis'
import { esbuildTransform } from './utils/transform'
import {
  RapideConfig,
  cachePath,
  rootPath,
  MEDIA_TYPES,
  updateMap,
  loaderMap
} from '.'

export async function transform(
  code: string,
  codePath: string,
  config: RapideConfig
): Promise<string> {
  const ext = path.extname(codePath)
  if (ext === '.css') {
    return `import { createHotContext, updateStyle } from '/node_modules/rapide/client.js';
import.meta.hot = createHotContext(import.meta.url);
const id = ${JSON.stringify(codePath)};
const css = ${JSON.stringify(code)};
updateStyle(id,css);`
  }

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
    code = await importAnalysis(code, codePath, config.ESModuleMap)
    if (ext === '.jsx' || ext === '.tsx') {
      code =
        `import {createHotContext} from '/node_modules/rapide/client.js';
import.meta.hot = createHotContext(import.meta.url);\n` + code
    }
  }
  return code
}

export function createHttpServer(config: RapideConfig) {
  const urls = new Set()
  const server = http.createServer(async (req, res) => {
    let { url } = req
    if (!url) {
      res.writeHead(404)
      res.write(404)
      res.end()
      return
    }
    // handle /index.css/1628048939939
    const temp = url.split('/')
    temp.pop()
    if (urls.has(temp.join('/'))) {
      const codePath = path.resolve(rootPath, temp.join('/').slice(1))
      let code = await readFile(codePath, 'utf-8')
      code = await transform(code, codePath, config)
      res.writeHead(200, {
        'Content-Type': MEDIA_TYPES[path.extname(codePath)] ?? 'text/plain'
      })
      return res.end(code)
    }

    urls.add(url)
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
        'Content-Type': 'application/javascript'
      })
      return res.end(await readFile(path.resolve(__dirname, 'client.js')))
    } else {
      subPath = url.slice(1)
    }
    const ext = path.extname(subPath)
    const codePath = path.resolve(rootPath, subPath)
    const cacheFilePath = path.resolve(cachePath, subPath)

    if (fs.existsSync(cacheFilePath) && !updateMap.get(codePath)) {
      res.writeHead(200, {
        'Content-Type': MEDIA_TYPES[ext] ?? 'text/plain'
      })
      return res.end(await readFile(cacheFilePath))
    }

    try {
      let code = await readFile(codePath, 'utf-8')
      code = await transform(code, codePath, config)
      await writeFileString(cacheFilePath, code)
      updateMap.set(cacheFilePath, false)
      res.writeHead(200, {
        'Content-Type': MEDIA_TYPES[ext] ?? 'text/plain'
      })
      return res.end(code)
    } catch (error) {
      res.writeHead(404)
      return res.end(error.message)
    }
  })
  return server
}
