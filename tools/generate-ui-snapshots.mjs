import { execFileSync, spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = resolve(process.cwd());
const OUT_DIR = join(ROOT, "ui-snapshots");
const PORT = Number(process.env.UI_SNAPSHOT_PORT || 4517);
const BASE_URL = `http://127.0.0.1:${PORT}/index.html`;
const NODE_MODULES = "C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const VIEWPORTS = [
  { name: "pc-1920x1080", width: 1920, height: 1080 },
  { name: "pc-1600x900", width: 1600, height: 900 },
  { name: "pc-1366x768", width: 1366, height: 768 }
];
const COMPONENTS = ["hud", "resource", "lineage", "choice", "story", "boss"];
const STATES = ["normal", "debug", "stress", "stress-debug"];

function sh(command, args, fallback = "") {
  try {
    return execFileSync(command, args, { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return fallback;
  }
}

const commit = sh("git", ["rev-parse", "--short=12", "HEAD"], "unknown");
const fullCommit = sh("git", ["rev-parse", "HEAD"], "unknown");

function cleanOutput() {
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
}

function wait(ms) {
  return new Promise(resolveWait => setTimeout(resolveWait, ms));
}

async function waitForServer(url, timeoutMs = 10000) {
  const started = Date.now();
  let lastError = "";
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
      lastError = `${response.status} ${response.statusText}`;
    } catch (error) {
      lastError = String(error?.message || error);
    }
    await wait(200);
  }
  throw new Error(`Dev server did not become ready: ${lastError}`);
}

function startServer() {
  const child = spawn(process.execPath, ["tools/dev-server.mjs"], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"]
  });
  child.stdout.on("data", chunk => process.stdout.write(`[server] ${chunk}`));
  child.stderr.on("data", chunk => process.stderr.write(`[server] ${chunk}`));
  return child;
}

function loadPlaywright() {
  return import(pathToFileURL(join(NODE_MODULES, "playwright/index.mjs")).href);
}

function ensureParent(file) {
  mkdirSync(dirname(file), { recursive: true });
}

