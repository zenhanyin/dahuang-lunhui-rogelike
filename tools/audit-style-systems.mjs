import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const game = readFileSync("src/game.js", "utf8");
const css = readFileSync("styles.css", "utf8");
const checklist = readFileSync("docs/formal-ui-audio-vfx-checklist.md", "utf8");
const runtimeManifest = JSON.parse(readFileSync("assets/asset-manifest.v0.3.json", "utf8").replace(/^\uFEFF/, ""));

const missingRuntimeFiles = runtimeManifest.assets
  .map(asset => asset.path)
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
  "assets/maps/qingqiu-runtime.webp",
  "assets/maps/v032/sword_tomb/ground_a.webp",
  "assets/maps/v032/qingqiu/ground_a.webp",
  "assets/maps/v032/herb_marsh/ground_a.webp",
  "assets/maps/v032/wilderness/ground_a.webp",
  "assets/maps/v032/sword_tomb/event_broken_sword.webp",
  "assets/maps/v032/qingqiu/event_foxfire_vow.webp",
  "assets/maps/v032/herb_marsh/event_herb_cauldron.webp",
  "assets/maps/v032/wilderness/event_memory_stele.webp",
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

const requiredGameHooks = [
  "drawEffect",
  "playSound",
  "startMusic",
  "dashPlayer",
  "pauseOverlay",
  "touchStick",
  "visibleMapFeatures",
  "drawSceneDecals",
  "ASSET_VERSION = \"0.3.2b-ui-point-feedback\""
];
const missingHooks = requiredGameHooks.filter(hook => !game.includes(hook) && !css.includes(hook));

const forbiddenRuntimeAssetIds = runtimeManifest.assets
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
  forbiddenRuntimeAssetIds,
  missingHooks,
  missingChecklistKeywords,
  ok: runtimeManifest.version === "0.3.2-scene-map" &&
    runtimeManifest.assetCount >= 90 &&
    runtimeManifest.totalBytes < 2_200_000 &&
    missingRuntimeFiles.length === 0 &&
    missingRequiredRuntimeAssets.length === 0 &&
    missingCssRefs.length === 0 &&
    forbiddenRuntimePrototypeRefs.length === 0 &&
    forbiddenCssPrototypeRefs.length === 0 &&
    forbiddenRuntimeAssetIds.length === 0 &&
    missingHooks.length === 0 &&
    missingChecklistKeywords.length === 0
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);

