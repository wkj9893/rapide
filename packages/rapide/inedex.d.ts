#!/usr/bin/env node
/// <reference types="node" />
/// <reference types="ws" />
declare module "src/server/utils/transform" {
    export type Loader = 'js' | 'jsx' | 'ts' | 'tsx' | 'css' | 'json' | 'text' | 'base64' | 'file' | 'dataurl' | 'binary' | 'default';
    export function esbuildTransform(code: string, loader: Loader): Promise<import("esbuild").TransformResult>;
}
declare module "src/server/utils/path" {
    /**
     * get project root directory absolute path
     * @returns project root directory
     */
    export function resolveRoot(): string;
    /**
     * @param filePath absolute path of module
     * @param order resolution extension order
     * @returns empty string if unfound else exact filename
     */
    export function resolvePath(filePath: string, order?: string[]): Promise<string>;
    /**
     *
     * @param filePath convert relative path to absolute path starting with /
     * @returns normalized path
     */
    export function normalize(filePath: string): string;
}
declare module "src/server/utils/importAnalysis" {
    export default function importAnalysis(code: string, codePath: string, ESModuleMap: Map<string, string>): Promise<string>;
}
declare module "src/server/utils/color" {
    const cyan: (str: string) => string;
    const lightBlue: (str: string) => string;
    export { cyan, lightBlue };
}
declare module "src/server/server" {
    import http = require('http');
    import { RapideConfig } from "src/server/index";
    export function transform(code: string, codePath: string, config: RapideConfig): Promise<string>;
    export function createHttpServer(config: RapideConfig): Promise<{
        httpServer: http.Server;
        port: number;
    }>;
}
declare module "src/server/watcher" {
    import chokidar = require('chokidar');
    export function createWatcher(dirPath: string): chokidar.FSWatcher;
}
declare module "src/server/wss" {
    import { Server } from 'http';
    export function createWebsocketServer(server: Server): any;
}
declare module "src/server/utils/file" {
    export function writeFileString(filePath: string, data: string): Promise<void>;
    export function writeBuildFile(filePath: string): Promise<void>;
}
declare module "src/server/plugins/preBundle" {
    import { OnResolveArgs } from 'esbuild';
    const filter: RegExp;
    const preBundlePlugin: {
        name: string;
        setup(build: {
            onResolve: (arg0: {
                filter: RegExp;
            }, arg1: (args: OnResolveArgs) => {
                path: string;
                external: boolean;
            }) => void;
        }): void;
    };
    export default preBundlePlugin;
}
declare module "src/server/utils/html" {
    interface ImportSpecifier {
        start: number;
        str: string;
    }
    export function scanHtml(html: string): ImportSpecifier[];
    export function transformHtml(html: string): {
        res: string;
        files: string[];
    };
}
declare module "src/server/utils/build" {
    export function buildFiles(entryPoints: string[], outdir: string): Promise<void>;
    export function build(): Promise<void>;
}
declare module "src/server/utils/exports" {
    export default function getExports(modulePath: string): Promise<string[]>;
}
declare module "src/server/preCreateServer" {
    import { RapideConfig } from "src/server/index";
    export function preCreateServer(port?: number): Promise<RapideConfig>;
}
declare module "src/server/index" {
    import { Loader } from "src/server/utils/transform";
    import { Server } from 'http';
    import WebSocket = require('ws');
    import { FSWatcher } from 'chokidar';
    import { preCreateServer } from "src/server/preCreateServer";
    import { cyan, lightBlue } from "src/server/utils/color";
    import { build } from "src/server/utils/build";
    type HMRMessage = ConnectedMessage | ReloadMessage | UpdateMessage;
    interface ConnectedMessage {
        type: 'connected';
    }
    interface ReloadMessage {
        type: 'reload';
    }
    interface UpdateMessage {
        type: 'update';
        update: string;
    }
    interface RapideConfig {
        plugins: RapidePlugin[];
        ESModuleMap: Map<string, string>;
        port: number;
    }
    interface RapidePlugin {
        name: string;
        transform: ((code: string, codePath: string) => string) | ((code: string, codePath: string) => Promise<string>);
    }
    const MEDIA_TYPES: Record<string, string>;
    const loaderMap: Record<string, Loader>;
    const cacheSet: Set<string>;
    const cachePath: string;
    const rootPath: string;
    interface RapideServer {
        httpServer: Server;
        port: number;
        wss: WebSocket.Server;
        watcher: FSWatcher;
    }
    function createServer(config: RapideConfig): Promise<RapideServer>;
    export { cacheSet, cachePath, rootPath, loaderMap, MEDIA_TYPES, preCreateServer, createServer, cyan, lightBlue, build };
    export type { RapideConfig, RapidePlugin, HMRMessage };
}
declare module "index" {
    import { createServer } from "src/server/index";
    export { createServer };
}
declare module "src/cli" { }
declare module "src/client/index" {
    export function createHotContext(url: string): {
        pathname: string;
        accept(callback: () => void): void;
    };
    export function updateStyle(id: string, css: string): void;
}
declare module "test/html.test" { }
