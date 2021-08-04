import * as moduleLexer from 'cjs-module-lexer'
import { readFileString } from './file'
import path from 'path'

//  https://github.com/evanw/esbuild/issues/442#issuecomment-739340295
export default async function getExports(modulePath: string) {
  const exports: string[] = []
  const paths = [modulePath]
  await moduleLexer.init()

  try {
    while (paths.length > 0) {
      const currentPath = paths.pop() as string
      const result = moduleLexer.parse(await readFileString(currentPath))
      exports.push(...result.exports)
      for (const reexport of result.reexports) {
        paths.push(path.resolve(path.dirname(modulePath), reexport))
      }
    }
  } catch (e) {
    console.error(e)
    return []
  }
  return exports
}
