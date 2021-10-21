import fs = require("fs");
import path = require("path");

const rootPath = resolveRoot();
const cachePath = path.join(__dirname, "cache");

/**
 * get project root directory absolute path
 * @returns project root directory
 */
function resolveRoot(): string {
  let rootDir = process.cwd();
  let prev = "";
  while (true) {
    if (fs.existsSync(path.join(rootDir, "package.json"))) {
      return rootDir;
    }
    if (prev === rootDir) {
      return process.cwd();
    }
    prev = rootDir;
    rootDir = path.dirname(rootDir);
  }
}

//  https://esbuild.github.io/api/#resolve-extensions
//  default order: .tsx,.ts,.jsx,.js,.css,.json
/**
 * @param filePath absolute path of module
 * @param order resolution extension order
 * @returns empty string if unfound else exact filename
 */
function resolvePath(
  filePath: string,
  order = [".tsx", ".ts", ".jsx", ".js", ".css", ".json"],
): Promise<string> {
  const fileName = filePath.split(path.sep).pop() as string;
  const hasExtension = Boolean(path.extname(fileName));
  const dirPath = path.dirname(filePath);
  const length = order.length;
  let findOrder = length;
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        reject(err);
      }
      for (const file of files) {
        const ext = path.extname(file);
        if (!order.includes(ext)) {
          continue;
        }
        const target = hasExtension ? fileName : fileName + ext;
        if (file === target) {
          const index = order.indexOf(ext);
          if (index !== -1 && index < findOrder) {
            findOrder = index;
          }
        }
      }
      if (findOrder < length) {
        resolve(
          normalize(
            rootPath,
            hasExtension ? filePath : filePath + order[findOrder],
          ),
        );
      } else {
        reject(
          `can not find file path ${
            normalize(
              rootPath,
              filePath + order[findOrder],
            )
          }`,
        );
      }
    });
  });
}

/**
 * @param filePath convert relative path to absolute path starting with / (for browser)
 * @returns normalized path
 */
function normalize(basePath: string, filePath: string): string {
  return "/" + path.relative(basePath, filePath).split(path.sep).join("/");
}

//  resolve html url(script src or link href)
function resolveUrl(htmlPath: string, str: string) {
  if (str.startsWith("/")) {
    return path.join(rootPath, str);
  }
  return path.join(path.dirname(htmlPath), str);
}

export { cachePath, normalize, resolvePath, resolveUrl, rootPath };
