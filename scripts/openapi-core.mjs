import { createHash } from "node:crypto";

/** @param {string | Buffer} content */
export function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

/** @param {unknown} value @returns {value is Record<string, unknown>} */
const isRecord = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/** @param {unknown} document */
export function validateOpenApiDocument(document) {
  /** @type {string[]} */
  const errors = [];
  if (!isRecord(document)) return ["OpenAPI document must be an object"];
  const root = /** @type {Record<string, unknown>} */ (document);
  if (typeof root.openapi !== "string" || !/^3\.(0|1)\./.test(root.openapi))
    errors.push("OpenAPI version must be 3.0.x or 3.1.x");
  if (!isRecord(root.info)) {
    errors.push("OpenAPI info object is required");
  } else {
    const info = /** @type {Record<string, unknown>} */ (root.info);
    if (typeof info.title !== "string" || !info.title)
      errors.push("OpenAPI info.title is required");
    if (typeof info.version !== "string" || !info.version)
      errors.push("OpenAPI info.version is required");
  }
  if (!isRecord(root.paths)) {
    errors.push("OpenAPI paths object is required");
    return errors;
  }

  const operationIds = new Set();
  const methods = new Set([
    "get",
    "put",
    "post",
    "delete",
    "options",
    "head",
    "patch",
    "trace",
  ]);
  for (const [route, pathValue] of Object.entries(root.paths)) {
    if (!route.startsWith("/")) errors.push("invalid OpenAPI path: " + route);
    if (!isRecord(pathValue)) {
      errors.push("path item must be an object: " + route);
      continue;
    }
    for (const [method, operationValue] of Object.entries(pathValue)) {
      if (!methods.has(method.toLowerCase())) continue;
      if (!isRecord(operationValue)) {
        errors.push(
          "operation must be an object: " + method.toUpperCase() + " " + route,
        );
        continue;
      }
      const operation = /** @type {Record<string, unknown>} */ (operationValue);
      if (typeof operation.operationId !== "string" || !operation.operationId) {
        errors.push(
          "operationId is required: " + method.toUpperCase() + " " + route,
        );
      } else if (operationIds.has(operation.operationId)) {
        errors.push("duplicate operationId: " + operation.operationId);
      } else {
        operationIds.add(operation.operationId);
      }
      if (
        !isRecord(operation.responses) ||
        !Object.keys(operation.responses).length
      )
        errors.push(
          "responses are required: " + method.toUpperCase() + " " + route,
        );
    }
  }
  return errors;
}

/** @param {unknown} value */
export function validateOpenApiProvenance(value) {
  /** @type {string[]} */
  const errors = [];
  if (!isRecord(value)) return ["OpenAPI provenance must be an object"];
  const provenance = /** @type {Record<string, unknown>} */ (value);
  if (provenance.repository !== "rampspec-backend")
    errors.push("OpenAPI provenance repository must be rampspec-backend");
  if (typeof provenance.tag !== "string" || !provenance.tag)
    errors.push("OpenAPI provenance tag is required");
  if (!/^[0-9a-f]{40}$/.test(/** @type {string} */ (provenance.commit)))
    errors.push("OpenAPI provenance commit must be a full lowercase SHA");
  if (!/^[0-9a-f]{64}$/.test(/** @type {string} */ (provenance.sha256)))
    errors.push("OpenAPI provenance sha256 is invalid");
  if (typeof provenance.source !== "string" || !provenance.source)
    errors.push("OpenAPI provenance source is required");
  if (
    typeof provenance.importedAt !== "string" ||
    Number.isNaN(Date.parse(provenance.importedAt))
  )
    errors.push("OpenAPI provenance importedAt must be an ISO date-time");
  return errors;
}
