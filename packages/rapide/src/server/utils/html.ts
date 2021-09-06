import path from 'path'
import fs from 'fs'
import { rootPath } from '..'

interface ImportSpecifier {
  start: number
  str: string
}

export function scanHtml(html: string): ImportSpecifier[] {
  const res: ImportSpecifier[] = []
  let i = 0
  let tagClose = false
  while (i < html.length) {
    //  skip html comment
    if (html.slice(i, i + 4) === '<!--') {
      i += 4
      while (html.slice(i, i + 3) !== '-->') {
        i++
      }
      i += 3
      continue
    }
    // link
    if (html.slice(i, i + 5) === '<link') {
      i += 5
      while (html[i] !== '>') {
        if (html.slice(i, i + 4) === 'href') {
          i += 4
          while (html[i] !== `'` && html[i] !== `"`) {
            i++
          }
          checkUrl()
        }
        i++
      }
      i += 7
      continue
    }

    // script
    if (html.slice(i, i + 7) === '<script') {
      i += 7
      while (html.slice(i, i + 9) !== '</script>') {
        if (html[i] === '>') {
          tagClose = true
        }
        if (!tagClose && html.slice(i, i + 3) === 'src') {
          i += 3
          while (html[i] !== `'` && html[i] !== `"`) {
            i++
          }
          checkUrl()
        }
        i++
      }
      tagClose = false
      i += 9
      continue
    }
    i++
  }

  return res

  function checkUrl() {
    let str = ''
    if (html[i] == `'`) {
      i++
      const start = i
      while (html[i] !== `'`) {
        str += html[i]
        i++
      }
      res.push({ start, str })
    } else if (html[i] == `"`) {
      i++
      const start = i
      while (html[i] !== `"`) {
        str += html[i]
        i++
      }
      res.push({ start, str })
    }
  }
}

export function transformHtml(html: string): { res: string; files: string[] } {
  let i = 0
  let j = 0
  let res = ''
  const files: string[] = []
  const imports = scanHtml(html)

  while (j < imports.length) {
    let { start, str } = imports[j]
    if (i === start) {
      if (str.startsWith('/')) {
        str = str.slice(1)
      }
      const filePath = path.resolve(rootPath, str)
      i += str.length
      j++
      if (fs.existsSync(filePath)) {
        files.push(filePath)
        const ext = path.extname(filePath)
        if (ext === '.ts' || ext === '.tsx' || ext === '.jsx') {
          res += path.relative(
            rootPath,
            filePath.slice(0, filePath.length - ext.length) + '.js'
          )
        } else {
          res += path.relative(rootPath, filePath)
        }
      } else {
        res += str
      }
    } else {
      while (i < start) {
        res += html[i]
        i++
      }
    }
  }
  while (i < html.length) {
    res += html[i]
    i++
  }
  return { res, files }
}
