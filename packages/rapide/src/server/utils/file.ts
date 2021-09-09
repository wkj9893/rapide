import fs = require('fs')
import { readFile, writeFile } from 'fs/promises'
import path = require('path')
import { rootPath } from '..'

export async function writeFileString(filePath: string, data: string) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  await writeFile(filePath, data)
}

export async function writeBuildFile(filePath: string) {
  const buildPath = path.resolve(rootPath, 'build')
  const data = await readFile(filePath, 'utf-8')
  await writeFile(
    path.resolve(buildPath, path.relative(rootPath, filePath)),
    data
  )
}
