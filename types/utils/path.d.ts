/**
 * get project root directory absolute path
 * @returns project root directory
 */
export declare function resolveRoot(): string;
export declare const rootPath: string;
/**
 * @param filePath absolute path of module
 * @param order resolution extension order
 * @returns empty string if unfound else exact filename
 */
export declare function resolvePath(filePath: string, order?: string[]): Promise<string>;
