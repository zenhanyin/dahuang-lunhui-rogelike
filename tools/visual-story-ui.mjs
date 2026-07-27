import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const outDir = "C:/Users/Administrator/.codex/visualizations/2026/07/21/019f83f5-c11c-75e0-8d28-c87682ead39a/dahuang-story-ui";
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

await page.goto("file:///D:/Acodex3/dahuang-lunhui-lu/index.html", { waitUntil: "domcontentloaded" });
await page.locator(".lineage").nth(1).click();
await page.click("#startBtn");
await page.waitForTimeout(800);
await page.evaluate(() => {
  state.paused = true;
  ui.storyTitle.textContent = "狐火旧约";
  ui.storySpeaker.textContent = "青丘旧誓";
  ui.storyPortrait.src = "assets/runtime/webp/ui/portraits/qingqiu_witch.webp";
  ui.storyText.textContent = "狐火绕身三匝，青丘旧约浮现一角：幻雾并非逃避，而是遮住天庭视线的古老术法。";
  ui.storyChoiceBtn.textContent = "记入轮回";
  ui.storyOverlay.classList.remove("hidden");
});
await page.waitForTimeout(250);
await page.screenshot({ path: `${outDir}/story-ui-desktop.png` });

await page.setViewportSize({ width: 430, height: 932 });
await page.waitForTimeout(250);
await page.screenshot({ path: `${outDir}/story-ui-mobile.png` });

await browser.close();
console.log(JSON.stringify({ errors, outDir }, null, 2));
if (errors.length) process.exit(1);