async function preparePage(page, component, stateName) {
  const debug = stateName.includes("debug");
  const stress = stateName.includes("stress");
  const url = `${BASE_URL}?uiSnapshot=1&snapshotComponent=${component}&snapshotState=${stateName}&v=${commit}${debug ? "&uiDebug=1" : ""}`;
  await page.addInitScript(() => {
    let seed = 1337;
    Math.random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    window.__DAHUANG_UI_SNAPSHOT__ = true;
  });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.readyState === "complete");
  await page.waitForFunction(() => [...document.images].every(img => img.complete));
  await page.evaluate(() => document.fonts?.ready);
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        caret-color: transparent !important;
      }
    `
  });
  await page.evaluate(({ component, stress }) => {
    const $ = selector => document.querySelector(selector);
    const hide = selector => $(selector)?.classList.add("hidden");
    const show = selector => $(selector)?.classList.remove("hidden");
    const set = (selector, text) => {
      const node = $(selector);
      if (node) node.textContent = text;
    };
    const clearOverlays = () => {
      hide("#start");
      hide("#choices");
      hide("#storyOverlay");
      hide("#pauseOverlay");
      hide("#buildOverlay");
      hide("#gameOver");
      hide("#bossFrame");
      hide("#chapterAlert");
    };
    const forceRender = () => {
      try { syncRuntimeUi(true); } catch {}
      try { render(); } catch {}
    };
    const ensureGame = () => {
      if (!state || !state.running) startGame();
      clearOverlays();
      state.paused = false;
      state.time = stress ? 615.4 : 72.8;
      state.kills = stress ? 9999 : 37;
      state.resources.soul = stress ? 9999 : 86;
      state.resources.fire = stress ? 999 : 4;
      state.player.level = stress ? 99 : 8;
      state.player.maxHp = stress ? 9999 : 186;
      state.player.hp = stress ? 8765 : 142;
      state.player.nextXp = stress ? 8888 : 120;
      state.player.xp = stress ? 7777 : 84;
      state.chapter.objective = stress
        ? "第一章压力测试文本：Boss 将至，轮回记忆与构筑路径同步显示"
        : "击破精英，等待 Boss 现身";
      state.enemies.length = 0;
      state.drops.length = 0;
      state.damageTexts.length = 0;
      state.effects.length = 0;
      state.projectiles.length = 0;
      forceRender();
    };

    if (component === "lineage") {
      if (!state) state = freshState();
      clearOverlays();
      renderLineageSelect();
      show("#start");
      if (stress) {
        document.querySelectorAll("#lineageList .lineage").forEach((card, index) => {
          const title = card.querySelector(".lineage-copy h3");
          const body = card.querySelector(".lineage-copy span");
          if (title) title.textContent = index === 0 ? "轩辕遗剑长名压力测试" : "青丘巫女长名压力测试";
          if (body) body.textContent = "这是一段用于检查开局卡文字安全区、人物立绘中心点与属性章是否溢出的长文本。";
        });
      }
      return;
    }

    if (component === "choice") {
      ensureGame();
      state.resources.soul = stress ? 9999 : 120;
      state.player.level = stress ? 99 : 6;
      openChoices();
      if (stress) {
        document.querySelectorAll("#choiceList .choice").forEach((card, index) => {
          card.querySelector("em").textContent = index === 1 ? "轩辕遗剑长机缘" : "通用机缘压力";
          card.querySelector("b").textContent = ["女娲息壤超长压力", "轩辕剑意叠层强化", "青风诀移动与气血上限"][index] || "功法";
          card.querySelector("span:not(.choice-icon)").textContent = "长文本用于检查卡牌安全区、按钮锚点、技能图标中心点与正文换行表现。";
        });
      }
      return;
    }

    if (component === "story") {
      ensureGame();
      const event = {
        type: "brokenSword",
        x: state.player.x + 180,
        y: state.player.y + 80,
        r: 50,
        event: true,
        chapterStory: "first_memory",
        triggerRadius: 152
      };
      openStoryEvent(event);
      if (stress) {
        set("#storyTitle", "断剑残誓长标题压力测试");
        set("#storySpeaker", "轩辕遗剑长名压力测试");
        set("#storyText", "断剑插在荒土里，剑脊仍有旧战余温。这一段文本用于检查剧情框正文安全区、头像落点、按钮锚点和标题牌文字是否仍在图件内部。");
      }
      return;
    }

    ensureGame();

    if (component === "boss") {
      state.chapter.bossSpawned = true;
      spawnChapterBoss();
      const boss = state.enemies.find(enemy => enemy.boss);
      if (boss) {
        boss.x = state.player.x + 260;
        boss.y = state.player.y + 30;
        boss.hp = stress ? 45678 : 420;
        boss.maxHp = stress ? 50000 : 520;
        boss.chapterBossName = stress ? "赤焰战魇长名压力测试" : boss.chapterBossName;
        state.chapter.bossName = boss.chapterBossName;
      }
      forceRender();
      return;
    }

    if (component === "resource") {
      forceRender();
      return;
    }

    forceRender();
  }, { component, stress });
  await page.waitForFunction(() => [...document.images].every(img => img.complete));
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(debug ? 450 : 250);
}

async function collectGeometry(page, component, viewport, stateName) {
  return page.evaluate(({ component, viewport, stateName, commit, fullCommit }) => {
    const selectors = {
      hud: ["#hud"],
      resource: ["#topCounters", "#topCounters .counter.soul", "#topCounters .counter.fire", "#pauseBtn"],
      lineage: ["#start", "#lineageList .lineage", "#startBtn"],
      choice: ["#choices", "#choiceList .choice", "#skipChoiceBtn"],
      story: ["#storyOverlay .story-panel", "#storyTitle", "#storyText", "#storySpeaker", "#storyChoiceBtn"],
      boss: ["#bossFrame", "#chapterAlert", "#hud", "#topCounters"]
    };
    const textSelector = "h1,h2,h3,p,small,label,span,b,strong,button,em,.brand,.bars,.stats,.story-body,.story-speaker,.choice-tag,.choice-cost";
    const rectOf = node => {
      const rect = node.getBoundingClientRect();
      return {
        x: Number(rect.x.toFixed(2)),
        y: Number(rect.y.toFixed(2)),
        width: Number(rect.width.toFixed(2)),
        height: Number(rect.height.toFixed(2)),
        left: Number(rect.left.toFixed(2)),
        top: Number(rect.top.toFixed(2)),
        right: Number(rect.right.toFixed(2)),
        bottom: Number(rect.bottom.toFixed(2))
      };
    };
    const nodeLabel = node => node.id ? `#${node.id}` : node.className ? `.${String(node.className).trim().replace(/\s+/g, ".")}` : node.tagName.toLowerCase();
    const components = [];
    for (const selector of selectors[component] || []) {
      document.querySelectorAll(selector).forEach((node, index) => {
        if (!(node instanceof HTMLElement)) return;
        const rect = rectOf(node);
        if (rect.width <= 0 || rect.height <= 0) return;
        const texts = [...node.querySelectorAll(textSelector)]
          .filter(child => child instanceof HTMLElement)
          .map(child => {
            const childRect = rectOf(child);
            return {
              selector: nodeLabel(child),
              text: (child.textContent || "").trim().slice(0, 120),
              rect: childRect,
              scrollWidth: child.scrollWidth,
              clientWidth: child.clientWidth,
              scrollHeight: child.scrollHeight,
              clientHeight: child.clientHeight,
              overflowX: child.scrollWidth > child.clientWidth + 1,
              overflowY: child.scrollHeight > child.clientHeight + 1
            };
          });
        components.push({
          selector,
          index,
          label: nodeLabel(node),
          rect,
          visualAxis: {
            x: Number((rect.left + rect.width / 2).toFixed(2)),
            y: Number((rect.top + rect.height / 2).toFixed(2)),
            source: "DOM center"
          },
          textBoxes: texts
        });
      });
    }
    return {
      generatedAt: new Date().toISOString(),
      commit,
      fullCommit,
      uiAssetSet: typeof ASSET_VERSION === "string" ? ASSET_VERSION : "unknown",
      viewport,
      dpr: window.devicePixelRatio,
      component,
      state: stateName,
      metadataStatus: {
        hud: "CURRENT",
        resource: "CURRENT",
        lineage: "TBD",
        choice: "TBD",
        story: "TBD",
        boss: "TBD"
      }[component] || "TBD",
      components
    };
  }, { component, viewport, stateName, commit, fullCommit });
}

