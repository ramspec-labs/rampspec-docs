const REQUIRED_SEPS = new Set([1, 6, 9, 10, 12, 24, 31, 34, 38, 45]);

/** @param {unknown} value @returns {value is Record<string, unknown>} */
const isRecord = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/** @param {unknown} value */
export function validateStandardsSnapshot(value) {
  /** @type {string[]} */
  const errors = [];
  if (!isRecord(value)) return ["standards snapshot must be an object"];
  if (value.repository !== "stellar/stellar-protocol")
    errors.push("repository must be stellar/stellar-protocol");
  if (!/^[0-9a-f]{40}$/.test(/** @type {string} */ (value.commit)))
    errors.push("commit must be a full lowercase SHA");
  if (
    typeof value.retrievedAt !== "string" ||
    Number.isNaN(Date.parse(value.retrievedAt))
  )
    errors.push("retrievedAt must be an ISO date-time");
  if (!Array.isArray(value.documents))
    return [...errors, "documents must be an array"];

  const seen = new Set();
  for (const [index, document] of value.documents.entries()) {
    if (!isRecord(document)) {
      errors.push("documents[" + index + "] must be an object");
      continue;
    }
    if (
      !Number.isInteger(document.sep) ||
      !REQUIRED_SEPS.has(Number(document.sep))
    )
      errors.push(
        "documents[" + index + "].sep is not in the supported baseline",
      );
    else if (seen.has(document.sep))
      errors.push("duplicate SEP: " + document.sep);
    else seen.add(document.sep);
    if (typeof document.title !== "string" || !document.title)
      errors.push("documents[" + index + "].title is required");
    if (typeof document.status !== "string" || !document.status)
      errors.push("documents[" + index + "].status is required");
    if (
      document.version !== null &&
      !/^\d+\.\d+\.\d+$/.test(/** @type {string} */ (document.version))
    )
      errors.push("documents[" + index + "].version must be semantic or null");
    if (
      document.updated !== null &&
      !/^\d{4}-\d{2}-\d{2}$/.test(/** @type {string} */ (document.updated))
    )
      errors.push(
        "documents[" + index + "].updated must be YYYY-MM-DD or null",
      );
    const expectedPath =
      "ecosystem/sep-" + String(document.sep).padStart(4, "0") + ".md";
    if (document.path !== expectedPath)
      errors.push("documents[" + index + "].path does not match SEP number");
    if (!/^[0-9a-f]{64}$/.test(/** @type {string} */ (document.sha256)))
      errors.push("documents[" + index + "].sha256 is invalid");
  }
  for (const sep of REQUIRED_SEPS) {
    if (!seen.has(sep)) errors.push("missing SEP: " + sep);
  }
  return errors;
}

/** @param {unknown} value */
export function validateSpecSyncRecord(value) {
  /** @type {string[]} */
  const errors = [];
  if (!isRecord(value)) return ["spec sync record must be an object"];
  if (value.schemaVersion !== "1.0.0")
    errors.push("spec sync schemaVersion must be 1.0.0");
  if (
    !new Set(["initial-baseline", "update"]).has(
      /** @type {string} */ (value.status),
    )
  )
    errors.push("spec sync status is invalid");
  if (
    typeof value.capturedAt !== "string" ||
    Number.isNaN(Date.parse(value.capturedAt))
  )
    errors.push("spec sync capturedAt must be an ISO date-time");
  if (value.sourceRepository !== "stellar/stellar-protocol")
    errors.push("spec sync sourceRepository is invalid");
  if (
    value.fromCommit !== null &&
    !/^[0-9a-f]{40}$/.test(/** @type {string} */ (value.fromCommit))
  )
    errors.push("spec sync fromCommit must be a full lowercase SHA or null");
  if (!/^[0-9a-f]{40}$/.test(/** @type {string} */ (value.toCommit)))
    errors.push("spec sync toCommit must be a full lowercase SHA");
  if (value.hashesVerified !== true)
    errors.push("spec sync hashes must be verified");
  if (!isRecord(value.diff)) {
    errors.push("spec sync diff must be an object");
  } else {
    for (const key of [
      "addedDocuments",
      "changedRequirements",
      "deprecatedRequirements",
      "removedRequirements",
    ]) {
      if (!Array.isArray(value.diff[key]))
        errors.push("spec sync diff." + key + " must be an array");
    }
  }
  if (!Array.isArray(value.artifacts) || !value.artifacts.length)
    errors.push("spec sync artifacts must be a non-empty array");
  if (typeof value.runtimeRulePackUpdated !== "boolean")
    errors.push("spec sync runtimeRulePackUpdated must be boolean");
  if (typeof value.releaseBound !== "boolean")
    errors.push("spec sync releaseBound must be boolean");
  if (value.releaseBound && !value.runtimeRulePackUpdated)
    errors.push("a release-bound sync requires a runtime rule-pack update");
  return errors;
}
