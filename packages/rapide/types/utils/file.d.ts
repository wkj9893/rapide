/// <reference types="node" />
export declare function readFileBuffer(filePath: string): Promise<Buffer>
export declare function readFileString(filePath: string): Promise<string>
export declare function writeFileString(
    filePath: string,
    data: string
): Promise<void>
