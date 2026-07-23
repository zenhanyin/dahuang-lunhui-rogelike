import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright");

const outDir = "C:/Users/Administrator/.codex/visualizations/2026/07/21/019f83f5-c11c-75e0-8d28-c87682ead39a/dahuang-visual-qa";
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
await page.screenshot({ path: `${outDir}/visual-start.png` });
await page.click("#startBtn");
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/visual-run-early.png` });

await page.keyboard.down("d");
await page.waitForTimeout(7600);
await page.keyboard.up("d");
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/visual-run-cross-map.png` });

async function closeStoryIfVisible() {
  if (await page.locator("#storyOverlay:not(.hidden)").count()) {
    await page.click("#storyChoiceBtn");
    await page.waitForTimeout(250);
  }
}

await closeStoryIfVisible();

const choiceVisible = await page.locator("#choices:not(.hidden)").count();
if (!choiceVisible) {
  await page.evaluate(() => {
    ui.storyOverlay.classList.add("hidden");
    state.pendingStory = null;
    state.resources.soul = 99;
    openChoices();
  });
}
await page.waitForTimeout(200);
await page.screenshot({ path: `${outDir}/visual-choice.png` });
const enabledChoice = page.locator(".choice:not(.is-disabled)");
if (await enabledChoice.count()) {
  await closeStoryIfVisible();
  await enabledChoice.first().click();
  await page.waitForTimeout(500);
}
await page.keyboard.press("Space");
await page.waitForTimeout(1800);
await page.screenshot({ path: `${outDir}/visual-after-choice-dash.png` });

await page.evaluate(() => {
  ui.choices.classList.add("hidden");
  ui.storyOverlay.classList.add("hidden");
  state.paused = false;
  state.resources.soul = 28;
  state.resources.fire = 1;
  Object.assign(state.weapons.sword, { level: 3, count: 4, cooldown: 0, damage: 28 });
  Object.assign(state.weapons.talisman, { level: 2, count: 3, cooldown: 0, damage: 36 });
  Object.assign(state.weapons.flame, { level: 2, cooldown: 0, damage: 64, radius: 160 });
  Object.assign(state.weapons.phantom, { level: 2, cooldown: 0, radius: 190 });
  state.enemies.length = 0;
  for (let i = 0; i < 18; i += 1) {
    const angle = (i / 18) * Math.PI * 2;
    const elite = i % 7 === 0;
    const table = CONFIG.enemies[elite ? "elite" : "wraith"];
    state.enemies.push({
      x: state.player.x + Math.cos(angle) * (150 + (i % 4) * 34),
      y: state.player.y + Math.sin(angle) * (105 + (i % 3) * 28),
      r: table.radius,
      hp: table.hp * (elite ? 1.6 : 0.9),
      maxHp: table.hp * (elite ? 1.6 : 0.9),
      speed: table.speed,
      damage: table.damage,
      xp: table.xp,
      elite,
      type: elite ? "elite" : "wraith",
      facing: Math.cos(angle) < 0 ? "right" : "left",
      animTime: i * 0.2,
      slowTime: 0,
      marks: 0,
      lastHit: "",
      hitFlash: 0
    });
  }
});
await page.waitForTimeout(1200);
await page.screenshot({ path: `${outDir}/visual-combat-pressure.png` });

const pressureProbe = await page.evaluate(async () => {
  const frames = [];
  let last = performance.now();
  await new Promise(resolve => {
    function step(now) {
      frames.push(now - last);
      last = now;
      if (frames.length >= 120) resolve();
      else requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
  const avgFrameMs = frames.reduce((sum, value) => sum + value, 0) / frames.length;
  return {
    avgFrameMs: Number(avgFrameMs.toFixed(2)),
    approxFps: Number((1000 / avgFrameMs).toFixed(1)),
    enemies: state.enemies.length,
    projectiles: state.projectiles.length,
    effects: state.effects.length,
    damageTexts: state.damageTexts.length,
    build: state.build.map(item => `${item.tag}:${item.name}x${item.count}`)
  };
});

await page.evaluate(() => {
  ui.choices.classList.add("hidden");
  state.paused = false;
});
await page.click("#pauseBtn");
await page.waitForTimeout(200);
await page.screenshot({ path: `${outDir}/visual-pause.png` });
await page.locator('[data-action="resume"]').click();
await page.waitForTimeout(200);

await page.evaluate(() => {
  ui.choices.classList.add("hidden");
  ui.storyOverlay.classList.add("hidden");
  state.paused = false;
  const events = [...state.map.events, ...visibleMapFeatures().events];
  if (events[0]) openStoryEvent(events[0]);
});
await page.waitForTimeout(250);
await page.screenshot({ path: `${outDir}/visual-story.png` });
await closeStoryIfVisible();

await page.evaluate(() => {
  ui.choices.classList.add("hidden");
  ui.storyOverlay.classList.add("hidden");
  state.player.hp = 0;
  endGame();
});
await page.waitForTimeout(250);
await page.screenshot({ path: `${outDir}/visual-gameover.png` });

await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => {
  ui.gameOver.classList.add("hidden");
  ui.pauseOverlay.classList.add("hidden");
  ui.storyOverlay.classList.add("hidden");
  state.running = true;
  state.paused = false;
  state.player.hp = state.player.maxHp;
  state.resources.soul = 99;
  openChoices();
});
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/visual-mobile-choice.png` });
await page.evaluate(() => {
  ui.choices.classList.add("hidden");
  state.paused = false;
});
await page.mouse.move(90, 690);
await page.mouse.down();
await page.mouse.move(145, 690);
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/visual-mobile-touch.png` });
await page.mouse.up();

const stateProbe = await page.evaluate(() => ({
  player: { x: Math.round(state.player.x), y: Math.round(state.player.y) },
  camera: { x: Math.round(state.camera.x), y: Math.round(state.camera.y) },
  chunks: state.map.chunks.size,
  choicesHidden: ui.choices.classList.contains("hidden"),
  touchStickVisible: ui.touchStick.classList.contains("is-active"),
  version: ASSET_VERSION
}));

await browser.close();
console.log(JSON.stringify({ errors, stateProbe, pressureProbe }, null, 2));
if (errors.length) process.exit(1);
