//  https://github.com/marvinhagemeister/kolorist/blob/main/src/index.ts
function color(start: number, end: number) {
  return (str: string) => {
    return `\x1b[${start}m${str}\x1b[${end}m`;
  };
}

const cyan = color(36, 39);
const lightBlue = color(94, 39);

export { cyan, lightBlue };
