/** Appends 3 new article entries to scripts/blog-i18n/*.mjs for assemble.mjs parity */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { NEW_BLOG_TRANSLATIONS } from "./new-blog-translations-data.mjs";

const dir = join(dirname(fileURLToPath(import.meta.url)), "blog-i18n");
const map = { el: "el", de: "de", ro: "ro", sr: "sr", bg: "bg" };

function formatEntry(slug, { title, excerpt, content }) {
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
  return `  "${slug}": {
    title: ${JSON.stringify(title)},
    excerpt: ${JSON.stringify(excerpt)},
    content: \`${esc(content)}\`,
  },`;
}

for (const [code, exportName] of Object.entries(map)) {
  const path = join(dir, `${code}.mjs`);
  let src = readFileSync(path, "utf8");
  if (src.includes('"limenaria-town-beaches-guide"')) {
    console.log(`Skip ${code}.mjs — already has new slugs`);
    continue;
  }
  const entries = Object.entries(NEW_BLOG_TRANSLATIONS[code])
    .map(([slug, data]) => formatEntry(slug, data))
    .join("\n");
  src = src.replace(/\n};\s*$/, `\n${entries}\n};\n`);
  writeFileSync(path, src);
  console.log(`Updated ${code}.mjs`);
}
