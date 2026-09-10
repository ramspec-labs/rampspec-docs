import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  validateDocumentText,
  validateExampleAnnotations,
  validateNavigationPages,
  validateReferenceIndex,
} from "../../scripts/quality-core.mjs";
import { validateReleaseManifest } from "../../scripts/manifest-core.mjs";
import {
  sha256,
  validateOpenApiDocument,
  validateOpenApiProvenance,
} from "../../scripts/openapi-core.mjs";
import {
  schemaBundleHash,
  validateSchemaBundle,
  validateSchemaBundleProvenance,
} from "../../scripts/schema-bundle-core.mjs";
import {
  contractBundleHash,
  validateContractBundle,
  validateContractBundleProvenance,
} from "../../scripts/contract-bundle-core.mjs";
import { validateStandardsSnapshot } from "../../scripts/standards-core.mjs";

const root = process.cwd();

test("content validation detects broken structure and links", () => {
  const fixture = path.join(root, "tests", "quality", "fixtures", "site");
  const source = path.join(fixture, "broken.mdx");
  const text = readFileSync(path.join(fixture, "broken.mdx.fixture"), "utf8");
  const errors = validateDocumentText(fixture, source, text).errors.join("\n");
  assert.match(errors, /missing description frontmatter/);
  assert.match(errors, /broken local link: missing-page/);
  assert.match(errors, /image has empty alt text/);
  assert.match(errors, /heading level jumps/);
});

test("external link extraction stops at inline-code delimiters", () => {
  const result = validateDocumentText(
    root,
    path.join(root, "fixture.mdx"),
    [
      "---",
      'title: "Fixture"',
      'description: "Fixture description"',
      "---",
      "",
      "Use `https://json-schema.org/draft/2020-12/schema`;",
    ].join("\n"),
  );
  assert.deepEqual(result.externalLinks, [
    "https://json-schema.org/draft/2020-12/schema",
  ]);
});

test("navigation validation detects missing and orphaned pages", () => {
  const navigation = {
    pages: ["introduction", "missing", "introduction"],
  };
  const errors = validateNavigationPages(
    navigation,
    new Set(["introduction", "orphaned"]),
  ).join("\n");
  assert.match(errors, /duplicate navigation page: introduction/);
  assert.match(errors, /navigation page does not exist: missing/);
  assert.match(errors, /orphaned MDX page: orphaned/);
});

test("reference validation detects absent operations, schemas, methods, and snippets", () => {
  const fixture = JSON.parse(
    readFileSync(
      path.join(
        root,
        "tests",
        "quality",
        "fixtures",
        "reference-index.invalid.json",
      ),
      "utf8",
    ),
  );
  const errors = validateReferenceIndex(fixture, root).join("\n");
  assert.match(errors, /missing operations reference/);
  assert.match(errors, /missing schemas reference/);
  assert.match(errors, /missing contractMethods reference/);
  assert.match(errors, /missing snippet/);
});

test("snippet validation requires stored example files", () => {
  const errors = validateExampleAnnotations(
    root,
    "{/* example: examples/missing.json */}",
  );
  assert.deepEqual(errors, [
    "example file does not exist: examples/missing.json",
  ]);
});

test("release manifest validation rejects incomplete release claims", () => {
  const invalid = {
    schemaVersion: "1.0.0",
    productVersion: "1.0.0",
    channel: "stable",
    releasedAt: null,
    components: [
      {
        name: "backend",
        repository: "rampspec-backend",
        status: "released",
        tag: null,
        commit: "short",
        artifacts: [],
      },
    ],
    compatibility: {
      apiMajor: 1,
      schemaMajor: 1,
      contractMajor: 1,
      breakingChanges: ["changed report shape"],
      migrationNotes: [],
    },
    verification: {
      status: "verified",
      verifiedAt: null,
      command: "npm run lint:manifests",
    },
  };
  const errors = validateReleaseManifest(invalid).join("\n");
  assert.match(errors, /released component backend requires a tag/);
  assert.match(errors, /requires a 40-character commit/);
  assert.match(errors, /requires at least one artifact/);
  assert.match(errors, /missing component: frontend/);
  assert.match(errors, /breaking changes require migration notes/);
  assert.match(errors, /verified manifests require verifiedAt/);
  assert.match(errors, /a released manifest requires releasedAt/);
});

