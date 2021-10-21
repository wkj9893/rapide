import { normalize, resolvePath } from "./path";
import path = require("path");
import { init, parse } from "es-module-lexer";
import { getMetaData, Metadata, preBuild } from "../preCreateServer";
import { cachePath } from "./path";
import { overwrite } from "./overwrite";

export default async function importAnalysis(
  code: string,
  codePath: string,
  map: Map<string, Metadata>,
) {
  await init;
  const imports = parse(code)[0].filter((value) => value.n);
  const starts: number[] = [];
  const ends: number[] = [];
  const contents: string[] = [];
  for (const { n, s, e } of imports) {
    if (!n) {
      continue;
    }
    starts.push(s);
    ends.push(e);
    if (n.startsWith(".") || n.startsWith("/")) {
      contents.push(
        await resolvePath(
          path.join(path.dirname(codePath), n),
        ),
      );
    } else {
      if (!map.get(n)) {
        const start = performance.now();
        console.log("\nnew dependency found:", n, "rebuilding...");
        map.set(n, getMetaData(n));
        await preBuild(map);
        console.log(`done in ${(performance.now() - start).toFixed()}ms`);
      }
      contents.push(normalize(cachePath, map.get(n)!.dest));
    }
  }
  const res = overwrite(code, starts, ends, contents);
  return res;
}
