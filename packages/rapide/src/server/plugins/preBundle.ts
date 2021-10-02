import { builtinModules } from "module";
import { OnResolveArgs } from "esbuild";

const filter = new RegExp(
  builtinModules
    .map((value) => `^${value}$`)
    .join("|")
    .replaceAll("/", "/"),
);

const preBundlePlugin = {
  name: "pre-bundle",
  setup(build: {
    onResolve: (
      arg0: { filter: RegExp },
      arg1: (args: OnResolveArgs) => { path: string; external: boolean },
    ) => void;
  }) {
    build.onResolve({ filter }, (args: OnResolveArgs) => {
      return { path: args.path, external: true };
    });
  },
};

export default preBundlePlugin;
