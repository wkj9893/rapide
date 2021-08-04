import { build } from 'esbuild'
import preBundlePlugin from '../plugins/preBundle'

export async function buildFiles(entryPoints: string[], outdir: string) {
  if (entryPoints.length < 1) {
    return
  }
  try {
    await build({
      entryPoints,
      bundle: true,
      splitting: true,
      sourcemap: true,
      format: 'esm',
      outdir,
      plugins: [preBundlePlugin]
    })
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}
