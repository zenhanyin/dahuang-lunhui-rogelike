import { createRequire } from "node:module";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const URL = "http://127.0.0.1:4177/index.html?qa=safe-area";
const bounds = JSON.parse(fs.readFileSync("assets/runtime/webp/ui/formal_v034a8/ui_bounds.v034b.json", "utf8"));
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});

function inflate(box, pad = 0) {
  return {
    left: box.left - pad,
    top: box.top - pad,
    right: box.right + pad,
    bottom: box.bottom + pad
  };
}

function inside(inner, outer, pad = 1) {
  const o = inflate(outer, pad);
  return inner.left >= o.left && inner.top >= o.top && inner.right <= o.right && inner.bottom <= o.bottom;
}

function roundBox(box) {
  if (!box) return null;
  return Object.fromEntries(Object.entries(box).map(([key, value]) => [key, Math.round(value)]));
}

function centerDelta(inner, outer) {
  return {
    dx: Math.round((inner.left + inner.width / 2) - (outer.left + outer.width / 2)),
    dy: Math.round((inner.top + inner.height / 2) - (outer.top + outer.height / 2))
  };
}

function scaledSafe(card, component, key) {
  const base = bounds.components[component].outer;
  const safe = bounds.components[component][key];
  const sx = card.width / base[2];
  const sy = card.height / base[3];
  return {
    left: card.left + safe[0] * sx,
    top: card.top + safe[1] * sy,
    right: card.left + (safe[0] + safe[2]) * sx,
    bottom: card.top + (safe[1] + safe[3]) * sy,
    width: safe[2] * sx,
    height: safe[3] * sy
  };
}

function pushIfOffAxis(issues, meta, box, safe, maxDx = 10, maxDy = 12) {
  const delta = centerDelta(box, safe);
  if (!inside(box, safe, 8) || Math.abs(delta.dx) > maxDx || Math.abs(delta.dy) > maxDy) {
    issues.push({ ...meta, box: roundBox(box), safe: roundBox(safe), centerDelta: delta });
  }
}

async function makePage(viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  return page;
}

