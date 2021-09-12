const esbuild = require('esbuild')

const p1 = esbuild.build({
  entryPoints: ['src/cli.ts'],
  platform: 'node',
  bundle: true,
  outfile: 'cli.js',
  external: ['esbuild', 'chokidar', 'ws'],
  watch: true
})

const p2 = esbuild.build({
  entryPoints: ['src/client/index.ts'],
  bundle: true,
  outfile: 'client.js',
  format: 'esm',
  watch: true
})

Promise.all([p1,p2]).catch((e)=>{
  console.log(e)
})