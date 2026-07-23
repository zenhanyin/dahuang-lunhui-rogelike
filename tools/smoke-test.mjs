import { readFileSync } from "node:fs";
import { Script, createContext } from "node:vm";

class ClassList {
  constructor(initial = "") {
    this.set = new Set(initial.split(/\s+/).filter(Boolean));
  }
  add(...names) { names.forEach(name => this.set.add(name)); }
  remove(...names) { names.forEach(name => this.set.delete(name)); }
  contains(name) { return this.set.has(name); }
  toggle(name, force) {
    const shouldAdd = force ?? !this.set.has(name);
    if (shouldAdd) this.set.add(name);
    else this.set.delete(name);
    return shouldAdd;
  }
  toString() { return [...this.set].join(" "); }
}

class ElementStub {
  constructor(id = "", tag = "div") {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.style = {
      setProperty(name, value) { this[name] = value; },
      removeProperty(name) { delete this[name]; }
    };
    this.dataset = {};
    this.classList = new ClassList();
    this.attributes = {};
    this.eventHandlers = {};
    this.firstElementChild = null;
    this.disabled = false;
    this.textContent = "";
    this.innerHTML = "";
  }
  appendChild(child) {
    this.children.push(child);
    if (!this.firstElementChild) this.firstElementChild = child;
    return child;
  }
  addEventListener(type, handler) {
    this.eventHandlers[type] = handler;
  }
  setAttribute(name, value) {
    this.attributes[name] = value;
  }
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 1280, height: 720 };
  }
}

function createCtx() {
  const noop = () => {};
  return {
    canvas: null,
    save: noop,
    restore: noop,
    setTransform: noop,
    clearRect: noop,
    fillRect: noop,
    strokeRect: noop,
    beginPath: noop,
    closePath: noop,
    fill: noop,
    stroke: noop,
    moveTo: noop,
    lineTo: noop,
    quadraticCurveTo: noop,
    bezierCurveTo: noop,
    arc: noop,
    ellipse: noop,
    translate: noop,
    rotate: noop,
    scale: noop,
    drawImage: noop,
    fillText: noop,
    strokeText: noop,
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop })
  };
}

const ids = [
  "game", "hpText", "hpBar", "xpText", "xpBar", "levelText", "lineageText", "timeText",
  "killText", "soulText", "fireText", "dockLevelText", "pauseBtn", "dashBtn",
  "touchStick", "start", "startBtn", "lineageList", "choices", "choiceList", "pauseOverlay",
  "skipChoiceBtn", "storyOverlay", "storyTitle", "storyText", "storyChoiceBtn",
  "gameOver", "resultText", "metaPointText", "restartBtn"
];
const elements = new Map(ids.map(id => [id, new ElementStub(id)]));
elements.get("game").getContext = () => createCtx();
elements.get("touchStick").firstElementChild = new ElementStub("", "span");
elements.get("choices").classList.add("hidden");
elements.get("storyOverlay").classList.add("hidden");
elements.get("pauseOverlay").classList.add("hidden");
elements.get("gameOver").classList.add("hidden");

const document = {
  getElementById: id => elements.get(id) ?? null,
  createElement: tag => new ElementStub("", tag)
};

const window = {
  document,
  devicePixelRatio: 1,
  eventHandlers: {},
  addEventListener(type, handler) { this.eventHandlers[type] = handler; }
};

class AudioContextStub {
  constructor() {
    this.state = "running";
    this.currentTime = 0;
    this.destination = {};
    this.sampleRate = 44100;
  }
  resume() {}
  createOscillator() {
    return {
      type: "sine",
      frequency: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      connect() { return this; },
      start() {},
      stop() {}
    };
  }
  createGain() {
    return {
      gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      connect() { return this; }
    };
  }
  createBuffer(_channels, length) {
    return { getChannelData: () => new Float32Array(length) };
  }
  createBufferSource() {
    return { buffer: null, connect() { return this; }, start() {}, stop() {} };
  }
  createBiquadFilter() {
    return { type: "bandpass", frequency: { setValueAtTime() {} }, Q: { setValueAtTime() {} }, connect() { return this; } };
  }
}
window.AudioContext = AudioContextStub;
window.webkitAudioContext = AudioContextStub;

class ImageStub {
  constructor() {
    this.complete = true;
    this.naturalWidth = 64;
    this.naturalHeight = 64;
  }
  set src(value) { this._src = value; }
  get src() { return this._src; }
}

const context = createContext({
  window,
  document,
  Image: ImageStub,
  performance: { now: () => 1000 },
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
  setTimeout: (fn) => {
    if (typeof fn === "function") fn();
    return 0;
  },
  clearTimeout: () => {},
  console,
  Math,
  JSON,
  URL
});
context.globalThis = context;

const config = readFileSync("src/config.js", "utf8");
const game = readFileSync("src/game.js", "utf8");
const probe = `
startGame();
const before = { x: state.player.x, y: state.player.y };
keys.add("d");
for (let i = 0; i < 420; i += 1) update(1 / 60);
keys.delete("d");
visibleMapFeatures();
const moved = { x: state.player.x, y: state.player.y, cameraX: state.camera.x, chunks: state.map.chunks.size };
const crossedScreen = moved.x > 1280;
const chunked = moved.chunks > 0;
state.resources.soul = 0;
openChoices();
const disabledChoices = Array.from(ui.choiceList.children).filter(button => button.disabled).length;
const freeChoices = Array.from(ui.choiceList.children).every(button => !button.disabled && button.innerHTML.includes("领悟"));
const beforeSkipSoul = state.resources.soul;
skipChoices();
const skipRewarded = state.resources.soul === beforeSkipSoul + 2 && ui.choices.classList.contains("hidden") && !state.paused;
touchMove.active = true;
touchMove.dx = 1;
touchMove.dy = 0;
update(1 / 10);
touchMove.active = false;
const touchMoved = state.player.x > moved.x;
if (!ui.storyOverlay.classList.contains("hidden")) closeStoryEvent();
state.paused = false;
ui.pauseBtn.eventHandlers.click?.();
const pauseVisible = !ui.pauseOverlay.classList.contains("hidden") && state.paused;
endGame();
const metaPoints = Number(ui.metaPointText.textContent);
globalThis.__SMOKE__ = {
  before,
  moved,
  crossedScreen,
  chunked,
  disabledChoices,
  freeChoices,
  skipRewarded,
  touchMoved,
  pauseVisible,
  metaPoints,
  formalUiAssets: ASSET_VERSION === "0.3.2-scene-map"
};
`;

new Script(`${config}\n${game}\n${probe}`).runInContext(context, { timeout: 5000 });
console.log(JSON.stringify(context.__SMOKE__, null, 2));

