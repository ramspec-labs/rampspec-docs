import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.cwd());
for (const generatedPath of ["export.zip", "out"]) {
  fs.rmSync(path.join(root, generatedPath), {
    recursive: true,
    force: true,
  });
}

console.log("stale-export-state=cleared");
