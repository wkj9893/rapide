const path = require('path')

require('esbuild').buildSync({
    entryPoints: [path.resolve(__dirname,'../server/index.ts')],
    bundle: true,
    platform: 'node',
    external:['esbuild'],
    outfile: 'out.js',
})