async function auditDesktop() {
  const page = await makePage({ width: 1294, height: 742 });
  const issues = [];

  await page.evaluate(() => {
    selectedLineage = CONFIG.lineages[0];
    renderLineageSelect();
  });
  await page.waitForTimeout(100);

  const start = await page.evaluate(() => {
    const rect = el => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    return [...document.querySelectorAll(".lineage")].map((card, index) => {
      const c = rect(card);
      return {
        index,
        card: rect(card),
        portrait: rect(card.querySelector(".lineage-art img")),
        copy: rect(card.querySelector(".lineage-copy")),
        stats: rect(card.querySelector(".lineage-stats"))
      };
    });
  });

  for (const item of start) {
    pushIfOffAxis(issues, { screen: "start", index: item.index, key: "portrait" }, item.portrait, scaledSafe(item.card, "lineage_card", "portrait"), 12, 16);
    pushIfOffAxis(issues, { screen: "start", index: item.index, key: "copy" }, item.copy, scaledSafe(item.card, "lineage_card", "copy"), 12, 16);
    pushIfOffAxis(issues, { screen: "start", index: item.index, key: "stats" }, item.stats, scaledSafe(item.card, "lineage_card", "stats"), 12, 12);
  }

  await page.click("#startBtn");
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    state.resources.soul = 99;
    state.level = 3;
    ui.storyOverlay.classList.add("hidden");
    openChoices();
  });
  await page.waitForTimeout(100);

  const choices = await page.evaluate(() => {
    const rect = el => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    return [...document.querySelectorAll(".level-overlay .choice")].map((card, index) => {
      const c = rect(card);
      return {
        index,
        card: c,
        icon: rect(card.querySelector(".choice-icon")),
        tag: rect(card.querySelector(".choice-tag")),
        title: rect(card.querySelector("b")),
        body: rect(card.querySelector("span:not(.choice-icon):not(.choice-tag)")),
        cost: rect(card.querySelector(".choice-cost")),
      };
    });
  });

  for (const item of choices) {
    pushIfOffAxis(issues, { screen: "choices", index: item.index, key: "icon" }, item.icon, scaledSafe(item.card, "choice_card_frame", "icon"), 8, 8);
    pushIfOffAxis(issues, { screen: "choices", index: item.index, key: "tag" }, item.tag, scaledSafe(item.card, "choice_card_frame", "tag"), 10, 8);
    pushIfOffAxis(issues, { screen: "choices", index: item.index, key: "title" }, item.title, scaledSafe(item.card, "choice_card_frame", "title"), 10, 10);
    pushIfOffAxis(issues, { screen: "choices", index: item.index, key: "body" }, item.body, scaledSafe(item.card, "choice_card_frame", "body"), 12, 12);
    pushIfOffAxis(issues, { screen: "choices", index: item.index, key: "cost" }, item.cost, scaledSafe(item.card, "choice_card_frame", "button"), 12, 8);
  }

  await page.evaluate(() => {
    ui.choices.classList.add("hidden");
    ui.storyTitle.textContent = "断剑残誓";
    ui.storySpeaker.textContent = "轩辕遗剑";
    ui.storyText.textContent = "断剑插在荒土里，剑脊仍有旧战余温。你听见前世在剑冢里留下的誓言：若轮回不止，便以剑痕记路。";
    ui.storyOverlay.classList.remove("hidden");
  });
  await page.waitForTimeout(100);

  const story = await page.evaluate(() => {
    const rect = el => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    const panel = document.querySelector(".story-panel");
    const p = rect(panel);
    const scaleX = p.width / 1858;
    const scaleY = p.height / 693;
    const safe = ([x, y, w, h]) => ({
      left: p.left + x * scaleX,
      top: p.top + y * scaleY,
      right: p.left + (x + w) * scaleX,
      bottom: p.top + (y + h) * scaleY
    });
    return {
      title: rect(document.querySelector(".story-panel h2")),
      speaker: rect(document.querySelector(".story-speaker")),
      body: rect(document.querySelector(".story-panel p")),
      button: rect(document.querySelector("#storyChoiceBtn")),
      safe: {
        title: safe([390, 62, 500, 56]),
        speaker: safe([130, 345, 260, 60]),
        body: safe([500, 230, 1150, 240]),
        button: safe([210, 500, 330, 95])
      }
    };
  });

  for (const key of ["title", "speaker", "body", "button"]) {
    if (!inside(story[key], story.safe[key], 8)) {
      issues.push({ screen: "story", key, box: roundBox(story[key]), safe: roundBox(story.safe[key]) });
    }
  }

  const counter = await page.evaluate(() => {
    ui.storyOverlay.classList.add("hidden");
    state.resources.soul = 999;
    state.resources.fire = 999;
    ui.soulText.textContent = "999";
    ui.fireText.textContent = "999";
    const rect = el => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    return {
      soul: rect(document.querySelector(".counter.soul b")),
      fire: rect(document.querySelector(".counter.fire b")),
      soulFrame: rect(document.querySelector(".counter.soul")),
      fireFrame: rect(document.querySelector(".counter.fire"))
    };
  });

  for (const key of ["soul", "fire"]) {
    const frame = counter[`${key}Frame`];
    const num = counter[key];
    const safe = { left: frame.right - 82, top: frame.top + 7, right: frame.right - 16, bottom: frame.bottom - 7, width: 66, height: frame.height - 14 };
    if (!inside(num, safe, 1)) {
      issues.push({ screen: "counter", key, box: roundBox(num), safe: roundBox(safe) });
    }
  }

  await page.close();
  return issues;
}

const desktopIssues = await auditDesktop();
await browser.close();

const report = {
  version: "ui-safe-area-audit-v1",
  issueCount: desktopIssues.length,
  issues: desktopIssues
};

console.log(JSON.stringify(report, null, 2));
if (desktopIssues.length) process.exit(1);
