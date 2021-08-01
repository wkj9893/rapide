import { resolvePath } from './path'
import path from 'path'
import { init, parse } from 'es-module-lexer'

export default async function importAnalysis(code: string, codePath: string) {
    await init
    const imports = parse(code)[0].filter(value => value.n)

    let i = 0
    let j = 0
    let res = ''
    while (j < imports.length) {
        const str = imports[j].n as string
        const start = imports[j].s
        if (i === start) {
            if (str.startsWith('.') || str.startsWith('/')) {
                const fileName = await resolvePath(
                    path.resolve(path.dirname(codePath), str)
                )
                res += fileName
                i += str.length
                j++
            }
            //  handle bare import specifiers, such as import moment from "moment"
            else {
                res += `/node_modules/${str}/mod.js`
                i += str.length
                j++
            }
        } else {
            while (i < start) {
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
