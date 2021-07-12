import fs from 'fs'
import path from 'path'

export function readFileBuffer(filePath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                reject(err)
            }
            resolve(data)
        })
    })
}

export function readFileString(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err)
            }
            resolve(data)
        })
    })
}

export function writeFileString(filePath: string, data: string): Promise<void> {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, err => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve()
        })
    })
}
