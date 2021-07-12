import { build } from 'esbuild'

export default async function buildFiles(
    entryPoints: string[],
    outdir: string
) {
    try {
        await build({
            entryPoints,
            bundle: true,
            splitting: true,
            sourcemap: true,
            format: 'esm',
            outdir,
        })
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}
