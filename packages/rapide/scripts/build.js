const { buildSync } = require('esbuild')

buildSync({
  entryPoints: ['src/cli.ts'],
  platform: 'node',
  bundle: true,
  outfile: 'cli.js',
  external: ['esbuild', 'chokidar', 'ws']
})
