const { readFile } = require("fs/promises");
const path = require("path");
const { transformAsync } = require("@babel/core");

function reactRefreshPlugin() {
  async function transform(code, codePath) {
    const ext = path.extname(codePath);

    if (ext === ".html") {
      const reactRefreshCode = (await readFile(
        require.resolve(
          "react-refresh/cjs/react-refresh-runtime.development.js",
        ),
        "utf-8",
      ))
        .replace("process.env.NODE_ENV", `'development'`);
      code += `<script>
  function debounce(e,t){let u;return()=>{clearTimeout(u),u=setTimeout(e,t)}}
  const exports = {};
  ${reactRefreshCode}
  exports.performReactRefresh = debounce(exports.performReactRefresh, 30);
  window.$RefreshRuntime$ = exports;
  window.$RefreshRuntime$.injectIntoGlobalHook(window);
  window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => (type) => type;
  </script>`;
    } else if (ext === ".tsx" || ext === ".jsx") {
      const babelFileResult = await transformAsync(code, {
        plugins: [
          [require("react-refresh/babel"), { skipEnvCheck: true }],
          [
            require("@babel/plugin-transform-react-jsx"),
            { runtime: "automatic" },
          ],
        ],
      });
      if (babelFileResult?.code) {
        code = `if (import.meta.hot) {
      var prevRefreshReg = window.$RefreshReg$;
      var prevRefreshSig = window.$RefreshSig$;
      window.$RefreshReg$ = (type, id) => {
          window.$RefreshRuntime$.register(type, '${codePath}' + " " + id)
      };
      window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
  }
  
  ${babelFileResult.code} 
  
  if (import.meta.hot) {
      window.$RefreshReg$ = prevRefreshReg
      window.$RefreshSig$ = prevRefreshSig
      import.meta.hot.accept(() => {
          window.$RefreshRuntime$.performReactRefresh()
      });
  }`;
      }
    }
    return code;
  }

  return {
    name: "rapide-react",
    transform,
    skip: [".tsx", ".jsx"],
  };
}

exports.default = reactRefreshPlugin;
