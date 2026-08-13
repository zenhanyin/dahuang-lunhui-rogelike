import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const root = process.cwd();
const expectedRuntimeHook = "0.3.4b1-ui-pass2";
const codeFiles = ["src/game.js", "src/config.js", "styles.css", "styles-ui.css", "styles-mobile.css", "index.html"];
const manifestFile = "assets/asset-manifest.v0.3.json";
const mapManifestFiles = [
  "assets/maps/v032_atlas/qingqiu/manifest.json",
  "assets/maps/v032_atlas/qingqiu_seamless/manifest.json",
  "assets/maps/v032_atlas/qingqiu/decals/manifest.json",
  "assets/maps/v033/xuanyuan_ground/manifest.json"
];

const sourceOnlyRoots = [
  "assets/art_direction/",
  "assets/concepts/",
  "assets/generated/",
  "assets/sprites/",
  "assets/ui/"
];

const deployExcludedRoots = [
  ...sourceOnlyRoots,
  "assets/runtime/raw_ai_atlas/",
  "assets/runtime/webp/ui/story_raw/",
  "assets/maps/v032/sword_tomb/",
  "assets/maps/v032/qingqiu/",
  "assets/maps/v032_atlas/sword_tomb/",
  "assets/maps/v032_atlas/sword_tomb_seamless/"
];

const forbiddenRuntimeRefs = [
  "assets/sprites/",
  "assets/ui/",
  "assets/generated/",
  "assets/runtime/raw_ai_atlas/",
  "assets/runtime/webp/ui/story_raw/",
  "assets/maps/v032/sword_tomb/",
  "assets/maps/v032/qingqiu/"
];

function toPosix(file) {
  return file.replaceAll("\\", "/");
}

function bytesAndCount(dir) {
  let bytes = 0;
  let count = 0;
  function walk(current) {
    if (!existsSync(current)) return;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const file = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(file);
      } else if (entry.isFile()) {
        count += 1;
        bytes += statSync(file).size;
      }
    }
  }
  walk(dir);
  return { count, bytes };
}

function collectCodeAssetRefs() {
  const refs = new Set();
  for (const file of codeFiles) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(/assets\/[A-Za-z0-9_./-]+\.(?:webp|png|jpg|jpeg|svg|mp3|wav|ogg|json)/g)) {
      refs.add(match[0]);
    }
  }
  return [...refs].sort();
}

function normalizeManifestAssetRef(value, baseDir) {
  if (value.startsWith("assets/") || value.startsWith("docs/")) return value;

  return toPosix(normalize(join(baseDir, value)));
}

function collectManifestRefs(value, baseDir, refs = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectManifestRefs(item, baseDir, refs);
    return refs;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectManifestRefs(item, baseDir, refs);
    return refs;
  }
  if (typeof value !== "string") return refs;
  if (!/\.(?:webp|png|jpg|jpeg|json)$/i.test(value)) return refs;

  refs.push(normalizeManifestAssetRef(value, baseDir));
  return refs;
}

const game = readFileSync("src/game.js", "utf8");
const css = [
  readFileSync("styles.css", "utf8"),
  readFileSync("styles-ui.css", "utf8"),
  readFileSync("styles-mobile.css", "utf8")
].join("\n");
const manifest = JSON.parse(readFileSync(manifestFile, "utf8").replace(/^\uFEFF/, ""));
const codeRefs = collectCodeAssetRefs();
const missingCodeRefs = codeRefs.filter(file => !existsSync(join(root, file)));

let manifestBytes = 0;
const missingManifestRefs = [];
for (const asset of manifest.assets || []) {
  const file = asset.path;
  if (!existsSync(join(root, file))) {
    missingManifestRefs.push(file);
  } else {
    manifestBytes += statSync(join(root, file)).size;
  }
}

const mapManifestResults = mapManifestFiles.map(file => {
  if (!existsSync(file)) return { file, exists: false, missing: [file] };
  const data = JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  const refs = [...new Set(collectManifestRefs(data, dirname(file)))];
  const missing = refs.filter(ref => !existsSync(join(root, ref)));
  return { file, exists: true, refs: refs.length, missing };
});

const forbiddenRefs = [...new Set(
  [...forbiddenRuntimeRefs.filter(ref => game.includes(ref) || css.includes(ref))]
) ].sort();

const buckets = {
  runtimeWebp: bytesAndCount("assets/runtime/webp"),
  mapV032Atlas: bytesAndCount("assets/maps/v032_atlas"),
  mapV033: bytesAndCount("assets/maps/v033"),
  generated: bytesAndCount("assets/generated"),
  concepts: bytesAndCount("assets/concepts"),
  sprites: bytesAndCount("assets/sprites"),
  audio: bytesAndCount("assets/audio")
};

const result = {
  expectedRuntimeHook,
  manifestVersion: manifest.version,
  manifestAssetCount: manifest.assets?.length ?? 0,
  manifestDeclaredAssetCount: manifest.assetCount,
  manifestDeclaredBytes: manifest.totalBytes,
  manifestActualBytes: manifestBytes,
  codeReferenceCount: codeRefs.length,
  missingCodeRefs,
  missingManifestRefs,
  mapManifestResults,
  forbiddenRefs,
  sourceOnlyRoots,
  deployExcludedRoots,
  buckets,
  ok: manifest.version === expectedRuntimeHook
    && manifest.assetCount === (manifest.assets?.length ?? 0)
    && manifest.totalBytes === manifestBytes
    && missingCodeRefs.length === 0
    && missingManifestRefs.length === 0
    && mapManifestResults.every(item => item.exists && item.missing.length === 0)
    && forbiddenRefs.length === 0
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
