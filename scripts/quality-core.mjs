import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const EXCLUDED_DIRECTORIES = new Set([
  ".git",
  ".mintlify",
  ".vercel",
  "node_modules",
  "out",
  "tests",
]);

/** @param {string} root @param {Set<string>} extensions */
export function listFiles(root, extensions) {
  /** @type {string[]} */
  const files = [];

  /** @param {string} directory */
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && EXCLUDED_DIRECTORIES.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (extensions.has(path.extname(entry.name))) files.push(absolute);
    }
  }

  visit(root);
  return files.sort((left, right) => left.localeCompare(right, "en"));
}

/**
 * @param {string} text
 * @returns {{attributes: Record<string, string>, body: string, error: string | null}}
 */
export function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match)
    return { attributes: {}, body: text, error: "missing frontmatter" };

  /** @type {Record<string, string>} */
  const attributes = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
    attributes[key] = value;
  }
  return { attributes, body: text.slice(match[0].length), error: null };
}

/** @param {unknown} value */
export function collectNavigationPages(value) {
  /** @type {string[]} */
  const pages = [];

  /** @param {unknown} node @param {string | null} parentKey */
  function visit(node, parentKey) {
    if (Array.isArray(node)) {
      for (const item of node) {
        if (parentKey === "pages" && typeof item === "string") pages.push(item);
        else visit(item, parentKey);
      }
      return;
    }
    if (node && typeof node === "object") {
      for (const [key, child] of Object.entries(node)) visit(child, key);
    }
  }

  visit(value, null);
  return pages;
}

/** @param {unknown} navigation @param {Set<string>} pageRoutes */
export function validateNavigationPages(navigation, pageRoutes) {
  /** @type {string[]} */
  const errors = [];
  const pages = collectNavigationPages(navigation);
  const duplicatePages = pages.filter(
    (page, index) => pages.indexOf(page) !== index,
  );
  for (const page of new Set(duplicatePages))
    errors.push(`duplicate navigation page: ${page}`);
  for (const page of pages) {
    if (!pageRoutes.has(page))
      errors.push(`navigation page does not exist: ${page}`);
  }
  for (const route of pageRoutes) {
    if (!pages.includes(route)) errors.push(`orphaned MDX page: ${route}`);
  }
  return errors;
}

