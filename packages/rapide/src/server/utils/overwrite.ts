export function overwrite(
  source: string,
  starts: number[],
  ends: number[],
  contents: string[],
): string {
  let res = "";
  let j = 0;
  for (let i = 0; i < source.length; i++) {
    if (j >= starts.length || i < starts[j] || i >= ends[j]) {
      res += source[i];
      continue;
    }
    res += contents[j];
    i = ends[j] - 1;
    j++;
  }
  return res;
}
