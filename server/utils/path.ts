import fs from 'fs'
import path from 'path'

/**
 * get project root directory absolute path
 * @returns project root directory
 */
export function resolveRoot(): string {
    let rootDir = process.cwd()
    let prev = ''
    while (true) {
        if (fs.existsSync(path.resolve(rootDir, 'package.json'))) {
            return rootDir
        }
        if (prev === rootDir) {
            throw new Error('can not find project root path')
        }
        prev = rootDir
        rootDir = path.dirname(rootDir)
    }
}

export const rootPath = resolveRoot()

//  https://esbuild.github.io/api/#resolve-extensions
//  default order: .tsx,.ts,.jsx,.js,.css,.json
/**
 * @param filePath absolute path of module
 * @param order resolution extension order
 * @returns empty string if unfound else exact filename
 */
export function resolvePath(
    filePath: string,
    order = ['.tsx', '.ts', '.jsx', '.js', '.css', '.json']
): Promise<string> {
    const fileName = filePath.split(path.sep).pop() as string
    const hasExtension = Boolean(path.extname(fileName))
    const dirPath = path.dirname(filePath)
    const length = order.length
    let findOrder = length
    return new Promise((resolve, reject) => {
        fs.readdir(dirPath, (err, files) => {
            if (err) {
                reject(err)
            }
            for (const file of files) {
                const ext = path.extname(file)
                const target = hasExtension ? fileName : fileName + ext
                if (file === target) {
                    const index = order.indexOf(ext)
                    if (index !== -1 && index < findOrder) {
                        findOrder = index
                    }
                }
            }
            if (findOrder < length) {
                resolve(normalize(filePath + order[findOrder]))
            } else {
                reject(
                    `can not find file path ${normalize(
                        filePath + order[findOrder]
                    )}`
                )
            }
        })
    })
}

/**
 *
 * @param filePath convert relative path to absolute path starting with /
 * @returns normalized path
 */
function normalize(filePath: string): string {
    return '/' + path.relative(rootPath, filePath).split(path.sep).join('/')
}
