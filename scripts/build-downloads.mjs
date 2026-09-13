// Builds everything in downloads/:
//   fountain-grid-letter.pdf, fountain-grid-a4.pdf  (rendered from grid/index.html)
//   fountain-grid-layout.json                        (from grid/layout.js)
//   handwriting-to-font.skill                        (zip of skill/handwriting-to-font)
// Run: npm run build
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "downloads");
mkdirSync(out, { recursive: true });

const layout = require(resolve(root, "grid/layout.js"));
const layoutJson = JSON.stringify(layout, null, 2) + "\n";
writeFileSync(resolve(out, "fountain-grid-layout.json"), layoutJson);
console.log("wrote fountain-grid-layout.json");

// The skill ships the same manifest, so an agent reading the skill has the cell map.
writeFileSync(resolve(root, "skill/handwriting-to-font/references/fountain-grid-layout.json"), layoutJson);

// Skill zip (.skill is a plain zip with the skill folder at its root)
const skillZip = resolve(out, "handwriting-to-font.skill");
if (existsSync(skillZip)) rmSync(skillZip);
execSync(`zip -r -X "${skillZip}" handwriting-to-font -x '*.DS_Store'`, { cwd: resolve(root, "skill"), stdio: "inherit" });
console.log("wrote handwriting-to-font.skill");

// PDFs
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [size, format] of [["letter", "Letter"], ["a4", "A4"]]) {
  const url = pathToFileURL(resolve(root, "grid/index.html")).href + `?size=${size}`;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: resolve(out, `fountain-grid-${size}.pdf`), format, printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }, preferCSSPageSize: true });
  console.log(`wrote fountain-grid-${size}.pdf`);
}
await browser.close();