/** @param {string} root @param {string} source @param {string} target */
function resolvesLocalTarget(root, source, target) {
  const withoutFragment = target.split("#", 1)[0].split("?", 1)[0];
  if (!withoutFragment) return true;

  const decoded = decodeURIComponent(withoutFragment);
  const base = decoded.startsWith("/") ? root : path.dirname(source);
  const requested = path.resolve(base, decoded.replace(/^\//, ""));
  const candidates = [
    requested,
    `${requested}.md`,
    `${requested}.mdx`,
    path.join(requested, "index.md"),
    path.join(requested, "index.mdx"),
  ];
  return candidates.some((candidate) => existsSync(candidate));
}

/** @param {string} root @param {string} source @param {string} text */
export function validateDocumentText(root, source, text) {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const externalLinks = [];
  const frontmatter = parseFrontmatter(text);

  if (frontmatter.error) errors.push(frontmatter.error);
  if (!frontmatter.attributes.title) errors.push("missing title frontmatter");
  if (!frontmatter.attributes.description)
    errors.push("missing description frontmatter");
  if (!frontmatter.body.trim()) errors.push("page body is empty");

  for (const match of text.matchAll(
    /!?\[([^\]]*)\]\(([^)\s]+)(?:\s+['"][^'"]*['"])?\)/g,
  )) {
    const [full, label, target] = match;
    if (full.startsWith("!") && !label.trim())
      errors.push(`image has empty alt text: ${target}`);
    if (!full.startsWith("!") && !label.trim())
      errors.push(`link has empty label: ${target}`);
    if (/^https?:\/\//i.test(target)) externalLinks.push(target);
    else if (
      !/^(mailto:|tel:)/i.test(target) &&
      !resolvesLocalTarget(root, source, target)
    ) {
      errors.push(`broken local link: ${target}`);
    }
  }

  for (const match of text.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt\s*=/.test(match[1]))
      errors.push("HTML image is missing alt text");
  }

  let previousLevel = 0;
  for (const match of frontmatter.body.matchAll(/^(#{2,6})\s+.+$/gm)) {
    const level = match[1].length;
    if (previousLevel && level > previousLevel + 1) {
      errors.push(`heading level jumps from h${previousLevel} to h${level}`);
    }
    previousLevel = level;
  }

  for (const match of text.matchAll(/https?:\/\/[^\s<>)"'`]+/g))
    externalLinks.push(match[0]);
  return {
    errors: [...new Set(errors)],
    externalLinks: [...new Set(externalLinks)],
  };
}

/** @param {string} root */
export function validateDocs(root) {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const externalLinks = [];
  const configPath = path.join(root, "docs.json");
  if (!existsSync(configPath))
    return { errors: ["docs.json is missing"], externalLinks };

  /** @type {Record<string, unknown>} */
  let config;
  try {
    config = JSON.parse(readFileSync(configPath, "utf8"));
  } catch (error) {
    return {
      errors: [`docs.json is invalid JSON: ${String(error)}`],
      externalLinks,
    };
  }

  if (typeof config.name !== "string" || !config.name.trim())
    errors.push("docs.json name is required");
  if (!config.navigation) errors.push("docs.json navigation is required");

  const pageFiles = listFiles(root, new Set([".mdx"]));
  const pageRoutes = new Set(
    pageFiles.map((file) =>
      path
        .relative(root, file)
        .replace(/\\/g, "/")
        .replace(/\.mdx$/, ""),
    ),
  );

  errors.push(...validateNavigationPages(config.navigation, pageRoutes));

  for (const file of pageFiles) {
    const result = validateDocumentText(root, file, readFileSync(file, "utf8"));
    const relative = path.relative(root, file).replace(/\\/g, "/");
    errors.push(...result.errors.map((error) => `${relative}: ${error}`));
    externalLinks.push(...result.externalLinks);
  }

  return { errors, externalLinks: [...new Set(externalLinks)].sort() };
}

/** @param {unknown} value @param {string} root */
export function validateReferenceIndex(value, root) {
  /** @type {string[]} */
  const errors = [];
  if (!value || typeof value !== "object")
    return ["reference index must be an object"];
  const index = /** @type {Record<string, unknown>} */ (value);
  const references = /** @type {Record<string, unknown>} */ (
    index.references ?? {}
  );
  const requirements = /** @type {Record<string, unknown>} */ (
    index.requirements ?? {}
  );

  for (const kind of ["operations", "schemas", "contractMethods"]) {
    const available = Array.isArray(references[kind]) ? references[kind] : [];
    const required = Array.isArray(requirements[kind])
      ? requirements[kind]
      : [];
    for (const entry of required) {
      if (!available.includes(entry))
        errors.push(`missing ${kind} reference: ${String(entry)}`);
    }
  }

  const snippets = Array.isArray(index.snippets) ? index.snippets : [];
  for (const snippet of snippets) {
    if (
      typeof snippet !== "string" ||
      !existsSync(path.resolve(root, snippet))
    ) {
      errors.push(`missing snippet: ${String(snippet)}`);
    }
  }
  return errors;
}

/** @param {string} root @param {string} text */
export function validateExampleAnnotations(root, text) {
  /** @type {string[]} */
  const errors = [];
  for (const match of text.matchAll(/\{\/\*\s*example:\s*([^*]+?)\s*\*\/\}/g)) {
    const relative = match[1].trim();
    if (!relative.startsWith("examples/"))
      errors.push(`example must be stored under examples/: ${relative}`);
    else if (!existsSync(path.resolve(root, relative)))
      errors.push(`example file does not exist: ${relative}`);
  }
  return errors;
}
