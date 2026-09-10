import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import AdmZip from "adm-zip";

const root = path.resolve(process.cwd());
const zipPath = path.join(root, "export.zip");
const outputDirectory = path.join(root, "out");

if (!fs.existsSync(zipPath)) {
  throw new Error(
    "Missing export.zip. Run `mintlify export --output export.zip` first.",
  );
}

const archive = new AdmZip(zipPath);
for (const entry of archive.getEntries()) {
  const normalized = entry.entryName.replace(/\\/g, "/");
  if (normalized.startsWith("/") || normalized.split("/").includes("..")) {
    throw new Error(`Unsafe path in export archive: ${entry.entryName}`);
  }
}

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });
archive.extractAllTo(outputDirectory, true);

if (!fs.existsSync(path.join(outputDirectory, "index.html"))) {
  throw new Error("The extracted export does not contain index.html.");
}

for (const sourceOnlyPath of [
  ".gitignore",
  ".prettierignore",
  "cspell.json",
  "docs.json",
  "implementation.md",
  "package.json",
  "scripts",
  "serve.js",
  "Start Docs.bat",
  "Start Docs.command",
  "tests",
  "tsconfig.json",
  "vercel.json",
]) {
  fs.rmSync(path.join(outputDirectory, sourceOnlyPath), {
    recursive: true,
    force: true,
  });
}

fs.rmSync(zipPath, { force: true });
console.log(`static-export=${outputDirectory}`);
