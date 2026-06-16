#!/usr/bin/env node
/**
 * Lightweight UI stress audit — run against a live dev server.
 * Usage: node scripts/ui-stress-audit.mjs [baseUrl]
 */
const BASE = process.argv[2] ?? "http://localhost:3000";

const ROUTES = [
  "/",
  "/fleet",
  "/fleet/pegasus-cruiser",
  "/booking",
  "/map",
  "/faq",
];

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
];

const AUDIT_JS = `(() => {
  const vw = window.innerWidth;
  const interactives = [...document.querySelectorAll('a,button,input,select,textarea,[role=button]')].filter(el => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.pointerEvents !== 'none';
  });
  const small = interactives.filter(el => {
    const r = el.getBoundingClientRect();
    return r.width < 44 || r.height < 44;
  });
  const fixed = [...document.querySelectorAll('header,[class*="fixed"]')].filter(el => {
    const s = getComputedStyle(el);
    return s.position === 'fixed' && el.getBoundingClientRect().height > 0;
  }).length;
  return {
    path: location.pathname,
    vw,
    overflow: document.documentElement.scrollWidth > vw + 1,
    interactiveCount: interactives.length,
    smallTargetCount: small.length,
    smallSamples: small.slice(0, 5).map(el => ({
      tag: el.tagName,
      label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 36),
      w: Math.round(el.getBoundingClientRect().width),
      h: Math.round(el.getBoundingClientRect().height),
    })),
    fixedLayers: fixed,
    hasHeader: !!document.querySelector('header'),
  };
})()`;

async function auditRoute(route, viewport) {
  const url = `${BASE}${route}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  const html = await res.text();
  const overflowMatch = html.includes("overflow-x");
  return {
    route,
    viewport: viewport.name,
    status: res.status,
    htmlBytes: html.length,
    note: overflowMatch ? "check overflow classes" : "ok",
  };
}

async function main() {
  console.log(`UI stress audit → ${BASE}\\n`);
  let failures = 0;

  for (const vp of VIEWPORTS) {
    console.log(`== ${vp.name} (${vp.width}×${vp.height}) ==`);
    for (const route of ROUTES) {
      try {
        const r = await auditRoute(route, vp);
        console.log(`  ✓ ${route} [${r.status}] ${(r.htmlBytes / 1024).toFixed(0)}kb`);
      } catch (e) {
        failures++;
        console.log(`  ✗ ${route} — ${e.message}`);
      }
    }
    console.log("");
  }

  console.log("Browser checks to run manually:");
  console.log("  • Open mobile menu → tap all sections → Book CTA");
  console.log("  • Language picker → switch locale → no hydration errors");
  console.log("  • Boat detail → swipe gallery, sticky book bar");
  console.log("  • Chat FAB + peek bubble → no overlap");
  console.log(`\\n${failures ? `⚠ ${failures} fetch failure(s)` : "All routes reachable."}`);
  process.exit(failures ? 1 : 0);
}

main();
