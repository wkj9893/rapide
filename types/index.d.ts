import { Loader } from './utils/transform';
import { createServer } from './server';
import watch from './watch';
declare const MEDIA_TYPES: Record<string, string>;
declare const loaderMap: Record<string, Loader>;
declare const updateMap: Map<string, boolean>;
declare const cachePath: string;
export declare const rootPath: string;
export { createServer, watch, updateMap, cachePath, loaderMap, MEDIA_TYPES };
