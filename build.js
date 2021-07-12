require('esbuild').buildSync({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    external:['esbuild'],
    outfile: 'out.js',
})

