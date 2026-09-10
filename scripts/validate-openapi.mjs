import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  sha256,
  validateOpenApiDocument,
  validateOpenApiProvenance,
} from "./openapi-core.mjs";

const documentPath = path.resolve("generated/openapi/openapi.json");
const sourcePath = path.resolve("generated/openapi/source.json");
if (!existsSync(documentPath) && !existsSync(sourcePath)) {
  console.log("generated-openapi=unavailable no-backend-release");
  process.exit(0);
}
if (!existsSync(documentPath) || !existsSync(sourcePath)) {
  console.error("generated OpenAPI and source provenance must exist together");
  process.exit(1);
}

const content = readFileSync(documentPath, "utf8");
const document = JSON.parse(content);
const provenance = JSON.parse(readFileSync(sourcePath, "utf8"));
const errors = [
  ...validateOpenApiDocument(document),
  ...validateOpenApiProvenance(provenance),
];
const canonicalContent = JSON.stringify(document, null, 2) + "\n";
if (content !== canonicalContent)
  errors.push("generated OpenAPI must use canonical two-space JSON formatting");
if (sha256(content) !== provenance.sha256)
  errors.push("generated OpenAPI content does not match its source hash");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("generated-openapi=ok tag=" + provenance.tag);
