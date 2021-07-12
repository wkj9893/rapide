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
    // console.log(code,loader)
    return await trans(code, {
        format: 'esm',
        loader,
        tsconfigRaw: `{
            "compilerOptions": {
                "target": "esnext",
              }
        }`,
    })
}