test("OpenAPI validation requires stable operation identifiers and responses", () => {
  const invalid = {
    openapi: "3.1.0",
    info: { title: "RampSpec API", version: "1.0.0" },
    paths: {
      "/runs": {
        get: { operationId: "runs", responses: {} },
        post: {
          operationId: "runs",
          responses: { 202: { description: "Accepted" } },
        },
      },
    },
  };
  const errors = validateOpenApiDocument(invalid).join("\n");
  assert.match(errors, /responses are required: GET \/runs/);
  assert.match(errors, /duplicate operationId: runs/);
});

test("OpenAPI provenance requires a pinned backend source", () => {
  const errors = validateOpenApiProvenance({
    repository: "another-repository",
    tag: "",
    commit: "short",
    source: "",
    sha256: sha256("fixture"),
    importedAt: "not-a-date",
  }).join("\n");
  assert.match(errors, /repository must be rampspec-backend/);
  assert.match(errors, /tag is required/);
  assert.match(errors, /full lowercase SHA/);
  assert.match(errors, /source is required/);
  assert.match(errors, /ISO date-time/);
});

test("schema bundle validates all five kinds and their examples", () => {
  const fixture = JSON.parse(
    readFileSync(
      path.join(root, "tests", "quality", "fixtures", "schemas.valid.json"),
      "utf8",
    ),
  );
  assert.deepEqual(validateSchemaBundle(fixture), []);
  fixture.schemas.pop();
  const errors = validateSchemaBundle(fixture).join("\n");
  assert.match(errors, /missing schema kind: report/);
  assert.match(errors, /schemaId does not resolve/);
});

test("schema provenance requires a pinned backend source", () => {
  const errors = validateSchemaBundleProvenance({
    repository: "rampspec-docs",
    tag: "",
    commit: "short",
    source: "",
    sha256: schemaBundleHash("fixture"),
    importedAt: "not-a-date",
  }).join("\n");
  assert.match(errors, /repository must be rampspec-backend/);
  assert.match(errors, /tag is required/);
  assert.match(errors, /full lowercase SHA/);
  assert.match(errors, /source is required/);
  assert.match(errors, /ISO date-time/);
});

test("contract bundle cross-checks interfaces and artifact hashes", () => {
  const fixture = JSON.parse(
    readFileSync(
      path.join(root, "tests", "quality", "fixtures", "contracts.valid.json"),
      "utf8",
    ),
  );
  assert.deepEqual(validateContractBundle(fixture), []);
  fixture.contracts[0].methods = [];
  fixture.contracts[0].wasmSha256 = "f".repeat(64);
  const errors = validateContractBundle(fixture).join("\n");
  assert.match(errors, /wasmSha256 is unknown/);
  assert.match(errors, /methods must be non-empty/);
});

test("contract provenance requires a pinned contracts source", () => {
  const errors = validateContractBundleProvenance({
    repository: "rampspec-docs",
    tag: "",
    commit: "short",
    source: "",
    sha256: contractBundleHash("fixture"),
    importedAt: "not-a-date",
  }).join("\n");
  assert.match(errors, /repository must be rampspec-contracts/);
  assert.match(errors, /tag is required/);
  assert.match(errors, /full lowercase SHA/);
  assert.match(errors, /source is required/);
  assert.match(errors, /ISO date-time/);
});

test("standards snapshot requires the complete pinned SEP inventory", () => {
  const fixture = JSON.parse(
    readFileSync(path.join(root, "standards", "snapshot.json"), "utf8"),
  );
  assert.deepEqual(validateStandardsSnapshot(fixture), []);
  fixture.documents = /** @type {{sep: number}[]} */ (fixture.documents).filter(
    (document) => document.sep !== 45,
  );
  const errors = validateStandardsSnapshot(fixture).join("\n");
  assert.match(errors, /missing SEP: 45/);
});
