import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { el } from "./el.mjs";
import { de } from "./de.mjs";
import { ro } from "./ro.mjs";
import { sr } from "./sr.mjs";
import { bg } from "./bg.mjs";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "../../data/blog/translations");

for (const [code, data] of Object.entries({ el, de, ro, sr, bg })) {
  const path = join(outDir, `${code}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log(`Wrote ${path} (${Object.keys(data).length} articles)`);
}
