import http = require('http')
import path = require('path')
import { readFile } from 'fs/promises'
import { getContentType, getNetworkAddress, lightBlue } from '..'

//  a static file server for build output
export function serve(rootPath: string) {
  http
    .createServer(async (req, res) => {
      let { url } = req
      if (!url) {
        return
      }
      if (url === '/') {
        url += 'index.html'
      }
      let filePath = path.resolve(rootPath, url?.slice(1))
      if (!path.extname(filePath)) {
        filePath += '.html'
      }
      try {
        return res
          .writeHead(200, {
            'Content-Type': getContentType(path.extname(filePath))
          })
          .end(await readFile(filePath))
      } catch (err) {
        if (err instanceof Error) {
          return res.writeHead(404).end(err.message)
        }
      }
    })
    .listen(5000)
  console.log('  > Local:    ' + lightBlue(`http://localhost:5000\n`))
  const address = getNetworkAddress()
  if (address) {
    console.log('  > Network:  ' + lightBlue(`http://${address}:5000`))
  }
}
