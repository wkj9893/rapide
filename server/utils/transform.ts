import { transform as trans } from 'esbuild'

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

export default async function transform(code: string, loader: Loader) {
    return await trans(code, {
        format: 'esm',
        loader,
        sourcemap: true,
        tsconfigRaw: `{
            "compilerOptions": {
                "target": "esnext",
              }
        }`,
    })
}
