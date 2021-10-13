import { extname, join } from "https://deno.land/std@0.111.0/path/mod.ts";
import { Loader, transform } from "https://deno.land/x/esbuild@v0.13.5/mod.js";

export async function createServer(port: number) {
  console.log(
    `server running at http://localhost:${port}/`,
  );

  for await (const conn of Deno.listen({ port })) {
    for await (const { request, respondWith } of Deno.serveHttp(conn)) {
      respondWith(await handler(request));
    }
  }
}

async function handler(request: Request): Promise<Response> {
  let body = null;
  const headers = new Headers();
  try {
    const url = new URL(request.url);
    const { pathname } = url;
    const filepath = resolvePath(pathname);
    const ext = extname(filepath);
    headers.set("content-type", getContentType(ext));
    body = await Deno.readFile(filepath);
    if (ext == ".ts" || ext == ".tsx" || ext == ".js" || ext == ".jsx") {
      body = (await transform(new TextDecoder().decode(body), {
        loader: loaderMap[ext],
      })).code;
    }
    return new Response(body, {
      status: 200,
      headers,
    });
  } catch (error) {
    if (error instanceof Error) {
      body = error.message;
    }
    return new Response(body, {
      status: 404,
    });
  }
}

function resolvePath(pathname: string): string {
  if (pathname.endsWith("/")) {
    pathname += "index.html";
  } else if (!extname(pathname)) {
    pathname += ".html";
  }
  return join(Deno.cwd(), pathname.slice(1));
}

function getContentType(ext: string): string {
  const contentType = MEDIA_TYPES[ext] ?? "text/plain";
  if (contentType.startsWith("text")) {
    return contentType + "; charset=utf-8";
  }
  return contentType;
}

const MEDIA_TYPES: Record<string, string> = {
  ".md": "text/markdown",
  ".html": "text/html",
  ".htm": "text/html",
  ".json": "application/json",
  ".map": "application/json",
  ".txt": "text/plain",
  ".ts": "application/javascript",
  ".tsx": "application/javascript",
  ".js": "application/javascript",
  ".jsx": "application/javascript",
  ".gz": "application/gzip",
  ".css": "application/javascript",
  ".wasm": "application/wasm",
  ".mjs": "application/javascript",
  ".svg": "image/svg+xml",
};

const loaderMap: Record<string, Loader> = {
  ".js": "js",
  ".jsx": "jsx",
  ".ts": "ts",
  ".tsx": "tsx",
  ".css": "css",
  ".json": "json",
};
