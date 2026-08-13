import fs from "node:fs";
import { join } from "node:path";

const manifestFile = "assets/asset-manifest.v0.3.json";
const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8").replace(/^\uFEFF/, ""));

const bossFrames = [
  "chapter_red_flame_right_0.webp",
  "chapter_red_flame_right_1.webp",
  "chapter_red_flame_right_2.webp",
  "chapter_red_flame_left_0.webp",
  "chapter_red_flame_left_1.webp",
  "chapter_red_flame_left_2.webp"
];

function imageSizeWebp(path) {
  const buf = fs.readFileSync(path);
  const riff = buf.toString("ascii", 0, 4);
  const webp = buf.toString("ascii", 8, 12);
  if (riff !== "RIFF" || webp !== "WEBP") return [0, 0];
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    const width = 1 + buf.readUIntLE(24, 3);
    const height = 1 + buf.readUIntLE(27, 3);
    return [width, height];
  }
  return [0, 0];
}

const existing = new Set((manifest.assets || []).map(asset => asset.path));
for (const file of bossFrames) {
  const path = `assets/runtime/webp/bosses/${file}`;
  if (existing.has(path)) continue;
  const fullPath = join(process.cwd(), path);
  manifest.assets.push({
    id: file.replace(/\.webp$/, ""),
    type: "bosses",
    path,
    size: imageSizeWebp(fullPath),
    bytes: fs.statSync(fullPath).size,
    preload: true,
    notes: "Formal chapter Boss validation sprite frame."
  });
}

manifest.assetCount = manifest.assets.length;
manifest.totalBytes = manifest.assets.reduce((sum, asset) => sum + (asset.bytes || 0), 0);

fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + "\n", "utf8");
