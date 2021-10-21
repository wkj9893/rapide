import http = require("http");
import path = require("path");
import { readFile } from "fs/promises";
import importAnalysis from "./utils/importAnalysis";
import { esbuildTransform } from "./utils/transform";
import { lightBlue } from "./utils/color";
import { cachePath, rootPath } from "./utils/path";
import { cacheSet, getContentType, loaderMap, RapideConfig } from ".";

export async function transform(
  code: string,
  codePath: string,
  config: RapideConfig,
): Promise<string> {
  const ext = path.extname(codePath);

  let shouldSkip = false;
  for (const plugin of config.plugins) {
    const p = require(plugin).default();
    code = await p.transform(code, codePath);
    if (p.skip && p.skip.includes(ext)) {
      shouldSkip = true;
    }
  }

  if (ext === ".css") {
    return `import { createHotContext, updateStyle } from '/node_modules/rapide/client.js';
import.meta.hot = createHotContext(import.meta.url);
const id = ${JSON.stringify(codePath)};
const css = ${JSON.stringify(code)};
updateStyle(id,css);`;
  }

  if (ext === ".html") {
    code +=
      '<script type="module" src="/node_modules/rapide/client.js"></script>';
  }

  const loader = loaderMap[ext];
  if (loader && !shouldSkip) {
    code = (await esbuildTransform(code, loader)).code;
  }

  if (ext === ".ts" || ext === ".js" || ext === ".tsx" || ext === ".jsx") {
    code = await importAnalysis(code, codePath, config.map);
    if (ext === ".jsx" || ext === ".tsx") {
      code = `import {createHotContext} from '/node_modules/rapide/client.js';
import.meta.hot = createHotContext(import.meta.url);\n` + code;
    }
  }
  return code;
}

export async function createHttpServer(config: RapideConfig) {
  const pathNames = new Set();
  const server = http.createServer(async (req, res) => {
    let { url } = req;
    if (!url) {
      return res.writeHead(404).end();
    }
    const { pathname, search } = new URL(url, `http://${req.headers.host}`);
    // handle /index.css?t=1628048939939
    if (search && pathNames.has(pathname)) {
      const codePath = path.join(rootPath, pathname.slice(1));
      let code = await readFile(codePath, "utf-8");
      code = await transform(code, codePath, config);
      return res
        .writeHead(200, {
          "Cache-Control": "no-cache",
          "Content-Length": Buffer.byteLength(code),
          "Content-Type": getContentType(path.extname(codePath)),
          ETag: `"${Date.now()}"`,
        })
        .end(code);
    }
    pathNames.add(pathname);

    //  for url end with /,for example rootPath,we add index.html to it
    if (url.endsWith("/")) {
      url = url.slice(1) + "index.html";
    } //  for path without extension resolve to html
    else if (!path.extname(url)) {
      url = url.slice(1) + ".html";
    } else {
      url = url.slice(1);
    }
    const ext = path.extname(url);
    const filePath = path.join(rootPath, url);
    const cacheFilePath = url === "/node_modules/rapide/client.js"
      ? path.join(__dirname, "client.js")
      : path.join(cachePath, url);

    if (cacheSet.has(filePath) && req.headers["if-none-match"]) {
      return res.writeHead(304).end();
    }

    //  node_modules files or client code
    try {
      const content = await readFile(cacheFilePath);
      cacheSet.add(filePath);
      return res
        .writeHead(200, {
          "Cache-Control": "no-cache",
          "Content-Length": Buffer.byteLength(content),
          "Content-Type": getContentType(ext),
          ETag: `"${Date.now()}"`,
        })
        .end(content);
    } catch (_err) {
      //  user files
    }

    try {
      let code = await readFile(filePath, "utf-8");
      code = await transform(code, filePath, config);
      cacheSet.add(filePath);
      return res
        .writeHead(200, {
          "Cache-Control": "no-cache",
          "Content-Length": Buffer.byteLength(code),
          "Content-Type": getContentType(ext),
          ETag: `"${Date.now()}"`,
        })
        .end(code);
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
  });
  let { port } = config;
  await new Promise((resolve, reject) => {
    server.on("error", (e: Error & { code: string }) => {
      if (e.code === "EADDRINUSE") {
        console.log(
          "\nAddress " +
            lightBlue(`http://localhost:${port}`) +
            " in use, retrying " +
            lightBlue(`http://localhost:${port + 1}`) +
            "...",
        );
        server.close();
        server.listen(++port);
      } else {
        reject(e);
      }
    });
    server.listen(port);
    server.on("listening", resolve);
  });
  return { httpServer: server, port };
}
