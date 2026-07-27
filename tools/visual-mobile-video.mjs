import { existsSync, mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const outDir = "C:/Users/Administrator/.codex/visualizations/2026/07/21/019f83f5-c11c-75e0-8d28-c87682ead39a/dahuang-mobile-qa";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  recordVideo: { dir: outDir, size: { width: 390, height: 844 } }
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));
page.on("console", msg => {
  if (msg.type() === "error") errors.push(msg.text());
});

await page.goto("file:///D:/Acodex3/dahuang-lunhui-lu/index.html", { waitUntil: "domcontentloaded" });
await page.click(".lineage:nth-child(2)");
await page.click("#startBtn");
await page.waitForTimeout(700);
await page.keyboard.down("d");
await page.waitForTimeout(900);
await page.keyboard.down("s");
await page.waitForTimeout(900);
await page.keyboard.up("d");
await page.waitForTimeout(900);
await page.keyboard.up("s");
await page.waitForTimeout(600);

const video = page.video();
await context.close();
await browser.close();

const videoPath = await video.path();
const finalPath = join(outDir, "mobile-hud-run.webm");
if (existsSync(finalPath)) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  renameSync(finalPath, join(outDir, `mobile-hud-run-${stamp}.webm`));
}
renameSync(videoPath, finalPath);
console.log(JSON.stringify({ errors, video: finalPath }, null, 2));
if (errors.length) process.exit(1);
