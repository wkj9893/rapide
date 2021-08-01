var p=Object.create;var o=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var u=Object.getOwnPropertyNames;var w=Object.getPrototypeOf,$=Object.prototype.hasOwnProperty;var f=e=>o(e,"__esModule",{value:!0});var d=(e,r)=>{f(e);for(var i in r)o(e,i,{get:r[i],enumerable:!0})},l=(e,r,i)=>{if(r&&typeof r=="object"||typeof r=="function")for(let t of u(r))!$.call(e,t)&&t!=="default"&&o(e,t,{get:()=>r[t],enumerable:!(i=m(r,t))||i.enumerable});return e},s=e=>l(f(o(e!=null?p(w(e)):{},"default",e&&e.__esModule&&"default"in e?{get:()=>e.default,enumerable:!0}:{value:e,enumerable:!0})),e);d(exports,{default:()=>h});var R=s(require("fs")),a=s(require("path")),c=s(require("@babel/core"));function h(){async function e(r,i){const t=a.default.extname(i);if(t===".html")r+=`<script>
            function debounce(e,t){let u;return()=>{clearTimeout(u),u=setTimeout(e,t)}}
            {
              const exports = {};
              ${R.default.readFileSync(require.resolve("react-refresh/cjs/react-refresh-runtime.development.js"),"utf-8").replace("process.env.NODE_ENV","'development'")}
              exports.performReactRefresh = debounce(exports.performReactRefresh, 30);
              window.$RefreshRuntime$ = exports;
              window.$RefreshRuntime$.injectIntoGlobalHook(window);
              window.$RefreshReg$ = () => {};
              window.$RefreshSig$ = () => (type) => type;
            }
          <\/script>`;else if(t===".tsx"||t===".jsx"){const n=await(0,c.transformAsync)(r,{plugins:[[require("react-refresh/babel"),{skipEnvCheck:!0}]]});n?.code&&(r=`if (import.meta.hot) {
              var prevRefreshReg = window.$RefreshReg$;
              var prevRefreshSig = window.$RefreshSig$;
              window.$RefreshReg$ = (type, id) => {
                window.$RefreshRuntime$.register(type, '${i}' + " " + id)
              };
              window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
              } 
              ${n.code} 
          if (import.meta.hot) {
              window.$RefreshReg$ = prevRefreshReg
              window.$RefreshSig$ = prevRefreshSig
              import.meta.hot.accept(() => {
                window.$RefreshRuntime$.performReactRefresh()
              });
          }
        `)}return r}return{name:"react-refresh",transform:e}}0&&(module.exports={});
