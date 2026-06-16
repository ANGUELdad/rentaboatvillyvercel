import { chromium } from "playwright";

const OUT = "/Users/aggelosdadalis/Projects/thassos-boat-charters";
const shots = [
  { name: "audit-before-en-390", url: "http://127.0.0.1:3000", width: 390, height: 844 },
  { name: "audit-before-en-1440", url: "http://127.0.0.1:3000", width: 1440, height: 900 },
  { name: "audit-before-el-390", url: "http://127.0.0.1:3000/?lang=el", width: 390, height: 844 },
  { name: "audit-before-el-1440", url: "http://127.0.0.1:3000/?lang=el", width: 1440, height: 900 },
];

const browser = await chromium.launch();
for (const shot of shots) {
  const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } });
  await page.goto(shot.url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/${shot.name}.png`, fullPage: false });
  await page.screenshot({ path: `${OUT}/${shot.name}-full.png`, fullPage: true });
  await page.close();
}
await browser.close();
console.log("Done:", shots.map((s) => s.name).join(", "));
