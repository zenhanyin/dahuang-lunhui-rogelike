import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const outDir = "C:/Users/Administrator/.codex/visualizations/2026/07/21/019f83f5-c11c-75e0-8d28-c87682ead39a/dahuang-scene-packs-v032d";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});

const errors = [];
const results = [];

async function captureLineage(index, label) {
  const page = await browser.newPage({ viewport: { width: 1294, height: 742 }, deviceScaleFactor: 1 });
  page.on("pageerror", error => errors.push(`${label}: ${error.message}`));
  page.on("console", msg => {
    if (msg.type() === "error") errors.push(`${label}: ${msg.text()}`);
  });
  await page.goto("file:///D:/Acodex3/dahuang-lunhui-lu/index.html", { waitUntil: "domcontentloaded" });
  await page.locator(".lineage").nth(index).click();
  await page.click("#startBtn");
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${outDir}/${label}-start.png` });
  await page.keyboard.down("d");
  await page.keyboard.down("s");
  await page.waitForTimeout(1800);
  await page.keyboard.up("d");
  await page.keyboard.up("s");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/${label}-move.png` });
  const probe = await page.evaluate(() => ({
    version: ASSET_VERSION,
    mapId: state.map.id,
    scenePack: state.map.scenePack || "",
    tileAtlas: state.map.tileAtlas || "",
    chunks: state.map.chunks.size,
    featureTypes: Array.from(new Set([...state.map.features, ...visibleMapFeatures().features].map(item => item.type))).sort(),
    eventTypes: Array.from(new Set([...state.map.events, ...visibleMapFeatures().events].map(item => item.type))).sort()
  }));
  results.push({ label, ...probe });
  await page.close();
}

await captureLineage(0, "sword");
await captureLineage(1, "qingqiu");

await browser.close();

console.log(JSON.stringify({ errors, results, outDir }, null, 2));
if (errors.length) process.exit(1);
