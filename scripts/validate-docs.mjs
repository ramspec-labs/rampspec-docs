import process from "node:process";
import { validateDocs } from "./quality-core.mjs";

const result = validateDocs(process.cwd());
if (result.errors.length) {
  console.error(result.errors.join("\n"));
  process.exit(1);
}

console.log(`content-quality=ok pages-and-navigation-validated`);
