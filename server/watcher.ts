import chokidar from 'chokidar'

export function createWatcher(dirPath: string) {
    return chokidar.watch(dirPath, {
        ignored: ['**/node_modules/**', '**/.git/**'],
        ignoreInitial: true,
        ignorePermissionErrors: true,
    })

    // watcher.on('change', filePath => {
    //     console.log(filePath)
    //     updateMap.set(path.resolve(dirPath, filePath), true)
    //     console.log(updateMap)
    // })
}
