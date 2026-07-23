const CONFIG = window.DAHUANG_CONFIG;
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  hpText: document.getElementById("hpText"),
  hpBar: document.getElementById("hpBar"),
  xpText: document.getElementById("xpText"),
  xpBar: document.getElementById("xpBar"),
  buildText: document.getElementById("buildText"),
  levelText: document.getElementById("levelText"),
  lineageText: document.getElementById("lineageText"),
  timeText: document.getElementById("timeText"),
  killText: document.getElementById("killText"),
  soulText: document.getElementById("soulText"),
  fireText: document.getElementById("fireText"),
  dockLevelText: document.getElementById("dockLevelText"),
  pauseBtn: document.getElementById("pauseBtn"),
  dashBtn: document.getElementById("dashBtn"),
  touchStick: document.getElementById("touchStick"),
  start: document.getElementById("start"),
  startBtn: document.getElementById("startBtn"),
  lineageList: document.getElementById("lineageList"),
  choices: document.getElementById("choices"),
  choiceList: document.getElementById("choiceList"),
  skipChoiceBtn: document.getElementById("skipChoiceBtn"),
  storyOverlay: document.getElementById("storyOverlay"),
  storyTitle: document.getElementById("storyTitle"),
  storyText: document.getElementById("storyText"),
  storyChoiceBtn: document.getElementById("storyChoiceBtn"),
  pauseOverlay: document.getElementById("pauseOverlay"),
  buildLedger: document.getElementById("buildLedger"),
  gameOver: document.getElementById("gameOver"),
  resultText: document.getElementById("resultText"),
  metaPointText: document.getElementById("metaPointText"),
  restartBtn: document.getElementById("restartBtn")
};

const keys = new Set();
const TAU = Math.PI * 2;
let selectedLineage = CONFIG.lineages[0];
let state;
let lastTime = 0;
let audioCtx;
let audioBudget = {};
let musicNodes;
let screenShake = 0;
const touchMove = { active: false, id: null, originX: 0, originY: 0, dx: 0, dy: 0 };

