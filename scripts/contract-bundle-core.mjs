import { createHash } from "node:crypto";

const ARTIFACT_KINDS = new Set([
  "spec-json",
  "spec-xdr",
  "typescript-binding",
  "wasm",
  "deployment-manifest",
]);
const REQUIRED_ARTIFACT_KINDS = new Set([
  "spec-json",
  "typescript-binding",
  "wasm",
  "deployment-manifest",
]);

/** @param {unknown} value @returns {value is Record<string, unknown>} */
const isRecord = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/** @param {string | Buffer} content */
export function contractBundleHash(content) {
  return createHash("sha256").update(content).digest("hex");
}

/** @param {unknown} value */
export function validateContractBundleProvenance(value) {
  /** @type {string[]} */
  const errors = [];
  if (!isRecord(value)) return ["contract provenance must be an object"];
  if (value.repository !== "rampspec-contracts")
    errors.push("contract provenance repository must be rampspec-contracts");
  if (typeof value.tag !== "string" || !value.tag)
    errors.push("contract provenance tag is required");
  if (!/^[0-9a-f]{40}$/.test(/** @type {string} */ (value.commit)))
    errors.push("contract provenance commit must be a full lowercase SHA");
  if (!/^[0-9a-f]{64}$/.test(/** @type {string} */ (value.sha256)))
    errors.push("contract provenance sha256 is invalid");
  if (typeof value.source !== "string" || !value.source)
    errors.push("contract provenance source is required");
  if (
    typeof value.importedAt !== "string" ||
    Number.isNaN(Date.parse(value.importedAt))
  )
    errors.push("contract provenance importedAt must be an ISO date-time");
  return errors;
}

/** @param {unknown} bundle */
export function validateContractBundle(bundle) {
  /** @type {string[]} */
  const errors = [];
  if (!isRecord(bundle)) return ["contract bundle must be an object"];
  if (typeof bundle.bundleVersion !== "string" || !bundle.bundleVersion)
    errors.push("bundleVersion is required");
  if (!Array.isArray(bundle.migrationNotes))
    errors.push("migrationNotes must be an array");
  if (!Array.isArray(bundle.artifacts) || !bundle.artifacts.length)
    return [...errors, "artifacts must be a non-empty array"];

  const artifactKinds = new Set();
  const artifactPaths = new Set();
  const wasmHashes = new Set();
  const specHashes = new Set();
  for (const [index, value] of bundle.artifacts.entries()) {
    if (!isRecord(value)) {
      errors.push("artifacts[" + index + "] must be an object");
      continue;
    }
    if (!ARTIFACT_KINDS.has(/** @type {string} */ (value.kind)))
      errors.push("artifacts[" + index + "].kind is invalid");
    else artifactKinds.add(value.kind);
    if (typeof value.path !== "string" || !value.path) {
      errors.push("artifacts[" + index + "].path is required");
    } else if (artifactPaths.has(value.path)) {
      errors.push("duplicate artifact path: " + value.path);
    } else {
      artifactPaths.add(value.path);
    }
    if (!/^[0-9a-f]{64}$/.test(/** @type {string} */ (value.sha256)))
      errors.push("artifacts[" + index + "].sha256 is invalid");
    else if (value.kind === "wasm") wasmHashes.add(value.sha256);
    else if (value.kind === "spec-json") specHashes.add(value.sha256);
  }
  for (const kind of REQUIRED_ARTIFACT_KINDS) {
    if (!artifactKinds.has(kind)) errors.push("missing artifact kind: " + kind);
  }

  if (!Array.isArray(bundle.contracts) || !bundle.contracts.length) {
    errors.push("contracts must be a non-empty array");
  } else {
    const names = new Set();
    for (const [index, value] of bundle.contracts.entries()) {
      if (!isRecord(value)) {
        errors.push("contracts[" + index + "] must be an object");
        continue;
      }
      if (typeof value.name !== "string" || !value.name)
        errors.push("contracts[" + index + "].name is required");
      else if (names.has(value.name))
        errors.push("duplicate contract name: " + value.name);
      else names.add(value.name);
      if (
        !new Set(["production", "test-fixture"]).has(
          /** @type {string} */ (value.classification),
        )
      )
        errors.push("contracts[" + index + "].classification is invalid");
      if (!wasmHashes.has(value.wasmSha256))
        errors.push("contracts[" + index + "].wasmSha256 is unknown");
      if (!specHashes.has(value.specSha256))
        errors.push("contracts[" + index + "].specSha256 is unknown");
      for (const key of ["methods", "types", "errors", "events"]) {
        if (!Array.isArray(value[key]) || !value[key].length)
          errors.push("contracts[" + index + "]." + key + " must be non-empty");
      }
      for (const key of ["methods", "types", "events"]) {
        if (Array.isArray(value[key])) {
          const entries = value[key];
          if (new Set(entries).size !== entries.length)
            errors.push(
              "contracts[" + index + "]." + key + " contains duplicates",
            );
        }
      }
      if (Array.isArray(value.errors)) {
        const codes = new Set();
        const errorNames = new Set();
        for (const entry of value.errors) {
          if (
            !isRecord(entry) ||
            !Number.isInteger(entry.code) ||
            typeof entry.name !== "string"
          )
            errors.push("contracts[" + index + "] has an invalid error entry");
          else if (codes.has(entry.code) || errorNames.has(entry.name))
            errors.push(
              "contracts[" + index + "] has duplicate error codes or names",
            );
          else {
            codes.add(entry.code);
            errorNames.add(entry.name);
          }
        }
      }
    }
  }

  if (!Array.isArray(bundle.deployments)) {
    errors.push("deployments must be an array");
  } else {
    const contractNames = new Set(
      Array.isArray(bundle.contracts)
        ? bundle.contracts
            .filter(isRecord)
            .map((contract) => contract.name)
            .filter((name) => typeof name === "string")
        : [],
    );
    for (const [index, value] of bundle.deployments.entries()) {
      if (!isRecord(value)) {
        errors.push("deployments[" + index + "] must be an object");
        continue;
      }
      if (!contractNames.has(/** @type {string} */ (value.contract)))
        errors.push("deployments[" + index + "].contract is unknown");
      if (
        !new Set(["testnet", "pubnet"]).has(
          /** @type {string} */ (value.network),
        )
      )
        errors.push("deployments[" + index + "].network is invalid");
      if (!/^C[A-Z2-7]{55}$/.test(/** @type {string} */ (value.contractId)))
        errors.push("deployments[" + index + "].contractId is invalid");
      if (!wasmHashes.has(value.wasmSha256))
        errors.push("deployments[" + index + "].wasmSha256 is unknown");
      if (
        typeof value.verifiedAt !== "string" ||
        Number.isNaN(Date.parse(value.verifiedAt))
      )
        errors.push(
          "deployments[" + index + "].verifiedAt must be an ISO date-time",
        );
      if (typeof value.rpcUrl !== "string" || !/^https:\/\//.test(value.rpcUrl))
        errors.push("deployments[" + index + "].rpcUrl must be HTTPS");
      if (typeof value.testOnly !== "boolean")
        errors.push("deployments[" + index + "].testOnly must be boolean");
    }
  }
  return errors;
}
