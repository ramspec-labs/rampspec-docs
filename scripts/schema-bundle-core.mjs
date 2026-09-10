import { createHash } from "node:crypto";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const REQUIRED_KINDS = new Set([
  "rule",
  "scenario",
  "suite-lock",
  "event",
  "report",
]);

/** @param {unknown} value @returns {value is Record<string, unknown>} */
const isRecord = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/** @param {string | Buffer} content */
export function schemaBundleHash(content) {
  return createHash("sha256").update(content).digest("hex");
}

/** @param {unknown} value */
export function validateSchemaBundleProvenance(value) {
  /** @type {string[]} */
  const errors = [];
  if (!isRecord(value)) return ["schema provenance must be an object"];
  if (value.repository !== "rampspec-backend")
    errors.push("schema provenance repository must be rampspec-backend");
  if (typeof value.tag !== "string" || !value.tag)
    errors.push("schema provenance tag is required");
  if (!/^[0-9a-f]{40}$/.test(/** @type {string} */ (value.commit)))
    errors.push("schema provenance commit must be a full lowercase SHA");
  if (!/^[0-9a-f]{64}$/.test(/** @type {string} */ (value.sha256)))
    errors.push("schema provenance sha256 is invalid");
  if (typeof value.source !== "string" || !value.source)
    errors.push("schema provenance source is required");
  if (
    typeof value.importedAt !== "string" ||
    Number.isNaN(Date.parse(value.importedAt))
  )
    errors.push("schema provenance importedAt must be an ISO date-time");
  return errors;
}

/** @param {unknown} bundle */
export function validateSchemaBundle(bundle) {
  /** @type {string[]} */
  const errors = [];
  if (!isRecord(bundle)) return ["schema bundle must be an object"];
  if (typeof bundle.bundleVersion !== "string" || !bundle.bundleVersion)
    errors.push("bundleVersion is required");
  if (!Array.isArray(bundle.migrationNotes))
    errors.push("migrationNotes must be an array");
  if (!Array.isArray(bundle.schemas) || !bundle.schemas.length)
    return [...errors, "schemas must be a non-empty array"];
  if (!Array.isArray(bundle.examples)) errors.push("examples must be an array");

  const identifiers = new Set();
  const kinds = new Set();
  /** @type {Record<string, unknown>[]} */
  const schemas = [];
  for (const [index, value] of bundle.schemas.entries()) {
    if (!isRecord(value)) {
      errors.push("schemas[" + index + "] must be an object");
      continue;
    }
    schemas.push(value);
    const identifier = value.$id;
    const kind = value["x-rampspec-kind"];
    if (typeof identifier !== "string" || !/^https:\/\/.+/.test(identifier)) {
      errors.push("schemas[" + index + "].$id must be an absolute HTTPS URL");
    } else if (identifiers.has(identifier)) {
      errors.push("duplicate schema $id: " + identifier);
    } else {
      identifiers.add(identifier);
    }
    if (value.$schema !== "https://json-schema.org/draft/2020-12/schema")
      errors.push("schemas[" + index + "] must declare JSON Schema 2020-12");
    if (!REQUIRED_KINDS.has(/** @type {string} */ (kind)))
      errors.push("schemas[" + index + "] has an invalid x-rampspec-kind");
    else kinds.add(kind);
    if (
      typeof value["x-rampspec-version"] !== "string" ||
      !value["x-rampspec-version"]
    )
      errors.push("schemas[" + index + "] requires x-rampspec-version");
  }
  for (const kind of REQUIRED_KINDS) {
    if (!kinds.has(kind)) errors.push("missing schema kind: " + kind);
  }

  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  ajv.addKeyword("x-rampspec-kind");
  ajv.addKeyword("x-rampspec-version");
  for (const schema of schemas) {
    try {
      ajv.addSchema(schema);
    } catch (error) {
      errors.push("schema compilation failed: " + String(error));
    }
  }

  if (Array.isArray(bundle.examples)) {
    for (const [index, value] of bundle.examples.entries()) {
      if (!isRecord(value)) {
        errors.push("examples[" + index + "] must be an object");
        continue;
      }
      if (typeof value.name !== "string" || !value.name)
        errors.push("examples[" + index + "].name is required");
      if (
        typeof value.schemaId !== "string" ||
        !identifiers.has(value.schemaId)
      ) {
        errors.push("examples[" + index + "].schemaId does not resolve");
        continue;
      }
      if (!Object.hasOwn(value, "document")) {
        errors.push("examples[" + index + "].document is required");
        continue;
      }
      const validate = ajv.getSchema(value.schemaId);
      if (!validate) {
        errors.push("examples[" + index + "].schemaId did not compile");
      } else if (!validate(value.document)) {
        errors.push(
          "examples[" +
            index +
            "] does not validate: " +
            ajv.errorsText(validate.errors),
        );
      }
    }
  }
  return errors;
}
