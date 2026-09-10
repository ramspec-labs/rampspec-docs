import { readFileSync } from "node:fs";
import process from "node:process";
import { listFiles, validateExampleAnnotations } from "./quality-core.mjs";

const root = process.cwd();
const errors = [];
for (const file of listFiles(root, new Set([".mdx"]))) {
  errors.push(
    ...validateExampleAnnotations(root, readFileSync(file, "utf8")).map(
      (error) => `${file}: ${error}`,
    ),
  );
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("example-annotations=ok");
