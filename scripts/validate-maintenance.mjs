import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const recordPath = path.join(
  root,
  "examples",
  "operations",
  "documentation-maintenance-calendar.planned.json",
);
const record = JSON.parse(fs.readFileSync(recordPath, "utf8"));
const errors = [];

if (record.recordType !== "documentation-maintenance-calendar") {
  errors.push("recordType must be documentation-maintenance-calendar");
}
if (!Array.isArray(record.entries) || record.entries.length !== 12) {
  errors.push("calendar must contain the twelve required maintenance entries");
}
if (!Array.isArray(record.automations) || record.automations.length < 3) {
  errors.push(
    "calendar must define recurring, dependency, and release-sync automation",
  );
}

const ids = new Set();
for (const entry of record.entries ?? []) {
  if (!entry.id || ids.has(entry.id))
    errors.push(`invalid or duplicate entry id: ${entry.id}`);
  ids.add(entry.id);
  for (const field of [
    "cadence",
    "sourceUrl",
    "lastReviewedAt",
    "nextReviewAt",
    "status",
    "automation",
  ]) {
    if (!entry[field]) errors.push(`${entry.id}: missing ${field}`);
  }
  const last = Date.parse(`${entry.lastReviewedAt}T00:00:00Z`);
  const next = Date.parse(`${entry.nextReviewAt}T00:00:00Z`);
  if (!Number.isFinite(last) || !Number.isFinite(next) || next <= last) {
    errors.push(`${entry.id}: invalid freshness window`);
  }
  if (
    record.launchActive &&
    next < Date.now() &&
    entry.status === "implemented"
  ) {
    errors.push(`${entry.id}: active maintenance entry is overdue`);
  }
}

const automationIds = new Set();
for (const automation of record.automations ?? []) {
  automationIds.add(automation.id);
}
for (const entry of record.entries ?? []) {
  if (!automationIds.has(entry.automation)) {
    errors.push(`${entry.id}: unknown automation ${entry.automation}`);
  }
}
for (const automation of record.automations ?? []) {
  if (
    !automation.path ||
    !fs.existsSync(path.join(root, automation.path.replace("*", "openapi")))
  ) {
    errors.push(`${automation.id}: automation path does not resolve`);
  }
}

if (record.launchActive && record.requiredUnassignedAreas?.length) {
  errors.push(
    "launch-active maintenance cannot have unassigned required areas",
  );
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `maintenance-calendar=ok entries=${record.entries.length} mode=${record.launchActive ? "active" : "pre-launch"}`,
);
