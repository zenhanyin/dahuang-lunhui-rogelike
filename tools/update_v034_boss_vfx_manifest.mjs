import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "assets", "asset-manifest.v0.3.json");
const files = [
  "vfx_boss_entry.webp",
  "vfx_boss_rupture_warning.webp",
  "vfx_boss_rupture_burst.webp",
  "vfx_boss_shockwave.webp",
  "vfx_boss_phase_flare.webp",
  "vfx_boss_death.webp"
];

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.version = "0.3.4a-5-boss-formal-vfx";
if (manifest.budget) manifest.budget.runtimeHook = "0.3.4a-5-boss-formal-vfx";
else manifest.runtimeHook = "0.3.4a-5-boss-formal-vfx";

const byId = new Map(manifest.assets.map((asset, index) => [asset.id, index]));
for (const file of files) {
  const id = file.replace(/^vfx_/, "").replace(/\.webp$/, "");
  const relPath = `assets/runtime/webp/vfx/dunhuang/${file}`;
  const absPath = path.join(root, relPath);
  const stats = fs.statSync(absPath);
  const asset = {
    id,
    type: "vfx",
    path: relPath,
    bytes: stats.size,
    format: "webp",
    runtime: true,
    preload: true,
    notes: "Boss formal VFX atlas for chapter entry, rupture, phase and death feedback."
  };
  if (byId.has(id)) manifest.assets[byId.get(id)] = asset;
  else manifest.assets.push(asset);
}

manifest.assetCount = manifest.assets.length;
manifest.totalBytes = manifest.assets.reduce((sum, asset) => sum + (asset.bytes || 0), 0);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(JSON.stringify({
  version: manifest.version,
  assetCount: manifest.assetCount,
  totalBytes: manifest.totalBytes
}, null, 2));
