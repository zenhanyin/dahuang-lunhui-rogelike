import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright");

const outDir = "C:/Users/Administrator/.codex/visualizations/2026/07/21/019f83f5-c11c-75e0-8d28-c87682ead39a/dahuang-mobile-qa";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true
});
const errors = [];
page.on("pageerror", error => errors.push(error.message));
page.on("console", msg => {
  if (msg.type() === "error") errors.push(msg.text());
});

await page.goto("file:///D:/Acodex3/dahuang-lunhui-lu/index.html", { waitUntil: "domcontentloaded" });
await page.screenshot({ path: `${outDir}/mobile-start.png`, fullPage: true });

await page.click(".lineage:nth-child(2)");
await page.click("#startBtn");
await page.waitForTimeout(700);
await page.screenshot({ path: `${outDir}/mobile-run.png`, fullPage: true });

await page.evaluate(() => {
  state.resources.soul = 88;
  state.resources.fire = 3;
  state.level = 6;
  state.xp = 69;
  state.nextXp = 100;
  state.kills = 110;
  state.time = 65;
  state.realm = "返虚入荒";
  state.build = [
    { tag: "生存", name: "女娲息壤", count: 4 },
    { tag: "通用", name: "玄龟息", count: 2 },
    { tag: "丹火", name: "祝融火环", count: 1 }
  ];
  state.enemies.length = 0;
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2;
    const table = CONFIG.enemies[i % 5 === 0 ? "elite" : "wraith"];
    state.enemies.push({
      x: state.player.x + Math.cos(angle) * (150 + (i % 3) * 42),
      y: state.player.y + Math.sin(angle) * (120 + (i % 4) * 36),
      r: table.radius,
      hp: table.hp,
      maxHp: table.hp,
      speed: table.speed,
      damage: table.damage,
      xp: table.xp,
      elite: i % 5 === 0,
      type: i % 5 === 0 ? "elite" : "wraith",
      facing: Math.cos(angle) < 0 ? "right" : "left",
      animTime: i * 0.2,
      slowTime: 0,
      marks: 0,
      lastHit: "",
      hitFlash: 0
    });
  }
});
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/mobile-combat.png`, fullPage: true });

await page.evaluate(() => {
  state.resources.soul = 99;
  openChoices();
});
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/mobile-choice.png`, fullPage: true });

await page.evaluate(() => {
  ui.choices.classList.add("hidden");
  state.paused = false;
  const events = [...state.map.events, ...visibleMapFeatures().events];
  if (events[0]) openStoryEvent(events[0]);
});
await page.waitForTimeout(250);
await page.screenshot({ path: `${outDir}/mobile-story.png`, fullPage: true });

const probe = await page.evaluate(() => {
  const hud = document.querySelector("#hud").getBoundingClientRect();
  const counters = document.querySelector(".top-counters").getBoundingClientRect();
  const dock = document.querySelector(".skill-dock").getBoundingClientRect();
  const choice = document.querySelector(".choice")?.getBoundingClientRect();
  return {
    viewport: { w: innerWidth, h: innerHeight },
    hud: { x: Math.round(hud.x), y: Math.round(hud.y), w: Math.round(hud.width), h: Math.round(hud.height) },
    counters: { x: Math.round(counters.x), y: Math.round(counters.y), w: Math.round(counters.width), h: Math.round(counters.height) },
    dock: { x: Math.round(dock.x), y: Math.round(dock.y), w: Math.round(dock.width), h: Math.round(dock.height) },
    choice: choice && { x: Math.round(choice.x), y: Math.round(choice.y), w: Math.round(choice.width), h: Math.round(choice.height) },
    version: ASSET_VERSION
  };
});

await browser.close();
console.log(JSON.stringify({ errors, probe, outDir }, null, 2));
if (errors.length) process.exit(1);
