import esbuild = require('esbuild')
import preBundlePlugin from '../plugins/preBundle'
import { readFile } from 'fs/promises'
import path = require('path')
import { cachePath, rootPath } from '..'
import { transformHtml } from './html'
import { writeFileString } from './file'

export async function buildFiles(entryPoints: string[]) {
  if (entryPoints.length < 1) {
    return
  }
  try {
    await esbuild.build({
      entryPoints,
      bundle: true,
      splitting: true,
      sourcemap: true,
      format: 'esm',
      outdir: path.resolve(cachePath, 'node_modules'),
      plugins: [preBundlePlugin]
    })
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

export async function build() {
  const html = await readFile(path.resolve(rootPath, 'index.html'), 'utf-8')
  const { res, files } = transformHtml(html)
  await writeFileString(path.resolve(rootPath, 'build', 'index.html'), res)
  await esbuild.build({
    entryPoints: files,
    bundle: true,
    splitting: true,
    format: 'esm',
    minify: true,
    outdir: path.resolve(rootPath, 'build')
  })
}
