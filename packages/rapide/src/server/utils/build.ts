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
    outdir: path.resolve(cachePath, "node_modules"),
    outbase: "node_modules",
  });
}

export async function build() {
  const map: Map<string, string[]> = new Map();
  const outdir = path.resolve(rootPath, "build");
  await rm(outdir, { recursive: true, force: true });

  const htmlPaths = findHtml(rootPath);
  const entryPoints = [];
  for (const htmlPath of htmlPaths) {
    const html = await readFile(htmlPath, "utf-8");
    const { result, files } = transformHtml(html);
    await writeFileString(
      path.resolve(rootPath, "build", path.relative(rootPath, htmlPath)),
      result,
    );
    entryPoints.push(...files);
    map.set(htmlPath, files);
  }
  await esbuild.build({
    entryPoints,
    bundle: true,
    splitting: true,
    platform: "browser",
    format: "esm",
    minify: true,
    outdir,
    outbase: rootPath,
  });
}
