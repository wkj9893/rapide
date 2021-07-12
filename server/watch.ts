import path from 'path'
import chokidar from 'chokidar'

export default function watch(
    dirPath: string,
    updateMap: Map<string, boolean>
) {
    const watcher = chokidar.watch(dirPath, {
        ignored: ['**/node_modules/**', '**/.git/**'],
        ignoreInitial: true,
        ignorePermissionErrors: true,
    })

    watcher.on('change', filePath => {
        console.log(filePath)
        updateMap.set(path.resolve(dirPath, filePath), true)
        console.log(updateMap)
    })
}
