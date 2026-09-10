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
