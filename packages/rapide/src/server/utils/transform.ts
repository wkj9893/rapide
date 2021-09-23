import { transform } from 'esbuild'

export type Loader =
  | 'js'
  | 'jsx'
  | 'ts'
  | 'tsx'
  | 'css'
  | 'json'
  | 'text'
  | 'base64'
  | 'file'
  | 'dataurl'
  | 'binary'
  | 'default'

export async function esbuildTransform(code: string, loader: Loader) {
  return await transform(code, {
    format: 'esm',
    loader,
    sourcemap: true,
    external: []
  })
}
