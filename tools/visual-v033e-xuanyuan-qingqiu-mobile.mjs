import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const outDir = "C:/Users/Administrator/.codex/visualizations/2026/07/21/019f83f5-c11c-75e0-8d28-c87682ead39a/dahuang-visual-qa/v033e-scene-ui";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});

async function boot(lineageIndex, viewport, name) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto("http://127.0.0.1:4177/index.html?qa=v033e", { waitUntil: "domcontentloaded" });
  await page.evaluate(index => {
    selectedLineage = CONFIG.lineages[index];
    renderLineageSelect();
  }, lineageIndex);
  await page.screenshot({ path: `${outDir}/${name}-start-cards.png` });
  await page.click("#startBtn");
  await page.waitForTimeout(650);
  await page.screenshot({ path: `${outDir}/${name}-early.png` });
  await page.keyboard.down("d");
  await page.keyboard.down("s");
  await page.waitForTimeout(2600);
  await page.keyboard.up("d");
  await page.keyboard.up("s");
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${outDir}/${name}-move.png` });
  await page.evaluate(() => {
    ui.storyOverlay.classList.add("hidden");
    state.pendingStory = null;
    state.resources.soul = 99;
    state.level = Math.max(state.level, 2);
    openChoices();
  });
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${outDir}/${name}-choice.png` });
  const probe = await page.evaluate(() => ({
    version: ASSET_VERSION,
    lineage: selectedLineage.id,
    mapId: state.map.id,
    scenePack: state.map.scenePack,
    tileAtlas: state.map.tileAtlas,
    chunks: state.map.chunks.size,
    features: visibleMapFeatures().features.length,
    events: visibleMapFeatures().events.length,
    errors: []
  }));
  await page.close();
  return { name, errors, probe };
}

const desktop = { width: 1294, height: 742 };
const mobile = { width: 390, height: 844 };
const results = [];
results.push(await boot(0, desktop, "xuanyuan-desktop"));
results.push(await boot(1, desktop, "qingqiu-desktop"));
results.push(await boot(0, mobile, "xuanyuan-mobile"));
results.push(await boot(1, mobile, "qingqiu-mobile"));

await browser.close();
console.log(JSON.stringify(results, null, 2));
if (results.some(result => result.errors.length)) process.exit(1);
