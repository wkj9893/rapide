import path = require("path");
import { writeFileString } from "./utils/file";
import fs = require("fs");
import { writeFile } from "fs/promises";
import { buildFiles } from "./utils/build";
import getExports from "./utils/exports";
import { cachePath, rootPath } from "./utils/path";
import { metaJsonPath, RapideConfig } from ".";

export interface Metadata {
  version?: string;
  src: string;
  dest: string;
  format: "cjs" | "esm";
}

interface Meta {
  [index: string]: Metadata;
}

export async function preCreateServer(port = 3000): Promise<RapideConfig> {
  const config: RapideConfig = {
    plugins: [],
    map: new Map(),
    port,
  };
  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
  }
  const packageJsonPath = path.join(rootPath, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const rapideConfig = packageJson.rapide ?? {};
    const deps = Object.keys(packageJson.dependencies ?? {});
    config.plugins = rapideConfig.plugins ?? [];
    if (!fs.existsSync(metaJsonPath)) {
      fs.writeFileSync(metaJsonPath, "{}");
    }
    const meta: Meta = JSON.parse(fs.readFileSync(metaJsonPath, "utf8")) ?? {};
    const map: Map<string, Metadata> = new Map(Object.entries(meta));
    let shouldBuild = false;

    for (const dep of deps) {
      const data = map.get(dep);
      if (!data) {
        shouldBuild = true;
        map.set(dep, getMetaData(dep));
      } else {
        const p = path.join(rootPath, "node_modules", dep, "package.json");
        if (JSON.parse(fs.readFileSync(p, "utf-8")).version !== data.version) {
          map.set(dep, getMetaData(dep));
          shouldBuild = true;
        }
      }
    }
    //  handle submodule,for example:
    //  if we don't need react,we can delete react/jsx-runtime,else we reserve it
    for (const [key] of map) {
      let shouldDelete = true;
      for (const dep of deps) {
        if (key === dep || key.startsWith(`${dep}/`)) {
          shouldDelete = false;
          break;
        }
      }
      if (shouldDelete) {
        map.delete(key);
      }
    }
    if (shouldBuild) {
      await preBuild(map);
    }
    config.map = map;
  }
  return config;
}

export function getMetaData(dep: string): Metadata {
  const p = path.join(rootPath, "node_modules", dep, "package.json");
  if (!fs.existsSync(p)) {
    let src = path.join(rootPath, "node_modules", dep);
    let dest = path.join(cachePath, "node_modules", dep);
    if (fs.existsSync(path.join(rootPath, "node_modules", dep))) {
      dest += ".js";
    } else if (
      fs.existsSync(path.join(rootPath, "node_modules", dep) + ".js")
    ) {
      src += ".js";
      dest += ".js.js";
    } else if (
      fs.existsSync(path.join(rootPath, "node_modules", dep, "index.js"))
    ) {
      src = path.join(src, "index.js");
      dest = path.join(dest, "index.js.js");
    } else {
      console.error(`can not resolve ${dep}`);
      process.exit(1);
    }
    return {
      src,
      dest,
      format: "cjs",
    };
  }
  const packageJson = JSON.parse(fs.readFileSync(p, "utf8"));
  const { version } = packageJson;
  const main = packageJson.module ?? packageJson.main ?? "index.js";
  const src = path.join(rootPath, "node_modules", dep, main);
  let dest = path.join(cachePath, "node_modules", dep, main);
  const format = packageJson.module ? "esm" : "cjs";
  if (format === "cjs") {
    dest += ".js";
  }
  return { version, src, dest, format };
}

export async function handleCjs(src: string, dest: string) {
  const fileName = src.split(path.sep).pop();
  const cjsExports = await getExports(src);
  await writeFileString(
    dest,
    `import _default from './${fileName}';\nexport { default } from './${fileName}';\nexport const { ${
      cjsExports.join(
        ", ",
      )
    } } = _default`,
  );
}

export async function preBuild(map: Map<string, Metadata>) {
  const entryPoints = [];
  const arr = [];
  for (const [, value] of map) {
    entryPoints.push(value.src);
    if (value.format === "cjs") {
      arr.push(handleCjs(value.src, value.dest));
    }
  }
  arr.push(
    writeFile(metaJsonPath, JSON.stringify(Object.fromEntries(map), null, 2)),
  );
  arr.push(buildFiles(entryPoints));
  await Promise.all(arr);
}
