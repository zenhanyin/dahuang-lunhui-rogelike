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
  const soulBeforeFirst = state.resources.soul;
  const swordBeforeFirst = state.weapons.sword.damage;
  if (firstEvent) {
    state.player.x = firstEvent.x;
    state.player.y = firstEvent.y;
    openStoryEvent(firstEvent);
    closeStoryEvent();
  }

  stepTo(70.1);
  const secondEvent = state.map.events.find(event => event.chapterStory === "second_memory");
  if (secondEvent) {
    state.player.x = secondEvent.x;
    state.player.y = secondEvent.y;
    openStoryEvent(secondEvent);
    closeStoryEvent();
  }

  const bossWeaken = state.chapter.bossWeaken;
  stepTo(120.1);
  const boss = state.enemies.find(enemy => enemy.boss);
  const bossMaxHp = boss?.maxHp || 0;
  const bossConfig = CONFIG.chapterOne.boss;
  const expectedUnweakened = bossConfig.hpBase + state.player.level * bossConfig.hpPerLevel;
  let phaseSummon = false;
  let phaseEnrage = false;
  let summonCount = 0;
  let bossPhaseUi = "";

  if (boss) {
    boss.hp = boss.maxHp * 0.62;
    updateChapterBoss(boss, 0.016);
    phaseSummon = state.chapter.bossPhaseSeen.summon === true && boss.bossPhase === "summon";
    summonCount = state.enemies.filter(enemy => enemy.chapterSummon).length;

    boss.hp = boss.maxHp * 0.32;
    updateChapterBoss(boss, 0.016);
    phaseEnrage = state.chapter.bossPhaseSeen.enrage === true && boss.bossPhase === "enrage";
    syncRuntimeUi(true);
    bossPhaseUi = ui.bossPhaseText.textContent;
  }

  return {
    memories: state.chapter.memories.slice(),
    firstRewarded: state.resources.soul > soulBeforeFirst || state.weapons.sword.damage > swordBeforeFirst,
    bossWeaken,
    bossMaxHp,
    expectedUnweakened,
    phaseSummon,
    phaseEnrage,
    summonCount,
    bossPhaseUi,
    objective: state.chapter.objective
  };
});

await browser.close();
console.log(JSON.stringify({ errors, probe }, null, 2));

if (
  errors.length
  || !probe.memories.includes("first_memory")
  || !probe.memories.includes("second_memory")
  || !probe.firstRewarded
  || probe.bossWeaken <= 0
  || probe.bossMaxHp >= probe.expectedUnweakened
  || !probe.phaseSummon
  || !probe.phaseEnrage
  || probe.summonCount < 2
  || !probe.bossPhaseUi.includes("三阶段")
) {
  process.exit(1);
}
