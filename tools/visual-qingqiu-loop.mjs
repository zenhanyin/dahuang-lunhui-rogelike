import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const outDir = "C:/Users/Administrator/.codex/visualizations/2026/07/21/019f83f5-c11c-75e0-8d28-c87682ead39a/dahuang-qingqiu-loop";
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

async function closeOverlays() {
  await page.evaluate(() => {
    if (!ui.storyOverlay.classList.contains("hidden")) closeStoryEvent();
    if (!ui.choices.classList.contains("hidden")) {
      ui.choices.classList.add("hidden");
      state.pendingChoices = [];
      state.paused = false;
    }
    state.paused = false;
  });
}

async function hold(key, ms) {
  await page.keyboard.down(key);
  const steps = Math.max(1, Math.ceil(ms / 500));
  for (let i = 0; i < steps; i += 1) {
    await page.waitForTimeout(ms / steps);
    await closeOverlays();
  }
  await page.keyboard.up(key);
  await closeOverlays();
}

async function shot(name) {
  await closeOverlays();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${outDir}/${name}.png` });
}

await page.goto("file:///D:/Acodex3/dahuang-lunhui-lu/index.html", { waitUntil: "domcontentloaded" });
await page.locator(".lineage").nth(1).click();
await page.click("#startBtn");
await page.waitForTimeout(700);
await shot("qingqiu-00-start");
await hold("d", 5600);
await shot("qingqiu-01-east");
await hold("s", 5600);
await shot("qingqiu-02-south");
await page.keyboard.down("d");
await page.keyboard.down("s");
for (let i = 0; i < 14; i += 1) {
  await page.waitForTimeout(450);
  await closeOverlays();
}
await page.keyboard.up("d");
await page.keyboard.up("s");
await shot("qingqiu-03-diagonal");

const probe = await page.evaluate(() => ({
  errors: [],
  player: { x: Math.round(state.player.x), y: Math.round(state.player.y) },
  camera: { x: Math.round(state.camera.x), y: Math.round(state.camera.y) },
  chunks: state.map.chunks.size,
  visibleFeatures: visibleMapFeatures().features.length,
  visibleEvents: visibleMapFeatures().events.map(event => event.type),
  version: ASSET_VERSION,
  mapTiles: Object.keys(ASSET_PATHS.mapTiles),
  qingqiuProps: Object.keys(ASSET_PATHS.qingqiuProps).length
}));

await browser.close();
console.log(JSON.stringify({ errors, probe, outDir }, null, 2));
if (errors.length) process.exit(1);
