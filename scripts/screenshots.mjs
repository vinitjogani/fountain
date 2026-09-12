// Renders screenshots of the site and the sheet for a quick visual check.
// Usage: node scripts/screenshots.mjs [outDir]
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(process.argv[2] || resolve(root, "screenshots"));
mkdirSync(out, { recursive: true });
// Tiny static server so fonts and scripts load like they would on a real host.
const types = { html: "text/html", css: "text/css", js: "text/javascript", woff2: "font/woff2", ttf: "font/ttf", json: "application/json", pdf: "application/pdf", svg: "image/svg+xml" };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const file = resolve(root, "." + p);
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": types[file.split(".").pop()] || "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();
const shots = [
  ["grid/index.html?size=letter", "sheet", { width: 900, height: 1200 }],
  ["index.html", "site-desktop", { width: 1440, height: 900 }],
  ["index.html", "site-mobile", { width: 400, height: 800 }],
];
for (const [path, name, viewport] of shots) {
  const page = await browser.newPage({ viewport });
  page.on("pageerror", (e) => console.error(`[${name}] page error:`, e.message));
  page.on("console", (m) => { if (m.type() === "error") console.error(`[${name}] console:`, m.text()); });
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // Scroll through so scroll-triggered reveals have fired before the capture.
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 400) { window.scrollTo({ top: y, behavior: "instant" }); await new Promise((r) => setTimeout(r, 60)); }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
  console.log("wrote", `${name}.png`);
  await page.close();
}
await browser.close();
server.close();
