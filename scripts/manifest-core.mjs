const COMPONENTS = new Set(["frontend", "backend", "contracts", "docs"]);
const CHANNELS = new Set(["next", "preview", "stable"]);
const ARTIFACT_KINDS = new Set([
  "application",
  "openapi",
  "json-schema-bundle",
  "rule-pack",
  "scenario-bundle",
  "report-schema",
  "suite-lock-schema",
  "runner-image",
  "contract-spec-bundle",
  "contract-bindings",
  "contract-wasm",
  "deployment-manifest",
  "documentation-export",
  "migration-bundle",
  "release-notes",
  "sbom",
  "provenance",
]);
const SEMANTIC_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const RELEASE_TAG = /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

/** @param {unknown} value */
const isRecord = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/** @param {unknown} manifest */
export function validateReleaseManifest(manifest) {
  /** @type {string[]} */
  const errors = [];
  if (!isRecord(manifest)) return ["manifest must be an object"];

  const root = /** @type {Record<string, unknown>} */ (manifest);
  if (root.schemaVersion !== "1.1.0")
    errors.push("schemaVersion must be 1.1.0");
  if (
    root.productVersion !== "unreleased" &&
    !SEMANTIC_VERSION.test(/** @type {string} */ (root.productVersion))
  )
    errors.push("productVersion must be unreleased or a semantic version");
  if (!CHANNELS.has(/** @type {string} */ (root.channel)))
    errors.push("channel must be next, preview, or stable");
  if (root.releasedAt !== null && !isDateTime(root.releasedAt))
    errors.push("releasedAt must be null or an ISO date-time");

  if (!Array.isArray(root.components)) {
    errors.push("components must be an array");
  } else {
    const names = new Set();
    for (const [index, value] of root.components.entries()) {
      if (!isRecord(value)) {
        errors.push(`components[${index}] must be an object`);
        continue;
      }
      const component = /** @type {Record<string, unknown>} */ (value);
      const name = /** @type {string} */ (component.name);
      if (!COMPONENTS.has(name))
        errors.push(`components[${index}].name is invalid`);
      if (names.has(name)) errors.push(`duplicate component: ${name}`);
      names.add(name);
      if (component.repository !== `rampspec-${name}`)
        errors.push(`components[${index}].repository does not match name`);
      if (
        !new Set(["unavailable", "released"]).has(
          /** @type {string} */ (component.status),
        )
      )
        errors.push(`components[${index}].status is invalid`);
      if (!Array.isArray(component.artifacts)) {
        errors.push(`components[${index}].artifacts must be an array`);
        continue;
      }
      if (component.status === "unavailable") {
        if (
          component.tag !== null ||
          component.commit !== null ||
          component.artifacts.length
        )
          errors.push(
            `unavailable component ${name} cannot claim release data`,
          );
      } else {
        if (!RELEASE_TAG.test(/** @type {string} */ (component.tag)))
          errors.push(
            `released component ${name} requires a tag formatted as a semantic v version`,
          );
        if (!/^[0-9a-f]{40}$/.test(/** @type {string} */ (component.commit)))
          errors.push(
            `released component ${name} requires a 40-character commit`,
          );
        if (!component.artifacts.length)
          errors.push(
            `released component ${name} requires at least one artifact`,
          );
      }
      for (const [
        artifactIndex,
        artifactValue,
      ] of component.artifacts.entries()) {
        if (!isRecord(artifactValue)) {
          errors.push(
            `components[${index}].artifacts[${artifactIndex}] must be an object`,
          );
          continue;
        }
        const artifact = /** @type {Record<string, unknown>} */ (artifactValue);
        if (!ARTIFACT_KINDS.has(/** @type {string} */ (artifact.kind)))
          errors.push(
            `components[${index}].artifacts[${artifactIndex}].kind is invalid`,
          );
        if (typeof artifact.path !== "string" || !artifact.path)
          errors.push(
            `components[${index}].artifacts[${artifactIndex}].path is required`,
          );
        if (!/^[0-9a-f]{64}$/.test(/** @type {string} */ (artifact.sha256)))
          errors.push(
            `components[${index}].artifacts[${artifactIndex}].sha256 is invalid`,
          );
      }
    }
    for (const name of COMPONENTS) {
      if (!names.has(name)) errors.push(`missing component: ${name}`);
    }
  }

  if (!isRecord(root.compatibility)) {
    errors.push("compatibility must be an object");
  } else {
    const compatibility = /** @type {Record<string, unknown>} */ (
      root.compatibility
    );
    for (const key of [
      "apiMajor",
      "schemaMajor",
      "contractMajor",
      "runnerProtocolMajor",
    ]) {
      const value = compatibility[key];
      if (value !== null && (!Number.isInteger(value) || Number(value) < 1))
        errors.push(`compatibility.${key} must be null or a positive integer`);
    }
    for (const key of [
      "rulePackVersion",
      "scenarioSchemaVersion",
      "reportSchemaVersion",
      "suiteLockSchemaVersion",
    ]) {
      const value = compatibility[key];
      if (
        value !== null &&
        !SEMANTIC_VERSION.test(/** @type {string} */ (value))
      )
        errors.push(`compatibility.${key} must be null or a semantic version`);
    }
    if (!Array.isArray(compatibility.breakingChanges))
      errors.push("compatibility.breakingChanges must be an array");
    if (!Array.isArray(compatibility.migrationNotes))
      errors.push("compatibility.migrationNotes must be an array");
    if (
      Array.isArray(compatibility.breakingChanges) &&
      compatibility.breakingChanges.length > 0 &&
      (!Array.isArray(compatibility.migrationNotes) ||
        compatibility.migrationNotes.length === 0)
    )
      errors.push("breaking changes require migration notes");
  }

  if (!isRecord(root.verification)) {
    errors.push("verification must be an object");
  } else {
    const verification = /** @type {Record<string, unknown>} */ (
      root.verification
    );
    if (
      !new Set(["not-applicable", "verified"]).has(
        /** @type {string} */ (verification.status),
      )
    )
      errors.push("verification.status is invalid");
    if (
      verification.verifiedAt !== null &&
      !isDateTime(verification.verifiedAt)
    )
      errors.push("verification.verifiedAt must be null or an ISO date-time");
    if (
      verification.status === "verified" &&
      !isDateTime(verification.verifiedAt)
    )
      errors.push("verified manifests require verifiedAt");
    if (typeof verification.command !== "string" || !verification.command)
      errors.push("verification.command is required");
  }

  const released = Array.isArray(root.components)
    ? root.components.some(
        (value) => isRecord(value) && value.status === "released",
      )
    : false;
  if (!released && (root.channel !== "next" || root.releasedAt !== null))
    errors.push(
      "an unreleased manifest must use the next channel and null releasedAt",
    );
  if (released && root.releasedAt === null)
    errors.push("a released manifest requires releasedAt");

  if (root.channel === "stable" && Array.isArray(root.components)) {
    const releasedNames = new Set(
      root.components
        .filter((value) => isRecord(value) && value.status === "released")
        .map((value) => /** @type {Record<string, unknown>} */ (value).name),
    );
    if ([...COMPONENTS].some((name) => !releasedNames.has(name)))
      errors.push("a stable manifest requires all four released components");

    for (const value of root.components) {
      if (!isRecord(value) || !Array.isArray(value.artifacts)) continue;
      const kinds = new Set();
      for (const artifact of value.artifacts) {
        if (isRecord(artifact)) kinds.add(artifact.kind);
      }
      for (const required of ["sbom", "provenance"]) {
        if (!kinds.has(required))
          errors.push(`stable component ${value.name} requires ${required}`);
      }
    }

    const compatibility = isRecord(root.compatibility)
      ? /** @type {Record<string, unknown>} */ (root.compatibility)
      : {};
    for (const key of [
      "apiMajor",
      "schemaMajor",
      "contractMajor",
      "runnerProtocolMajor",
      "rulePackVersion",
      "scenarioSchemaVersion",
      "reportSchemaVersion",
      "suiteLockSchemaVersion",
    ]) {
      if (compatibility[key] === null || compatibility[key] === undefined)
        errors.push(`stable compatibility requires ${key}`);
    }
    const verification = isRecord(root.verification)
      ? /** @type {Record<string, unknown>} */ (root.verification)
      : {};
    if (verification.status !== "verified")
      errors.push("a stable manifest requires verified status");
  }

  return errors;
}

/** @param {unknown} value */
function isDateTime(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}
