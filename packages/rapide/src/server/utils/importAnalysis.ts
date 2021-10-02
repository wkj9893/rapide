import { normalize, resolvePath } from "./path";
import path = require("path");
import { init, parse } from "es-module-lexer";
import { getMetaData, Metadata, preBuild } from "../preCreateServer";
import { cachePath } from "..";

export default async function importAnalysis(
  code: string,
  codePath: string,
  map: Map<string, Metadata>,
) {
  await init;
  const imports = parse(code)[0].filter((value) => value.n);

  let i = 0;
  let j = 0;
  let res = "";
  while (j < imports.length) {
    const str = imports[j].n as string;
    const start = imports[j].s;
    if (i === start) {
      if (str.startsWith(".") || str.startsWith("/")) {
        const fileName = await resolvePath(
          path.resolve(path.dirname(codePath), str),
        );
        res += fileName;
        i += str.length;
        j++;
      } //  handle bare import specifiers, such as import moment from "moment"
      else {
        if (!map.get(str)) {
          const start = performance.now();
          console.log();
          console.log("new dependency found:", str, "rebuilding...");
          map.set(str, getMetaData(str));
          await preBuild(map);
          console.log(`done in ${(performance.now() - start).toFixed()}ms`);
        }
        res += normalize(cachePath, map.get(str)?.dest as string);
        i += str.length;
        j++;
      }
    } else {
      while (i < start) {
        res += code[i];
        i++;
      }
    }
  }
  while (i < code.length) {
    res += code[i];
    i++;
  }
  return res;
}
