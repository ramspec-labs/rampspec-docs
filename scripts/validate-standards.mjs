import { readFileSync } from "node:fs";
import process from "node:process";
import { validateStandardsSnapshot } from "./standards-core.mjs";

const snapshot = JSON.parse(readFileSync("standards/snapshot.json", "utf8"));
const errors = validateStandardsSnapshot(snapshot);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  "standards-snapshot=ok commit=" +
    snapshot.commit +
    " documents=" +
    snapshot.documents.length,
);
