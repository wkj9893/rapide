const { build } = require('esbuild')

const p1 = build({
  entryPoints: ['src/cli.ts'],
  platform: 'node',
  bundle: true,
  minify: true,
  outfile: 'cli.js',
  external: ['esbuild'],
  watch: true
})

const p2 = build({
  entryPoints: ['src/client/index.ts'],
  bundle: true,
  minify: true,
  outfile: 'client.js',
  format: 'esm',
  watch: true
})

Promise.all([p1, p2]).catch((e) => {
  console.log(e)
})
