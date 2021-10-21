import fs = require("fs");
import { mkdir, readFile, writeFile } from "fs/promises";
import path = require("path");
import { rootPath } from "./path";

export async function writeFileString(filePath: string, data: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  await writeFile(filePath, data);
}

export async function writeBuildFile(filePath: string) {
  const buildPath = path.join(rootPath, "build");
  const data = await readFile(filePath, "utf-8");
  await writeFile(
    path.join(buildPath, path.relative(rootPath, filePath)),
    data,
  );
}
