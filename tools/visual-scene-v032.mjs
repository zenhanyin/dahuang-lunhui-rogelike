import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright");

const outDir = "C:/Users/Administrator/.codex/visualizations/2026/07/21/019f83f5-c11c-75e0-8d28-c87682ead39a/dahuang-v032-scenes";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});

const page = await browser.newPage({ viewport: { width: 1294, height: 742 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
page.on("console", msg => {
  if (msg.type() === "error") errors.push(msg.text());
});

const probes = [];
for (const [index, id] of ["sword", "witch", "alchemist"].entries()) {
  await page.goto("file:///D:/Acodex3/dahuang-lunhui-lu/index.html", { waitUntil: "domcontentloaded" });
  await page.locator(".lineage").nth(index).click();
  await page.click("#startBtn");
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${outDir}/${id}-start.png` });
  await page.keyboard.down("d");
  await page.waitForTimeout(3600);
  await page.keyboard.up("d");
  await page.keyboard.down("s");
  await page.waitForTimeout(1800);
  await page.keyboard.up("s");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${outDir}/${id}-cross-map.png` });
  probes.push(await page.evaluate(() => ({
    lineage: state.lineage.id,
    map: state.map.id,
    scenePack: state.map.scenePack,
    chunks: state.map.chunks.size,
    events: [...state.map.events, ...visibleMapFeatures().events].map(event => event.type).slice(0, 8),
    player: { x: Math.round(state.player.x), y: Math.round(state.player.y) },
    version: ASSET_VERSION
  })));
}

await browser.close();
console.log(JSON.stringify({ errors, probes, outDir }, null, 2));
if (errors.length) process.exit(1);
