import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const game = readFileSync("src/game.js", "utf8");
const css = readFileSync("styles.css", "utf8");
const checklist = readFileSync("docs/formal-ui-audio-vfx-checklist.md", "utf8");
const runtimeManifest = JSON.parse(readFileSync("assets/asset-manifest.v0.3.json", "utf8").replace(/^\uFEFF/, ""));

const deprecatedRuntimePrefixes = [
  "assets/maps/v032/sword_tomb/",
  "assets/maps/v032/qingqiu/",
  "assets/maps/v032/herb_marsh/",
  "assets/runtime/webp/scene/qingqiu/",
  "assets/runtime/raw_ai_atlas/",
  "assets/runtime/webp/ui/story_raw/"
];

function isDeprecatedRuntimePath(file) {
  return deprecatedRuntimePrefixes.some(prefix => file.startsWith(prefix));
}

const missingRuntimeFiles = runtimeManifest.assets
  .map(asset => asset.path)
  .filter(file => !isDeprecatedRuntimePath(file))
  .filter(file => !existsSync(join(root, file)));

const requiredCssSprites = [
  "assets/runtime/webp/ui/hud_scroll.webp",
  "assets/runtime/webp/ui/mobile_hud_compact.webp",
  "assets/runtime/webp/ui/mobile_controls_atlas.webp",
  "assets/runtime/webp/ui/hud_atlas/hud_controls_atlas.webp",
  "assets/runtime/webp/ui/title_plaque.webp",
  "assets/runtime/webp/ui/lineage_card.webp",
  "assets/runtime/webp/ui/choice_card_frame.webp",
  "assets/runtime/webp/ui/button_continue.webp",
  "assets/runtime/webp/ui/button_minor.webp",
  "assets/runtime/webp/ui/pause_panel.webp",
  "assets/runtime/webp/ui/result_panel.webp",
  "assets/runtime/webp/ui/story/story_panel_art.webp",
  "assets/runtime/webp/ui/hp_bar.webp",
  "assets/runtime/webp/ui/xp_bar.webp"
];
const missingCssRefs = requiredCssSprites.filter(file => !css.includes(file));

const requiredRuntimeAssets = [
  "assets/maps/wilds-runtime.webp",
  "assets/maps/v032/wilderness/ground_a.webp",
  "assets/maps/v032/wilderness/event_memory_stele.webp",
  "assets/maps/v032_atlas/qingqiu_seamless/tile_qingqiu_base_final_01.webp",
  "assets/maps/v032_atlas/qingqiu/events/event_qingqiu_foxfire_vow_idle.webp",
  "assets/maps/v033/xuanyuan_ground/base_tiles/tile_xuanyuan_ground_base_v033j2_01.webp",
  "assets/maps/v033/xuanyuan_ground/base_tiles/tile_xuanyuan_ground_base_v033j2_02.webp",
  "assets/maps/v033/xuanyuan_ground/base_tiles/tile_xuanyuan_ground_base_v033j2_03.webp",
  "assets/maps/v033/xuanyuan_ground/base_tiles/tile_xuanyuan_ground_base_v033j2_04.webp",
  "assets/maps/v033/xuanyuan_ground/events/event_xuanyuan_stone_disk_v033e_idle.webp",
  "assets/maps/v033/xuanyuan_ground/events/event_xuanyuan_stone_disk_v033e_ready.webp",
  "assets/maps/v033/xuanyuan_ground/events/event_xuanyuan_stone_disk_v033e_done.webp",
  "assets/maps/v032_atlas/herb_marsh_seamless/tile_herb_marsh_base_final_01.webp",
  "assets/maps/v032_atlas/herb_marsh/events/event_herb_marsh_herb_cauldron_idle.webp",
  "assets/runtime/webp/ui/hud_scroll.webp",
  "assets/runtime/webp/ui/hud_atlas/hud_controls_atlas.webp",
  "assets/runtime/webp/ui/lineage_card.webp",
  "assets/runtime/webp/ui/choice_card_frame.webp",
  "assets/runtime/webp/ui/story/story_panel_art.webp"
];
const missingRequiredRuntimeAssets = requiredRuntimeAssets.filter(file => !existsSync(join(root, file)));

const forbiddenRuntimePrototypeRefs = [
  "assets/sprites/characters/",
  "assets/sprites/enemies/",
  "assets/sprites/terrain/",
  "assets/ui/icons/"
].filter(ref => game.includes(ref));

const forbiddenCssPrototypeRefs = [
  "assets/ui/atlas-v1/",
  "assets/generated/runtime-webp/ui/",
  "assets/ui/icons/",
  "assets/runtime/webp/ui/nineslice/",
  "assets/runtime/webp/ui/icons/attr_",
  "assets/runtime/webp/ui/pause_seal.webp",
  "assets/runtime/webp/ui/godpower_medallion.webp"
].filter(ref => css.includes(ref));

const forbiddenRuntimeLegacyRefs = [
  "assets/maps/v032/sword_tomb/",
  "assets/maps/v032/qingqiu/",
  "assets/maps/v032/herb_marsh/",
  "assets/runtime/webp/scene/qingqiu/",
  "assets/runtime/raw_ai_atlas/",
  "assets/runtime/webp/ui/story_raw/"
].filter(ref => game.includes(ref) || css.includes(ref) || checklist.includes(ref));

const requiredGameHooks = [
  "drawEffect",
  "playSound",
  "startMusic",
  "dashPlayer",
  "pauseOverlay",
  "touchStick",
  "visibleMapFeatures",
  "drawSceneDecals",
  "0.3.3j-3g-safe-area-corrections"
];
const missingHooks = requiredGameHooks.filter(hook => !game.includes(hook) && !css.includes(hook));

const forbiddenRuntimeAssetIds = runtimeManifest.assets
  .filter(asset => !isDeprecatedRuntimePath(asset.path))
  .map(asset => asset.id)
  .filter(id => id.startsWith("shadow_") || id.startsWith("ground_") || id.startsWith("attr_") || id.endsWith("_9") || id === "pause_seal" || id === "godpower_medallion");

const styleKeywords = ["Dunhuang", "mineral", "cinnabar", "jade", "bronze", "lotus"];
const missingChecklistKeywords = styleKeywords.filter(keyword => !checklist.includes(keyword));

const result = {
  runtimeVersion: runtimeManifest.version,
  runtimeAssetCount: runtimeManifest.assetCount,
  runtimeTotalBytes: runtimeManifest.totalBytes,
  missingRuntimeFiles,
  missingRequiredRuntimeAssets,
  missingCssRefs,
  forbiddenRuntimePrototypeRefs,
  forbiddenCssPrototypeRefs,
  forbiddenRuntimeLegacyRefs,
  forbiddenRuntimeAssetIds,
  missingHooks,
  missingChecklistKeywords,
  ok: game.includes("0.3.3j-3g-safe-area-corrections") &&
    runtimeManifest.assetCount >= 70 &&
    runtimeManifest.totalBytes < 2_200_000 &&
    missingRuntimeFiles.length === 0 &&
    missingRequiredRuntimeAssets.length === 0 &&
    missingCssRefs.length === 0 &&
    forbiddenRuntimePrototypeRefs.length === 0 &&
    forbiddenCssPrototypeRefs.length === 0 &&
    forbiddenRuntimeLegacyRefs.length === 0 &&
    forbiddenRuntimeAssetIds.length === 0 &&
    missingHooks.length === 0 &&
    missingChecklistKeywords.length === 0
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);

