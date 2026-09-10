import { readFileSync } from "node:fs";
import process from "node:process";
import { validateDocs } from "./quality-core.mjs";

const root = process.cwd();
const config = JSON.parse(readFileSync(".linkcheckrc.json", "utf8"));
const ignored = new Set(config.ignore);
const links = validateDocs(root).externalLinks.filter(
  (link) => !ignored.has(link),
);

/** @param {string} url */
async function check(url) {
  let lastError = "unknown error";
  for (let attempt = 0; attempt < config.retries; attempt += 1) {
    try {
      let response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(config.timeoutMs),
        headers: { "user-agent": "rampspec-docs-link-checker" },
      });
      if (response.status === 405) {
        response = await fetch(url, {
          method: "GET",
          redirect: "follow",
          signal: AbortSignal.timeout(config.timeoutMs),
          headers: { "user-agent": "rampspec-docs-link-checker" },
        });
      }
      if (
        (response.status >= 200 && response.status < 400) ||
        [401, 403].includes(response.status)
      )
        return null;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = String(error);
    }
  }
  return `${url}: ${lastError}`;
}

const failures = (await Promise.all(links.map(check))).filter(Boolean);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`external-links=ok count=${links.length}`);
