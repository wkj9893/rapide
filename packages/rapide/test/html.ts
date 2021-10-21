import { scanHtml } from "../src/server/utils/html";
import { deepEqual } from "assert/strict";

deepEqual(
  scanHtml(`<link rel="icon" href="https://reactjs.org/favicon.ico">
      <script type="module" src="src/index.tsx"></script>`),
  {
    head: -1,
    starts: [23, 90],
    strs: ["https://reactjs.org/favicon.ico", "src/index.tsx"],
  },
);
