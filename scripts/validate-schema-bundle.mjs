import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  schemaBundleHash,
  validateSchemaBundle,
  validateSchemaBundleProvenance,
} from "./schema-bundle-core.mjs";

const bundlePath = path.resolve("generated/schemas/schemas.json");
const sourcePath = path.resolve("generated/schemas/source.json");
if (!existsSync(bundlePath) && !existsSync(sourcePath)) {
  console.log("generated-schemas=unavailable no-backend-release");
  process.exit(0);
}
if (!existsSync(bundlePath) || !existsSync(sourcePath)) {
  console.error("generated schemas and source provenance must exist together");
  process.exit(1);
}

const content = readFileSync(bundlePath, "utf8");
const bundle = JSON.parse(content);
const provenance = JSON.parse(readFileSync(sourcePath, "utf8"));
const errors = [
  ...validateSchemaBundle(bundle),
  ...validateSchemaBundleProvenance(provenance),
];
if (schemaBundleHash(content) !== provenance.sha256)
  errors.push("generated schema bundle does not match its source hash");
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("generated-schemas=ok tag=" + provenance.tag);
