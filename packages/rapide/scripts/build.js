const { build } = require("esbuild");

const promise1 = build({
  entryPoints: ["src/cli.ts"],
  platform: "node",
  bundle: true,
  outfile: "cli.js",
  external: ["esbuild", "chokidar", "ws"],
});

const promise2 = build({
  entryPoints: ["index.ts"],
  platform: "node",
  bundle: true,
  outfile: "index.js",
  external: ["esbuild", "chokidar", "ws"],
});

Promise.allSettled([promise1, promise2]).then((values) => {
  console.log(values);
});
