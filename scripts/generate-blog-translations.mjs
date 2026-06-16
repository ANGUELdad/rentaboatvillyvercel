/**
 * Generates data/blog/translations/{locale}.json from data/blog/en.json.
 * Preserves <a href="..."> links; translates visible text only.
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "data", "blog", "translations");
const articles = JSON.parse(
  readFileSync(join(root, "data", "blog", "en.json"), "utf8"),
);

const LOCALES = [
  { code: "el", target: "el", name: "Greek" },
  { code: "de", target: "de", name: "German" },
  { code: "ro", target: "ro", name: "Romanian" },
  { code: "sr", target: "sr", name: "Serbian" },
  { code: "bg", target: "bg", name: "Bulgarian" },
];

const CONTEXT =
  "Thassos island Greece boat rental tourism Rent A Boat Villy. CRITICAL: guests must stay on board, no disembarking at beaches harbours coves, swim only from boat ladder, lunch on board. Keep place names in Latin script: Thassos, Limenaria, Marble Beach, Aliki, Tripiti, Metalia, Pefkari, Potos, Golden Beach, Chrisi Akti, Rent A Boat Villy, Vathi, Kalogria, Paradise Cove, Limenas, Chrisi Akti.";

const POLICY_SNIPPETS = {
  el: {
    stayOnBoard:
      "Οι επισκέπτες ΔΕΝ μπορούν να αποβιβαστούν σε παραλίες, λιμάνια ή όρμους — παραμένετε πάντα στο σκάφος. Κολύμπι και snorkeling μόνο από τη σκάλα κολύμβησης.",
    lunchOnBoard: "Γεύματα και μεσημεριανό μόνο στο σκάφος.",
  },
  de: {
    stayOnBoard:
      "Gäste dürfen an Stränden, Häfen oder Buchten NICHT von Bord gehen — Sie bleiben immer an Bord. Schwimmen und Schnorcheln nur über die Badeleiter.",
    lunchOnBoard: "Mittagessen und Mahlzeiten nur an Bord.",
  },
  ro: {
    stayOnBoard:
      "Oaspeții NU pot debarca pe plaje, în porturi sau golfuri — rămâneți mereu la bord. Înot și snorkeling doar de pe scara de baie.",
    lunchOnBoard: "Prânzul și mesele doar la bord.",
  },
  sr: {
    stayOnBoard:
      "Gosti NE smeju da iskrcaju na plažama, u lukama ili uvalama — uvek ostajete na brodu. Plivanje i ronjenje samo sa merdevina za kupanje.",
    lunchOnBoard: "Ručak i obroci samo na brodu.",
  },
  bg: {
    stayOnBoard:
      "Гостите НЕ могат да слязат на плажове, пристанища или заливи — оставате винаги на борда. Плуване и шнорхел само от стълбата за плуване.",
    lunchOnBoard: "Обяд и хранене само на борда.",
  },
};

async function translate(text, target) {
  const langpair = `en|${target}`;
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text.slice(0, 480));
  url.searchParams.set("langpair", langpair);
  url.searchParams.set("de", "thassosboats@user.com");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error(data.responseDetails);
  const out = data.responseData?.translatedText?.trim();
  if (!out) throw new Error("Empty translation");
  return out;
}

async function translateWithRetry(text, target, retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      return await translate(text, target);
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

async function translateSegment(text, target) {
  if (!text.trim()) return text;
  const prefixed = `${CONTEXT} ${text}`;
  const result = await translateWithRetry(prefixed, target);
  return result.replace(/^Thassos island Greece boat rental tourism Rent A Boat Villy\.\s*/i, "").trim();
}

async function translateHtml(html, target) {
  const blocks = [];
  const regex = /(<h[23]>.*?<\/h[23]>|<p>.*?<\/p>)/gs;
  let match;
  while ((match = regex.exec(html)) !== null) {
    blocks.push(match[1]);
  }

  const translated = [];
  for (const block of blocks) {
    const tagMatch = block.match(/^<(h[23]|p)>(.*)<\/\1>$/s);
    if (!tagMatch) {
      translated.push(block);
      continue;
    }
    const [, tag, inner] = tagMatch;

    const linkRegex = /<a href="([^"]+)">([^<]*)<\/a>/g;
    const parts = [];
    let last = 0;
    let lm;
    while ((lm = linkRegex.exec(inner)) !== null) {
      if (lm.index > last) parts.push({ type: "text", value: inner.slice(last, lm.index) });
      parts.push({ type: "link", href: lm[1], text: lm[2] });
      last = lm.index + lm[0].length;
    }
    if (last < inner.length) parts.push({ type: "text", value: inner.slice(last) });

    if (parts.length === 0) parts.push({ type: "text", value: inner });

    const outParts = [];
    for (const part of parts) {
      if (part.type === "link") {
        await new Promise((r) => setTimeout(r, 600));
        const linkText = await translateSegment(part.text, target);
        outParts.push(`<a href="${part.href}">${linkText}</a>`);
      } else {
        const text = part.value.replace(/<strong>(.*?)<\/strong>/gs, (_, s) => `[[STRONG]]${s}[[/STRONG]]`);
        if (text.trim()) {
          await new Promise((r) => setTimeout(r, 600));
          let t = await translateSegment(text.trim(), target);
          t = t.replace(/\[\[STRONG\]\](.*?)\[\[\/STRONG\]\]/gs, "<strong>$1</strong>");
          outParts.push(t);
        }
      }
    }

    translated.push(`<${tag}>${outParts.join("")}</${tag}>`);
  }
  return translated.join("\n");
}

function patchSafetyArticle(entry, locale) {
  const policy = POLICY_SNIPPETS[locale];
  if (!policy) return entry;
  if (!entry.content.includes("<strong>")) {
    entry.content = entry.content.replace(
      /<h2>.*?<\/h2>\n<p>/,
      (m) => m,
    );
  }
  entry.content = entry.content.replace(
    /<p><strong>.*?<\/strong>/,
    `<p><strong>${policy.stayOnBoard}</strong>`,
  );
  return entry;
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  console.log(`Found ${articles.length} articles`);

  const onlyLocale = process.argv.find((a) => a.startsWith("--locale="))?.split("=")[1];

  for (const { code, target, name } of LOCALES) {
    if (onlyLocale && code !== onlyLocale) continue;

    console.log(`\nTranslating to ${name} (${code})...`);
    const map = {};

    for (const article of articles) {
      console.log(`  ${article.slug}`);
      await new Promise((r) => setTimeout(r, 600));
      const title = await translateSegment(article.title, target);
      await new Promise((r) => setTimeout(r, 600));
      const excerpt = await translateSegment(article.excerpt, target);
      const content = await translateHtml(article.content, target);

      let entry = { title, excerpt, content };
      if (article.slug === "boat-rental-safety-stay-on-board") {
        entry = patchSafetyArticle(entry, code);
      }
      map[article.slug] = entry;
    }

    const outPath = join(outDir, `${code}.json`);
    writeFileSync(outPath, JSON.stringify(map, null, 2) + "\n");
    console.log(`Wrote ${outPath} (${Object.keys(map).length} articles)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
