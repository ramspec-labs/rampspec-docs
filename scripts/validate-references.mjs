import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { validateReferenceIndex } from "./quality-core.mjs";

const root = process.cwd();
const requested = process.argv[2] ?? "generated/reference-index.json";
const indexPath = path.resolve(root, requested);

if (!existsSync(indexPath)) {
  console.log("generated-references=not-required-before-runtime-releases");
  process.exit(0);
}

const index = JSON.parse(readFileSync(indexPath, "utf8"));
const errors = validateReferenceIndex(index, root);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("generated-references=ok");
