export declare type Loader = 'js' | 'jsx' | 'ts' | 'tsx' | 'css' | 'json' | 'text' | 'base64' | 'file' | 'dataurl' | 'binary' | 'default';
export default function transform(code: string, loader: Loader): Promise<import("esbuild").TransformResult>;
