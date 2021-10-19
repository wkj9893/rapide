import { deepEqual } from "assert/strict";
import { overwrite } from "../src/server/utils/overwrite";

deepEqual(overwrite("problems = 99", [0], [8], ["answer"]), "answer = 99");
deepEqual(
  overwrite("import foo from bar", [16], [19], ["baz"]),
  "import foo from baz",
);
