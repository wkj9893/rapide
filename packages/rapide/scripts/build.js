const { build } = require('esbuild')

const promise1 = build({
  entryPoints: ['src/cli.ts'],
  platform: 'node',
  bundle: true,
  minify:true,
  outfile: 'cli.js',
  external: ['esbuild', 'ws']
})

const promise2 = build({
  entryPoints: ['index.ts'],
  platform: 'node',
  bundle: true,
  minify:true,
  outfile: 'index.js',
  external: ['esbuild', 'chokidar', 'ws']
})

const promise3 = build({
  entryPoints: ['src/client/index.ts'],
  bundle: true,
  minify:true,
  outfile: 'client.js',
  format: 'esm'
})

Promise.allSettled([promise1, promise2, promise3]).then((values) => {
  console.log(values)
})
