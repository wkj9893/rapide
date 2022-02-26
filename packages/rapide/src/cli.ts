#!/usr/bin/env node
import { build, createServer, preCreateServer, serve } from "./server";
import { rootPath } from "./server/utils/path";
import { version } from "../package.json";
import { cyan, lightBlue } from "./server/utils/color";
import { address } from "./server/utils/network";
import path from "path";
import { performance } from "perf_hooks";

const args = process.argv.slice(2);

async function main() {
  if (!args[0] || args[0] === "dev") {
    const startTime = performance.now()
    const config = await preCreateServer();
    const server = await createServer(config);
    console.log(cyan(`\n  rapide ${version}`) + " dev server running at:\n");
    console.log("  > Local: " + lightBlue(`http://localhost:${server.port}\n`));
    if (address) {
      console.log(
        "  > Network: " + lightBlue(`http://${address}:${server.port}`),
      );
    }
    console.log(
      cyan(`  ready in ${(performance.now() - startTime).toFixed()}ms`),
    );
  } else if (args[0] === "build") {
    await build();
  } else if (args[0] === "serve") {
    const p = args[1] ? args[1] : path.join(rootPath, "build");
    serve(p);
  } else if (args[0] === "--version") {
    console.log("rapide", version);
  } else {
    throw new Error(
      `rapide:  '${args[0]}' is not a rapide command. See 'rapide --help'`,
    );
  }
}

main().catch((e) => console.error(e));

export { createServer };
