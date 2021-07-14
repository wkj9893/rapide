import { resolve } from './path'
import fs from 'fs'
import { cachePath } from '../index'
import path from 'path'

interface modulePath {
    start: number
    value: string
}

function findImports(code: string): modulePath[] {
    let i = 0
    const length = code.length
    const isImport = (i: number) =>
        code[i] === 'i' &&
        code[i + 1] === 'm' &&
        code[i + 2] === 'p' &&
        code[i + 3] === 'o' &&
        code[i + 4] === 'r' &&
        code[i + 5] === 't'

    let res: modulePath[] = []

    while (i < length) {
        if (isImport(i)) {
            while (code[i] !== `'` && code[i] !== `"`) {
                advance()
            }
            const start = i
            let value = ''
            if (code[i] === `'`) {
                advance()
                while (code[i] !== `'`) {
                    value += code[i]
                    advance()
                }
            } else if (code[i] === `"`) {
                advance()
                while (code[i] !== `"`) {
                    value += code[i]
                    advance()
                }
            }
            res.push({ start, value })
        }
        advance()
    }
    return res

    function advance(distance = 1) {
        i += distance
    }
}

export default async function importAnalysis(code: string, codePath: string) {
    const imports = findImports(code)

    let i = 0
    let j = 0
    let res = ''
    while (j < imports.length) {
        const str = imports[j].value
        const moduleStart = imports[j].start
        if (i === moduleStart + 1) {
            if (str.startsWith('.') || str.startsWith('/')) {
                // file without extension,we have to find exact filename
                if (!path.extname(str)) {
                    const fileName = await resolve(
                        path.resolve(path.dirname(codePath), str)
                    )
                    res += fileName
                    i += str.length
                    j++
                } else {
                    res += str
                    i += str.length
                    j++
                }
            }
            //  handle bare import specifiers, such as import moment from "moment"
            else {
                const filePath = path.resolve(
                    cachePath,
                    'node_modules',
                    str,
                    'index.js'
                )
                if (fs.existsSync(filePath)) {
                    res += `/node_modules/${str}/mod.js`
                    i += str.length
                    j++
                } else {
                    throw new Error(`can not find file path ${str}`)
                }
            }
        } else {
            while (i < moduleStart + 1) {
                res += code[i]
                i++
            }
        }
    }
    while (i < code.length) {
        res += code[i]
        i++
    }
    return res
}
