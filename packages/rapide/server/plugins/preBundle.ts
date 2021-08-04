import { builtinModules } from 'module'

interface OnResolveArgs {
  path: string
  importer: string
  namespace: string
  resolveDir: string
  kind: ResolveKind
  pluginData: any
}

type ResolveKind =
  | 'entry-point'
  | 'import-statement'
  | 'require-call'
  | 'dynamic-import'
  | 'require-resolve'
  | 'import-rule'
  | 'url-token'

const filter = new RegExp(
  builtinModules
    .map((value) => `^${value}$`)
    .join('|')
    .replaceAll('/', '/')
)

const preBundlePlugin = {
  name: 'pre-bundle',
  setup(build: any) {
    build.onResolve({ filter }, (args: OnResolveArgs) => {
      return { path: args.path, external: true }
    })
  }
}

export default preBundlePlugin
