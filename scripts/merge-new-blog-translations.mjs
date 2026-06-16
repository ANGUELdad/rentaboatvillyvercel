import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { NEW_BLOG_TRANSLATIONS } from "./new-blog-translations-data.mjs";

const dir = join(dirname(fileURLToPath(import.meta.url)), "../data/blog/translations");

for (const [code, articles] of Object.entries(NEW_BLOG_TRANSLATIONS)) {
  const path = join(dir, `${code}.json`);
  const data = JSON.parse(readFileSync(path, "utf8"));
  Object.assign(data, articles);
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log(`Merged ${Object.keys(articles).length} articles into ${code}.json`);
}
