import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { validateReleaseManifest } from "./manifest-core.mjs";

const requested = process.argv[2] ?? "examples/release-manifest.planned.json";
const manifestPath = path.resolve(process.cwd(), requested);
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const errors = validateReleaseManifest(manifest);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `release-manifest=ok path=${path.relative(process.cwd(), manifestPath)}`,
);