function writeSnapshotIndex(manifest) {
  const cards = [];
  for (const shot of manifest.snapshots) {
    const png = shot.png.replaceAll("\\", "/");
    const json = shot.geometry.replaceAll("\\", "/");
    cards.push(`
      <article>
        <h2>${shot.component} / ${shot.viewport} / ${shot.state}</h2>
        <a href="${png}"><img src="${png}" alt="${shot.component} ${shot.viewport} ${shot.state}"></a>
        <p><a href="${png}">Open original PNG</a> · <a href="${json}">geometry json</a></p>
      </article>`);
  }
  writeFileSync(join(OUT_DIR, "index.html"), `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>UI Snapshot Index</title>
  <style>
    body { margin: 0; padding: 24px; font-family: system-ui, sans-serif; background: #191411; color: #f4e6bd; }
    header { margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 18px; }
    article { background: #261c17; border: 1px solid #735234; padding: 12px; }
    h1 { margin: 0 0 8px; }
    h2 { font-size: 14px; margin: 0 0 8px; color: #f7d88a; }
    img { width: 100%; height: auto; display: block; background: #080706; }
    a { color: #8bd8c1; }
    code { color: #f7d88a; }
  </style>
</head>
<body>
  <header>
    <h1>《大荒轮回录：荒境》UI Snapshot Index</h1>
    <p>Commit <code>${manifest.commit}</code> · Asset Set <code>${manifest.uiAssetSet}</code> · Generated ${manifest.generatedAt}</p>
    <p>Static PNG evidence only. This page does not rerender game UI.</p>
  </header>
  <main class="grid">${cards.join("\n")}</main>
</body>
</html>
`, "utf8");
}

function runMetadataValidator() {
  const result = spawnSync(process.execPath, ["tools/validate-ui-metadata.mjs"], {
    cwd: ROOT,
    encoding: "utf8"
  });
  const report = {
    command: "node tools/validate-ui-metadata.mjs",
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr
  };
  writeFileSync(join(OUT_DIR, "metadata-validation.json"), JSON.stringify(report, null, 2), "utf8");
  return report;
}

async function main() {
  if (process.argv.includes("--index-only")) {
    const manifest = JSON.parse(readFileSync(join(OUT_DIR, "manifest.json"), "utf8"));
    writeSnapshotIndex(manifest);
    return;
  }

  cleanOutput();
  const { chromium } = await loadPlaywright();
  const server = startServer();
  const manifest = {
    generatedAt: new Date().toISOString(),
    commit,
    fullCommit,
    uiAssetSet: "unknown",
    dpr: 1,
    viewports: VIEWPORTS,
    components: COMPONENTS,
    states: STATES,
    snapshots: [],
    blocked: []
  };

  try {
    await waitForServer(BASE_URL);
    const browser = await chromium.launch({
      executablePath: existsSync(CHROME_PATH) ? CHROME_PATH : undefined,
      headless: true
    });
    manifest.browserVersion = await browser.version();
    for (const viewport of VIEWPORTS) {
      for (const component of COMPONENTS) {
        for (const stateName of STATES) {
          const page = await browser.newPage({
            viewport: { width: viewport.width, height: viewport.height },
            deviceScaleFactor: 1
          });
          try {
            await preparePage(page, component, stateName);
            const geometry = await collectGeometry(page, component, viewport, stateName);
            manifest.uiAssetSet = manifest.uiAssetSet === "unknown" ? geometry.uiAssetSet : manifest.uiAssetSet;
            const base = join(viewport.name, component, stateName);
            const pngFile = join(OUT_DIR, `${base}.png`);
            const jsonFile = join(OUT_DIR, `${base}.geometry.json`);
            ensureParent(pngFile);
            await page.screenshot({ path: pngFile, fullPage: false });
            writeFileSync(jsonFile, JSON.stringify(geometry, null, 2), "utf8");
            manifest.snapshots.push({
              viewport: viewport.name,
              component,
              state: stateName,
              png: `${base}.png`,
              geometry: `${base}.geometry.json`,
              metadataStatus: geometry.metadataStatus
            });
          } catch (error) {
            manifest.blocked.push({
              viewport: viewport.name,
              component,
              state: stateName,
              reason: String(error?.stack || error)
            });
          } finally {
            await page.close().catch(() => {});
          }
        }
      }
    }
    await browser.close();
    manifest.metadataValidation = runMetadataValidator();
    writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
    writeSnapshotIndex(manifest);
  } finally {
    server.kill();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
