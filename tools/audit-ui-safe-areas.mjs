import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const URL = "http://127.0.0.1:4177/index.html?qa=safe-area";
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
      const safe = {
        portrait: { left: c.left + 48 / 276 * c.width, top: c.top + 82 / 500 * c.height, right: c.left + 228 / 276 * c.width, bottom: c.top + 188 / 500 * c.height },
        role: { left: c.left + 48 / 276 * c.width, top: c.top + 226 / 500 * c.height, right: c.left + 228 / 276 * c.width, bottom: c.top + 246 / 500 * c.height },
        name: { left: c.left + 42 / 276 * c.width, top: c.top + 250 / 500 * c.height, right: c.left + 234 / 276 * c.width, bottom: c.top + 282 / 500 * c.height },
        skill: { left: c.left + 48 / 276 * c.width, top: c.top + 286 / 500 * c.height, right: c.left + 228 / 276 * c.width, bottom: c.top + 316 / 500 * c.height },
        stats: { left: c.left + 60 / 276 * c.width, top: c.top + 424 / 500 * c.height, right: c.left + 216 / 276 * c.width, bottom: c.top + 456 / 500 * c.height }
      };
      return {
        index,
        card: rect(card),
        portrait: rect(card.querySelector(".lineage-art img")),
        role: rect(card.querySelector(".lineage-copy em")),
        name: rect(card.querySelector(".lineage h3")),
        skill: rect(card.querySelector(".lineage strong")),
        stats: rect(card.querySelector(".lineage-stats")),
        safe
      };
    });
  });

  for (const item of start) {
    for (const key of ["portrait", "role", "name", "skill", "stats"]) {
      if (!inside(item[key], item.safe[key], 10)) {
        issues.push({ screen: "start", index: item.index, key, box: roundBox(item[key]), safe: roundBox(item.safe[key]) });
      }
    }
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
      const safe = {
        icon: { left: c.left + 92 / 268 * c.width, top: c.top + 50 / 344 * c.height, right: c.left + 164 / 268 * c.width, bottom: c.top + 122 / 344 * c.height },
        tag: { left: c.left + 70 / 268 * c.width, top: c.top + 124 / 344 * c.height, right: c.left + 194 / 268 * c.width, bottom: c.top + 146 / 344 * c.height },
        title: { left: c.left + 48 / 268 * c.width, top: c.top + 154 / 344 * c.height, right: c.left + 214 / 268 * c.width, bottom: c.top + 194 / 344 * c.height },
        body: { left: c.left + 54 / 268 * c.width, top: c.top + 204 / 344 * c.height, right: c.left + 210 / 268 * c.width, bottom: c.top + 286 / 344 * c.height },
        cost: { left: c.left + 82 / 268 * c.width, top: c.top + 286 / 344 * c.height, right: c.left + 178 / 268 * c.width, bottom: c.top + 326 / 344 * c.height }
      };
      return {
        index,
        card: c,
        icon: rect(card.querySelector(".choice-icon")),
        tag: rect(card.querySelector(".choice-tag")),
        title: rect(card.querySelector("b")),
        body: rect(card.querySelector("span:not(.choice-icon):not(.choice-tag)")),
        cost: rect(card.querySelector(".choice-cost")),
        safe
      };
    });
  });

  for (const item of choices) {
    for (const key of ["icon", "tag", "title", "body", "cost"]) {
      if (!inside(item[key], item.safe[key], key === "icon" ? 8 : 4)) {
        issues.push({ screen: "choices", index: item.index, key, box: roundBox(item[key]), safe: roundBox(item.safe[key]) });
      }
    }
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
    const safe = { left: frame.right - 50, top: frame.top + 7, right: frame.right - 8, bottom: frame.bottom - 7 };
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
