import path from 'path'
import { writeFileString } from './utils/file'
import fs from 'fs'
import buildFiles from './utils/build'
import getExports from './utils/exports'
import { cachePath, rootPath, RapideConfig } from '.'

export async function preCreateServer(): Promise<RapideConfig | undefined> {
    fs.rmSync(cachePath, { recursive: true, force: true })
    fs.mkdirSync(cachePath, { recursive: true })
    const packageJsonPath = path.resolve(rootPath, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
        const dependencies =
            JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).dependencies ??
            {}
        const entryPoints = []
        const promises: Promise<void>[] = []
        for (const dependency of Object.keys(dependencies)) {
            //  do not bundle itself
            if (dependency === 'rapide') {
                continue
            }
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
            promises.push(writeModFile(dependency, filePath))
        }
        promises.push(
            buildFiles(entryPoints, path.resolve(cachePath, 'node_modules'))
        )
        await Promise.all(promises)
    }
    const configPath = path.resolve(rootPath, 'rapide.config.json')
    if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    }
}

async function writeModFile(dependency: string, filePath: string) {
    const cjsExports = await getExports(filePath)
    await writeFileString(
        path.resolve(cachePath, `node_modules/${dependency}/mod.js`),
        `import _default from './index.js';\nexport { default } from './index.js';\nexport const { ${cjsExports.join(
            ', '
        )} } = _default`
    )
}