const RUNTIME_ASSET_ROOT = "assets/runtime/webp";
const ASSET_VERSION = "0.3.2-ground-mist";
const ASSET_PATHS = {
  characters: {
    sword_right_0: `${RUNTIME_ASSET_ROOT}/characters/sword_right_0.webp`,
    sword_right_1: `${RUNTIME_ASSET_ROOT}/characters/sword_right_1.webp`,
    sword_right_2: `${RUNTIME_ASSET_ROOT}/characters/sword_right_2.webp`,
    sword_right_3: `${RUNTIME_ASSET_ROOT}/characters/sword_right_3.webp`,
    sword_left_0: `${RUNTIME_ASSET_ROOT}/characters/sword_left_0.webp`,
    sword_left_1: `${RUNTIME_ASSET_ROOT}/characters/sword_left_1.webp`,
    sword_left_2: `${RUNTIME_ASSET_ROOT}/characters/sword_left_2.webp`,
    sword_left_3: `${RUNTIME_ASSET_ROOT}/characters/sword_left_3.webp`,
    witch_right_0: `${RUNTIME_ASSET_ROOT}/characters/witch_right_0.webp`,
    witch_right_1: `${RUNTIME_ASSET_ROOT}/characters/witch_right_1.webp`,
    witch_right_2: `${RUNTIME_ASSET_ROOT}/characters/witch_right_2.webp`,
    witch_right_3: `${RUNTIME_ASSET_ROOT}/characters/witch_right_3.webp`,
    witch_left_0: `${RUNTIME_ASSET_ROOT}/characters/witch_left_0.webp`,
    witch_left_1: `${RUNTIME_ASSET_ROOT}/characters/witch_left_1.webp`,
    witch_left_2: `${RUNTIME_ASSET_ROOT}/characters/witch_left_2.webp`,
    witch_left_3: `${RUNTIME_ASSET_ROOT}/characters/witch_left_3.webp`,
    alchemist_right_0: `${RUNTIME_ASSET_ROOT}/characters/alchemist_right_0.webp`,
    alchemist_right_1: `${RUNTIME_ASSET_ROOT}/characters/alchemist_right_1.webp`,
    alchemist_right_2: `${RUNTIME_ASSET_ROOT}/characters/alchemist_right_2.webp`,
    alchemist_right_3: `${RUNTIME_ASSET_ROOT}/characters/alchemist_right_3.webp`,
    alchemist_left_0: `${RUNTIME_ASSET_ROOT}/characters/alchemist_left_0.webp`,
    alchemist_left_1: `${RUNTIME_ASSET_ROOT}/characters/alchemist_left_1.webp`,
    alchemist_left_2: `${RUNTIME_ASSET_ROOT}/characters/alchemist_left_2.webp`,
    alchemist_left_3: `${RUNTIME_ASSET_ROOT}/characters/alchemist_left_3.webp`
  },
  enemies: {
    wraith_right_0: `${RUNTIME_ASSET_ROOT}/enemies/wraith_right_0.webp`,
    wraith_right_1: `${RUNTIME_ASSET_ROOT}/enemies/wraith_right_1.webp`,
    wraith_right_2: `${RUNTIME_ASSET_ROOT}/enemies/wraith_right_2.webp`,
    wraith_left_0: `${RUNTIME_ASSET_ROOT}/enemies/wraith_left_0.webp`,
    wraith_left_1: `${RUNTIME_ASSET_ROOT}/enemies/wraith_left_1.webp`,
    wraith_left_2: `${RUNTIME_ASSET_ROOT}/enemies/wraith_left_2.webp`,
    elite_right_0: `${RUNTIME_ASSET_ROOT}/enemies/elite_right_0.webp`,
    elite_right_1: `${RUNTIME_ASSET_ROOT}/enemies/elite_right_1.webp`,
    elite_right_2: `${RUNTIME_ASSET_ROOT}/enemies/elite_right_2.webp`,
    elite_left_0: `${RUNTIME_ASSET_ROOT}/enemies/elite_left_0.webp`,
    elite_left_1: `${RUNTIME_ASSET_ROOT}/enemies/elite_left_1.webp`,
    elite_left_2: `${RUNTIME_ASSET_ROOT}/enemies/elite_left_2.webp`
  },
  skills: {
    sword: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_sword.webp`,
    talisman: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_talisman.webp`
  },
  terrain: {
    foxfire_0: `${RUNTIME_ASSET_ROOT}/terrain/foxfire_0.webp`,
    foxfire_1: `${RUNTIME_ASSET_ROOT}/terrain/foxfire_1.webp`,
    foxfire_2: `${RUNTIME_ASSET_ROOT}/terrain/foxfire_2.webp`,
    foxfire_3: `${RUNTIME_ASSET_ROOT}/terrain/foxfire_3.webp`,
    spirit_0: `${RUNTIME_ASSET_ROOT}/terrain/spirit_pool_0.webp`,
    spirit_1: `${RUNTIME_ASSET_ROOT}/terrain/spirit_pool_1.webp`,
    spirit_2: `${RUNTIME_ASSET_ROOT}/terrain/spirit_pool_2.webp`,
    spiritWell_0: `${RUNTIME_ASSET_ROOT}/terrain/portal_0.webp`,
    spiritWell_1: `${RUNTIME_ASSET_ROOT}/terrain/portal_1.webp`,
    mist_0: `${RUNTIME_ASSET_ROOT}/terrain/mist_0.webp`,
    mist_1: `${RUNTIME_ASSET_ROOT}/terrain/mist_1.webp`,
    mist_2: `${RUNTIME_ASSET_ROOT}/terrain/mist_2.webp`,
    rift_0: `${RUNTIME_ASSET_ROOT}/terrain/rift_0.webp`,
    rift_1: `${RUNTIME_ASSET_ROOT}/terrain/rift_1.webp`,
    rift_2: `${RUNTIME_ASSET_ROOT}/terrain/rift_2.webp`,
    stele_0: `${RUNTIME_ASSET_ROOT}/terrain/stele_0.webp`,
    shrine_0: `${RUNTIME_ASSET_ROOT}/terrain/shrine_0.webp`,
    stone_0: `${RUNTIME_ASSET_ROOT}/terrain/rock_0.webp`,
    stone_1: `${RUNTIME_ASSET_ROOT}/terrain/rock_1.webp`,
    stone_2: `${RUNTIME_ASSET_ROOT}/terrain/rock_2.webp`,
    grass_0: `${RUNTIME_ASSET_ROOT}/terrain/grass_0.webp`,
    grass_1: `${RUNTIME_ASSET_ROOT}/terrain/grass_1.webp`,
    grass_2: `${RUNTIME_ASSET_ROOT}/terrain/grass_2.webp`,
    bone_0: `${RUNTIME_ASSET_ROOT}/terrain/bone_0.webp`,
    bone_1: `${RUNTIME_ASSET_ROOT}/terrain/bone_1.webp`
  },
  maps: {
    wilds: `assets/maps/wilds-runtime.webp`,
    qingqiu: `assets/maps/qingqiu-runtime.webp`,
    sword_tomb: `assets/maps/v032/sword_tomb/ground_a.webp`,
    herb_marsh: `assets/maps/v032/herb_marsh/ground_a.webp`,
    wilderness: `assets/maps/v032/wilderness/ground_a.webp`
  },
  mapTiles: {
    qingqiu_base_01: `assets/maps/v032_atlas/qingqiu_seamless/tile_qingqiu_base_seamless_01.webp`
  },
  scene: {
    decal_mist_pool_01: `${RUNTIME_ASSET_ROOT}/scene/qingqiu/decal_mist_pool_01.webp`,
    decal_mist_pool_02: `${RUNTIME_ASSET_ROOT}/scene/qingqiu/decal_mist_pool_02.webp`,
    decal_mist_pool_03: `${RUNTIME_ASSET_ROOT}/scene/qingqiu/decal_mist_pool_03.webp`,
    decal_qingqiu_ground_mist_01: `assets/maps/v032_atlas/qingqiu/decals/decal_qingqiu_ground_mist_01.webp`,
    decal_qingqiu_ground_mist_02: `assets/maps/v032_atlas/qingqiu/decals/decal_qingqiu_ground_mist_02.webp`,
    decal_qingqiu_ground_mist_03: `assets/maps/v032_atlas/qingqiu/decals/decal_qingqiu_ground_mist_03.webp`,
    decal_qingqiu_old_vow_trace_01: `assets/maps/v032_atlas/qingqiu/decals/decal_qingqiu_old_vow_trace_01.webp`,
    decal_crack_01: `${RUNTIME_ASSET_ROOT}/scene/qingqiu/decal_crack_01.webp`,
    decal_crack_02: `${RUNTIME_ASSET_ROOT}/scene/qingqiu/decal_crack_02.webp`,
    sword_tomb_transition_1: `assets/maps/v032/sword_tomb/transition_1.webp`,
    sword_tomb_transition_2: `assets/maps/v032/sword_tomb/transition_2.webp`,
    sword_tomb_transition_3: `assets/maps/v032/sword_tomb/transition_3.webp`,
    qingqiu_transition_1: `assets/maps/v032/qingqiu/transition_1.webp`,
    qingqiu_transition_2: `assets/maps/v032/qingqiu/transition_2.webp`,
    qingqiu_transition_3: `assets/maps/v032/qingqiu/transition_3.webp`,
    herb_marsh_transition_1: `assets/maps/v032/herb_marsh/transition_1.webp`,
    herb_marsh_transition_2: `assets/maps/v032/herb_marsh/transition_2.webp`,
    herb_marsh_transition_3: `assets/maps/v032/herb_marsh/transition_3.webp`,
    wilderness_transition_1: `assets/maps/v032/wilderness/transition_1.webp`,
    wilderness_transition_2: `assets/maps/v032/wilderness/transition_2.webp`,
    wilderness_transition_3: `assets/maps/v032/wilderness/transition_3.webp`
  },
  sceneEvents: {
    brokenSword: `assets/maps/v032/sword_tomb/event_broken_sword.webp`,
    foxfire: `assets/maps/v032/qingqiu/event_foxfire_vow.webp`,
    herbCauldron: `assets/maps/v032/herb_marsh/event_herb_cauldron.webp`,
    memoryStele: `assets/maps/v032/wilderness/event_memory_stele.webp`
  },
  uiIcons: {
    sword: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_sword.webp`,
    talisman: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_talisman.webp`,
    flame: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_flame.webp`,
    phantom: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_mist.webp`,
    wind: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_speed.webp`,
    earth: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_shield.webp`,
    arrow: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_sword.webp`,
    core: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_burst.webp`,
    mark: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_sword.webp`,
    rune: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_talisman.webp`,
    mist: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_mist.webp`,
    split: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_talisman.webp`,
    lotus: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_heal.webp`,
    cloud: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_flame.webp`,
    heal: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_heal.webp`,
    clue: `${RUNTIME_ASSET_ROOT}/ui/icons/attr_clue.webp`
  }
};

const assets = {};

function loadAssets() {
  for (const [group, entries] of Object.entries(ASSET_PATHS)) {
    assets[group] = {};
    for (const [key, src] of Object.entries(entries)) {
      const img = new Image();
      img.src = `${src}?v=${ASSET_VERSION}`;
      assets[group][key] = img;
    }
  }
}

function assetReady(group, key) {
  const img = assets[group]?.[key];
  return img && img.complete && img.naturalWidth > 0;
}

function drawAsset(group, key, x, y, w, h, options = {}) {
  if (!assetReady(group, key)) return false;
  const { rotate = 0, alpha = 1, anchorY = 0.5 } = options;
  const img = assets[group][key];
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(rotate);
  ctx.drawImage(img, -w / 2, -h * anchorY, w, h);
  ctx.restore();
  return true;
}

function animatedKey(prefix, direction, frameCount, animTime, fps = 8) {
  const frame = Math.floor((animTime || 0) * fps) % frameCount;
  return `${prefix}_${direction}_${frame}`;
}

function drawAnimatedAsset(group, prefix, direction, frameCount, animTime, x, y, w, h, options = {}) {
  const key = animatedKey(prefix, direction, frameCount, animTime, options.fps || 8);
  return drawAsset(group, key, x, y, w, h, options);
}

function tuningValue(key, fallback) {
  return CONFIG.tuning[key] ?? fallback;
}

function pushCapped(list, item, max) {
  if (list.length >= max) list.shift();
  list.push(item);
}

function makeRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randomBetween(rng, range) {
  return range[0] + rng() * (range[1] - range[0]);
}

function pickFrom(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const DECAL_ALPHA = {
  sceneMist: 0.76,
  sceneTransition: 0.52,
  groundMist: 0.56,
  oldVowTrace: 0.48,
  sceneCrack: 0.46
};

function getAtPath(root, path) {
  return path.split(".").reduce((obj, key) => obj[key], root);
}

function setAtPath(root, path, value) {
  const parts = path.split(".");
  const key = parts.pop();
  const target = parts.reduce((obj, part) => obj[part], root);
  target[key] = value;
}

function applyEffect(stateRef, [path, op, value, limit]) {
  const current = getAtPath(stateRef, path);
  if (op === "add") setAtPath(stateRef, path, current + value);
  if (op === "set") setAtPath(stateRef, path, value);
  if (op === "heal") setAtPath(stateRef, path, Math.min(stateRef.player.maxHp, current + value));
  if (op === "mulMin") setAtPath(stateRef, path, Math.max(limit, current * value));
  if (op === "addMin") setAtPath(stateRef, path, Math.max(limit, current + value));
}

function buildTagFor(upgrade) {
  if (upgrade.effects.some(effect => effect[0].startsWith("weapons.sword"))) return "剑气";
  if (upgrade.effects.some(effect => effect[0].startsWith("weapons.talisman"))) return "符法";
  if (upgrade.effects.some(effect => effect[0].startsWith("weapons.flame"))) return "丹火";
  if (upgrade.effects.some(effect => effect[0].startsWith("weapons.phantom"))) return "幻雾";
  if (upgrade.effects.some(effect => effect[0].includes("hp") || effect[0].includes("Heal"))) return "生存";
  if (upgrade.effects.some(effect => effect[0].includes("speed"))) return "身法";
  return upgrade.group === "common" ? "通用" : "命格";
}

function recordBuild(upgrade) {
  if (!state?.build) return;
  const existing = state.build.find(item => item.id === upgrade.id);
  if (existing) existing.count += 1;
  else state.build.push({ id: upgrade.id, name: upgrade.name, tag: buildTagFor(upgrade), count: 1 });
}

function buildSummary() {
  if (!state?.build?.length) return "构筑 初定：尚未领悟机缘";
  const tags = new Map();
  for (const item of state.build) tags.set(item.tag, (tags.get(item.tag) || 0) + item.count);
  return `构筑 ${[...tags.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([tag, count]) => `${tag}x${count}`).join(" · ")}`;
}

function renderBuildLedger() {
  if (!ui.buildLedger || !state) return;
  if (!state.build.length) {
    ui.buildLedger.innerHTML = "<span>本局尚未领悟机缘。</span>";
    return;
  }
  ui.buildLedger.innerHTML = state.build
    .slice(-6)
    .map(item => `<span><b>${item.tag}</b>${item.name}${item.count > 1 ? ` x${item.count}` : ""}</span>`)
    .join("");
}

function screen() {
  const rect = canvas.getBoundingClientRect();
  return { w: rect.width, h: rect.height };
}

function hashSeed(seed, a, b) {
  let value = (seed ^ Math.imul(a + 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0xc2b2ae35, 0x27d4eb2f)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d) >>> 0;
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b) >>> 0;
  return (value ^ (value >>> 16)) >>> 0;
}

function freshState() {
  const bounds = screen();
  const mapTemplate = CONFIG.maps.find(map => map.id === selectedLineage.mapId) || CONFIG.maps[0];
  const mapSeed = Math.floor(Math.random() * 1000000000);
  const weapons = clone(CONFIG.weapons);
  const s = {
    running: false,
    paused: true,
    time: 0,
    kills: 0,
    player: {
      x: 0,
      y: 0,
      r: 16,
      speed: 245,
      hp: 120,
      maxHp: 120,
      pickupBonus: 0,
      xp: 0,
      nextXp: CONFIG.tuning.xpBase,
      level: 1,
      invuln: 0,
      dashCooldown: 0,
      dashTime: 0,
      dashVx: 0,
      dashVy: 0,
      facing: "right",
      moving: false,
      animTime: 0
    },
    weapons,
    passive: { alchemyHeal: 0 },
    mechanics: { swordMark: 0, talismanSplit: 0, flameCloud: 0, pickupBurst: 0, guard: 0 },
    build: [],
    resources: { soul: 0, fire: 0, spent: 0 },
    storySeen: {},
    pendingStory: null,
    storyCooldown: 2.5,
    enemies: [],
    projectiles: [],
    drops: [],
    pulses: [],
    clouds: [],
    effects: [],
    damageTexts: [],
    map: generateMap(mapTemplate, mapSeed, bounds),
    spawnTimer: 1.2,
    spawnDelay: CONFIG.tuning.spawnDelay,
    camera: { x: 0, y: 0 },
    lineage: selectedLineage
  };

  s.player.maxHp = selectedLineage.base.hp;
  s.player.hp = selectedLineage.base.hp;
  s.player.speed = selectedLineage.base.speed;
  Object.assign(s.passive, selectedLineage.passive);
  for (const [weaponId, override] of Object.entries(selectedLineage.weapons)) {
    Object.assign(s.weapons[weaponId], override);
  }
  return s;
}

function generateMap(template, seed, bounds) {
  const rng = makeRng(seed);
  const variant = pickFrom(rng, template.variants || [{ id: "default", name: "无名变体" }]);
  const chunkSize = Math.max(720, Math.min(1100, Math.round(Math.max(bounds.w, bounds.h) * 0.95)));
  const visibleRadius = 2;
  const features = [];
  const events = [];
  const padding = 90;
  const safePoint = { x: 0, y: 0 };
  const safeRadius = CONFIG.tuning.safeRadius || 170;
  const minFeatureDistance = CONFIG.tuning.minFeatureDistance || 76;
  const minEventDistance = CONFIG.tuning.minEventDistance || 150;

  function canPlace(candidate, list, minDistance) {
    if (dist(candidate, safePoint) < safeRadius + candidate.r) return false;
    return list.every(item => dist(candidate, item) > minDistance + candidate.r + item.r * 0.35);
  }

  function placeOne(rule, list, minDistance, event = false) {
    for (let tries = 0; tries < 70; tries += 1) {
      const candidate = {
        type: rule.type,
        x: -bounds.w / 2 + padding + rng() * Math.max(1, bounds.w - padding * 2),
        y: -bounds.h / 2 + padding + rng() * Math.max(1, bounds.h - padding * 2),
        r: randomBetween(rng, rule.radius),
        phase: rng() * TAU,
        spin: rng() > 0.5 ? 1 : -1,
        event
      };
      if (canPlace(candidate, [...features, ...events, ...list], minDistance)) {
        list.push(candidate);
        return true;
      }
    }
    return false;
  }

  for (const rule of template.generation.features) {
    const bias = variant.featureBias?.[rule.type] || 0;
    const count = Math.max(0, randomInt(rng, rule.count[0], rule.count[1]) + bias);
    for (let i = 0; i < count; i += 1) placeOne(rule, features, minFeatureDistance);
  }

  for (const rule of template.generation.events || []) {
    const bias = variant.eventBias?.[rule.type] || 0;
    const count = Math.max(0, randomInt(rng, rule.count[0], rule.count[1]) + bias);
    for (let i = 0; i < count; i += 1) placeOne(rule, events, minEventDistance, true);
  }

  return { ...clone(template), seed, variant, features, events, chunks: new Map(), chunkSize, visibleRadius };
}

function generateChunk(map, chunkX, chunkY) {
  const key = `${chunkX},${chunkY}`;
  if (map.chunks.has(key)) return map.chunks.get(key);

  const rng = makeRng(hashSeed(map.seed, chunkX, chunkY));
  const chunk = { features: [], events: [], decals: [] };
  const chunkSize = map.chunkSize || 900;
  const originX = chunkX * chunkSize;
  const originY = chunkY * chunkSize;
  const safePoint = { x: 0, y: 0 };
  const safeRadius = CONFIG.tuning.safeRadius || 170;
  const minFeatureDistance = CONFIG.tuning.minFeatureDistance || 76;
  const minEventDistance = CONFIG.tuning.minEventDistance || 150;

  function canPlace(candidate, list, minDistance) {
    if (Math.abs(chunkX) <= 1 && Math.abs(chunkY) <= 1 && dist(candidate, safePoint) < safeRadius + candidate.r) return false;
    return list.every(item => dist(candidate, item) > minDistance + candidate.r + item.r * 0.35);
  }

  function placeOne(rule, list, minDistance, event = false) {
    for (let tries = 0; tries < 50; tries += 1) {
      const candidate = {
        type: rule.type,
        x: originX + 80 + rng() * Math.max(1, chunkSize - 160),
        y: originY + 80 + rng() * Math.max(1, chunkSize - 160),
        r: randomBetween(rng, rule.radius),
        phase: rng() * TAU,
        spin: rng() > 0.5 ? 1 : -1,
        event
      };
      if (canPlace(candidate, [...chunk.features, ...chunk.events, ...list], minDistance)) {
        list.push(candidate);
        return true;
      }
    }
    return false;
  }

  for (const rule of map.generation.decals || []) {
    const count = Math.max(0, randomInt(rng, rule.count[0], rule.count[1]));
    for (let i = 0; i < count; i += 1) {
      chunk.decals.push({
        type: rule.type,
        asset: rule.asset,
        x: originX + 80 + rng() * Math.max(1, chunkSize - 160),
        y: originY + 80 + rng() * Math.max(1, chunkSize - 160),
        r: randomBetween(rng, rule.radius),
        phase: rng() * TAU,
        rotate: -0.28 + rng() * 0.56,
        alpha: DECAL_ALPHA[rule.type] ?? 0.58
      });
    }
  }

  for (const rule of map.generation.features) {
    const bias = map.variant.featureBias?.[rule.type] || 0;
    const count = Math.max(0, Math.round((randomInt(rng, rule.count[0], rule.count[1]) + bias) * 0.62));
    for (let i = 0; i < count; i += 1) placeOne(rule, chunk.features, minFeatureDistance);
  }

  for (const rule of map.generation.events || []) {
    const bias = map.variant.eventBias?.[rule.type] || 0;
    const count = Math.max(0, Math.round((randomInt(rng, rule.count[0], rule.count[1]) + bias) * 0.45));
    for (let i = 0; i < count; i += 1) placeOne(rule, chunk.events, minEventDistance, true);
  }

  map.chunks.set(key, chunk);
  return chunk;
}

function visibleMapFeatures() {
  if (!state?.map) return { features: [], events: [] };
  const map = state.map;
  const chunkSize = map.chunkSize || 900;
  const radius = map.visibleRadius || 2;
  const baseX = Math.floor(state.camera.x / chunkSize);
  const baseY = Math.floor(state.camera.y / chunkSize);
  const features = [];
  const events = [];
  const chunks = [];
  for (let y = baseY - radius; y <= baseY + radius; y += 1) {
    for (let x = baseX - radius; x <= baseX + radius; x += 1) {
      const chunk = generateChunk(map, x, y);
      chunks.push({ x, y, chunk });
      features.push(...chunk.features);
      events.push(...chunk.events);
    }
  }
  return { features, events, chunks };
}

function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  audioBudget = {};
}

function tone(freq, duration, type = "sine", gain = 0.04, slide = 1) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const amp = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * slide), now + duration);
  amp.gain.setValueAtTime(gain, now);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(amp).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

function noiseBurst(duration = 0.08, gain = 0.035, filterFreq = 650) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const buffer = audioCtx.createBuffer(1, Math.max(1, audioCtx.sampleRate * duration), audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = audioCtx.createBufferSource();
  const filter = audioCtx.createBiquadFilter();
  const amp = audioCtx.createGain();
  src.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(filterFreq, now);
  filter.Q.setValueAtTime(5, now);
  amp.gain.setValueAtTime(gain, now);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  src.connect(filter).connect(amp).connect(audioCtx.destination);
  src.start(now);
  src.stop(now + duration);
}

function startMusic() {
  if (!audioCtx || musicNodes) return;
  const master = audioCtx.createGain();
  master.gain.value = 0.018;
  master.connect(audioCtx.destination);
  const notes = [110, 165, 220];
  const oscillators = notes.map((freq, i) => {
    const osc = audioCtx.createOscillator();
    const amp = audioCtx.createGain();
    osc.type = i === 0 ? "sine" : "triangle";
    osc.frequency.value = freq;
    amp.gain.value = i === 0 ? 0.62 : 0.22;
    osc.connect(amp).connect(master);
    osc.start();
    return osc;
  });
  musicNodes = { master, oscillators };
}

function playSound(name, priority = 1) {
  if (!audioCtx) return;
  const now = performance.now();
  const cooldowns = { shoot: 55, hit: 42, pickup: 34, level: 200, flame: 180, hurt: 180, death: 800, boom: 90, kill: 55 };
  const cooldown = cooldowns[name] || 80;
  const last = audioBudget[name] || 0;
  if (now - last < cooldown && priority < 3) return;
  audioBudget[name] = now;

  if (name === "shoot") {
    tone(760, 0.055, "triangle", 0.018, 1.5);
    tone(1240, 0.04, "sine", 0.01, 0.82);
  }
  if (name === "hit") {
    tone(190, 0.055, "square", 0.026, 0.62);
    noiseBurst(0.045, 0.018, 920);
  }
  if (name === "kill") {
    tone(260, 0.07, "triangle", 0.024, 1.7);
    noiseBurst(0.07, 0.024, 420);
  }
  if (name === "pickup") {
    tone(690, 0.07, "sine", 0.024, 1.55);
    setTimeout(() => tone(980, 0.07, "sine", 0.018, 1.2), 38);
  }
  if (name === "level") {
    tone(392, 0.12, "triangle", 0.03, 1.35);
    setTimeout(() => tone(588, 0.14, "triangle", 0.03, 1.28), 80);
    setTimeout(() => tone(784, 0.18, "triangle", 0.035, 1.2), 160);
  }
  if (name === "flame") {
    tone(95, 0.18, "sawtooth", 0.04, 0.52);
    noiseBurst(0.16, 0.026, 240);
  }
  if (name === "hurt") {
    tone(120, 0.16, "square", 0.05, 0.65);
    noiseBurst(0.055, 0.025, 300);
  }
  if (name === "death") tone(85, 0.7, "sawtooth", 0.055, 0.35);
  if (name === "boom") {
    tone(72, 0.15, "sawtooth", 0.05, 0.42);
    noiseBurst(0.12, 0.032, 180);
  }
}

function addShake(amount) {
  screenShake = Math.min(18, screenShake + amount);
}

function addEffect(type, x, y, options = {}) {
  if (!state) return;
  const life = options.life ?? 0.42;
  pushCapped(state.effects, {
    type,
    x,
    y,
    life,
    maxLife: life,
    angle: options.angle || 0,
    radius: options.radius || 42,
    color: options.color || "#e7ba56",
    secondary: options.secondary || "#f7ead3",
    spin: options.spin || (Math.random() > 0.5 ? 1 : -1),
    driftX: options.driftX || 0,
    driftY: options.driftY || 0,
    count: options.count || 1,
    fromX: options.fromX,
    fromY: options.fromY
  }, tuningValue("maxEffects", 96));
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, tuningValue("maxPixelRatio", 1.5));
  canvas.width = Math.round(rect.width * scale);
  canvas.height = Math.round(rect.height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function toView(point) {
  const s = screen();
  const cx = s.w / 2;
  const cy = s.h / 2 + 26;
  const camera = state?.camera || { x: 0, y: 0 };
  const dx = point.x - camera.x;
  const dy = point.y - camera.y;
  return {
    x: cx + dx + dy * 0.22,
    y: cy + dy * 0.68
  };
}

function toWorld(viewX, viewY) {
  const s = screen();
  const cx = s.w / 2;
  const cy = s.h / 2 + 26;
  const camera = state?.camera || { x: 0, y: 0 };
  const dy = (viewY - cy) / 0.68;
  const dx = viewX - cx - dy * 0.22;
  return { x: camera.x + dx, y: camera.y + dy };
}

function addDamageText(x, y, amount, kind = "damage") {
  if (!state) return;
  const colors = {
    damage: { fill: "#f7ead3", edge: "#6e3a22", label: "斩" },
    sword: { fill: "#dff6ff", edge: "#356d89", label: "剑" },
    talisman: { fill: "#fff0a4", edge: "#8a5227", label: "符" },
    flame: { fill: "#ffb060", edge: "#8a2f27", label: "焚" },
    boom: { fill: "#ffe18a", edge: "#9b2d22", label: "裂" },
    pickupBurst: { fill: "#9bf0c0", edge: "#24644b", label: "震" },
    resource: { fill: "#9bf0c0", edge: "#25684d", label: "灵髓" },
    buy: { fill: "#ffd58f", edge: "#7d3527", label: "购买" },
    hurt: { fill: "#ff7466", edge: "#531813", label: "损" }
  };
  const color = colors[kind] || colors.damage;
  const numeric = Number.isFinite(Number(amount));
  const crit = numeric && kind !== "hurt" && amount >= 24 && Math.random() < 0.24;
  pushCapped(state.damageTexts, {
    x,
    y,
    value: numeric ? Math.max(1, Math.round(amount * (crit ? 1.35 : 1))) : String(amount),
    label: crit ? "会心" : color.label,
    life: crit ? 0.95 : 0.78,
    maxLife: crit ? 0.95 : 0.78,
    vy: -34 - Math.random() * 22,
    drift: (Math.random() - 0.5) * 18,
    fill: color.fill,
    edge: color.edge,
    scale: (crit ? 1.34 : 1) * (kind === "boom" ? 1.26 : kind === "hurt" ? 1.1 : 1)
  }, tuningValue("maxDamageTexts", 54));
}

function renderLineageSelect() {
  ui.lineageList.innerHTML = "";
  for (const lineage of CONFIG.lineages) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `lineage${lineage.id === selectedLineage.id ? " is-selected" : ""}`;
    const portrait = `${RUNTIME_ASSET_ROOT}/characters/${lineage.id}_right_1.webp?v=${ASSET_VERSION}`;
    const primaryWeapon = Object.entries(lineage.weapons)[0]?.[0] || "sword";
    const weaponName = CONFIG.weapons[primaryWeapon]?.ui?.name || "命格";
    button.innerHTML = `
      <span class="lineage-seal">${lineage.name.slice(0, 1)}</span>
      <span class="lineage-art"><img src="${portrait}" alt=""></span>
      <span class="lineage-copy">
        <em>${lineage.role}</em>
        <h3>${lineage.name}</h3>
        <strong>${weaponName}</strong>
        <span>${lineage.memory}</span>
      </span>
      <span class="lineage-stats">
        <i>气血 ${lineage.base.hp}</i>
        <i>身法 ${lineage.base.speed}</i>
      </span>
    `;
    button.addEventListener("click", () => {
      selectedLineage = lineage;
      renderLineageSelect();
    });
    ui.lineageList.appendChild(button);
  }
}

const UI_ICON_TEXT = {
  sword: "剑",
  talisman: "符",
  flame: "火",
  phantom: "雾",
  wind: "风",
  earth: "壤",
  arrow: "羿",
  core: "丹",
  mark: "痕",
  rune: "咒",
  mist: "幻",
  split: "裂",
  lotus: "莲",
  cloud: "云"
};

const UI_ICON_SRC = ASSET_PATHS.uiIcons;

function iconMarkup(icon, className) {
  const src = UI_ICON_SRC[icon];
  if (src) return `<img class="${className}" src="${src}?v=${ASSET_VERSION}" alt="">`;
  return `<span class="${className}">${UI_ICON_TEXT[icon] || "术"}</span>`;
}

function startGame() {
  ensureAudio();
  startMusic();
  state = freshState();
  state.running = true;
  state.paused = false;
  ui.lineageText.textContent = `${state.lineage.name} · ${state.map.name} · ${state.map.variant.name}`;
  ui.start.classList.add("hidden");
  ui.gameOver.classList.add("hidden");
  ui.choices.classList.add("hidden");
  ui.pauseOverlay.classList.add("hidden");
  ui.pauseBtn.textContent = "暂";
  lastTime = performance.now();
  playSound("level", 3);
}

function endGame() {
  if (!state.running) return;
  state.running = false;
  state.paused = true;
  playSound("death", 3);
  ui.resultText.textContent = `${state.lineage.name}在${state.map.name}坚持了 ${formatTime(state.time)}，斩妖 ${state.kills}。`;
  if (ui.metaPointText) ui.metaPointText.textContent = Math.max(1, Math.floor(state.kills / 12) + Math.floor(state.time / 45));
  ui.gameOver.classList.remove("hidden");
}

function formatTime(t) {
  const m = Math.floor(t / 60).toString().padStart(2, "0");
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function pickNearest(maxRange, from = state.player) {
  let best = null;
  let bestD = maxRange;
  for (const enemy of state.enemies) {
    const d = dist(from, enemy);
    if (d < bestD) {
      best = enemy;
      bestD = d;
    }
  }
  return best;
}

function dashPlayer() {
  if (!state?.running || state.paused || state.player.dashCooldown > 0) return;
  let { dx, dy } = movementVector();
  if (!dx && !dy) dx = state.player.facing === "left" ? -1 : 1;
  const len = Math.hypot(dx, dy) || 1;
  const force = 760;
  state.player.dashVx = (dx / len) * force;
  state.player.dashVy = (dy / len) * force;
  state.player.dashTime = 0.18;
  state.player.dashCooldown = 2.4;
  state.player.invuln = Math.max(state.player.invuln, 0.26);
  addEffect("dashTrail", state.player.x, state.player.y, {
    angle: Math.atan2(state.player.dashVy, state.player.dashVx),
    radius: 96,
    life: 0.42,
    color: state.lineage.color,
    secondary: "#fff2c8",
    count: 4
  });
  addShake(4);
  playSound("shoot", 3);
}

function movementVector() {
  let dx = 0;
  let dy = 0;
  if (keys.has("w") || keys.has("arrowup")) dy -= 1;
  if (keys.has("s") || keys.has("arrowdown")) dy += 1;
  if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
  if (keys.has("d") || keys.has("arrowright")) dx += 1;
  if (touchMove.active) {
    dx += touchMove.dx;
    dy += touchMove.dy;
  }
  const len = Math.hypot(dx, dy);
  if (len > 1) {
    dx /= len;
    dy /= len;
  }
  return { dx, dy };
}

function spawnEnemy() {
  if (state.enemies.length >= tuningValue("maxEnemies", 90)) return;
  const s = screen();
  const side = Math.floor(Math.random() * 4);
  const margin = 80;
  let vx = 0;
  let vy = 0;
  if (side === 0) {
    vx = Math.random() * s.w;
    vy = -margin;
  } else if (side === 1) {
    vx = s.w + margin;
    vy = Math.random() * s.h;
  } else if (side === 2) {
    vx = Math.random() * s.w;
    vy = s.h + margin;
  } else {
    vx = -margin;
    vy = Math.random() * s.h;
  }
  const spawnPoint = toWorld(vx, vy);

  const elite = Math.random() < Math.min(0.08 + state.time / 900, 0.22);
  const pool = state.map.enemyPool || ["wraith", "elite"];
  const enemyId = elite && pool.includes("elite") ? "elite" : pool[Math.floor(Math.random() * pool.length)] || "wraith";
  const table = CONFIG.enemies[enemyId] || CONFIG.enemies.wraith;
  const hp = table.hp + state.time * table.hpRamp;
  pushCapped(state.enemies, {
    x: spawnPoint.x,
    y: spawnPoint.y,
    r: table.radius,
    hp,
    maxHp: hp,
    speed: table.speed + state.time * table.speedRamp,
    damage: table.damage,
    xp: table.xp,
    elite,
    type: enemyId,
    facing: spawnPoint.x < state.player.x ? "right" : "left",
    animTime: Math.random() * 10,
    slowTime: 0,
    marks: 0,
    lastHit: "",
    hitFlash: 0
  }, tuningValue("maxEnemies", 90));
}

function fireSword() {
  const w = state.weapons.sword;
  let fired = false;
  const levelBoost = Math.max(0, state.player.level - 1);
  const visualLevel = Math.max(w.level || 1, 1 + Math.floor(levelBoost / 2));
  const volleyCount = Math.min(8, w.count + Math.floor(levelBoost / 3));
  const projectileSpeed = 520 + visualLevel * 18;
  const projectileRadius = 5 + Math.min(4, visualLevel * 0.45);
  const projectileDamage = Math.round(w.damage * (1 + levelBoost * 0.035));
  for (let i = 0; i < volleyCount; i += 1) {
    const target = pickNearest(w.range);
    if (!target) return;
    const angle = Math.atan2(target.y - state.player.y, target.x - state.player.x) + (i - (volleyCount - 1) / 2) * 0.1;
    addEffect("swordCast", state.player.x, state.player.y, {
      angle,
      radius: 36 + visualLevel * 5,
      life: 0.24 + Math.min(0.16, visualLevel * 0.015),
      color: "#7ad5ee",
      count: volleyCount
    });
    pushCapped(state.projectiles, {
      x: state.player.x,
      y: state.player.y,
      vx: Math.cos(angle) * projectileSpeed,
      vy: Math.sin(angle) * projectileSpeed,
      r: projectileRadius,
      life: 0.92 + Math.min(0.25, visualLevel * 0.025),
      damage: projectileDamage,
      type: "sword",
      angle,
      pierce: Math.max(0, Math.floor(visualLevel / 3))
    }, tuningValue("maxProjectiles", 120));
    fired = true;
  }
  if (fired) playSound("shoot");
}

function fireTalisman() {
  const w = state.weapons.talisman;
  if (w.level <= 0) return;
  for (let i = 0; i < w.count; i += 1) {
    const angle = Math.random() * TAU;
    addEffect("talismanCast", state.player.x, state.player.y, {
      angle,
      radius: 38 + w.level * 5,
      life: 0.38,
      color: "#78bff2",
      secondary: "#fff0a4"
    });
    pushCapped(state.projectiles, {
      x: state.player.x + Math.cos(angle) * 18,
      y: state.player.y + Math.sin(angle) * 18,
      vx: Math.cos(angle) * 130,
      vy: Math.sin(angle) * 130,
      r: 7,
      life: 3.2,
      damage: w.damage,
      type: "talisman",
      angle,
      spin: Math.random() > 0.5 ? 1 : -1
    }, tuningValue("maxProjectiles", 120));
  }
  playSound("shoot");
}

function castFlame() {
  const w = state.weapons.flame;
  if (w.level <= 0) return;
  pushCapped(state.pulses, { x: state.player.x, y: state.player.y, radius: w.radius, life: 0.45, maxLife: 0.45, kind: "flame" }, tuningValue("maxPulses", 36));
  addEffect("flameRing", state.player.x, state.player.y, {
    radius: w.radius,
    life: 0.62,
    color: "#e16935",
    secondary: "#ffd58f",
    count: 10 + w.level * 3
  });
  for (let i = 0; i < 8 + w.level * 2; i += 1) {
    const a = (i / (8 + w.level * 2)) * TAU + Math.random() * 0.2;
    addEffect("spark", state.player.x + Math.cos(a) * 18, state.player.y + Math.sin(a) * 18, {
      angle: a,
      radius: 18 + Math.random() * 24,
      life: 0.42 + Math.random() * 0.22,
      color: "#e16935",
      secondary: "#ffd58f",
      driftX: Math.cos(a) * (90 + Math.random() * 70),
      driftY: Math.sin(a) * (90 + Math.random() * 70)
    });
  }
  for (const enemy of state.enemies) {
    if (dist(state.player, enemy) <= w.radius + enemy.r) {
      enemy.hp -= w.damage;
      enemy.lastHit = "flame";
      enemy.hitFlash = 0.14;
      addDamageText(enemy.x, enemy.y, w.damage, "flame");
    }
  }
  addShake(5);
  playSound("flame");
}

function castPhantom() {
  const w = state.weapons.phantom;
  if (w.level <= 0) return;
  pushCapped(state.pulses, { x: state.player.x, y: state.player.y, radius: w.radius, life: 2.2, maxLife: 2.2, kind: "phantom" }, tuningValue("maxPulses", 36));
  addEffect("phantomMist", state.player.x, state.player.y, {
    radius: w.radius,
    life: 1.2,
    color: "#75c8a4",
    secondary: "#d98bd8",
    count: 5 + w.level * 2
  });
  for (const enemy of state.enemies) {
    if (dist(state.player, enemy) <= w.radius + enemy.r) enemy.slowTime = 2.2;
  }
  playSound("flame");
}

function explodeAt(x, y, radius, damage, kind = "boom") {
  pushCapped(state.pulses, { x, y, radius, life: 0.32, maxLife: 0.32, kind }, tuningValue("maxPulses", 36));
  for (const enemy of state.enemies) {
    if (dist({ x, y }, enemy) <= radius + enemy.r) {
      enemy.hp -= damage;
      enemy.lastHit = kind;
      enemy.hitFlash = 0.16;
      addDamageText(enemy.x, enemy.y, damage, "boom");
    }
  }
  addShake(kind === "pickupBurst" ? 3 : 7);
  playSound("boom");
}

function splitTalismanFrom(enemy) {
  for (let i = 0; i < 2; i += 1) {
    const angle = Math.random() * TAU;
    pushCapped(state.projectiles, {
      x: enemy.x,
      y: enemy.y,
      vx: Math.cos(angle) * 210,
      vy: Math.sin(angle) * 210,
      r: 5,
      life: 1.5,
      damage: Math.max(8, state.weapons.talisman.damage * 0.48),
      type: "talisman"
    }, tuningValue("maxProjectiles", 120));
  }
}

function gainXp(amount) {
  state.player.xp += amount;
  state.resources.soul += amount;
  if (state.passive.alchemyHeal > 0) {
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + amount * state.passive.alchemyHeal);
  }
  if (state.mechanics.pickupBurst) {
    explodeAt(state.player.x, state.player.y, 58 + state.mechanics.pickupBurst * 8, 8 + state.mechanics.pickupBurst * 3, "pickupBurst");
  }
  addDamageText(state.player.x, state.player.y - 20, amount, "resource");
  playSound("pickup");
  while (state.player.xp >= state.player.nextXp) {
    state.player.xp -= state.player.nextXp;
    state.player.level += 1;
    state.player.nextXp = Math.floor(state.player.nextXp * CONFIG.tuning.xpGrowth + CONFIG.tuning.xpAdd);
    state.weapons.sword.damage += 2;
    state.weapons.sword.range += 8;
    state.weapons.sword.delay = Math.max(0.34, state.weapons.sword.delay * 0.97);
    if (state.player.level % 3 === 0) state.weapons.sword.count += 1;
    addDamageText(state.player.x, state.player.y - 46, "剑气增强", "resource");
    addEffect("swordCast", state.player.x, state.player.y, {
      angle: -Math.PI / 2,
      radius: 78 + state.player.level * 5,
      life: 0.5,
      color: "#7ad5ee",
      count: Math.min(8, state.weapons.sword.count + 1)
    });
    addShake(4);
    openChoices();
  }
}

function closeChoices() {
  ui.choices.classList.add("hidden");
  state.paused = false;
  lastTime = performance.now();
}

function openChoices() {
  state.paused = true;
  ui.choiceList.innerHTML = "";
  playSound("level", 3);
  const pool = CONFIG.upgrades.filter(upgrade => upgrade.group === "common" || upgrade.group === state.lineage.id);
  const options = pool.sort(() => Math.random() - 0.5).slice(0, 3);
  for (const option of options) {
    const button = document.createElement("button");
    button.className = "choice";
    button.type = "button";
    const color = option.group === "sword" ? "#72cfe9" : option.group === "witch" ? "#9ad9b9" : option.group === "alchemist" ? "#d75d34" : "#d8a64d";
    button.style.setProperty("--choice-color", color);
    const tag = option.group === "common" ? "通用机缘" : state.lineage.name;
    button.innerHTML = `<span class="choice-icon">${iconMarkup(option.icon, "choice-icon-img")}</span><em class="choice-tag">${tag}</em><b>${option.name}</b><span>${option.text}</span><strong class="choice-cost">领悟</strong>`;
    button.addEventListener("click", () => {
      for (const effect of option.effects) applyEffect(state, effect);
      recordBuild(option);
      state.player.hp = Math.min(state.player.hp, state.player.maxHp);
      closeChoices();
      addEffect("levelBurst", state.player.x, state.player.y, {
        radius: 92 + state.player.level * 3,
        life: 0.72,
        color,
        secondary: "#fff2c8",
        count: 8
      });
      addEffect("cardLink", state.player.x, state.player.y, {
        radius: 220,
        life: 0.55,
        color,
        secondary: "#fff2c8",
        fromX: state.player.x,
        fromY: state.player.y - 210
      });
      addDamageText(state.player.x, state.player.y - 28, option.name, "buy");
      addShake(5);
      playSound("level", 3);
    });
    ui.choiceList.appendChild(button);
  }
  ui.choices.classList.remove("hidden");
}

function skipChoices() {
  if (!state?.running || ui.choices.classList.contains("hidden")) return;
  state.resources.soul += 2;
  closeChoices();
  addDamageText(state.player.x, state.player.y - 22, 2, "resource");
  addEffect("pickupBurst", state.player.x, state.player.y, {
    radius: 48,
    life: 0.32,
    color: "#54b88a",
    secondary: "#fff2c8",
    count: 5
  });
  playSound("pickup", 3);
}

function storyKey(event) {
  return `${event.type}:${Math.round(event.x)}:${Math.round(event.y)}`;
}

function storyForEvent(event) {
  const table = {
    stele: {
      title: "残碑低语",
      text: "碑上刻着半句旧誓：若不死药重开，青丘、轩辕、神农三脉皆会被拖回同一场轮回。"
    },
    shrine: {
      title: "荒祠香火",
      text: "破败小祠仍有微光，像是在供奉某位被抹去姓名的古神。你记下一缕香火，灵台短暂清明。"
    },
    rift: {
      title: "赤裂回声",
      text: "裂隙里传来前世兵戈声。有人在梦里喊你的名字，也有人提醒你：不要相信昆仑送来的丹方。"
    },
    spiritWell: {
      title: "灵井残影",
      text: "井中浮出陌生倒影，似乎是另一世的你。倒影伸手点向远方，那里应当藏着章节 Boss 的线索。"
    },
    foxfire: {
      title: "狐火旧约",
      text: "狐火绕身三匝，青丘旧约浮现一角：幻雾并非逃避，而是遮住天庭视线的古老术法。"
    },
    brokenSword: {
      title: "断剑残誓",
      text: "断剑插在荒土里，剑脊仍有旧战余温。你听见前世在剑冢里留下的誓言：若轮回不止，便以剑痕记路。"
    },
    herbCauldron: {
      title: "丹炉遗火",
      text: "残炉里有未熄的丹火，火色并不灼人，反而像在辨认你的气息。神农一脉的旧线索开始浮出。"
    },
    memoryStele: {
      title: "轮回残碑",
      text: "碑文只亮起一半，像有意漏掉结局。它提醒你：每一世走过的地方，都会把真结局往前推近一点。"
    }
  };
  return table[event.type] || {
    title: "大荒遗痕",
    text: "你触碰到一段散落在大荒里的记忆。它尚未完整，却足以证明这片荒原并非单纯的试炼场。"
  };
}

function openStoryEvent(event) {
  const key = storyKey(event);
  if (state.storySeen[key]) return;
  state.storySeen[key] = true;
  state.pendingStory = { key, event };
  const story = storyForEvent(event);
  ui.storyTitle.textContent = story.title;
  ui.storyText.textContent = story.text;
  state.paused = true;
  ui.storyOverlay.classList.remove("hidden");
  addShake(3);
  playSound("level", 3);
}

function closeStoryEvent() {
  if (!state?.pendingStory) return;
  const reward = 3;
  state.resources.soul += reward;
  const event = state.pendingStory.event;
  ui.storyOverlay.classList.add("hidden");
  state.pendingStory = null;
  state.paused = false;
  state.storyCooldown = 18;
  addDamageText(event.x, event.y - 18, reward, "resource");
  addEffect("cardLink", event.x, event.y, {
    radius: 180,
    life: 0.55,
    color: "#54b88a",
    secondary: "#fff2c8",
    fromX: event.x,
    fromY: event.y - 150
  });
  playSound("pickup", 3);
  lastTime = performance.now();
}

function checkStoryEvents() {
  if (!state?.running || state.paused || !ui.storyOverlay.classList.contains("hidden") || !ui.choices.classList.contains("hidden")) return;
  if (state.storyCooldown > 0) return;
  const visible = visibleMapFeatures();
  const events = [...state.map.events, ...visible.events];
  for (const event of events) {
    if (state.storySeen[storyKey(event)]) continue;
    if (dist(state.player, event) < storyTriggerRadius(event)) {
      openStoryEvent(event);
      break;
    }
  }
}

function update(dt) {
  const s = screen();
  state.time += dt;
  state.storyCooldown = Math.max(0, (state.storyCooldown || 0) - dt);
  state.spawnDelay = Math.max(CONFIG.tuning.spawnDelayMin, CONFIG.tuning.spawnDelay - state.time * CONFIG.tuning.spawnRamp);
  state.spawnTimer -= dt;
  while (state.spawnTimer <= 0) {
    spawnEnemy();
    if (state.time > 45 && Math.random() < 0.35) spawnEnemy();
    state.spawnTimer += state.spawnDelay;
  }

  const { dx, dy } = movementVector();
  if (dx || dy) {
    state.player.x += dx * state.player.speed * dt;
    state.player.y += dy * state.player.speed * dt;
    state.player.moving = true;
    if (Math.abs(dx) > 0.08) state.player.facing = dx < 0 ? "left" : "right";
    state.player.animTime += dt;
  } else {
    state.player.moving = false;
    state.player.animTime += dt * 0.35;
  }
  state.player.invuln = Math.max(0, state.player.invuln - dt);
  state.player.dashCooldown = Math.max(0, state.player.dashCooldown - dt);
  if (state.player.dashTime > 0) {
    state.player.x += state.player.dashVx * dt;
    state.player.y += state.player.dashVy * dt;
    state.player.dashTime = Math.max(0, state.player.dashTime - dt);
    addEffect("dashTrail", state.player.x, state.player.y, {
      angle: Math.atan2(state.player.dashVy, state.player.dashVx),
      radius: 58,
      life: 0.24,
      color: state.lineage.color,
      secondary: "#fff2c8",
      count: 3
    });
  }
  state.camera.x += (state.player.x - state.camera.x) * Math.min(1, dt * 9);
  state.camera.y += (state.player.y - state.camera.y) * Math.min(1, dt * 9);

  for (const key of Object.keys(state.weapons)) state.weapons[key].cooldown -= dt;
  if (state.weapons.sword.cooldown <= 0) {
    fireSword();
    state.weapons.sword.cooldown = state.weapons.sword.delay;
  }
  if (state.weapons.talisman.cooldown <= 0) {
    fireTalisman();
    state.weapons.talisman.cooldown = state.weapons.talisman.delay;
  }
  if (state.weapons.flame.cooldown <= 0) {
    castFlame();
    state.weapons.flame.cooldown = state.weapons.flame.delay;
  }
  if (state.weapons.phantom.cooldown <= 0) {
    castPhantom();
    state.weapons.phantom.cooldown = state.weapons.phantom.delay;
  }
  checkStoryEvents();

  for (const cloud of state.clouds) {
    cloud.life -= dt;
    cloud.tick -= dt;
    if (cloud.tick <= 0) {
      cloud.tick = 0.36;
      for (const enemy of state.enemies) {
        if (dist(cloud, enemy) < cloud.radius + enemy.r) {
          enemy.hp -= cloud.damage;
          enemy.lastHit = "cloud";
          enemy.hitFlash = 0.1;
          addEffect("hitSpark", enemy.x, enemy.y, { radius: 22, life: 0.24, color: "#54b88a", secondary: "#fff2c8", count: 5 });
          addDamageText(enemy.x, enemy.y, cloud.damage, "flame");
        }
      }
    }
  }
  state.clouds = state.clouds.filter(cloud => cloud.life > 0);

  for (const enemy of state.enemies) {
    const angle = Math.atan2(state.player.y - enemy.y, state.player.x - enemy.x);
    const slow = enemy.slowTime > 0 ? state.weapons.phantom.slow : 1;
    enemy.x += Math.cos(angle) * enemy.speed * slow * dt;
    enemy.y += Math.sin(angle) * enemy.speed * slow * dt;
    enemy.facing = Math.cos(angle) < 0 ? "left" : "right";
    enemy.animTime += dt * (enemy.slowTime > 0 ? 0.55 : 1);
    enemy.slowTime = Math.max(0, enemy.slowTime - dt);
    enemy.hitFlash = Math.max(0, (enemy.hitFlash || 0) - dt);
    if (dist(state.player, enemy) < state.player.r + enemy.r && state.player.invuln <= 0) {
      const guarded = state.mechanics.guard > 0;
      const damage = Math.max(1, Math.round(enemy.damage * (guarded ? 0.78 : 1)));
      state.player.hp -= damage;
      state.player.invuln = guarded ? 0.72 : 0.48;
      pushCapped(state.pulses, { x: state.player.x, y: state.player.y, radius: 54, life: 0.28, maxLife: 0.28, kind: "hurt" }, tuningValue("maxPulses", 36));
      if (guarded) {
        addEffect("guard", state.player.x, state.player.y, { radius: 76, life: 0.42, color: "#9bf0c0", secondary: "#fff2c8" });
      }
      addDamageText(state.player.x, state.player.y, damage, "hurt");
      addShake(guarded ? 4 : 6);
      playSound("hurt");
      if (state.player.hp <= 0) endGame();
    }
  }

  for (const projectile of state.projectiles) {
    if (projectile.type === "talisman") {
      const target = pickNearest(state.weapons.talisman.range, projectile);
      if (target) {
        const angle = Math.atan2(target.y - projectile.y, target.x - projectile.x);
        projectile.vx += Math.cos(angle) * 680 * dt;
        projectile.vy += Math.sin(angle) * 680 * dt;
        const speed = Math.max(1, Math.hypot(projectile.vx, projectile.vy));
        projectile.vx = (projectile.vx / speed) * Math.min(speed, 360);
        projectile.vy = (projectile.vy / speed) * Math.min(speed, 360);
      }
    }
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.angle = Math.atan2(projectile.vy, projectile.vx);
    projectile.life -= dt;
    if (projectile.type === "sword") {
      addEffect("swordTrail", projectile.x, projectile.y, {
        angle: projectile.angle,
        radius: 24 + state.weapons.sword.level * 2,
        life: 0.18,
        color: "#7ad5ee"
      });
    } else if (projectile.type === "talisman") {
      addEffect("talismanTrail", projectile.x, projectile.y, {
        angle: projectile.angle,
        radius: 18 + state.weapons.talisman.level * 3,
        life: 0.24,
        color: "#78bff2",
        secondary: "#fff0a4"
      });
    }
    for (const enemy of state.enemies) {
      if (enemy.hp > 0 && dist(projectile, enemy) < projectile.r + enemy.r) {
        enemy.hp -= projectile.damage;
        enemy.lastHit = projectile.type;
        enemy.hitFlash = 0.16;
        if ((projectile.pierce || 0) > 0) projectile.pierce -= 1;
        else projectile.life = 0;
        pushCapped(state.pulses, { x: enemy.x, y: enemy.y, radius: 22, life: 0.18, maxLife: 0.18, kind: "hit" }, tuningValue("maxPulses", 36));
        addEffect(projectile.type === "sword" ? "swordImpact" : "talismanImpact", enemy.x, enemy.y, {
          angle: projectile.angle || 0,
          radius: projectile.type === "sword" ? 42 : 52,
          life: 0.28,
          color: projectile.type === "sword" ? "#dff6ff" : "#fff0a4",
          secondary: projectile.type === "sword" ? "#72cfe9" : "#78bff2"
        });
        addEffect("hitSpark", enemy.x, enemy.y, {
          angle: projectile.angle || 0,
          radius: projectile.type === "sword" ? 34 : 42,
          life: 0.24,
          color: projectile.type === "sword" ? "#dff6ff" : "#fff0a4",
          secondary: projectile.type === "sword" ? "#72cfe9" : "#d98bd8",
          count: projectile.type === "sword" ? 6 : 8
        });
        addDamageText(enemy.x, enemy.y, projectile.damage, projectile.type);
        addShake(projectile.type === "sword" ? 2.3 : 3.2);
        playSound("hit");
        if (projectile.type === "sword" && state.mechanics.swordMark) {
          enemy.marks += 1;
          if (enemy.marks >= 3) {
            enemy.marks = 0;
            explodeAt(enemy.x, enemy.y, 72, state.weapons.sword.damage * 1.4, "swordMark");
          }
        }
        if (projectile.type === "talisman" && state.mechanics.talismanSplit && enemy.slowTime > 0) splitTalismanFrom(enemy);
        break;
      }
    }
  }

  for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = state.enemies[i];
    if (enemy.hp <= 0) {
      state.kills += 1;
      pushCapped(state.pulses, { x: enemy.x, y: enemy.y, radius: enemy.elite ? 68 : 42, life: 0.24, maxLife: 0.24, kind: enemy.elite ? "boom" : "kill" }, tuningValue("maxPulses", 36));
      addEffect("killBloom", enemy.x, enemy.y, {
        radius: enemy.elite ? 92 : 62,
        life: enemy.elite ? 0.62 : 0.42,
        color: enemy.elite ? "#e16935" : "#54b88a",
        secondary: "#fff2c8",
        count: enemy.elite ? 12 : 8
      });
      addDamageText(enemy.x, enemy.y - 8, enemy.elite ? 88 : 36, enemy.elite ? "boom" : "pickupBurst");
      addShake(enemy.elite ? 8 : 3);
      playSound(enemy.elite ? "boom" : "kill");
      pushCapped(state.drops, {
        x: enemy.x,
        y: enemy.y,
        r: enemy.elite ? 8 : 6,
        xp: enemy.xp,
        soul: enemy.xp,
        fire: enemy.elite ? 1 : 0
      }, tuningValue("maxDrops", 80));
      if (state.mechanics.flameCloud && (enemy.lastHit === "flame" || enemy.lastHit === "cloud")) {
        pushCapped(state.clouds, { x: enemy.x, y: enemy.y, radius: 72, damage: 7 + state.weapons.flame.level * 2, life: 3.4, tick: 0.1 }, tuningValue("maxClouds", 18));
      }
      state.enemies.splice(i, 1);
    }
  }

  for (let i = state.drops.length - 1; i >= 0; i -= 1) {
    const drop = state.drops[i];
    drop.magnet = Math.max(0, (drop.magnet || 0) - dt);
    const range = CONFIG.tuning.pickupRange + state.player.pickupBonus;
    const d = dist(state.player, drop);
    if (d < range * 2.2) {
      const angle = Math.atan2(state.player.y - drop.y, state.player.x - drop.x);
      const pull = (1 - Math.min(1, d / (range * 2.2))) * 540;
      const oldX = drop.x;
      const oldY = drop.y;
      drop.x += Math.cos(angle) * pull * dt;
      drop.y += Math.sin(angle) * pull * dt;
      drop.magnet = 0.18;
      if (Math.random() < 0.55) {
        addEffect("pickupTrail", drop.x, drop.y, {
          fromX: oldX,
          fromY: oldY,
          radius: drop.r * 3,
          life: 0.24,
          color: drop.fire ? "#e16935" : "#54b88a",
          secondary: "#fff2c8"
        });
      }
    }
    if (d < state.player.r + drop.r + 8) {
      gainXp(drop.xp);
      if (drop.fire) {
        state.resources.fire += drop.fire;
        addDamageText(state.player.x + 20, state.player.y - 16, drop.fire, "flame");
      }
      addEffect("pickupBurst", state.player.x, state.player.y, {
        radius: drop.fire ? 58 : 42,
        life: 0.32,
        color: drop.fire ? "#e16935" : "#54b88a",
        secondary: "#fff2c8",
        count: drop.fire ? 8 : 5
      });
      state.drops.splice(i, 1);
    }
  }

  for (const text of state.damageTexts) {
    text.life -= dt;
    text.x += text.drift * dt;
    text.y += text.vy * dt;
  }

  for (const effect of state.effects) {
    effect.life -= dt;
    effect.x += effect.driftX * dt;
    effect.y += effect.driftY * dt;
    effect.angle += effect.spin * dt * 1.2;
  }

  state.enemies = state.enemies.filter(enemy => dist(enemy, state.player) < 1800);
  state.projectiles = state.projectiles.filter(p => p.life > 0 && dist(p, state.player) < 1500);
  state.pulses = state.pulses.filter(p => {
    p.life -= dt;
    return p.life > 0;
  });
  state.effects = state.effects.filter(effect => effect.life > 0);
  state.damageTexts = state.damageTexts.filter(text => text.life > 0);
}

function drawBackground(s) {
  const map = state?.map || CONFIG.maps[0];
  const palette = map.palette || ["#29341f", "#36321d", "#15181a"];
  const grad = ctx.createLinearGradient(0, 0, s.w, s.h);
  grad.addColorStop(0, palette[0]);
  grad.addColorStop(0.52, palette[1]);
  grad.addColorStop(1, palette[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, s.w, s.h);
  drawMapBaseImage(s, map);
  drawMuralTexture(s, map);
  if (!map.tileAtlas) drawPaintedGround(s, map);

  if (!state?.map) return;
  const visible = visibleMapFeatures();
  drawSceneDecals(visible.chunks || []);
  for (const feature of [...state.map.features, ...visible.features]) drawMapFeature(feature);
  for (const event of [...state.map.events, ...visible.events]) drawMapFeature(event);
  drawMuralFrame(s, map);
}

function drawMapBaseImage(s, map) {
  if (map.tileAtlas === "qingqiu_seamless" && drawTiledMapBase(s, map)) return true;
  if (!assetReady("maps", map.id)) return false;
  const img = assets.maps[map.id];
  if (map.scenePack) {
    const camera = state?.camera || { x: 0, y: 0 };
    const scale = Math.max(s.w / img.naturalWidth, s.h / img.naturalHeight) * 1.18;
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const driftX = Math.sin(camera.x * 0.00055) * 44;
    const driftY = Math.sin(camera.y * 0.00062) * 32;
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.drawImage(img, (s.w - drawW) / 2 + driftX, (s.h - drawH) / 2 + driftY, drawW, drawH);
    ctx.restore();
    return true;
  }
  const scale = Math.max(s.w / img.naturalWidth, s.h / img.naturalHeight) * 1.08;
  const drawW = img.naturalWidth * scale;
  const drawH = img.naturalHeight * scale;
  const camera = state?.camera || { x: 0, y: 0 };
  const driftX = Math.sin(camera.x * 0.0009) * 38;
  const driftY = Math.sin(camera.y * 0.0011) * 28;
  ctx.save();
  ctx.globalAlpha = map.id === "qingqiu" ? 0.72 : 0.68;
  ctx.drawImage(img, (s.w - drawW) / 2 + driftX, (s.h - drawH) / 2 + driftY, drawW, drawH);
  ctx.restore();
  return true;
}

function drawTiledMapBase(s, map) {
  if (!assetReady("mapTiles", "qingqiu_base_01")) return false;
  const img = assets.mapTiles.qingqiu_base_01;
  const tileSize = map.tileSize || 512;
  const camera = state?.camera || { x: 0, y: 0 };
  const startX = -mod(camera.x, tileSize) - tileSize;
  const startY = -mod(camera.y, tileSize) - tileSize;
  ctx.save();
  ctx.globalAlpha = 1;
  for (let y = startY; y < s.h + tileSize; y += tileSize) {
    for (let x = startX; x < s.w + tileSize; x += tileSize) {
      ctx.drawImage(img, x, y, tileSize + 1, tileSize + 1);
    }
  }
  ctx.restore();
  return true;
}

function mod(value, size) {
  return ((value % size) + size) % size;
}

function drawMuralTexture(s, map) {
  ctx.save();
  ctx.globalAlpha = map.scenePack ? 0.18 : 0.42;
  ctx.strokeStyle = "rgba(231, 186, 86, 0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i += 1) {
    const y = ((i * 157 + map.seed * 0.00001) % (s.h + 160)) - 80;
    ctx.beginPath();
    for (let x = -80; x <= s.w + 80; x += 70) {
      const wave = Math.sin((x + i * 37) * 0.012) * 16;
      if (x === -80) ctx.moveTo(x, y + wave);
      else ctx.quadraticCurveTo(x - 34, y - wave * 0.35, x, y + wave);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 0.34;
  ctx.strokeStyle = "rgba(37, 25, 18, 0.28)";
  for (let i = 0; i < 18; i += 1) {
    const x = (i * 311 + map.seed * 0.00003) % s.w;
    const y = (i * 173 + map.seed * 0.00002) % s.h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 18, y + 8);
    ctx.lineTo(x + 34, y - 3);
    ctx.lineTo(x + 52, y + 10);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPaintedGround(s, map) {
  ctx.save();
  ctx.globalAlpha = map.scenePack ? 0.16 : 0.42;
  const tint = map.id === "qingqiu" ? "rgba(93, 75, 112, 0.12)" : "rgba(147, 107, 56, 0.18)";
  const stroke = map.id === "qingqiu" ? "rgba(185, 123, 174, 0.12)" : "rgba(225, 178, 88, 0.19)";
  const camera = state?.camera || { x: 0, y: 0 };
  const cell = 360;
  const baseX = Math.floor(camera.x / cell);
  const baseY = Math.floor(camera.y / cell);
  for (let gy = baseY - 3; gy <= baseY + 3; gy += 1) {
    for (let gx = baseX - 4; gx <= baseX + 4; gx += 1) {
      const rng = makeRng(hashSeed(map.seed, gx, gy));
      if (rng() < 0.2) continue;
      const world = {
        x: gx * cell + 40 + rng() * (cell - 80),
        y: gy * cell + 40 + rng() * (cell - 80)
      };
      const p = toView(world);
      if (p.x < -280 || p.x > s.w + 280 || p.y < -140 || p.y > s.h + 140) continue;
      const w = 150 + rng() * 220;
      const h = 28 + rng() * 34;
      const angle = -0.22 + rng() * 0.44;
    ctx.globalAlpha = map.scenePack ? 0.055 : map.id === "qingqiu" ? 0.12 : 0.18;
    ctx.fillStyle = tint;
    ctx.beginPath();
      ctx.ellipse(p.x, p.y, w, h, angle, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = map.scenePack ? 0.09 : map.id === "qingqiu" ? 0.18 : 0.26;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
      ctx.moveTo(p.x - w * 0.58, p.y + 2);
      ctx.bezierCurveTo(p.x - w * 0.24, p.y - h * 0.5, p.x + w * 0.05, p.y + h * 0.52, p.x + w * 0.5, p.y - 2);
      ctx.moveTo(p.x - w * 0.38, p.y + h * 0.28);
      ctx.bezierCurveTo(p.x - w * 0.08, p.y + h * 0.62, p.x + w * 0.12, p.y - h * 0.2, p.x + w * 0.42, p.y + h * 0.18);
    ctx.stroke();
    }
  }
  ctx.restore();
}

function drawSceneDecals(chunks) {
  if (!state?.map) return;
  ctx.save();
  for (const item of chunks) {
    for (const decal of item.chunk.decals || []) {
      const p = toView(decal);
      const isPaintedGround = decal.type === "groundMist" || decal.type === "oldVowTrace";
      const isImageDecal = Boolean(decal.asset && assetReady("scene", decal.asset));
      const w = decal.r * (isPaintedGround ? 4.8 : decal.type === "sceneMist" || decal.type === "sceneTransition" ? 3.4 : 3.0);
      const h = decal.r * (isPaintedGround ? 2.15 : decal.type === "sceneMist" || decal.type === "sceneTransition" ? 1.35 : 1.25);
      if (p.x < -w || p.x > screen().w + w || p.y < -h || p.y > screen().h + h) continue;
      if (isImageDecal && drawAsset("scene", decal.asset, p.x, p.y, w, h, {
        alpha: decal.alpha,
        rotate: decal.rotate,
        anchorY: 0.5
      })) continue;
      ctx.globalAlpha = decal.alpha;
      if (decal.type === "sceneMist" || decal.type === "groundMist" || decal.type === "oldVowTrace") {
        ctx.fillStyle = "rgba(132, 72, 158, 0.24)";
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, w * 0.42, h * 0.38, decal.rotate, 0, TAU);
        ctx.fill();
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(decal.rotate);
        ctx.strokeStyle = "rgba(139, 52, 41, 0.32)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i += 1) {
          const yy = (i - 1.5) * h * 0.12;
          ctx.beginPath();
          ctx.moveTo(-w * 0.36, yy);
          ctx.bezierCurveTo(-w * 0.18, yy - h * 0.1, w * 0.04, yy + h * 0.1, w * 0.32, yy - h * 0.04);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }
  ctx.restore();
}

function drawMuralFrame(s, map) {
  ctx.save();
  const edge = map.id === "qingqiu" ? "rgba(30, 21, 34, 0.52)" : "rgba(64, 31, 18, 0.5)";
  const gradTop = ctx.createLinearGradient(0, 0, 0, s.h);
  gradTop.addColorStop(0, edge);
  gradTop.addColorStop(0.16, "rgba(0, 0, 0, 0)");
  gradTop.addColorStop(0.84, "rgba(0, 0, 0, 0)");
  gradTop.addColorStop(1, edge);
  ctx.fillStyle = gradTop;
  ctx.fillRect(0, 0, s.w, s.h);

  ctx.globalAlpha = map.id === "qingqiu" ? 0.18 : 0.26;
  ctx.strokeStyle = map.id === "qingqiu" ? "#b96eb1" : "#b74431";
  ctx.lineWidth = 9;
  for (let i = 0; i < 4; i += 1) {
    const y = i % 2 === 0 ? 24 + i * 7 : s.h - 32 + i * 5;
    ctx.beginPath();
    for (let x = -80; x <= s.w + 90; x += 64) {
      const wave = Math.sin((x + i * 77 + map.seed * 0.00004) * 0.018) * 15;
      if (x === -80) ctx.moveTo(x, y + wave);
      else ctx.quadraticCurveTo(x - 30, y - wave * 0.7, x, y + wave);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawStoryMarkerUnder(feature) {
  const pulse = 0.5 + 0.5 * Math.sin(state.time * 3.4 + feature.phase);
  const radius = storyTriggerRadius(feature) * (0.72 + pulse * 0.05);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.38 + pulse * 0.16;
  ctx.strokeStyle = "rgba(236, 186, 82, 0.78)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, feature.r * 0.18, radius, radius * 0.28, 0, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 0.18 + pulse * 0.14;
  ctx.strokeStyle = feature.type === "foxfire" || feature.type === "rift" ? "rgba(224, 86, 60, 0.78)" : "rgba(84, 184, 138, 0.72)";
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * TAU + pulse * 0.08;
    const x = Math.cos(a) * radius * 0.38;
    const y = feature.r * 0.18 + Math.sin(a) * radius * 0.11;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 0.18, radius * 0.055, a * 0.3, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStoryMarkerOver(feature) {
  const pulse = 0.5 + 0.5 * Math.sin(state.time * 4.2 + feature.phase);
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.translate(0, -feature.r * 1.72);
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = "rgba(35, 25, 18, 0.72)";
  ctx.strokeStyle = "rgba(231, 186, 86, 0.82)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -2, 19, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 226, 150, 0.95)";
  ctx.font = "700 17px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("缘", 0, -2);
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.28 + pulse * 0.22;
  ctx.strokeStyle = "rgba(84, 184, 138, 0.88)";
  ctx.beginPath();
  ctx.arc(0, -2, 22 + pulse * 4, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function storyTriggerRadius(event) {
  return Math.max(116, event.r * 3.15 + 42);
}

function drawMapFeature(feature) {
  const p = toView(feature);
  ctx.save();
  ctx.translate(p.x, p.y);
  if (feature.event && !state.storySeen[storyKey(feature)]) drawStoryMarkerUnder(feature);
  if (feature.event && drawSceneEventFeature(feature)) {
    if (!state.storySeen[storyKey(feature)]) drawStoryMarkerOver(feature);
    ctx.restore();
    return;
  }
  const terrainKey = feature.type === "spiritWell" ? "spiritWell" : feature.type;
  const terrainScale = {
    mist: [3.0, 1.15],
    spirit: [2.7, 1.5],
    spiritWell: [3.6, 2.2],
    foxfire: [1.7, 2.2],
    stele: [1.75, 2.6],
    shrine: [2.65, 2.65],
    rift: [2.5, 1.15],
    stone: [2.4, 1.85],
    grass: [2.6, 1.35],
    bone: [2.4, 1.35]
  };
  const [wScale, hScale] = terrainScale[feature.type] || [2.15, 2.25];
  const assetW = feature.r * wScale;
  const assetH = feature.r * hScale;
  const loopCounts = { foxfire: 4, spirit: 3, spiritWell: 2, mist: 3, rift: 3 };
  const variantCounts = { stone: 3, grass: 3, bone: 2, stele: 1, shrine: 1 };
  const loopCount = loopCounts[terrainKey];
  const variantCount = variantCounts[terrainKey];
  const frame = loopCount
    ? Math.floor((state.time + feature.phase) * (terrainKey === "foxfire" ? 5 : 2.4)) % loopCount
    : Math.floor(feature.phase * 1000) % (variantCount || 1);
  const runtimeKey = `${terrainKey}_${frame}`;
  if (drawAsset("terrain", runtimeKey, 0, feature.type === "mist" ? 0 : feature.r * 0.2, assetW, assetH, {
    alpha: feature.event ? 0.96 : 0.82,
    anchorY: feature.type === "mist" ? 0.5 : 0.86
  })) {
    if (feature.event && !state.storySeen[storyKey(feature)]) drawStoryMarkerOver(feature);
    ctx.restore();
    return;
  }
  const fallbackKey = feature.type === "spiritWell" ? "spirit" : feature.type;
  if (feature.type === "spirit" || feature.type === "spiritWell") {
    ctx.fillStyle = state.map.accentColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, feature.r, feature.r * 0.24, -0.18, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(220, 247, 203, 0.32)";
    ctx.stroke();
    ctx.strokeStyle = "rgba(231, 186, 86, 0.42)";
    ctx.beginPath();
    ctx.arc(0, 0, feature.r * 0.38, 0, TAU);
    ctx.stroke();
  } else if (feature.type === "stone") {
    ctx.fillStyle = "rgba(31, 29, 24, 0.42)";
    ctx.beginPath();
    ctx.ellipse(0, 0, feature.r * 1.2, feature.r * 0.45, -0.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(190, 178, 139, 0.52)";
    ctx.beginPath();
    ctx.moveTo(-feature.r * 0.42, 0);
    ctx.lineTo(-feature.r * 0.3, -feature.r * 1.45);
    ctx.lineTo(feature.r * 0.32, -feature.r * 1.55);
    ctx.lineTo(feature.r * 0.42, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(231, 186, 86, 0.28)";
    ctx.stroke();
  } else if (feature.type === "rift") {
    ctx.strokeStyle = "rgba(186, 59, 47, 0.7)";
    ctx.lineWidth = feature.event ? 4 : 3;
    ctx.beginPath();
    ctx.moveTo(-feature.r * 0.7, -feature.r * 0.12);
    ctx.lineTo(-feature.r * 0.22, feature.r * 0.18);
    ctx.lineTo(feature.r * 0.15, -feature.r * 0.08);
    ctx.lineTo(feature.r * 0.7, feature.r * 0.14);
    ctx.stroke();
  } else if (feature.type === "mist") {
    ctx.globalAlpha = feature.event ? 0.44 : 0.3;
    ctx.fillStyle = "#d98bd8";
    ctx.beginPath();
    ctx.ellipse(0, 0, feature.r, feature.r * 0.36, 0.1, 0, TAU);
    ctx.fill();
  } else if (feature.type === "foxfire") {
    ctx.fillStyle = "rgba(231, 186, 86, 0.72)";
    ctx.beginPath();
    ctx.moveTo(0, -feature.r * 1.5);
    ctx.quadraticCurveTo(feature.r * 0.9, -feature.r * 0.35, feature.r * 0.18, feature.r * 0.25);
    ctx.quadraticCurveTo(-feature.r * 0.45, -feature.r * 0.18, 0, -feature.r * 1.5);
    ctx.fill();
    ctx.strokeStyle = "rgba(217, 139, 216, 0.6)";
    ctx.stroke();
  } else if (feature.type === "stele" || feature.type === "shrine") {
    ctx.fillStyle = "rgba(42, 38, 48, 0.76)";
    ctx.fillRect(-feature.r * 0.38, -feature.r * 1.8, feature.r * 0.76, feature.r * 1.8);
    ctx.strokeStyle = "rgba(231, 186, 86, 0.45)";
    ctx.strokeRect(-feature.r * 0.38, -feature.r * 1.8, feature.r * 0.76, feature.r * 1.8);
    if (feature.event) {
      ctx.fillStyle = "rgba(186, 59, 47, 0.68)";
      ctx.fillRect(-feature.r * 0.18, -feature.r * 1.42, feature.r * 0.36, feature.r * 0.5);
    }
  }
  if (feature.event && !state.storySeen[storyKey(feature)]) drawStoryMarkerOver(feature);
  ctx.restore();
}

function drawSceneEventFeature(feature) {
  const eventAsset = {
    brokenSword: "brokenSword",
    herbCauldron: "herbCauldron",
    memoryStele: "memoryStele",
    foxfire: state.map?.scenePack === "qingqiu" ? "foxfire" : ""
  }[feature.type];
  if (!eventAsset) return false;
  const pulse = 0.5 + 0.5 * Math.sin(state.time * 3 + feature.phase);
  const w = feature.r * 5.3;
  const h = feature.r * 5.3;
  const ok = drawAsset("sceneEvents", eventAsset, 0, feature.r * 0.38, w, h, {
    alpha: state.storySeen[storyKey(feature)] ? 0.52 : 0.98,
    anchorY: 0.86
  });
  if (!ok) return false;
  if (!state.storySeen[storyKey(feature)]) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.18 + pulse * 0.14;
    ctx.strokeStyle = feature.type === "brokenSword" ? "#f0c86a" : feature.type === "herbCauldron" ? "#54b88a" : "#d98bd8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, feature.r * 0.28, feature.r * 2.65, feature.r * 0.75, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  return true;
}

function drawShadow(entity, scale = 1) {
  const p = toView(entity);
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + entity.r * 0.62, entity.r * 1.35 * scale, entity.r * 0.42 * scale, 0, 0, TAU);
  ctx.fill();
}

function drawPlayer(player) {
  const p = toView(player);
  drawShadow(player, 1.35);
  const wobble = Math.sin(performance.now() * 0.006) * 0.035;
  const alpha = player.invuln > 0 ? 0.72 + Math.sin(performance.now() * 0.04) * 0.22 : 1;
  if (drawAnimatedAsset("characters", state.lineage.id, player.facing, 4, player.animTime, p.x, p.y + 16, player.r * 5.9, player.r * 6.35, {
    alpha,
    anchorY: 0.92,
    fps: player.moving ? 8 : 2
  })) {
    return;
  }
  if (drawAsset("characters", state.lineage.id, p.x, p.y + 12, player.r * 4.6, player.r * 5.35, {
    rotate: wobble,
    alpha,
    anchorY: 0.86
  })) {
    return;
  }
  ctx.save();
  ctx.translate(p.x, p.y);
  const mainColor = player.invuln > 0 ? "#f3df8b" : state.lineage.color;
  ctx.strokeStyle = "rgba(231, 186, 86, 0.75)";
  ctx.lineWidth = 2;
  ctx.fillStyle = "rgba(29, 21, 16, 0.92)";
  ctx.beginPath();
  ctx.moveTo(0, -player.r * 1.75);
  ctx.quadraticCurveTo(player.r * 0.82, -player.r * 0.68, player.r * 0.42, player.r * 0.6);
  ctx.lineTo(-player.r * 0.42, player.r * 0.6);
  ctx.quadraticCurveTo(-player.r * 0.82, -player.r * 0.68, 0, -player.r * 1.75);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = mainColor;
  ctx.beginPath();
  ctx.ellipse(0, -player.r * 0.54, player.r * 0.58, player.r * 0.92, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(247, 239, 224, 0.46)";
  ctx.stroke();
  ctx.strokeStyle = "#ba3b2f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(6, -player.r * 1.2);
  ctx.quadraticCurveTo(24, -player.r * 1.6, 11, -player.r * 0.35);
  ctx.moveTo(-4, -player.r * 1.22);
  ctx.quadraticCurveTo(-25, -player.r * 1.45, -12, -player.r * 0.2);
  ctx.stroke();
  ctx.restore();
}

function drawEnemy(enemy) {
  const p = toView(enemy);
  const s = screen();
  if (p.x < -120 || p.x > s.w + 120 || p.y < -140 || p.y > s.h + 140) return;
  drawShadow(enemy, enemy.elite ? 1.35 : 1.2);
  const enemyKey = enemy.elite ? "elite" : "wraith";
  const pressureMode = state.enemies.length > 42 && !enemy.elite && dist(enemy, state.player) > 460;
  const sway = Math.sin((performance.now() * 0.005) + enemy.x * 0.02) * 0.04;
  if (!pressureMode && drawAnimatedAsset("enemies", enemyKey, enemy.facing || "right", 3, enemy.animTime, p.x, p.y + 12, enemy.r * (enemy.elite ? 5.0 : 4.7), enemy.r * (enemy.elite ? 5.35 : 5.05), {
    alpha: enemy.slowTime > 0 ? 0.78 : 1,
    anchorY: 0.9,
    fps: enemy.elite ? 6 : 7
  })) {
    ctx.save();
    ctx.translate(p.x, p.y);
    if (enemy.hitFlash > 0) {
      ctx.globalAlpha = Math.min(0.55, enemy.hitFlash * 4.5);
      ctx.fillStyle = "#fff2c8";
      ctx.beginPath();
      ctx.ellipse(0, -enemy.r * 1.2, enemy.r * 1.45, enemy.r * 1.9, 0, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (enemy.marks > 0) {
      ctx.font = "700 13px KaiTi, STKaiti, Microsoft YaHei, serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#dceeff";
      ctx.strokeStyle = "rgba(29, 21, 16, 0.8)";
      ctx.lineWidth = 3;
      ctx.strokeText("剑".repeat(enemy.marks), 0, -enemy.r * 2.8);
      ctx.fillText("剑".repeat(enemy.marks), 0, -enemy.r * 2.8);
    }
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(-enemy.r, enemy.r + 3, enemy.r * 2, 4);
    ctx.fillStyle = enemy.elite ? "#e05b77" : "#74ba82";
    ctx.fillRect(-enemy.r, enemy.r + 3, enemy.r * 2 * Math.max(0, enemy.hp / enemy.maxHp), 4);
    ctx.restore();
    return;
  }
  if (drawAsset("enemies", `${enemyKey}_${enemy.facing || "right"}_1`, p.x, p.y + 10, enemy.r * (enemy.elite ? 4.35 : 4.0), enemy.r * (enemy.elite ? 4.85 : 4.45), {
    rotate: sway,
    alpha: enemy.slowTime > 0 ? 0.78 : 1,
    anchorY: 0.86
  })) {
    ctx.save();
    ctx.translate(p.x, p.y);
    if (enemy.hitFlash > 0) {
      ctx.globalAlpha = Math.min(0.55, enemy.hitFlash * 4.5);
      ctx.fillStyle = "#fff2c8";
      ctx.beginPath();
      ctx.ellipse(0, -enemy.r * 1.2, enemy.r * 1.4, enemy.r * 1.8, 0, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (enemy.marks > 0) {
      ctx.font = "700 13px KaiTi, STKaiti, Microsoft YaHei, serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#dceeff";
      ctx.strokeStyle = "rgba(29, 21, 16, 0.8)";
      ctx.lineWidth = 3;
      ctx.strokeText("剑".repeat(enemy.marks), 0, -enemy.r * 2.5);
      ctx.fillText("剑".repeat(enemy.marks), 0, -enemy.r * 2.5);
    }
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(-enemy.r, enemy.r + 3, enemy.r * 2, 4);
    ctx.fillStyle = enemy.elite ? "#e05b77" : "#74ba82";
    ctx.fillRect(-enemy.r, enemy.r + 3, enemy.r * 2 * Math.max(0, enemy.hp / enemy.maxHp), 4);
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.translate(p.x, p.y);
  const body = enemy.elite ? "#723452" : "#3d5344";
  const trim = enemy.slowTime > 0 ? "#d98bd8" : enemy.elite ? "#e05b77" : "#9fc6a1";
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-enemy.r * 0.95, -enemy.r * 0.32);
  ctx.quadraticCurveTo(-enemy.r * 0.58, -enemy.r * 1.35, 0, -enemy.r * 1.15);
  ctx.quadraticCurveTo(enemy.r * 0.92, -enemy.r * 1.0, enemy.r * 0.82, -enemy.r * 0.05);
  ctx.quadraticCurveTo(enemy.r * 0.25, enemy.r * 0.55, -enemy.r * 0.78, enemy.r * 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = trim;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = "rgba(231, 186, 86, 0.52)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-enemy.r * 0.2, -enemy.r * 1.05);
  ctx.lineTo(-enemy.r * 0.52, -enemy.r * 1.62);
  ctx.moveTo(enemy.r * 0.22, -enemy.r * 1.02);
  ctx.lineTo(enemy.r * 0.58, -enemy.r * 1.52);
  ctx.stroke();
  if (enemy.marks > 0) {
    ctx.fillStyle = "#dceeff";
    ctx.fillText("x".repeat(enemy.marks), -enemy.r * 0.45, -enemy.r - 12);
  }
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(-enemy.r, enemy.r + 3, enemy.r * 2, 4);
  ctx.fillStyle = enemy.elite ? "#e05b77" : "#74ba82";
  ctx.fillRect(-enemy.r, enemy.r + 3, enemy.r * 2 * Math.max(0, enemy.hp / enemy.maxHp), 4);
  ctx.restore();
}

function drawProjectile(projectile) {
  const p = toView(projectile);
  ctx.save();
  ctx.translate(p.x, p.y);
  if (projectile.type === "sword") {
    const angle = Math.atan2(projectile.vy * 0.68, projectile.vx + projectile.vy * 0.22);
    ctx.restore();
    if (drawAsset("skills", "sword", p.x, p.y, 44, 18, { rotate: angle, anchorY: 0.5 })) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(angle);
    const grad = ctx.createLinearGradient(-28, 0, 28, 0);
    grad.addColorStop(0, "rgba(122, 213, 238, 0)");
    grad.addColorStop(0.45, "#7ad5ee");
    grad.addColorStop(1, "#fff8d7");
    ctx.strokeStyle = grad;
    ctx.shadowColor = "rgba(122, 213, 238, 0.65)";
    ctx.shadowBlur = 10;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-26, 0);
    ctx.lineTo(26, 0);
    ctx.stroke();
    ctx.fillStyle = "#f7efe0";
    ctx.beginPath();
    ctx.arc(26, 0, 4, 0, TAU);
    ctx.fill();
  } else {
    const angle = Math.atan2(projectile.vy * 0.68, projectile.vx + projectile.vy * 0.22);
    ctx.restore();
    if (drawAsset("skills", "talisman", p.x, p.y, 28, 38, { rotate: angle + Math.sin(state.time * 8) * 0.35, anchorY: 0.5 })) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(angle + Math.sin(state.time * 8) * 0.5);
    ctx.shadowColor = "rgba(255, 240, 164, 0.6)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#e7ba56";
    ctx.fillRect(-6, -10, 12, 20);
    ctx.strokeStyle = "#7f2d27";
    ctx.strokeRect(-6, -10, 12, 20);
    ctx.strokeStyle = "#fff0a4";
    ctx.beginPath();
    ctx.moveTo(-3, -4);
    ctx.lineTo(3, -4);
    ctx.moveTo(-3, 2);
    ctx.lineTo(3, 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDrop(drop) {
  const p = toView(drop);
  const pulse = 1 + Math.sin(state.time * 8 + drop.x * 0.02) * 0.08;
  ctx.save();
  ctx.globalAlpha = drop.magnet ? 0.82 : 0.44;
  ctx.strokeStyle = drop.fire ? "#d65d35" : "#52b489";
  ctx.shadowColor = drop.fire ? "rgba(214, 93, 53, 0.48)" : "rgba(82, 180, 137, 0.48)";
  ctx.shadowBlur = 12;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(p.x, p.y - 4, drop.r * 2.2 * pulse, 0, TAU);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.shadowColor = drop.fire ? "rgba(225, 105, 53, 0.82)" : "rgba(84, 184, 138, 0.82)";
  ctx.shadowBlur = 14;
  const grad = ctx.createRadialGradient(-drop.r * 0.28, -drop.r * 0.4, 1, 0, -4, drop.r * 1.35);
  if (drop.fire) {
    grad.addColorStop(0, "#ffd58f");
    grad.addColorStop(0.5, "#d65d35");
    grad.addColorStop(1, "#67251f");
  } else {
    grad.addColorStop(0, "#dff7cb");
    grad.addColorStop(0.48, "#52b489");
    grad.addColorStop(1, "#1d5b47");
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, -4, drop.r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = drop.fire ? "#f7ead3" : "#dff7cb";
  ctx.stroke();
  ctx.globalAlpha = 0.78;
  ctx.strokeStyle = drop.fire ? "#ffd58f" : "#9bf0c0";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-drop.r * 0.55, -4);
  ctx.quadraticCurveTo(0, -drop.r * 1.3, drop.r * 0.55, -4);
  ctx.stroke();
  ctx.restore();
}

function drawPulse(pulse) {
  const t = 1 - pulse.life / pulse.maxLife;
  const p = toView(pulse);
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - t);
  ctx.strokeStyle = pulse.kind === "hurt" ? "#ba3b2f" : pulse.kind === "phantom" ? "rgba(159, 105, 176, 0.72)" : pulse.kind === "pickupBurst" ? "#54b88a" : "#e7ba56";
  ctx.shadowColor = pulse.kind === "phantom" ? "rgba(216, 166, 77, 0.24)" : "transparent";
  ctx.shadowBlur = pulse.kind === "phantom" ? 10 : 0;
  ctx.lineWidth = pulse.kind === "phantom" ? 3 : 4;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, pulse.radius * (0.45 + t * 0.7), pulse.radius * (0.22 + t * 0.34), -0.1, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawCloud(cloud) {
  const p = toView(cloud);
  ctx.save();
  ctx.globalAlpha = Math.min(0.42, cloud.life / 3.4);
  ctx.fillStyle = "#54b88a";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, cloud.radius, cloud.radius * 0.38, -0.1, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawEffect(effect) {
  const p = toView(effect);
  const t = 1 - effect.life / effect.maxLife;
  const fade = Math.max(0, 1 - t);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.globalAlpha = fade;

  if (effect.type === "swordTrail") {
    ctx.rotate(effect.angle);
    const grad = ctx.createLinearGradient(-effect.radius, 0, effect.radius * 0.45, 0);
    grad.addColorStop(0, "rgba(122, 213, 238, 0)");
    grad.addColorStop(0.55, effect.color);
    grad.addColorStop(1, "#f7ead3");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 5 * fade;
    ctx.beginPath();
    ctx.moveTo(-effect.radius, 0);
    ctx.quadraticCurveTo(-effect.radius * 0.2, -5, effect.radius * 0.5, 0);
    ctx.stroke();
  } else if (effect.type === "swordCast") {
    ctx.rotate(effect.angle);
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = 2;
    for (let i = 0; i < Math.min(5, effect.count + 2); i += 1) {
      ctx.globalAlpha = fade * (0.35 + i * 0.1);
      ctx.beginPath();
      ctx.moveTo(-10, (i - 2) * 5);
      ctx.lineTo(effect.radius + i * 7, (i - 2) * 2);
      ctx.stroke();
    }
  } else if (effect.type === "swordImpact") {
    ctx.rotate(effect.angle);
    ctx.strokeStyle = effect.secondary;
    ctx.lineWidth = 4 * fade;
    ctx.beginPath();
    ctx.moveTo(-effect.radius * 0.5, -effect.radius * 0.25);
    ctx.lineTo(effect.radius * 0.55, effect.radius * 0.22);
    ctx.moveTo(-effect.radius * 0.35, effect.radius * 0.25);
    ctx.lineTo(effect.radius * 0.45, -effect.radius * 0.2);
    ctx.stroke();
  } else if (effect.type === "talismanTrail") {
    ctx.rotate(effect.angle + Math.sin(t * TAU) * 0.4);
    ctx.strokeStyle = effect.secondary;
    ctx.fillStyle = effect.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-effect.radius * 0.2, 0, effect.radius * 0.42, effect.radius * 0.16, 0, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = fade * 0.72;
    ctx.fillRect(-5, -8, 10, 16);
  } else if (effect.type === "talismanCast" || effect.type === "talismanImpact") {
    ctx.rotate(effect.angle + t * TAU * effect.spin);
    ctx.strokeStyle = effect.secondary;
    ctx.lineWidth = effect.type === "talismanImpact" ? 4 : 2;
    const r = effect.radius * (0.45 + t * 0.5);
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const a = i / 6 * TAU;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r * 0.45;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  } else if (effect.type === "flameRing") {
    const r = effect.radius * (0.35 + t * 0.78);
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = 8 * fade;
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.38, -0.08, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = effect.secondary;
    ctx.lineWidth = 2 * fade;
    for (let i = 0; i < effect.count; i += 1) {
      const a = i / effect.count * TAU + t * 2.3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.74, Math.sin(a) * r * 0.28);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.38);
      ctx.stroke();
    }
  } else if (effect.type === "spark") {
    ctx.fillStyle = effect.secondary;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(1, effect.radius * 0.12 * fade), 0, TAU);
    ctx.fill();
  } else if (effect.type === "phantomMist") {
    const r = effect.radius * (0.32 + t * 0.76);
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(163, 96, 184, 0.62)";
    ctx.shadowColor = "rgba(216, 166, 77, 0.34)";
    ctx.shadowBlur = 16;
    ctx.lineWidth = 4 * fade;
    for (let i = 0; i < effect.count; i += 1) {
      const off = (i - effect.count / 2) * 9;
      ctx.beginPath();
      ctx.ellipse(off, Math.sin(i + t * TAU) * 8, r * (0.72 + i * 0.025), r * 0.24, -0.12, Math.PI * 0.08, Math.PI * 1.86);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(231, 186, 86, 0.5)";
    ctx.lineWidth = 1.5 * fade;
    for (let i = 0; i < Math.max(4, effect.count - 1); i += 1) {
      const a = i / Math.max(4, effect.count - 1) * TAU + t * 1.8;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.52, Math.sin(a) * r * 0.18, 2.2 + 2.8 * fade, 0, TAU);
      ctx.stroke();
    }
  } else if (effect.type === "levelBurst") {
    const r = effect.radius * (0.2 + t * 0.86);
    ctx.strokeStyle = effect.secondary;
    ctx.lineWidth = 5 * fade;
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.36, -0.08, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = 2 * fade;
    for (let i = 0; i < effect.count; i += 1) {
      const a = i / effect.count * TAU + t * TAU * effect.spin;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.35, Math.sin(a) * r * 0.14);
      ctx.lineTo(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.34);
      ctx.stroke();
    }
  } else if (effect.type === "dashTrail") {
    ctx.rotate(effect.angle);
    const r = effect.radius * (0.35 + t * 0.8);
    ctx.strokeStyle = effect.secondary;
    ctx.lineWidth = 4 * fade;
    for (let i = 0; i < effect.count; i += 1) {
      ctx.globalAlpha = fade * (0.28 + i * 0.14);
      ctx.beginPath();
      ctx.moveTo(-r * (0.95 + i * 0.12), (i - 1.5) * 9);
      ctx.quadraticCurveTo(-r * 0.3, (i - 1.5) * 4, r * 0.2, 0);
      ctx.stroke();
    }
  } else if (effect.type === "guard") {
    const r = effect.radius * (0.45 + t * 0.55);
    ctx.strokeStyle = effect.secondary;
    ctx.lineWidth = 4 * fade;
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.38, -0.08, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = 2 * fade;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.72, r * 0.27, -0.08, 0, TAU);
    ctx.stroke();
  } else if (effect.type === "hitSpark") {
    ctx.rotate(effect.angle);
    ctx.shadowColor = effect.secondary;
    ctx.shadowBlur = 16;
    ctx.strokeStyle = effect.secondary;
    ctx.lineWidth = 3 * fade;
    const r = effect.radius * (0.35 + t * 0.9);
    for (let i = 0; i < effect.count; i += 1) {
      const a = (i / effect.count) * TAU;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.16, Math.sin(a) * r * 0.12);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.42);
      ctx.stroke();
    }
    ctx.fillStyle = effect.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.36, r * 0.18, -0.12, 0, TAU);
    ctx.fill();
  } else if (effect.type === "killBloom" || effect.type === "pickupBurst") {
    const r = effect.radius * (0.22 + t * 0.9);
    ctx.shadowColor = effect.color;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = effect.type === "killBloom" ? 5 * fade : 3 * fade;
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.36, -0.1, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = effect.secondary;
    ctx.lineWidth = 2 * fade;
    for (let i = 0; i < effect.count; i += 1) {
      const a = (i / effect.count) * TAU + t * 1.6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.32, Math.sin(a) * r * 0.14);
      ctx.lineTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.34);
      ctx.stroke();
    }
  } else if (effect.type === "pickupTrail") {
    const start = effect.fromX !== undefined ? toView({ x: effect.fromX, y: effect.fromY }) : { x: 0, y: 0 };
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = fade * 0.8;
    ctx.strokeStyle = effect.color;
    ctx.shadowColor = effect.color;
    ctx.shadowBlur = 10;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y - 4);
    ctx.quadraticCurveTo((start.x + p.x) * 0.5, (start.y + p.y) * 0.5 - 18, p.x, p.y - 4);
    ctx.stroke();
  } else if (effect.type === "cardLink") {
    const start = effect.fromX !== undefined ? toView({ x: effect.fromX, y: effect.fromY }) : { x: p.x, y: p.y - effect.radius };
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.strokeStyle = effect.secondary;
    ctx.shadowColor = effect.color;
    ctx.shadowBlur = 18;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(start.x - 18, start.y + 90, p.x + 42, p.y - 96, p.x, p.y);
    ctx.stroke();
    ctx.fillStyle = effect.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4 + 8 * fade, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

function drawDamageText(text) {
  const p = toView(text);
  const t = 1 - text.life / text.maxLife;
  const pop = text.scale * (1 + Math.sin(Math.min(1, t) * Math.PI) * 0.22);
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - t);
  ctx.translate(p.x, p.y - 18);
  ctx.rotate((text.drift || 0) * 0.002);
  ctx.scale(pop, pop);
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(247, 204, 114, 0.46)";
  ctx.shadowBlur = 12;
  ctx.font = "900 13px KaiTi, STKaiti, Microsoft YaHei, serif";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(29, 21, 16, 0.9)";
  ctx.strokeText(text.label || "", -18, -15);
  ctx.fillStyle = text.edge;
  ctx.fillText(text.label || "", -18, -15);
  ctx.font = "900 24px KaiTi, STKaiti, Microsoft YaHei, serif";
  ctx.lineWidth = 8;
  ctx.strokeStyle = "rgba(29, 21, 16, 0.9)";
  ctx.strokeText(String(text.value), 8, 0);
  ctx.lineWidth = 3;
  ctx.strokeStyle = text.edge;
  ctx.strokeText(String(text.value), 8, 0);
  ctx.fillStyle = text.fill;
  ctx.fillText(String(text.value), 8, 0);
  ctx.restore();
}

function render() {
  const s = screen();
  ctx.clearRect(0, 0, s.w, s.h);
  ctx.save();
  if (screenShake > 0.05) {
    const shake = Math.min(12, screenShake);
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    screenShake = Math.max(0, screenShake * 0.82 - 0.08);
  }
  drawBackground(s);
  if (!state) {
    ctx.restore();
    return;
  }

  for (const cloud of state.clouds) drawCloud(cloud);
  for (const effect of state.effects) drawEffect(effect);
  for (const drop of state.drops) drawDrop(drop);
  for (const projectile of state.projectiles) drawProjectile(projectile);
  state.enemies.sort((a, b) => a.y - b.y);
  let playerDrawn = false;
  for (const enemy of state.enemies) {
    if (!playerDrawn && enemy.y > state.player.y) {
      drawPlayer(state.player);
      playerDrawn = true;
    }
    drawEnemy(enemy);
  }
  if (!playerDrawn) drawPlayer(state.player);
  for (const pulse of state.pulses) drawPulse(pulse);
  for (const text of state.damageTexts) drawDamageText(text);
  ctx.restore();

  ui.hpText.textContent = `${Math.max(0, Math.ceil(state.player.hp))}/${state.player.maxHp}`;
  ui.hpBar.style.width = `${Math.max(0, state.player.hp / state.player.maxHp) * 100}%`;
  const xpNeed = Math.max(0, state.player.nextXp - state.player.xp);
  ui.xpText.textContent = `${state.player.xp}/${state.player.nextXp}  差${xpNeed}`;
  ui.xpBar.style.width = `${(state.player.xp / state.player.nextXp) * 100}%`;
  ui.levelText.textContent = CONFIG.realms[Math.min(CONFIG.realms.length - 1, state.player.level - 1)];
  ui.timeText.textContent = formatTime(state.time);
  ui.killText.textContent = state.kills;
  ui.soulText.textContent = state.resources.soul;
  ui.fireText.textContent = state.resources.fire;
  ui.dockLevelText.textContent = state.player.level;
  if (ui.buildText) ui.buildText.textContent = buildSummary();
  if (ui.dashBtn) {
    const ready = state.player.dashCooldown <= 0;
    ui.dashBtn.classList.toggle("is-ready", ready);
    ui.dashBtn.textContent = ready ? "冲刺" : state.player.dashCooldown.toFixed(1);
  }
}

function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000 || 0);
  lastTime = now;
  if (state && state.running && !state.paused) update(dt);
  render();
  requestAnimationFrame(loop);
}

function updateTouchStick(clientX, clientY) {
  const max = 54;
  const rawX = clientX - touchMove.originX;
  const rawY = clientY - touchMove.originY;
  const len = Math.hypot(rawX, rawY);
  const clamped = Math.min(max, len);
  const nx = len > 0 ? rawX / len : 0;
  const ny = len > 0 ? rawY / len : 0;
  touchMove.dx = (nx * clamped) / max;
  touchMove.dy = (ny * clamped) / max;
  if (ui.touchStick) {
    ui.touchStick.style.left = `${touchMove.originX}px`;
    ui.touchStick.style.top = `${touchMove.originY}px`;
    ui.touchStick.firstElementChild.style.transform = `translate(${nx * clamped}px, ${ny * clamped}px)`;
  }
}

function hideTouchStick() {
  touchMove.active = false;
  touchMove.id = null;
  touchMove.dx = 0;
  touchMove.dy = 0;
  if (ui.touchStick) {
    ui.touchStick.classList.remove("is-active");
    ui.touchStick.firstElementChild.style.transform = "";
  }
}

window.addEventListener("keydown", event => {
  keys.add(event.key.toLowerCase());
  if (event.code === "Space") {
    event.preventDefault();
    dashPlayer();
  }
});
window.addEventListener("keyup", event => keys.delete(event.key.toLowerCase()));
window.addEventListener("resize", resize);
canvas.addEventListener("pointerdown", event => {
  if (!state?.running || state.paused || event.pointerType === "mouse") return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  if (x > rect.width * 0.62) return;
  touchMove.active = true;
  touchMove.id = event.pointerId;
  touchMove.originX = event.clientX;
  touchMove.originY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
  if (ui.touchStick) ui.touchStick.classList.add("is-active");
  updateTouchStick(event.clientX, event.clientY);
});
canvas.addEventListener("pointermove", event => {
  if (!touchMove.active || touchMove.id !== event.pointerId) return;
  updateTouchStick(event.clientX, event.clientY);
});
canvas.addEventListener("pointerup", event => {
  if (touchMove.id === event.pointerId) hideTouchStick();
});
canvas.addEventListener("pointercancel", event => {
  if (touchMove.id === event.pointerId) hideTouchStick();
});
ui.startBtn.addEventListener("click", startGame);
ui.dashBtn.addEventListener("click", dashPlayer);
ui.skipChoiceBtn.addEventListener("click", skipChoices);
ui.storyChoiceBtn.addEventListener("click", closeStoryEvent);
ui.pauseBtn.addEventListener("click", () => {
  if (!state?.running || !ui.choices.classList.contains("hidden") || !ui.storyOverlay.classList.contains("hidden")) return;
  state.paused = !state.paused;
  if (state.paused) renderBuildLedger();
  ui.pauseOverlay.classList.toggle("hidden", !state.paused);
  ui.pauseBtn.textContent = state.paused ? "续" : "暂";
  lastTime = performance.now();
});
ui.pauseOverlay.addEventListener("click", event => {
  if (event.target?.dataset?.action !== "resume") return;
  state.paused = false;
  ui.pauseOverlay.classList.add("hidden");
  ui.pauseBtn.textContent = "暂";
  lastTime = performance.now();
});
ui.restartBtn.addEventListener("click", () => {
  ui.gameOver.classList.add("hidden");
  ui.pauseOverlay.classList.add("hidden");
  ui.start.classList.remove("hidden");
  renderLineageSelect();
});

resize();
loadAssets();
renderLineageSelect();
state = freshState();
requestAnimationFrame(loop);
