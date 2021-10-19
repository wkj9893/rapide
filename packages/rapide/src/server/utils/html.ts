import path = require("path");
import fs = require("fs");
import { rootPath } from "./path";
import { overwrite } from "./overwrite";

interface ImportSpecifier {
  start: number;
  str: string;
}

export function scanHtml(html: string): ImportSpecifier[] {
  const res: ImportSpecifier[] = [];
  let i = 0;
  let tagClose = false;
  while (i < html.length) {
    //  skip html comment
    if (html.slice(i, i + 4) === "<!--") {
      i += 4;
      while (html.slice(i, i + 3) !== "-->") {
        i++;
      }
      i += 3;
      continue;
    }
    // link
    if (html.slice(i, i + 5) === "<link") {
      i += 5;
      while (html[i] !== ">") {
        if (html.slice(i, i + 4) === "href") {
          i += 4;
          while (html[i] !== `'` && html[i] !== `"`) {
            i++;
          }
          checkUrl();
        }
        i++;
      }
      i += 7;
      continue;
    }

    // script
    if (html.slice(i, i + 7) === "<script") {
      i += 7;
      while (html.slice(i, i + 9) !== "</script>") {
        if (html[i] === ">") {
          tagClose = true;
        }
        if (!tagClose && html.slice(i, i + 3) === "src") {
          i += 3;
          while (html[i] !== `'` && html[i] !== `"`) {
            i++;
          }
          checkUrl();
        }
        i++;
      }
      tagClose = false;
      i += 9;
      continue;
    }
    i++;
  }

  return res;

  function checkUrl() {
    let str = "";
    if (html[i] == `'`) {
      i++;
      const start = i;
      while (html[i] !== `'`) {
        str += html[i];
        i++;
      }
      res.push({ start, str });
    } else if (html[i] == `"`) {
      i++;
      const start = i;
      while (html[i] !== `"`) {
        str += html[i];
        i++;
      }
      res.push({ start, str });
    }
  }
}

export function transformHtml(html: string): {
  html: string;
  filePaths: string[];
} {
  const filePaths: string[] = [];
  const imports = scanHtml(html);
  const starts = [];
  const ends = [];
  const contents = [];
  for (const { str, start } of imports) {
    const src = path.join(rootPath, str);
    const ext = path.extname(src);
    if (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx") {
      starts.push(start);
      ends.push(start + str.length);
      contents.push("");
      filePaths.push(src);
    } else {
      const dest = path.join(rootPath, "build", str);
      fs.cpSync(src, dest, {
        recursive: true,
      });
      starts.push(start);
      ends.push(start + str.length);
      contents.push(path.join("build", str));
    }
  }
  html = overwrite(html, starts, ends, contents);
  return { html, filePaths };
}

export function findHtml(dir: string): string[] {
  const res: string[] = [];
  find(dir);
  return res;

  function find(dir: string) {
    for (const fileName of fs.readdirSync(dir)) {
      const filePath = path.resolve(dir, fileName);
      const stat = fs.statSync(filePath);
      if (stat.isFile() && path.extname(fileName) === ".html") {
        res.push(filePath);
        continue;
      }
      if (stat.isDirectory()) {
        find(filePath);
      }
    }
  }
}
