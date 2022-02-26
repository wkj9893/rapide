import esbuild from "esbuild";
import { readFile, rm } from "fs/promises";
import path from "path";
import { cachePath, rootPath } from "./path";
import { findEntryPoints, findHtml, writeHtml } from "./html";

export async function buildFiles(entryPoints: string[]) {
  if (entryPoints.length < 1) {
    return;
  }

  await esbuild.build({
    entryPoints,
    bundle: true,
    splitting: true,
    sourcemap: true,
    platform: "browser",
    format: "esm",
    outdir: path.join(cachePath, "node_modules"),
    outbase: "node_modules",
  });
}

export async function build() {
  await rm(path.join(rootPath, "build"), { recursive: true, force: true });

  const htmlPaths = findHtml(rootPath);
  const htmls = [];
  const entryPoints = [];

  for (const htmlPath of htmlPaths) {
    const html = await readFile(htmlPath, "utf-8");
    htmls.push(html);
    entryPoints.push(
      ...findEntryPoints(htmlPath, html),
    );
  }
  const res = await esbuild.build({
    entryPoints,
    entryNames: "[dir]/[name]-[hash]",
    bundle: true,
    splitting: true,
    platform: "browser",
    format: "esm",
    minify: true,
    outdir: path.join(rootPath, "build"),
    outbase: rootPath,
    metafile: true,
  });
  if (!res.metafile) {
    return;
  }
  //  entryPoint(ts,tsx,js,jsx) -> ouput js
  const jsMap: Map<string, string> = new Map();
  //  entryPoint(ts,tsx,js,jsx) -> ouput css
  const cssMap: Map<string, string> = new Map();
  //  entryPoint(ts,tsx,js,jsx) -> input css
  const tempMap: Map<string, Set<string>> = new Map();
  const { outputs } = res.metafile;
  //  first handle output js
  for (const i in outputs) {
    if (!i.endsWith(".js")) {
      continue;
    }
    const { entryPoint, inputs } = outputs[i];
    if (!entryPoint) {
      continue;
    }
    jsMap.set(path.join(rootPath, entryPoint), i.slice(5));
    for (const j in inputs) {
      if (j.endsWith(".css")) {
        if (!tempMap.get(entryPoint)) {
          tempMap.set(entryPoint, new Set());
        }
        tempMap.get(entryPoint)?.add(j);
      }
    }
  }
  // then handle output css
  for (const i in outputs) {
    if (!i.endsWith(".css")) {
      continue;
    }
    const set: Set<string> = new Set();
    const { inputs } = outputs[i];
    for (const j in inputs) {
      set.add(j);
    }
    for (const [key, value] of tempMap) {
      if (equal(value, set)) {
        cssMap.set(path.join(rootPath, key), i.slice(5));
      }
    }
  }
  const arr = [];
  for (let i = 0; i < htmlPaths.length; i++) {
    arr.push(writeHtml(htmlPaths[i], htmls[i], jsMap, cssMap));
  }
  await Promise.all(arr);
}

function equal(s1: Set<string>, s2: Set<string>): boolean {
  if (s1.size !== s2.size) {
    return false;
  }
  for (const i of s1) {
    if (!s2.has(i)) {
      return false;
    }
  }
  return true;
}
