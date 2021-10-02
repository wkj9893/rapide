import { Loader } from "./utils/transform";
import { normalize, rootPath } from "./utils/path";
import { createHttpServer } from "./server";
import path = require("path");
import { createWatcher } from "./watcher";
import { Server } from "http";
import WebSocket = require("ws");
import { createWebsocketServer } from "./wss";
import { FSWatcher } from "chokidar";
import { Metadata, preCreateServer } from "./preCreateServer";
import { cyan, lightBlue } from "./utils/color";
import { build } from "./utils/build";
import { serve } from "./utils/serve";
import { getNetworkAddress } from "./utils/network";

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

const MEDIA_TYPES = new Map([
  [".md", "text/markdown"],
  [".html", "text/html"],
  [".htm", "text/html"],
  [".json", "application/json"],
  [".map", "application/json"],
  [".txt", "text/plain"],
  [".ts", "application/javascript"],
  [".tsx", "application/javascript"],
  [".js", "application/javascript"],
  [".jsx", "application/javascript"],
  [".gz", "application/gzip"],
  [".css", "application/javascript"],
  [".wasm", "application/wasm"],
  [".mjs", "application/javascript"],
  [".svg", "image/svg+xml"],
]);

const loaderMap: Map<string, Loader> = new Map([
  [".js", "js"],
  [".jsx", "jsx"],
  [".ts", "ts"],
  [".tsx", "tsx"],
  [".css", "css"],
  [".json", "json"],
]);

const cacheSet: Set<string> = new Set();

const cachePath = path.resolve(__dirname, "cache");
const metaJsonPath = path.resolve(cachePath, "metadata.json");

function getContentType(ext: string): string {
  const contentType = MEDIA_TYPES.get(ext) ?? "text/plain";
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
    //  TODO: @types/ws
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
      performance.now();
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
  cachePath,
  cacheSet,
  createServer,
  cyan,
  getContentType,
  getNetworkAddress,
  lightBlue,
  loaderMap,
  metaJsonPath,
  preCreateServer,
  rootPath,
  serve,
};

export type { HMRMessage, RapideConfig };
