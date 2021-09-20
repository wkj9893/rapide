import path = require('path')
import { writeFileString } from './utils/file'
import fs = require('fs')
import { copyFile } from 'fs/promises'
import { buildFiles } from './utils/build'
import getExports from './utils/exports'
import { cachePath, rootPath, RapideConfig } from '.'

export async function preCreateServer(port = 3000): Promise<RapideConfig> {
  const config: RapideConfig = { plugins: [], ESModuleMap: new Map(), port }
  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true })
  }
  const packageJsonPath = path.resolve(rootPath, 'package.json')
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    const rapideConfig = packageJson.rapide ?? {}
    const deps = packageJson.dependencies ?? {}
    config.plugins = rapideConfig.plugins
    const cachePackageJsonPath = path.resolve(cachePath, 'package.json')
    if (!fs.existsSync(cachePackageJsonPath)) {
      fs.writeFileSync(cachePackageJsonPath, '{}')
    }
    const cacheDeps =
      JSON.parse(fs.readFileSync(cachePackageJsonPath, 'utf8')).dependencies ??
      {}
    const entryPoints = []
    const arr: Promise<void>[] = []
    for (const dep of Object.keys(deps)) {
      if (cacheDeps[dep] === deps[dep]) {
        continue
      }
      const packageJson = JSON.parse(
        fs.readFileSync(
          path.resolve(rootPath, `node_modules/${dep}/package.json`),
          'utf8'
        )
      )
      const main = packageJson.module ?? packageJson.main ?? 'index.js'
      const filePath = path.resolve(rootPath, 'node_modules', dep, main)
      if (!fs.existsSync(filePath)) {
        continue
      }
      entryPoints.push(filePath)
      if (packageJson.module) {
        config.ESModuleMap.set(dep, path.join('/node_modules', dep, main))
      } else {
        arr.push(writeModFile(dep, filePath))
      }
    }
    arr.push(buildFiles(entryPoints, path.resolve(cachePath, 'node_modules')))
    arr.push(copyFile(packageJsonPath, cachePackageJsonPath))
    await Promise.all(arr)
  }
  return config
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
