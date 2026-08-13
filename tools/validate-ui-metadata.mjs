import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const TARGETS = [
  {
    component: "HUD",
    asset: "assets/runtime/webp/ui/formal_v034b1/hud_panel_pc.webp",
    metadata: "assets/runtime/webp/ui/formal_v034b1/ui_runtime_atlas.json",
    sourceSizePath: ["hud", "size"],
    boxes: [
      { name: "safe.brand", path: ["hud", "safe", "brand"] },
      { name: "safe.bars", path: ["hud", "safe", "bars"] },
      { name: "safe.stats", path: ["hud", "safe", "stats"] }
    ]
  },
  {
    component: "Resource Soul",
    asset: "assets/runtime/webp/ui/formal_v034b1/ui_runtime_atlas.webp",
    metadata: "assets/runtime/webp/ui/formal_v034b1/ui_runtime_atlas.json",
    sourceSizePath: ["size"],
    spritePath: ["sprites", "resource_soul_wide"],
    boxes: [
      { name: "textSafe.resource_number", path: ["textSafe", "resource_number"], relativeToSprite: true }
    ]
  },
  {
    component: "Resource Fire",
    asset: "assets/runtime/webp/ui/formal_v034b1/ui_runtime_atlas.webp",
    metadata: "assets/runtime/webp/ui/formal_v034b1/ui_runtime_atlas.json",
    sourceSizePath: ["size"],
    spritePath: ["sprites", "resource_fire_wide"],
    boxes: [
      { name: "textSafe.resource_number", path: ["textSafe", "resource_number"], relativeToSprite: true }
    ]
  },
  {
    component: "Lineage Card",
    asset: "assets/runtime/webp/ui/lineage_card.webp",
    metadata: null,
    tbd: "No current authoritative metadata in formal_v034b1. legacy formal_v034a8 bounds exist but are migration reference only."
  },
  {
    component: "Choice Card",
    asset: "assets/runtime/webp/ui/choice_card_frame.webp",
    metadata: null,
    tbd: "No current authoritative metadata in formal_v034b1. legacy formal_v034a8 bounds exist but are migration reference only."
  },
  {
    component: "Story UI",
    asset: "assets/runtime/webp/ui/story/story_panel_art.webp",
    metadata: "assets/runtime/webp/ui/story/manifest-art.json",
    manifestAssetId: "story_panel_art",
    tbd: "Current art manifest records size only. Safe areas are not authoritative because spec dimensions differ from current asset dimensions."
  }
];

function readJson(file) {
  return JSON.parse(readFileSync(join(root, file), "utf8").replace(/^\uFEFF/, ""));
}

function getPath(value, path) {
  return path.reduce((current, key) => current?.[key], value);
}

function readWebpSize(file) {
  const buffer = readFileSync(join(root, file));
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error("Not a WebP file");
  }

  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    return [
      1 + buffer.readUIntLE(24, 3),
      1 + buffer.readUIntLE(27, 3)
    ];
  }

  if (chunk === "VP8L") {
    const b0 = buffer[21];
    const b1 = buffer[22];
    const b2 = buffer[23];
    const b3 = buffer[24];
    return [
      1 + (((b1 & 0x3f) << 8) | b0),
      1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6))
    ];
  }

  if (chunk === "VP8 ") {
    return [
      buffer.readUInt16LE(26) & 0x3fff,
      buffer.readUInt16LE(28) & 0x3fff
    ];
  }

  throw new Error(`Unsupported WebP chunk ${chunk}`);
}

function normalizeSprite(sprite) {
  if (!sprite) return null;
  if (Array.isArray(sprite)) {
    const [x, y, w, h] = sprite;
    return { x, y, w, h };
  }
  return sprite;
}

function rectWithin(rect, width, height) {
  if (!Array.isArray(rect) || rect.length !== 4 || rect.some(value => !Number.isFinite(value))) {
    return { ok: false, reason: "rect is not [x,y,w,h]" };
  }
  const [x, y, w, h] = rect;
  if (w < 0 || h < 0) return { ok: false, reason: "negative size" };
  if (x < 0 || y < 0 || x + w > width || y + h > height) {
    return { ok: false, reason: `out of bounds ${width}x${height}` };
  }
  return { ok: true };
}

