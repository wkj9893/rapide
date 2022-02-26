import { Loader } from "./utils/transform";
import { cachePath, normalize, rootPath } from "./utils/path";
import { createHttpServer } from "./server";
import { createWatcher } from "./watcher";
import { Server } from "http";
import { createWebsocketServer } from "./wss";
import { FSWatcher } from "chokidar";
import { Metadata, preCreateServer } from "./preCreateServer";
import { build } from "./utils/build";
import { serve } from "./utils/serve";
import path from "path";
import WebSocket from "ws";

type HMRMessage = ConnectedMessage | ReloadMessage | UpdateMessage;

interface ConnectedMessage {
  type: "connected";
}

interface ReloadMessage {
  type: "reload";
}

interface UpdateMessage {
  type: "update";
  update: string;
}

interface RapideConfig {
  plugins: string[];
  map: Map<string, Metadata>;
  port: number;
}

interface RapideServer {
  httpServer: Server;
  port: number;
  wss: WebSocket.Server;
  watcher: FSWatcher;
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

const cacheSet: Set<string> = new Set();

const metaJsonPath = path.join(cachePath, "metadata.json");

function getContentType(ext: string): string {
  const contentType = MEDIA_TYPES[ext] ?? "text/plain";
  if (contentType.startsWith("text")) {
    return contentType + ";charset=UTF-8";
  }
  return contentType;
}

async function createServer(config: RapideConfig): Promise<RapideServer> {
  const { httpServer, port } = await createHttpServer(config);
  const wss = createWebsocketServer(httpServer);
  const watcher = createWatcher(rootPath);
  const send = (data: HMRMessage) => {
    wss.clients.forEach(
      (client: { readyState: number; send: (arg0: string) => void }) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      },
    );
  };

  watcher.on("change", (filePath: string) => {
    cacheSet.delete(filePath);
    const ext = path.extname(filePath);
    // hot reload(jsx,tsx,css)
    if (ext === ".jsx" || ext === ".tsx" || ext === ".css") {
      send({
        type: "update",
        update: `${normalize(rootPath, filePath)}?t=${new Date().getTime()}`,
      });
      return;
    }
    send({ type: "reload" });
  });
  return { httpServer, port, wss, watcher };
}

export {
  build,
  cacheSet,
  createServer,
  getContentType,
  loaderMap,
  metaJsonPath,
  preCreateServer,
  serve,
};

export type { HMRMessage, RapideConfig };
