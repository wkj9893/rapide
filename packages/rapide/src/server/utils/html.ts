import path = require("path");
import fs = require("fs");
import { resolveUrl, rootPath } from "./path";
import { writeFileString } from "./file";
import { overwrite } from "./overwrite";

interface HtmlInfo {
  head: number;
  starts: number[];
  strs: string[];
}

function scanHtml(html: string): HtmlInfo {
  let i = 0;
  let head = -1;
  let tagClose = false;
  const starts: number[] = [];
  const strs: string[] = [];
  while (i < html.length) {
    if (html.slice(i, i + 6) === "<head>") {
      i += 6;
      continue;
    }
    //  skip head
    if (html.slice(i, i + 7) === "</head>") {
      head = i - 1;
      i += 7;
      continue;
    }
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
    if (html[i] === "<") {
      while (html[i] !== ">") {
        i++;
      }
      i++;
      continue;
    }
    i++;
  }

  return { head, starts, strs };

  function checkUrl() {
    let str = "";
    if (html[i] == `'`) {
      i++;
      const start = i;
      while (html[i] !== `'`) {
        str += html[i];
        i++;
      }
      starts.push(start);
      strs.push(str);
    } else if (html[i] == `"`) {
      i++;
      const start = i;
      while (html[i] !== `"`) {
        str += html[i];
        i++;
      }
      starts.push(start);
      strs.push(str);
    }
  }
}

function findHtml(dir: string): string[] {
  const res: string[] = [];
  find(dir);
  return res;

  function find(dir: string) {
    for (const fileName of fs.readdirSync(dir)) {
      const filePath = path.join(dir, fileName);
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

function findEntryPoints(
  htmlPath: string,
  html: string,
): string[] {
  const entryPoints: string[] = [];
  const { strs } = scanHtml(html);
  for (let i = 0; i < strs.length; i++) {
    const str = strs[i];
    const ext = path.extname(str);
    if (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx") {
      entryPoints.push(resolveUrl(htmlPath, str));
    }
  }
  return entryPoints;
}

async function writeHtml(
  htmlPath: string,
  html: string,
  jsMap: Map<string, string>,
  cssMap: Map<string, string>,
): Promise<void> {
  const { head, starts, strs } = scanHtml(html);
  const arr1 = [head];
  const arr2 = [head + 1];
  const contents = [""];
  let css = "";
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const str = strs[i];
    const filePath = resolveUrl(htmlPath, str);
    const ext = path.extname(str);
    if (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx") {
      if (cssMap.get(filePath)) {
        css += `\n  <link rel="stylesheet" href="${cssMap.get(filePath)}">  \n`;
      }
      arr1.push(start);
      arr2.push(start + str.length);
      contents.push(jsMap.get(filePath) as string);
    } else {
      await writeFileString(
        filePath,
        path.join("buid", path.relative(rootPath, filePath)),
      );
    }
  }
  contents[0] = css;
  for (let i = 1; i < starts.length; i++) {
    if (starts[i] < starts[0]) {
      [starts[i], starts[0], strs[i], strs[0]] = [
        head,
        starts[i],
        strs[0],
        strs[i],
      ];
    } else {
      break;
    }
  }
  console.log(arr1, arr2, contents);
  html = overwrite(html, arr1, arr2, contents);
  await writeFileString(
    path.join("build", path.relative(rootPath, htmlPath)),
    html,
  );
}

export { findEntryPoints, findHtml, scanHtml, writeHtml };
