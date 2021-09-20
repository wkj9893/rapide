import http = require('http')
import path = require('path')
import fs = require('fs')
import { readFile } from 'fs/promises'
import importAnalysis from './utils/importAnalysis'
import { esbuildTransform } from './utils/transform'
import { lightBlue } from './utils/color'
import {
  RapideConfig,
  rootPath,
  cacheSet,
  loaderMap,
  cachePath,
  getContentType
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
      '<script type="module" src="/node_modules/rapide/client.js"></script>'
  }

  const loader = loaderMap.get(ext)
  if (loader) {
    code = (await esbuildTransform(code, loader)).code
  }
  for (const plugin of config.plugins) {
    code = await require(plugin).default().transform(code, codePath)
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

export async function createHttpServer(config: RapideConfig) {
  const urls = new Set()
  const server = http.createServer(async (req, res) => {
    const { url } = req
    if (!url) {
      return res.writeHead(404).end()
    }
    // handle /index.css/1628048939939
    const temp = url.split('/')
    temp.pop()
    if (urls.has(temp.join('/'))) {
      const codePath = path.resolve(rootPath, temp.join('/').slice(1))
      let code = await readFile(codePath, 'utf-8')
      code = await transform(code, codePath, config)
      return res
        .writeHead(200, {
          'Content-Type': getContentType(path.extname(codePath)),
          'Cache-Control': 'no-cache',
          ETag: `"${Date.now()}"`
        })
        .end(code)
    }

    urls.add(url)
    let subPath = ''
    // if url is '/' ,resolve to index.html
    if (url === '/') {
      subPath = 'index.html'
    }
    //  for path without extension resolve to html
    else if (!path.extname(url)) {
      subPath = url.slice(1) + '.html'
    } else {
      subPath = url.slice(1)
    }
    const ext = path.extname(subPath)
    const codePath = path.resolve(rootPath, subPath)
    const cacheFilePath =
      url === '/node_modules/rapide/client.js'
        ? path.resolve(__dirname, 'client.js')
        : path.resolve(cachePath, subPath)

    if (cacheSet.has(codePath) && req.headers['if-none-match']) {
      return res.writeHead(304).end()
    }

    //  node_modules cache files or client code
    if (fs.existsSync(cacheFilePath)) {
      const content = await readFile(cacheFilePath)
      cacheSet.add(codePath)
      return res
        .writeHead(200, {
          'Content-Type': getContentType(ext),
          'Cache-Control': 'no-cache',
          ETag: `"${Date.now()}"`
        })
        .end(content)
    }
    if (!fs.existsSync(codePath)) {
      return res.writeHead(404).end(`<h2>${codePath} not found</h2>`)
    }
    try {
      let code = await readFile(codePath, 'utf-8')
      code = await transform(code, codePath, config)
      cacheSet.add(codePath)
      return res
        .writeHead(200, {
          'Content-Type': getContentType(ext),
          'Cache-Control': 'no-cache',
          ETag: `"${Date.now()}"`
        })
        .end(code)
    } catch (err) {
      if (err instanceof Error) {
        return res.writeHead(404).end(err.message)
      }
    }
  })
  let { port } = config
  await new Promise((resolve, reject) => {
    server.on('error', (e: Error & { code: string }) => {
      if (e.code === 'EADDRINUSE') {
        console.log(
          '\nAddress ' +
            lightBlue(`http://localhost:${port}`) +
            ' in use, retrying ' +
            lightBlue(`http://localhost:${port + 1}`) +
            '...'
        )
        server.close()
        server.listen(++port)
      } else {
        reject(e)
      }
    })
    server.listen(port)
    server.on('listening', resolve)
  })
  return { httpServer: server, port }
}
