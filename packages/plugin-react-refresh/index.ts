


export function transform(code: string, ext: string): string {
    let res = code
    if (ext === '.html') {
        res += `<></>`
    }

    return res

}