function compareSize(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === 2 && b.length === 2 && a[0] === b[0] && a[1] === b[1];
}

const report = {
  phase: "UI Governance Phase 2",
  scope: "Metadata Validator: read-only checks for asset dimensions, metadata source size, safe/text box bounds, and size conflicts.",
  checkedAt: new Date().toISOString(),
  results: [],
  summary: {
    checked: 0,
    pass: 0,
    fail: 0,
    tbd: 0
  }
};

for (const target of TARGETS) {
  const result = {
    component: target.component,
    asset: target.asset,
    metadata: target.metadata || "TBD",
    status: "PASS",
    messages: []
  };

  if (!existsSync(join(root, target.asset))) {
    result.status = "FAIL";
    result.messages.push(`Missing asset: ${target.asset}`);
    report.results.push(result);
    continue;
  }

  let assetSize;
  try {
    assetSize = readWebpSize(target.asset);
    result.assetSize = assetSize;
  } catch (error) {
    result.status = "FAIL";
    result.messages.push(`Cannot read asset size: ${error.message}`);
    report.results.push(result);
    continue;
  }

  if (target.tbd) {
    result.status = result.status === "FAIL" ? "FAIL" : "TBD";
    result.messages.push(`TBD: ${target.tbd}`);
  }

  if (target.metadata) {
    if (!existsSync(join(root, target.metadata))) {
      result.status = "FAIL";
      result.messages.push(`Missing metadata: ${target.metadata}`);
    } else {
      const metadata = readJson(target.metadata);
      if (target.sourceSizePath) {
        const sourceSize = getPath(metadata, target.sourceSizePath);
        result.metadataSourceSize = sourceSize;
        if (!compareSize(assetSize, sourceSize)) {
          result.status = "FAIL";
          result.messages.push(`Metadata source size ${JSON.stringify(sourceSize)} conflicts with asset size ${JSON.stringify(assetSize)}`);
        }
      }

      if (target.manifestAssetId) {
        const manifestAsset = metadata.assets?.find(asset => asset.id === target.manifestAssetId);
        result.metadataSourceSize = manifestAsset?.size;
        if (!manifestAsset) {
          result.status = "FAIL";
          result.messages.push(`Manifest asset id not found: ${target.manifestAssetId}`);
        } else if (!compareSize(assetSize, manifestAsset.size)) {
          result.status = "FAIL";
          result.messages.push(`Manifest size ${JSON.stringify(manifestAsset.size)} conflicts with asset size ${JSON.stringify(assetSize)}`);
        }
      }

      const sprite = normalizeSprite(target.spritePath ? getPath(metadata, target.spritePath) : null);
      if (sprite) {
        const spriteCheck = rectWithin([sprite.x, sprite.y, sprite.w, sprite.h], assetSize[0], assetSize[1]);
        if (!spriteCheck.ok) {
          result.status = "FAIL";
          result.messages.push(`Sprite ${target.spritePath.join(".")} ${spriteCheck.reason}`);
        }
      }

      for (const box of target.boxes || []) {
        const rect = getPath(metadata, box.path);
        const bounds = box.relativeToSprite && sprite ? [sprite.w, sprite.h] : (target.sourceSizePath ? getPath(metadata, target.sourceSizePath) : assetSize);
        const check = rectWithin(rect, bounds?.[0], bounds?.[1]);
        if (!check.ok) {
          result.status = "FAIL";
          result.messages.push(`${box.name} ${check.reason}: ${JSON.stringify(rect)}`);
        }
      }
    }
  }

  if (!result.messages.length) {
    result.messages.push("No metadata conflicts detected.");
  }

  report.results.push(result);
}

for (const result of report.results) {
  report.summary.checked += 1;
  if (result.status === "PASS") report.summary.pass += 1;
  if (result.status === "FAIL") report.summary.fail += 1;
  if (result.status === "TBD") report.summary.tbd += 1;
}

report.ok = report.summary.fail === 0;

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
