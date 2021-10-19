import esbuild = require("esbuild");
import { readFile, rm } from "fs/promises";
import path = require("path");
import { cachePath, rootPath } from "./path";
import { findHtml, transformHtml } from "./html";
import { writeFileString } from "./file";

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
  //  input file -> html
  const map: Map<string, string> = new Map();
  //  html -> output file
  const htmlMap: Map<string, Set<string>> = new Map();
  //  html -> css
  const htmlCssMap: Map<string, Set<string>> = new Map();

  const outdir = path.join(rootPath, "build");
  await rm(outdir, { recursive: true, force: true });

  const htmlPaths = findHtml(rootPath);
  const entryPoints = [];
  for (const htmlPath of htmlPaths) {
    htmlMap.set(htmlPath, new Set());
    htmlCssMap.set(htmlPath, new Set());
    const { html, filePaths } = transformHtml(
      await readFile(htmlPath, "utf-8"),
    );

    await writeFileString(
      path.join(rootPath, "build", path.relative(rootPath, htmlPath)),
      html,
    );
    for (const filePath of filePaths) {
      entryPoints.push(filePath);
      map.set(filePath, htmlPath);
    }
  }

  const res = await esbuild.build({
    entryPoints,
    entryNames: "[dir]/[name]-[hash]",
    bundle: true,
    splitting: true,
    platform: "browser",
    format: "esm",
    minify: true,
    outdir,
    outbase: rootPath,
    metafile: true,
  });
  const { metafile } = res;
  if (metafile) {
    const arr = [];
    const { outputs } = metafile;

    for (const i in outputs) {
      if (i.endsWith("css")) {
        arr.push(i);
        continue;
      }
      const { entryPoint, inputs } = outputs[i];
      if (!entryPoint) {
        continue;
      }
      const htmlPath = map.get(path.join(rootPath, entryPoint));
      if (!htmlPath) {
        continue;
      }
      htmlMap.get(htmlPath)?.add(i);

      for (const j in inputs) {
        if (j.endsWith(".css")) {
          htmlCssMap.get(htmlPath)?.add(j);
        }
      }
    }
    for (const i of arr) {
      const { inputs } = outputs[i];
      const cssSet: Set<string> = new Set();
      for (const j in inputs) {
        cssSet.add(j);
      }
      for (const [key, value] of htmlCssMap) {
        if (equal(value, cssSet)) {
          htmlMap.get(key)?.add(i);
        }
      }
    }
  }
  console.log(htmlMap);
  // for (const [key, value] of htmlMap) {

  // }
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
