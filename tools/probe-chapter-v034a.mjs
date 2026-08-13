import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
page.on("console", msg => {
  if (msg.type() === "error") errors.push(msg.text());
});

await page.goto("file:///D:/Acodex3/dahuang-lunhui-lu/index.html", { waitUntil: "domcontentloaded" });
await page.click("#startBtn");
await page.waitForTimeout(300);

const probe = await page.evaluate(() => {
  function stepTo(time) {
    state.time = time;
    state.paused = false;
    state.storyCooldown = 0;
    updateChapterDirector();
  }

  stepTo(14.1);
  const firstEvent = state.map.events.find(event => event.chapterStory === "first_memory");
  if (firstEvent) {
    state.player.x = firstEvent.x;
    state.player.y = firstEvent.y;
    openStoryEvent(firstEvent);
  }
  const firstStoryOpen = !ui.storyOverlay.classList.contains("hidden");
  if (firstStoryOpen) closeStoryEvent();

  stepTo(42.1);
  const eliteCount = state.enemies.filter(enemy => enemy.chapterElite).length;
  syncRuntimeUi(true);
  const eliteAlertVisible = !ui.chapterAlert.classList.contains("hidden");
  const eliteAlertTitle = ui.chapterAlertTitle.textContent;

  stepTo(70.1);
  const secondEvent = state.map.events.find(event => event.chapterStory === "second_memory");
  if (secondEvent) {
    state.player.x = secondEvent.x;
    state.player.y = secondEvent.y;
    openStoryEvent(secondEvent);
    closeStoryEvent();
  }

  stepTo(105.1);
  const warned = state.chapter.bossWarned;

  stepTo(120.1);
  const boss = state.enemies.find(enemy => enemy.boss);
  syncRuntimeUi(true);
  const bossFrameVisible = !ui.bossFrame.classList.contains("hidden");
  const bossNameText = ui.bossNameText.textContent;
  const bossHpWidth = ui.bossHpBar.style.width;
  if (boss) {
    boss.hp = 0;
    update(0.016);
  }

  return {
    objective: state.chapter.objective,
    firstEvent: Boolean(firstEvent),
    firstStoryOpen,
    firstMemoryRecorded: state.chapter.memories.includes("first_memory"),
    eliteCount,
    eliteAlertVisible,
    eliteAlertTitle,
    secondEvent: Boolean(secondEvent),
    warned,
    bossSpawned: state.chapter.bossSpawned,
    bossFrameVisible,
    bossNameText,
    bossHpWidth,
    bossCleared: state.chapter.bossCleared,
    gameOverVisible: !ui.gameOver.classList.contains("hidden"),
    resultText: ui.resultText.textContent
  };
});

await browser.close();
console.log(JSON.stringify({ errors, probe }, null, 2));
if (errors.length || !probe.firstEvent || !probe.firstMemoryRecorded || probe.eliteCount < 1 || !probe.eliteAlertVisible || !probe.eliteAlertTitle.includes("第2波") || !probe.secondEvent || !probe.warned || !probe.bossSpawned || !probe.bossFrameVisible || !probe.bossNameText || !probe.bossHpWidth || !probe.bossCleared || !probe.gameOverVisible) {
  process.exit(1);
}
