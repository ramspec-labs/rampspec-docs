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
