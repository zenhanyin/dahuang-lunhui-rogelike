import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright");

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
await page.click("#startBtn");
await page.waitForTimeout(300);
const probe = await page.evaluate(async () => {
  ui.choices.classList.add("hidden");
  ui.storyOverlay.classList.add("hidden");
  state.paused = false;
  state.player.invuln = 999;
  for (const weapon of Object.values(state.weapons)) weapon.cooldown = 999;
  state.enemies.length = 0;
  for (let i = 0; i < 60; i += 1) {
    const angle = (i / 60) * Math.PI * 2;
    const ring = i % 3;
    const elite = i % 13 === 0;
    const table = CONFIG.enemies[elite ? "elite" : "wraith"];
    state.enemies.push({
      x: state.player.x + Math.cos(angle) * (170 + ring * 120),
      y: state.player.y + Math.sin(angle) * (118 + ring * 82),
      r: table.radius,
      hp: 9999,
      maxHp: 9999,
      speed: table.speed,
      damage: table.damage,
      xp: table.xp,
      elite,
      type: elite ? "elite" : "wraith",
      facing: Math.cos(angle) < 0 ? "right" : "left",
      animTime: i * 0.13,
      slowTime: 0,
      marks: 0,
      lastHit: "",
      hitFlash: 0
    });
  }
  const frames = [];
  let last = performance.now();
  await new Promise(resolve => {
    function step(now) {
      frames.push(now - last);
      last = now;
      if (frames.length >= 180) resolve();
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
    damageTexts: state.damageTexts.length
  };
});

await browser.close();
console.log(JSON.stringify({ errors, probe }, null, 2));
if (errors.length) process.exit(1);
