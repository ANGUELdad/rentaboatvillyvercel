#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PATH = join(dirname(fileURLToPath(import.meta.url)), "../src/lib/chat/concierge-brain.ts");
const PHONE = "+30 698 131 8393";

let src = readFileSync(PATH, "utf8");

// Strip all €{var}/unit patterns in template strings
src = src.replace(/€\{min\}\/(?:hr|ώρα|oră|Std|h|ч)/g, "rates on request");
src = src.replace(/€\{price\}\/(?:hr|ώρα|oră|Std|h|ч)/g, "contact for rates");
src = src.replace(/from €\{min\}\/hr/g, "contact us for rates");
src = src.replace(/€\$\{b\.pricePerHour\}\/hr/g, "contact for rates");
src = src.replace(/€\$\{boat\.pricePerHour\}\/hr/g, "contact for rates");
src = src.replace(/€\$\{pick\.pricePerHour\}\/hr/g, "contact for rates");
src = src.replace(/€\$\{alt\.pricePerHour\}\/hr/g, "contact for rates");
src = src.replace(/€\$\{minPrice\}\/hr/g, "rates on request");

src = src.replace(
  /`We run \$\{boats\.length\} boats from €\$\{minPrice\}\/hr, send a booking request with your date and hours and we'll confirm what's free\.`/,
  `\`We run \${boats.length} boats at Limenaria Marina — send a booking request with your date and hours and we'll confirm availability. Call ${PHONE} for rates.\``,
);

src = src.replace(
  /\.map\(\(b\) => `\$\{b\.name\} \(\$\{b\.pax\} pax, €\$\{b\.pricePerHour\}\/hr\)`\)/,
  ".map((b) => `${b.name} (${b.pax} pax)`)",
);

src = src.replace(
  /`\$\{boat\.name\} — up to \$\{boat\.pax\} passengers, €\$\{boat\.pricePerHour\}\/hr\.`/,
  "`${boat.name} — up to ${boat.pax} passengers. Contact us for rates.`",
);
src = src.replace(
  /`Great pick! \$\{boat\.name\}: seats up to \$\{boat\.pax\}, €\$\{boat\.pricePerHour\}\/hr\.`/,
  "`Great pick! ${boat.name}: seats up to ${boat.pax}. Contact us for rates.`",
);
src = src.replace(
  /`\$\{boat\.name\} — \$\{boat\.tagline \?\? "fully equipped"\}, up to \$\{boat\.pax\} guests, €\$\{boat\.pricePerHour\}\/hr\.`/,
  "`${boat.name} — ${boat.tagline ?? \"fully equipped\"}, up to ${boat.pax} guests. Contact us for rates.`",
);
src = src.replace(
  /\? ` Also consider \$\{alt\.name\} \(€\$\{alt\.pricePerHour\}\/hr\) if you want a different layout\.`/,
  "? ` Also consider ${alt.name} if you want a different layout.`",
);

// Remove price from fill vars in recommend responses (keep internal sorting)
src = src.replace(/prices, routes/g, "availability, routes");
src = src.replace(/boats, beaches, prices/g, "boats, beaches, availability");
src = src.replace(/explain pricing/g, "explain rates by phone");
src = src.replace(/hourly rates/g, "availability");
src = src.replace(/per-boat hourly rates/g, "fleet details");
src = src.replace(/Pricing starts at/g, "Rates available — call");
src = src.replace(/Hourly rates from/g, "Rates on request —");
src = src.replace(/budget/gi, (m, off) => {
  // only in specific contexts - skip global
  return m;
});

writeFileSync(PATH, src);
console.log("concierge-brain.ts cleaned");
