import http from 'http'
import path from 'path'
import { readFileBuffer, readFileString, writeFileString } from './utils/file'
import fs from 'fs'
import importAnalysis from './utils/importAnalysis'
import transform from './utils/transform'
import buildFiles from './build'
import getExports from './utils/exports'
import { cachePath, rootPath, MEDIA_TYPES, updateMap, loaderMap } from '.'


export async function createServer() {
    fs.rmSync(cachePath, { recursive: true, force: true })
    fs.mkdirSync(cachePath, { recursive: true })
    const packageJsonPath = path.resolve(rootPath, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
        const dependencies = JSON.parse(
            fs.readFileSync(packageJsonPath, 'utf8')
        ).dependencies ?? {}
        const entryPoints = []
        const promises:Promise<void>[] = []
        for (const dependency of Object.keys(dependencies)) {
            const main =
                JSON.parse(
                    fs.readFileSync(
                        path.resolve(
                            rootPath,
                            `node_modules/${dependency}/package.json`
                        ),
                        'utf8'
                    )
                ).main ?? 'index.js'
            const filePath = path.resolve(
                rootPath,
                'node_modules',
                dependency,
                main
            )
            if (fs.existsSync(filePath)) {
                entryPoints.push(filePath)
            }
            promises.push(writeModFile(dependency,filePath))
        }
        promises.push(buildFiles(entryPoints, path.resolve(cachePath, 'node_modules')))
        await Promise.all(promises)
    }

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
                    const data = await readFileBuffer(cacheFilePath)
                    res.writeHead(200, {
                        'Content-Type': 'text/html',
                    })
                    return res.end(data)
                }
                try {
                    fs.copyFileSync(
                        path.resolve(rootPath, 'index.html'),
                        cacheFilePath
                    )
                    const data = await readFileBuffer(cacheFilePath)
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
            let code = await readFileString(path.join(rootPath, url))
            const ext = path.extname(codePath)
            if (
                ext === '.ts' ||
                ext === '.js' ||
                ext === '.tsx' ||
                ext === '.jsx'
            ) {
                code = await importAnalysis(code, codePath)
            }
            const loader = loaderMap[path.extname(codePath)] ?? 'default'
            await writeFileString(
                cacheFilePath,
                (
                    await transform(code, loader)
                ).code
            )
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


async function writeModFile(dependency:string,filePath:string) {
    const cjsExports = await getExports(filePath)
    await writeFileString(
        path.resolve(cachePath, `node_modules/${dependency}/mod.js`),
        `import _default from './index.js';\nexport { default } from './index.js';\nexport const { ${cjsExports.join(
            ', '
        )} } = _default`
    )
}
