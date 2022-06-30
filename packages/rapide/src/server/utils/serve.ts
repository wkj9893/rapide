import http from "http";
import path from "path";
import { readFile } from "fs/promises";
import { getContentType } from "..";
import { address } from "./network";

//  a static file server for build output
export function serve(rootPath: string) {
  http
    .createServer(async (req, res) => {
      let { url } = req;
      if (!url) {
        return res.writeHead(404).end();
      }
      //  for url end with /,for example rootPath,we add index.html to it
      if (url.endsWith("/")) {
        url = url.slice(1) + "index.html";
      } //  for path without extension resolve to html
      else if (!path.extname(url)) {
        url = url.slice(1) + ".html";
      } else {
        url = url.slice(1);
      }
      const filePath = path.join(rootPath, url);
      try {
        const data = await readFile(filePath);
        return res
          .writeHead(200, {
            "Content-Length": Buffer.byteLength(data),
            "Content-Type": getContentType(path.extname(filePath)),
          })
          .end(data);
      } catch (err) {
        if (err instanceof Error) {
          const { message } = err;
          return res
            .writeHead(404, {
              "Content-Length": Buffer.byteLength(message),
              "Content-Type": "text/plain",
            })
            .end(message);
        }
      }
    })
    .listen(5000);
  console.log("  > Local:   http://localhost:5000\n");
  if (address) {
    console.log(`  > Network:  http://${address}:5000`);
  }
}
