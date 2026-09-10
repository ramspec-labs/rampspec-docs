import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  contractBundleHash,
  validateContractBundle,
  validateContractBundleProvenance,
} from "./contract-bundle-core.mjs";

const bundlePath = path.resolve("generated/contract-specs/contracts.json");
const sourcePath = path.resolve("generated/contract-specs/source.json");
if (!existsSync(bundlePath) && !existsSync(sourcePath)) {
  console.log("generated-contracts=unavailable no-contracts-release");
  process.exit(0);
}
if (!existsSync(bundlePath) || !existsSync(sourcePath)) {
  console.error(
    "generated contracts and source provenance must exist together",
  );
  process.exit(1);
}
const content = readFileSync(bundlePath, "utf8");
const bundle = JSON.parse(content);
const provenance = JSON.parse(readFileSync(sourcePath, "utf8"));
const errors = [
  ...validateContractBundle(bundle),
  ...validateContractBundleProvenance(provenance),
];
if (contractBundleHash(content) !== provenance.sha256)
  errors.push("generated contract bundle does not match its source hash");
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("generated-contracts=ok tag=" + provenance.tag);
