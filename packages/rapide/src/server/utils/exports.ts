import * as moduleLexer from 'cjs-module-lexer'
import { readFile } from 'fs/promises'
import path from 'path'

//  https://github.com/evanw/esbuild/issues/442#issuecomment-739340295
export default async function getExports(modulePath: string) {
  const exports: string[] = []
  const paths = [modulePath]
  await moduleLexer.init()

  try {
    while (paths.length > 0) {
      const currentPath = require.resolve(paths.pop() as string)
      const result = moduleLexer.parse(await readFile(currentPath, 'utf-8'))
      exports.push(...result.exports)
      for (const reexport of result.reexports) {
        paths.push(path.resolve(path.dirname(currentPath), reexport))
      }
    }
  } catch (e) {
    console.error(e)
    return []
  }
  const set = new Set(exports)
  set.delete('default')
  return [...set]
}
