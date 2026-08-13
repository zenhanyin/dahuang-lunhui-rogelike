import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const game = readFileSync("src/game.js", "utf8");
const baseCss = readFileSync("styles.css", "utf8");
const formalUiCss = readFileSync("styles-ui.css", "utf8");
const mobileCss = readFileSync("styles-mobile.css", "utf8");
const css = [
  baseCss,
  formalUiCss,
  mobileCss
].join("\n");
const checklist = readFileSync("docs/formal-ui-audio-vfx-checklist.md", "utf8");
const runtimeManifest = JSON.parse(readFileSync("assets/asset-manifest.v0.3.json", "utf8").replace(/^\uFEFF/, ""));
const expectedRuntimeHook = "0.3.4b1-ui-pass2";

const deprecatedRuntimePrefixes = [
  "assets/maps/v032/sword_tomb/",
  "assets/maps/v032/qingqiu/",
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
  "assets/runtime/webp/ui/formal_v034b1/hud_panel_pc.webp",
  "assets/runtime/webp/ui/formal_v034b1/ui_runtime_atlas.webp",
  "assets/runtime/webp/ui/mobile_hud_compact.webp",
  "assets/runtime/webp/ui/mobile_controls_atlas.webp",
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
  "assets/runtime/webp/ui/formal_v034b1/hud_panel_pc.webp",
  "assets/runtime/webp/ui/formal_v034b1/ui_runtime_atlas.webp",
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
  expectedRuntimeHook
];
const missingHooks = requiredGameHooks.filter(hook => !game.includes(hook) && !css.includes(hook));

const forbiddenRuntimeAssetIds = runtimeManifest.assets
  .filter(asset => !isDeprecatedRuntimePath(asset.path))
  .map(asset => asset.id)
  .filter(id => id.startsWith("shadow_") || id.startsWith("ground_") || id.startsWith("attr_") || id.endsWith("_9") || id === "pause_seal" || id === "godpower_medallion");

const styleKeywords = ["Dunhuang", "mineral", "cinnabar", "jade", "bronze", "lotus"];
const missingChecklistKeywords = styleKeywords.filter(keyword => !checklist.includes(keyword));
const forbiddenBaseUiPatterns = [
  /^#hud\b/m,
  /^\.mobile-status\b/m,
  /^\.top-counters\b/m,
  /^\.touch-stick\b/m,
  /^\.skill-dock\b/m,
  /^\.overlay\b/m,
  /^\.panel\b/m,
  /^\.start-panel\b/m,
  /^\.choice\b/m,
  /^\.lineage\b/m,
  /^\.story-panel\b/m,
  /^\.pause-panel\b/m,
  /^\.result-panel\b/m,
  /^\.resource-pill\b/m,
  /^\.level-overlay\b/m,
  /^\.choice-panel\b/m,
  /^\.choice-list\b/m,
  /^@media\s+\(max-width:\s*760px\)/m
];
const forbiddenBaseUiSelectors = forbiddenBaseUiPatterns
  .filter(pattern => pattern.test(baseCss))
  .map(pattern => pattern.source);
const forbiddenFormalUiMobileMedia = [
  "@media (max-width: 700px) and (orientation: portrait)",
  "@media (max-width: 760px), (orientation: portrait)"
].filter(ref => formalUiCss.includes(ref));
const uiAuthorityChecks = {
  baseRemovedHistoricalPatches: !baseCss.includes("V0.3.2b: formal UI close pass")
    && !baseCss.includes("V0.3.3j-2: mobile option flow")
    && !baseCss.includes("V0.3.3k: portrait start confirmation")
    && baseCss.includes("0.3.3i-base-only")
    && forbiddenBaseUiSelectors.length === 0,
  formalUiAuthorityLoaded: formalUiCss.includes("0.3.3l-formal-ui-authority")
    && formalUiCss.includes(expectedRuntimeHook)
    && formalUiCss.includes(".start-panel .lineage")
    && formalUiCss.includes(".level-overlay .choice")
    && formalUiCss.includes(".story-panel h2")
    && forbiddenFormalUiMobileMedia.length === 0,
  mobileAuthorityLoaded: mobileCss.includes("0.3.4b1-mobile-safe")
    && mobileCss.includes("#hud")
    && mobileCss.includes("#mobileHud")
    && mobileCss.includes(".start-panel #startBtn")
    && mobileCss.includes(".level-overlay .choice")
};

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
  forbiddenBaseUiSelectors,
  forbiddenFormalUiMobileMedia,
  missingHooks,
  missingChecklistKeywords,
  uiAuthorityChecks,
  ok: (game.includes(expectedRuntimeHook) || css.includes(expectedRuntimeHook)) &&
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
    missingChecklistKeywords.length === 0 &&
    Object.values(uiAuthorityChecks).every(Boolean)
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);

