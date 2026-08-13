import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});

const checkpoints = [20, 45, 75, 110, 125, 140];
const errors = [];

async function runLineage(lineageIndex) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", msg => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto("file:///D:/Acodex3/dahuang-lunhui-lu/index.html", { waitUntil: "domcontentloaded" });
  await page.evaluate(index => {
    selectedLineage = playableLineages()[index] || playableLineages()[0];
    renderLineageSelect();
  }, lineageIndex);
  await page.click("#startBtn");
  await page.waitForTimeout(250);

  const result = await page.evaluate(targets => {
    const samples = [];
    let safetyAssists = 0;

    function closeBlockingOverlay() {
      const storyEvent = state.map.events.find(event => event.chapterStory && !state.storySeen[storyKey(event)]);
      if (storyEvent && dist(state.player, storyEvent) < storyTriggerRadius(storyEvent) * 1.35) {
        openStoryEvent(storyEvent);
        return true;
      }
      const choice = document.querySelector(".choice:not(.is-disabled)");
      if (!ui.choices.classList.contains("hidden") && choice) {
        choice.click();
        return true;
      }
      if (!ui.storyOverlay.classList.contains("hidden")) {
        closeStoryEvent();
        return true;
      }
      if (state.paused) state.paused = false;
      return false;
    }

    function guidePlayer() {
      const t = state.time;
      const storyEvent = state.map.events.find(event => event.chapterStory && !state.storySeen[storyKey(event)]);
      if (storyEvent) {
        const angle = Math.atan2(storyEvent.y - state.player.y, storyEvent.x - state.player.x);
        state.player.x += Math.cos(angle) * 4.8;
        state.player.y += Math.sin(angle) * 4.8;
        state.player.facing = Math.cos(angle) < 0 ? "left" : "right";
        return;
      }
      state.player.x += Math.cos(t * 0.75) * 1.9;
      state.player.y += Math.sin(t * 0.58) * 1.55;
      state.player.facing = Math.cos(t * 0.75) < 0 ? "left" : "right";
    }

    for (const target of targets) {
      let guard = 0;
      while (state.running && state.time < target && guard < 9000) {
        closeBlockingOverlay();
        guidePlayer();
        update(1 / 30);
        if (state.player.hp < state.player.maxHp * 0.34 && state.time < CHAPTER_ONE_TIMELINE.bossSpawn) {
          state.player.hp = Math.max(state.player.hp, state.player.maxHp * 0.58);
          safetyAssists += 1;
        }
        guard += 1;
      }
      closeBlockingOverlay();
      syncRuntimeUi(true);
      const boss = activeChapterBoss();
      samples.push({
        target,
        time: Number(state.time.toFixed(1)),
        running: state.running,
        chapterResult: state.chapter?.result || "",
        level: state.player.level,
        hp: Math.ceil(state.player.hp),
        maxHp: state.player.maxHp,
        xp: state.player.xp,
        nextXp: state.player.nextXp,
        soul: state.resources.soul,
        fire: state.resources.fire,
        kills: state.kills,
        enemies: state.enemies.length,
        elites: state.enemies.filter(enemy => enemy.elite).length,
        boss: Boolean(boss),
        bossPhase: boss?.bossPhase || "",
        bossCleared: Boolean(state.chapter?.bossCleared),
        memories: state.chapter.memories.slice(),
        objective: state.chapter.objective,
        overlay: !ui.choices.classList.contains("hidden")
          ? "choices"
          : !ui.storyOverlay.classList.contains("hidden")
            ? "story"
            : ""
      });
      if (!state.running) break;
    }

    return {
      lineage: state.lineage.id,
      map: state.map.id,
      safetyAssists,
      samples
    };
  }, checkpoints);

  await page.close();
  return result;
}

const playableCount = 2;
const runs = [];
for (let i = 0; i < playableCount; i += 1) {
  runs.push(await runLineage(i));
}

await browser.close();

console.log(JSON.stringify({ errors, runs }, null, 2));

const failed = errors.length
  || runs.length !== playableCount
  || runs.some(run => run.samples.at(-1)?.time < 120)
  || runs.some(run => !run.samples.some(sample => sample.boss || sample.bossCleared))
  || runs.some(run => run.samples.at(-1)?.enemies > 62);

if (failed) process.exit(1);
