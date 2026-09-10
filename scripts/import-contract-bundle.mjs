import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  contractBundleHash,
  validateContractBundle,
  validateContractBundleProvenance,
} from "./contract-bundle-core.mjs";

const options = parseArgs(process.argv.slice(2));
for (const required of ["source", "tag", "commit", "sha256"]) {
  if (!options[required]) throw new Error("--" + required + " is required");
}
if (!/^[0-9a-f]{40}$/.test(options.commit))
  throw new Error("--commit must be a full lowercase SHA");
if (!/^[0-9a-f]{64}$/.test(options.sha256))
  throw new Error("--sha256 must be a lowercase SHA-256 digest");
const content = await readSource(options.source);
const actualHash = contractBundleHash(content);
if (actualHash !== options.sha256)
  throw new Error(
    "contract bundle hash mismatch: expected " +
      options.sha256 +
      ", received " +
      actualHash,
  );
const bundle = JSON.parse(content);
const errors = validateContractBundle(bundle);
if (errors.length) throw new Error(errors.join("\n"));
const provenance = {
  repository: "rampspec-contracts",
  tag: options.tag,
  commit: options.commit,
  source: options.source,
  sha256: actualHash,
  importedAt: new Date().toISOString(),
};
const provenanceErrors = validateContractBundleProvenance(provenance);
if (provenanceErrors.length) throw new Error(provenanceErrors.join("\n"));
const outputDirectory = path.resolve("generated/contract-specs");
mkdirSync(outputDirectory, { recursive: true });
writeFileSync(path.join(outputDirectory, "contracts.json"), content);
writeFileSync(
  path.join(outputDirectory, "source.json"),
  JSON.stringify(provenance, null, 2) + "\n",
);
console.log("contract-import=ok tag=" + options.tag + " sha256=" + actualHash);

/** @param {string[]} args */
function parseArgs(args) {
  /** @type {Record<string, string>} */
  const parsed = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]?.replace(/^--/, "");
    const value = args[index + 1];
    if (!key || !value)
      throw new Error("invalid argument near " + (args[index] ?? "end"));
    parsed[key] = value;
  }
  return parsed;
}

/** @param {string} source */
async function readSource(source) {
  if (!/^https?:\/\//.test(source))
    return readFileSync(path.resolve(source), "utf8");
  /** @type {Record<string, string>} */
  const headers = {};
  if (process.env.GH_TOKEN)
    headers.Authorization = "Bearer " + process.env.GH_TOKEN;
  const response = await fetch(source, { headers });
  if (!response.ok)
    throw new Error("contract download failed with HTTP " + response.status);
  return response.text();
}
