import esbuild = require('esbuild')
import preBundlePlugin from '../plugins/preBundle'
import { readFile, rm } from 'fs/promises'
import path = require('path')
import { cachePath, rootPath } from '..'
import { findHtml, transformHtml } from './html'
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
      outbase: 'node_modules',
      plugins: [preBundlePlugin]
    })
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

export async function build() {
  const outdir = path.resolve(rootPath, 'build')
  await rm(outdir, { recursive: true, force: true })

  const htmlPaths = findHtml(rootPath)
  const entryPoints = []
  for (const htmlPath of htmlPaths) {
    const html = await readFile(htmlPath, 'utf-8')
    const { result, files } = transformHtml(html)
    await writeFileString(
      path.resolve(rootPath, 'build', path.relative(rootPath, htmlPath)),
      result
    )
    entryPoints.push(...files)
  }
  await esbuild.build({
    entryPoints,
    bundle: true,
    splitting: true,
    format: 'esm',
    minify: true,
    outdir,
    outbase: rootPath
  })
}
