import path = require('path')
import { writeFileString } from './utils/file'
import fs = require('fs')
import { copyFile } from 'fs/promises'
import { buildFiles } from './utils/build'
import getExports from './utils/exports'
import { cachePath, rootPath, RapideConfig } from '.'

export async function preCreateServer(port = 3000): Promise<RapideConfig> {
  const config: RapideConfig = { plugins: [], ESModuleMap: new Map(), port }
  if (fs.existsSync(cachePath)) {
    deleteFiles()
  } else {
    fs.mkdirSync(cachePath, { recursive: true })
  }
  const packageJsonPath = path.resolve(rootPath, 'package.json')
  if (fs.existsSync(packageJsonPath)) {
    handleConfig()
    const deps =
      JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).dependencies ?? {}
    const cachePackageJsonPath = path.resolve(cachePath, 'package.json')
    if (!fs.existsSync(cachePackageJsonPath)) {
      fs.writeFileSync(cachePackageJsonPath, '{}')
    }
    const cacheDeps =
      JSON.parse(fs.readFileSync(cachePackageJsonPath, 'utf8')).dependencies ??
      {}
    const cacheKey = Object.keys(cacheDeps)
    const entryPoints = []
    const promises: Promise<void>[] = []
    for (const dep of Object.keys(deps)) {
      const shouldSkip = cacheKey.includes(dep) && cacheDeps[dep] === deps[dep]
      const packageJson = JSON.parse(
        fs.readFileSync(
          path.resolve(rootPath, `node_modules/${dep}/package.json`),
          'utf8'
        )
      )
      const main = packageJson.module ?? packageJson.main ?? 'index.js'
      const filePath = path.resolve(rootPath, 'node_modules', dep, main)
      if (!shouldSkip && fs.existsSync(filePath)) {
        entryPoints.push(filePath)
      }
      if (packageJson.module) {
        config.ESModuleMap.set(dep, path.join('/node_modules', dep, main))
      } else {
        //  skip already cached dependency
        if (!shouldSkip) {
          promises.push(writeModFile(dep, filePath))
        }
      }
    }
    promises.push(
      buildFiles(entryPoints, path.resolve(cachePath, 'node_modules'))
    )
    promises.push(copyFile(packageJsonPath, cachePackageJsonPath))
    await Promise.all(promises)
  }
  return config

  function handleConfig() {
    const rapideConfig = JSON.parse(
      fs.readFileSync(packageJsonPath, 'utf8')
    ).rapide
    if (!rapideConfig) {
      return
    }
    for (const plugin of rapideConfig.plugins) {
      config.plugins.push(require(plugin).default())
    }
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

//  delete all cache files excludes node_modules
function deleteFiles() {
  const files = fs.readdirSync(cachePath)
  for (const file of files) {
    if (file === 'node_modules' || file === 'package.json') {
      continue
    }
    fs.rmSync(path.resolve(cachePath, file), { recursive: true, force: true })
  }
}
