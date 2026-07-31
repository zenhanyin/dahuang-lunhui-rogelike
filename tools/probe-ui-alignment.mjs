import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});

const page = await browser.newPage({ viewport: { width: 1000, height: 563 }, deviceScaleFactor: 1 });
await page.goto("http://127.0.0.1:4177/index.html?qa=align", { waitUntil: "domcontentloaded" });
await page.click("#startBtn");
await page.waitForTimeout(500);
await page.evaluate(() => {
  state.resources.soul = 99;
  state.level = 3;
  ui.storyOverlay.classList.add("hidden");
  openChoices();
});
await page.waitForTimeout(250);

const report = await page.evaluate(() => {
  const box = selector => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      left: Math.round(r.left),
      top: Math.round(r.top),
      width: Math.round(r.width),
      height: Math.round(r.height),
      cx: Math.round(r.left + r.width / 2),
      cy: Math.round(r.top + r.height / 2)
    };
  };
  const boxes = [...document.querySelectorAll(".choice")].map((el, index) => {
    const r = el.getBoundingClientRect();
    return {
      index,
      left: Math.round(r.left),
      top: Math.round(r.top),
      width: Math.round(r.width),
      height: Math.round(r.height),
      cx: Math.round(r.left + r.width / 2),
      cy: Math.round(r.top + r.height / 2)
    };
  });
  const cardGroup = boxes.length ? {
    left: Math.min(...boxes.map(b => b.left)),
    right: Math.max(...boxes.map(b => b.left + b.width)),
    cx: Math.round((Math.min(...boxes.map(b => b.left)) + Math.max(...boxes.map(b => b.left + b.width))) / 2)
  } : null;
  return {
    viewport: { width: innerWidth, height: innerHeight },
    title: box(".choice-panel h2"),
    choicePanel: box(".choice-panel"),
    choiceList: box(".choice-list"),
    choices: boxes,
    cardGroup,
    skip: box("#skipChoiceBtn"),
    topCounters: box(".top-counters"),
    soul: box(".counter.soul"),
    fire: box(".counter.fire"),
    pause: box(".pause-btn")
  };
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
