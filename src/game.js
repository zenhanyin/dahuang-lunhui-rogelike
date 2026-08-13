const CONFIG = window.DAHUANG_CONFIG;
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true }) || canvas.getContext("2d");

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
  buildQuickBtn: document.getElementById("buildQuickBtn"),
  buildQuickText: document.getElementById("buildQuickText"),
  chapterAlert: document.getElementById("chapterAlert"),
  chapterAlertTitle: document.getElementById("chapterAlertTitle"),
  chapterAlertText: document.getElementById("chapterAlertText"),
  bossFrame: document.getElementById("bossFrame"),
  bossNameText: document.getElementById("bossNameText"),
  bossPhaseText: document.getElementById("bossPhaseText"),
  bossHpBar: document.getElementById("bossHpBar"),
  dockLevelText: document.getElementById("dockLevelText"),
  mobileHud: document.getElementById("mobileHud"),
  mobileHpText: document.getElementById("mobileHpText"),
  mobileHpBar: document.getElementById("mobileHpBar"),
  mobileXpText: document.getElementById("mobileXpText"),
  mobileXpBar: document.getElementById("mobileXpBar"),
  mobileLevelText: document.getElementById("mobileLevelText"),
  mobileLineageText: document.getElementById("mobileLineageText"),
  mobileTimeText: document.getElementById("mobileTimeText"),
  mobileKillText: document.getElementById("mobileKillText"),
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
  storySpeaker: document.getElementById("storySpeaker"),
  storyPortrait: document.getElementById("storyPortrait"),
  storyChoiceBtn: document.getElementById("storyChoiceBtn"),
  pauseOverlay: document.getElementById("pauseOverlay"),
  buildOverlay: document.getElementById("buildOverlay"),
  buildLedger: document.getElementById("buildLedger"),
  gameOver: document.getElementById("gameOver"),
  resultText: document.getElementById("resultText"),
  resultBuildSummary: document.getElementById("resultBuildSummary"),
  metaPointText: document.getElementById("metaPointText"),
  restartBtn: document.getElementById("restartBtn")
};

const keys = new Set();
const TAU = Math.PI * 2;
function playableLineages() {
  return CONFIG.lineages.filter(lineage => !lineage.hidden);
}

let selectedLineage = playableLineages()[0] || CONFIG.lineages[0];
let state;
let lastTime = 0;
let audioCtx;
let audioBudget = {};
let musicNodes;
let screenShake = 0;
const touchMove = { active: false, id: null, originX: 0, originY: 0, dx: 0, dy: 0 };
const touchStickKnob = ui.touchStick?.firstElementChild || null;
const domTextCache = new WeakMap();
const domWidthCache = new WeakMap();
let lastUiSync = 0;
let resizeQueued = false;
const UI_SYNC_INTERVAL = 90;

const RUNTIME_ASSET_ROOT = "assets/runtime/webp";
const ASSET_VERSION = "0.3.4b1-ui-pass2";
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
    witch_left_3: `${RUNTIME_ASSET_ROOT}/characters/witch_left_3.webp`
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
    elite_left_2: `${RUNTIME_ASSET_ROOT}/enemies/elite_left_2.webp`,
    blade_thrall_right_0: `${RUNTIME_ASSET_ROOT}/enemies/blade_thrall_right_0.webp`,
    blade_thrall_right_1: `${RUNTIME_ASSET_ROOT}/enemies/blade_thrall_right_1.webp`,
    blade_thrall_right_2: `${RUNTIME_ASSET_ROOT}/enemies/blade_thrall_right_2.webp`,
    blade_thrall_left_0: `${RUNTIME_ASSET_ROOT}/enemies/blade_thrall_left_0.webp`,
    blade_thrall_left_1: `${RUNTIME_ASSET_ROOT}/enemies/blade_thrall_left_1.webp`,
    blade_thrall_left_2: `${RUNTIME_ASSET_ROOT}/enemies/blade_thrall_left_2.webp`,
    foxshade_right_0: `${RUNTIME_ASSET_ROOT}/enemies/foxshade_right_0.webp`,
    foxshade_right_1: `${RUNTIME_ASSET_ROOT}/enemies/foxshade_right_1.webp`,
    foxshade_right_2: `${RUNTIME_ASSET_ROOT}/enemies/foxshade_right_2.webp`,
    foxshade_left_0: `${RUNTIME_ASSET_ROOT}/enemies/foxshade_left_0.webp`,
    foxshade_left_1: `${RUNTIME_ASSET_ROOT}/enemies/foxshade_left_1.webp`,
    foxshade_left_2: `${RUNTIME_ASSET_ROOT}/enemies/foxshade_left_2.webp`,
    stone_imp_right_0: `${RUNTIME_ASSET_ROOT}/enemies/stone_imp_right_0.webp`,
    stone_imp_right_1: `${RUNTIME_ASSET_ROOT}/enemies/stone_imp_right_1.webp`,
    stone_imp_right_2: `${RUNTIME_ASSET_ROOT}/enemies/stone_imp_right_2.webp`,
    stone_imp_left_0: `${RUNTIME_ASSET_ROOT}/enemies/stone_imp_left_0.webp`,
    stone_imp_left_1: `${RUNTIME_ASSET_ROOT}/enemies/stone_imp_left_1.webp`,
    stone_imp_left_2: `${RUNTIME_ASSET_ROOT}/enemies/stone_imp_left_2.webp`,
    cinnabar_guard_right_0: `${RUNTIME_ASSET_ROOT}/enemies/cinnabar_guard_right_0.webp`,
    cinnabar_guard_right_1: `${RUNTIME_ASSET_ROOT}/enemies/cinnabar_guard_right_1.webp`,
    cinnabar_guard_right_2: `${RUNTIME_ASSET_ROOT}/enemies/cinnabar_guard_right_2.webp`,
    cinnabar_guard_left_0: `${RUNTIME_ASSET_ROOT}/enemies/cinnabar_guard_left_0.webp`,
    cinnabar_guard_left_1: `${RUNTIME_ASSET_ROOT}/enemies/cinnabar_guard_left_1.webp`,
    cinnabar_guard_left_2: `${RUNTIME_ASSET_ROOT}/enemies/cinnabar_guard_left_2.webp`,
    chapter_red_flame_right_0: `${RUNTIME_ASSET_ROOT}/bosses/chapter_red_flame_right_0.webp`,
    chapter_red_flame_right_1: `${RUNTIME_ASSET_ROOT}/bosses/chapter_red_flame_right_1.webp`,
    chapter_red_flame_right_2: `${RUNTIME_ASSET_ROOT}/bosses/chapter_red_flame_right_2.webp`,
    chapter_red_flame_left_0: `${RUNTIME_ASSET_ROOT}/bosses/chapter_red_flame_left_0.webp`,
    chapter_red_flame_left_1: `${RUNTIME_ASSET_ROOT}/bosses/chapter_red_flame_left_1.webp`,
    chapter_red_flame_left_2: `${RUNTIME_ASSET_ROOT}/bosses/chapter_red_flame_left_2.webp`
  },
  skills: {
    sword: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_sword.webp`,
    talisman: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_talisman.webp`
  },
  vfx: {
    sword_projectile: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_sword_projectile.webp`,
    sword_slash: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_sword_slash.webp`,
    talisman_projectile: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_talisman_projectile.webp`,
    talisman_impact: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_talisman_impact.webp`,
    fire_explosion: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_fire_explosion.webp`,
    fire_ground_bloom: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_fire_ground_bloom.webp`,
    phantom_mist_ring: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_phantom_mist_ring.webp`,
    dash_wind_trail: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_dash_wind_trail.webp`,
    pickup_orb_burst: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_pickup_orb_burst.webp`,
    level_lotus_burst: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_level_lotus_burst.webp`,
    hit_spark: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_hit_spark.webp`,
    kill_bloom: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_kill_bloom.webp`,
    boss_entry: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_boss_entry.webp`,
    boss_rupture_warning: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_boss_rupture_warning.webp`,
    boss_rupture_burst: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_boss_rupture_burst.webp`,
    boss_shockwave: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_boss_shockwave.webp`,
    boss_phase_flare: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_boss_phase_flare.webp`,
    boss_death: `${RUNTIME_ASSET_ROOT}/vfx/dunhuang/vfx_boss_death.webp`
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
    wilderness: `assets/maps/v032/wilderness/ground_a.webp`
  },
  mapTiles: {
    qingqiu_base_final_01: `assets/maps/v032_atlas/qingqiu_seamless/tile_qingqiu_base_final_01.webp`,
    qingqiu_base_final_02: `assets/maps/v032_atlas/qingqiu_seamless/tile_qingqiu_base_final_02.webp`,
    qingqiu_base_final_03: `assets/maps/v032_atlas/qingqiu_seamless/tile_qingqiu_base_final_03.webp`,
    qingqiu_base_final_04: `assets/maps/v032_atlas/qingqiu_seamless/tile_qingqiu_base_final_04.webp`,
    xuanyuan_ground_base_final_01: `assets/maps/v033/xuanyuan_ground/base_tiles/tile_xuanyuan_ground_base_v033j2_01.webp`,
    xuanyuan_ground_base_final_02: `assets/maps/v033/xuanyuan_ground/base_tiles/tile_xuanyuan_ground_base_v033j2_02.webp`,
    xuanyuan_ground_base_final_03: `assets/maps/v033/xuanyuan_ground/base_tiles/tile_xuanyuan_ground_base_v033j2_03.webp`,
    xuanyuan_ground_base_final_04: `assets/maps/v033/xuanyuan_ground/base_tiles/tile_xuanyuan_ground_base_v033j2_04.webp`
  },
  scene: {
    decal_qingqiu_old_vow_trace_01: `assets/maps/v032_atlas/qingqiu/decals/decal_qingqiu_old_vow_trace_01.webp`,
    decal_qingqiu_old_vow_trace_02: `assets/maps/v032_atlas/qingqiu/decals/decal_qingqiu_old_vow_trace_02.webp`,
    decal_qingqiu_ink_teal_vein_01: `assets/maps/v032_atlas/qingqiu/decals/decal_qingqiu_ink_teal_vein_01.webp`,
    decal_qingqiu_gold_mural_lines_01: `assets/maps/v032_atlas/qingqiu/decals/decal_qingqiu_gold_mural_lines_01.webp`,
    decal_qingqiu_ink_teal_vein_ai_01: `assets/maps/v032_atlas/qingqiu/decals/decal_qingqiu_ink_teal_vein_ai_01.webp`,
    decal_qingqiu_gold_mural_lines_ai_01: `assets/maps/v032_atlas/qingqiu/decals/decal_qingqiu_gold_mural_lines_ai_01.webp`,
    decal_qingqiu_old_vow_trace_ai_02: `assets/maps/v032_atlas/qingqiu/decals/decal_qingqiu_old_vow_trace_ai_02.webp`,
    decal_qingqiu_ink_teal_vein_ai_02: `assets/maps/v032_atlas/qingqiu/decals/decal_qingqiu_ink_teal_vein_ai_02.webp`,
    decal_qingqiu_gold_mural_lines_ai_02: `assets/maps/v032_atlas/qingqiu/decals/decal_qingqiu_gold_mural_lines_ai_02.webp`,
    decal_qingqiu_old_vow_trace_ai_03: `assets/maps/v032_atlas/qingqiu/decals/decal_qingqiu_old_vow_trace_ai_03.webp`,
    decal_xuanyuan_sword_trace_v033e_01: `assets/maps/v033/xuanyuan_ground/decals/decal_xuanyuan_sword_trace_v033e_01.webp`,
    decal_xuanyuan_sword_trace_v033e_02: `assets/maps/v033/xuanyuan_ground/decals/decal_xuanyuan_sword_trace_v033e_02.webp`,
    decal_xuanyuan_cloud_line_v033e_01: `assets/maps/v033/xuanyuan_ground/decals/decal_xuanyuan_cloud_line_v033e_01.webp`,
    decal_xuanyuan_array_disk_v033e_01: `assets/maps/v033/xuanyuan_ground/decals/decal_xuanyuan_array_disk_v033e_01.webp`,
    decal_xuanyuan_cinnabar_trace_v033e_01: `assets/maps/v033/xuanyuan_ground/decals/decal_xuanyuan_cinnabar_trace_v033e_01.webp`,
    decal_xuanyuan_bronze_oxidation_v033e_01: `assets/maps/v033/xuanyuan_ground/decals/decal_xuanyuan_bronze_oxidation_v033e_01.webp`,
    decal_xuanyuan_detail_cracks_a_v033g_01: `assets/maps/v033/xuanyuan_ground/decals/decal_xuanyuan_detail_cracks_a_v033g_01.webp`,
    decal_xuanyuan_detail_cracks_b_v033g_01: `assets/maps/v033/xuanyuan_ground/decals/decal_xuanyuan_detail_cracks_b_v033g_01.webp`,
    decal_xuanyuan_detail_cloud_fresco_a_v033g_01: `assets/maps/v033/xuanyuan_ground/decals/decal_xuanyuan_detail_cloud_fresco_a_v033g_01.webp`,
    decal_xuanyuan_detail_cloud_fresco_b_v033g_01: `assets/maps/v033/xuanyuan_ground/decals/decal_xuanyuan_detail_cloud_fresco_b_v033g_01.webp`,
    decal_xuanyuan_detail_sword_engraving_a_v033g_01: `assets/maps/v033/xuanyuan_ground/decals/decal_xuanyuan_detail_sword_engraving_a_v033g_01.webp`,
    decal_xuanyuan_detail_sword_engraving_b_v033g_01: `assets/maps/v033/xuanyuan_ground/decals/decal_xuanyuan_detail_sword_engraving_b_v033g_01.webp`,
    decal_xuanyuan_detail_bronze_oxidation_a_v033g_01: `assets/maps/v033/xuanyuan_ground/decals/decal_xuanyuan_detail_bronze_oxidation_a_v033g_01.webp`,
    decal_xuanyuan_detail_cinnabar_scrape_a_v033g_01: `assets/maps/v033/xuanyuan_ground/decals/decal_xuanyuan_detail_cinnabar_scrape_a_v033g_01.webp`,
    wilderness_transition_1: `assets/maps/v032/wilderness/transition_1.webp`,
    wilderness_transition_2: `assets/maps/v032/wilderness/transition_2.webp`,
    wilderness_transition_3: `assets/maps/v032/wilderness/transition_3.webp`
  },
  sceneEvents: {
    foxfireVowIdle: `assets/maps/v032_atlas/qingqiu/events/event_qingqiu_foxfire_vow_idle.webp`,
    foxfireVowReady: `assets/maps/v032_atlas/qingqiu/events/event_qingqiu_foxfire_vow_ready.webp`,
    foxfireVowDone: `assets/maps/v032_atlas/qingqiu/events/event_qingqiu_foxfire_vow_done.webp`,
    oldVowSteleIdle: `assets/maps/v032_atlas/qingqiu/events/event_qingqiu_old_vow_stele_idle.webp`,
    oldVowSteleReady: `assets/maps/v032_atlas/qingqiu/events/event_qingqiu_old_vow_stele_ready.webp`,
    oldVowSteleDone: `assets/maps/v032_atlas/qingqiu/events/event_qingqiu_old_vow_stele_done.webp`,
    storyUnderIdle: `assets/maps/v032_atlas/qingqiu/events/event_marker_under_idle.webp`,
    storyUnderReady: `assets/maps/v032_atlas/qingqiu/events/event_marker_under_ready.webp`,
    storyUnderDone: `assets/maps/v032_atlas/qingqiu/events/event_marker_under_done.webp`,
    storyBadgeIdle: `assets/maps/v032_atlas/qingqiu/events/event_marker_badge_idle.webp`,
    storyBadgeReady: `assets/maps/v032_atlas/qingqiu/events/event_marker_badge_ready.webp`,
    storyBadgeDone: `assets/maps/v032_atlas/qingqiu/events/event_marker_badge_done.webp`,
    storyPromptReady: `assets/maps/v032_atlas/qingqiu/events/event_marker_prompt_ready.webp`,
    xuanyuanStoneDiskIdle: `assets/maps/v033/xuanyuan_ground/events/event_xuanyuan_stone_disk_v033j_idle.webp`,
    xuanyuanStoneDiskReady: `assets/maps/v033/xuanyuan_ground/events/event_xuanyuan_stone_disk_v033j_ready.webp`,
    xuanyuanStoneDiskDone: `assets/maps/v033/xuanyuan_ground/events/event_xuanyuan_stone_disk_v033j_done.webp`,
    memoryStele: `assets/maps/v032/wilderness/event_memory_stele.webp`
  },
  sceneProps: {
    xuanyuan_buried_sword_grass_v033e_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_buried_sword_grass_v033e_0.webp`,
    xuanyuan_broken_array_stone_v033e_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_broken_array_stone_v033e_0.webp`,
    xuanyuan_low_oath_base_v033e_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_low_oath_base_v033e_0.webp`,
    xuanyuan_cloth_trace_v033e_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_cloth_trace_v033e_0.webp`,
    xuanyuan_sword_scatter_v033e_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_sword_scatter_v033e_0.webp`,
    xuanyuan_bronze_fragment_v033e_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_bronze_fragment_v033e_0.webp`,
    xuanyuan_buried_sword_grass_v033f_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_buried_sword_grass_v033f_0.webp`,
    xuanyuan_sword_cluster_v033f_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_sword_cluster_v033f_0.webp`,
    xuanyuan_cracked_stone_disk_v033f_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_cracked_stone_disk_v033f_0.webp`,
    xuanyuan_bronze_mural_shard_v033f_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_bronze_mural_shard_v033f_0.webp`,
    xuanyuan_cinnabar_oath_cloth_v033f_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_cinnabar_oath_cloth_v033f_0.webp`,
    xuanyuan_collapsed_ritual_base_v033f_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_collapsed_ritual_base_v033f_0.webp`,
    xuanyuan_inscription_slab_v033f_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_inscription_slab_v033f_0.webp`,
    xuanyuan_low_array_ring_v033f_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_low_array_ring_v033f_0.webp`,
    xuanyuan_dry_grass_clump_v033f_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_dry_grass_clump_v033f_0.webp`,
    xuanyuan_broken_scabbard_v033f_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_broken_scabbard_v033f_0.webp`,
    xuanyuan_cloud_mural_shard_v033f_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_cloud_mural_shard_v033f_0.webp`,
    xuanyuan_battlefield_rubble_v033f_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_battlefield_rubble_v033f_0.webp`,
    xuanyuan_sword_trace_low_v033j_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_sword_trace_low_v033j_0.webp`,
    xuanyuan_broken_ring_low_v033j_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_broken_ring_low_v033j_0.webp`,
    xuanyuan_cinnabar_scrape_low_v033j_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_cinnabar_scrape_low_v033j_0.webp`,
    xuanyuan_dry_grass_low_v033j_0: `assets/maps/v033/xuanyuan_ground/props/prop_xuanyuan_dry_grass_low_v033j_0.webp`
  },
  qingqiuProps: {
    foxfire_small_0: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_foxfire_small_0.webp`,
    foxfire_small_1: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_foxfire_small_1.webp`,
    foxfire_small_2: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_foxfire_small_2.webp`,
    foxfire_small_3: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_foxfire_small_3.webp`,
    foxfire_medium_0: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_foxfire_medium_0.webp`,
    foxfire_medium_1: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_foxfire_medium_1.webp`,
    foxfire_medium_2: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_foxfire_medium_2.webp`,
    foxfire_medium_3: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_foxfire_medium_3.webp`,
    foxfire_cluster_0: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_foxfire_cluster_0.webp`,
    foxfire_cluster_1: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_foxfire_cluster_1.webp`,
    foxfire_cluster_2: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_foxfire_cluster_2.webp`,
    foxfire_cluster_3: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_foxfire_cluster_3.webp`,
    grass_low_0: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_grass_low_0.webp`,
    grass_low_1: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_grass_low_1.webp`,
    grass_low_2: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_grass_low_2.webp`,
    grass_low_3: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_grass_low_3.webp`,
    grass_low_4: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_grass_low_4.webp`,
    fox_mask_shard_0: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_fox_mask_shard_0.webp`,
    fox_mask_shard_1: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_fox_mask_shard_1.webp`,
    fox_mask_shard_2: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_fox_mask_shard_2.webp`,
    ground_ribbon_0: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_ground_ribbon_0.webp`,
    ground_ribbon_1: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_ground_ribbon_1.webp`,
    ground_ribbon_2: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_ground_ribbon_2.webp`,
    ground_ribbon_3: `assets/maps/v032_atlas/qingqiu/props/prop_qingqiu_ground_ribbon_3.webp`
  },
  formalUi: {
    atlas: `${RUNTIME_ASSET_ROOT}/ui/formal_v034b1/ui_runtime_atlas.webp`
  },
  uiIcons: {
    sword: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_sword.webp`,
    talisman: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_talisman.webp`,
    flame: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_flame.webp`,
    phantom: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_mist.webp`,
    wind: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_speed.webp`,
    earth: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_shield.webp`,
    arrow: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_sword.webp`,
    core: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_burst.webp`,
    mark: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_sword.webp`,
    rune: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_talisman.webp`,
    mist: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_mist.webp`,
    split: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_talisman.webp`,
    lotus: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_heal.webp`,
    cloud: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_flame.webp`,
    heal: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_heal.webp`,
    clue: `${RUNTIME_ASSET_ROOT}/ui/icons/formal/icon_clue.webp`
  }
};

const assets = {};
const FORMAL_UI_SPRITES = {
  bossNamePlaque: [312, 92, 392, 74],
  bossBarTrack: [312, 176, 358, 18],
  bossBarFill: [312, 202, 358, 18],
  enemyHpTrack: [720, 96, 88, 12],
  enemyHpFill: [720, 116, 88, 12],
  eliteHpFill: [720, 136, 88, 12],
  bossHpFillSmall: [720, 156, 118, 14],
  storyMarkerIdleHalo: [344, 240, 150, 94],
  storyMarkerReadyHalo: [504, 240, 172, 104],
  storyMarkerDoneHalo: [688, 240, 132, 84]
};

function loadAssets() {
  for (const [group, entries] of Object.entries(ASSET_PATHS)) {
    assets[group] = {};
    for (const [key, src] of Object.entries(entries)) {
      const img = new Image();
      img.decoding = "async";
      img.src = `${src}?v=${ASSET_VERSION}`;
      if (img.decode) img.decode().catch(() => {});
      assets[group][key] = img;
    }
  }
}

function setText(el, value) {
  if (!el) return;
  const next = String(value);
  if (domTextCache.get(el) === next) return;
  domTextCache.set(el, next);
  el.textContent = next;
}

function setWidth(el, ratio) {
  if (!el) return;
  const next = `${Math.max(0, Math.min(100, ratio * 100)).toFixed(2)}%`;
  if (domWidthCache.get(el) === next) return;
  domWidthCache.set(el, next);
  el.style.width = next;
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

function drawFormalUiSprite(name, x, y, w, h, options = {}) {
  const img = assets.formalUi?.atlas;
  const sprite = FORMAL_UI_SPRITES[name];
  if (!img || !sprite || !img.complete) return false;
  const { rotate = 0, alpha = 1, anchorY = 0.5, clipRatio = 1 } = options;
  const [sx, sy, sw, sh] = sprite;
  const ratio = Math.max(0, Math.min(1, clipRatio));
  if (ratio <= 0) return false;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(rotate);
  ctx.drawImage(img, sx, sy, sw * ratio, sh, -w / 2, -h * anchorY, w * ratio, h);
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

function drawVfxAsset(key, x, y, radius, options = {}) {
  const { rotate = 0, alpha = 1, w = 2.8, h = 1.8, anchorY = 0.5 } = options;
  return drawAsset("vfx", key, x, y, radius * w, radius * h, { rotate, alpha, anchorY });
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
  oldVowTrace: 0.3,
  inkTealVein: 0.28,
  goldMuralLine: 0.24,
  sceneCrack: 0.46,
  xuanyuanSwordArrayTrace: 0.24,
  xuanyuanBronzeCloudStain: 0.2,
  xuanyuanBloodOath: 0.24,
  xuanyuanOxidizedCrack: 0.22,
  xuanyuanBuriedSwords: 0.24,
  xuanyuanOldCloudLine: 0.18,
  xuanyuanSwordTrace: 0.24,
  xuanyuanCloudLine: 0.2,
  xuanyuanArrayDisk: 0.18,
  xuanyuanCinnabarTrace: 0.22,
  xuanyuanBronzeOxidation: 0.18,
  xuanyuanDetailCracks: 0.16,
  xuanyuanDetailCloudFresco: 0.14,
  xuanyuanDetailSwordEngraving: 0.15,
  xuanyuanDetailBronzeOxidation: 0.13,
  xuanyuanDetailCinnabarScrape: 0.14
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
  else {
    state.build.push({
      id: upgrade.id,
      name: upgrade.name,
      tag: buildTagFor(upgrade),
      group: upgrade.group,
      icon: upgrade.icon,
      text: upgrade.text,
      count: 1
    });
  }
  setText(ui.buildQuickText, buildQuickSummary());
}

function buildTagCounts() {
  const tags = new Map();
  for (const item of state?.build || []) tags.set(item.tag, (tags.get(item.tag) || 0) + item.count);
  return tags;
}

function dominantBuildEntry() {
  return [...buildTagCounts().entries()].sort((a, b) => b[1] - a[1])[0] || ["未定", 0];
}

function buildRouteText(limit = 3) {
  const entries = [...buildTagCounts().entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  return entries.length ? entries.map(([tag, count]) => `${tag}x${count}`).join(" · ") : "未定";
}

function buildEvolutionHint() {
  const [tag, count] = dominantBuildEntry();
  if (!state?.build?.length) return "尚未形成路线：先通过升级三选一领悟第一门功法。";
  if (count >= 4) return `${tag}路线已成型：下一步应接入同系进化卡和Boss弱点联动。`;
  if (count >= 2) return `${tag}路线正在成型：继续选择同系功法可点亮进化条件。`;
  return "路线初定：再领悟同系功法，才能让构筑产生明显形态变化。";
}

function buildSummary() {
  if (state?.chapter) return chapterHudText();
  if (!state?.build?.length) return "构筑 初定：尚未领悟机缘";
  return `构筑 ${buildRouteText(3)}`;
}

function weaponBuildRows() {
  if (!state?.weapons) return [];
  const labels = {
    sword: "剑气诀",
    talisman: "符法",
    flame: "离火术",
    phantom: "幻雾步"
  };
  return Object.entries(state.weapons)
    .filter(([, weapon]) => (weapon.level || 0) > 0 || (weapon.count || 0) > 0)
    .map(([id, weapon]) => {
      const uiMeta = weapon.ui || {};
      const level = Math.max(weapon.level || 0, weapon.count ? 1 : 0);
      const details = [];
      if (weapon.count) details.push(`数量 ${weapon.count}`);
      if (weapon.damage) details.push(`威力 ${Math.round(weapon.damage)}`);
      if (weapon.radius) details.push(`范围 ${Math.round(weapon.radius)}`);
      return {
        id,
        name: labels[id] || uiMeta.name || id,
        icon: uiMeta.icon || id,
        level,
        details: details.join(" · ") || "已入局"
      };
    });
}

function resultBuildHtml() {
  if (!state) return "";
  const rows = weaponBuildRows();
  const memories = state.chapter?.memories?.length || 0;
  const bossState = state.chapter?.bossCleared ? "Boss 已破" : state.chapter?.bossSpawned ? "Boss 未破" : "Boss 未现";
  const skillHtml = rows.slice(0, 4).map(row => `<span><b>${row.name}</b><i>Lv.${row.level}</i></span>`).join("");
  return `
    <div class="result-build-route"><strong>本局构筑</strong><em>${state.build?.length ? buildRouteText(3) : "尚未领悟"}</em></div>
    <div class="result-build-skills">${skillHtml || "<span><b>无功法记录</b><i>Lv.0</i></span>"}</div>
    <div class="result-build-route"><strong>章节记录</strong><em>记忆 ${memories} · ${bossState}</em></div>
  `;
}

function selectedChoiceFeedback(option) {
  const tag = buildTagFor(option);
  const route = buildRouteText(2);
  if (!state?.chapter) return `${tag}路线 ${route}`;
  return `${tag}入局 · ${route} · ${state.chapter.objective}`;
}

function buildQuickSummary() {
  if (!state?.build?.length) return "未定";
  return [...buildTagCounts().entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([tag, count]) => `${tag}x${count}`)
    .join(" · ");
}

function syncBuildQuickUi() {
  if (!ui.buildQuickBtn) return;
  setText(ui.buildQuickText, buildQuickSummary());
  const blocked = !state?.running
    || !ui.start?.classList.contains("hidden")
    || !ui.choices?.classList.contains("hidden")
    || !ui.storyOverlay?.classList.contains("hidden")
    || !ui.pauseOverlay?.classList.contains("hidden")
    || !ui.buildOverlay?.classList.contains("hidden")
    || !ui.gameOver?.classList.contains("hidden");
  ui.buildQuickBtn.classList.toggle("is-hidden", blocked);
}

const CHAPTER_ONE_CONFIG = CONFIG.chapterOne || {};
const CHAPTER_ONE_TIMELINE = CHAPTER_ONE_CONFIG.timeline || {
  limit: 210,
  firstStory: 14,
  eliteWave: 42,
  secondStory: 70,
  bossWarning: 105,
  bossSpawn: 120
};

const CHAPTER_ONE_STORY = CHAPTER_ONE_CONFIG.stories || {
  first_memory: {
    qingqiu: {
      title: "青丘旧誓",
      speaker: "青丘旧誓",
      portrait: "qingqiu_witch",
      text: "旧誓残碑亮起一线青金。幻雾不是逃避，而是青丘一族遮蔽天庭视线的古老法。",
      objective: "撑过第一轮精英妖潮",
      rewardText: "旧誓入魂：拾取范围提升，下一波妖潮放缓",
      rewardSoul: 5,
      healRatio: 0.08,
      pickupBonus: 14
    },
    sword_tomb: {
      title: "断剑初誓",
      speaker: "轩辕遗剑",
      portrait: "xuanyuan_swordsman",
      text: "断剑仍埋在荒土里。你听见前世留下的誓言：若轮回不止，便以剑痕记路。",
      objective: "撑过第一轮精英妖潮",
      rewardText: "剑誓入魂：剑气伤害提升，下一波妖潮放缓",
      rewardSoul: 5,
      healRatio: 0.06,
      swordDamage: 4
    }
  },
  second_memory: {
    qingqiu: {
      title: "狐火旧约",
      speaker: "青丘旧誓",
      portrait: "qingqiu_witch",
      text: "第二段残碑照见狐火旧约。你明白 Boss 的赤焰并非天罚，而是被丹火强行催熟的轮回余烬。",
      objective: "击败章节 Boss，稳定轮回锚点",
      rewardText: "旧约显形：Boss 入场气血削弱",
      rewardSoul: 7,
      bossWeaken: 0.12,
      phantomRadius: 18
    },
    sword_tomb: {
      title: "轮回残碑",
      speaker: "轮回残灵",
      portrait: "reincarnation_spirit",
      text: "第二段残碑照见旧战裂口。你终于确认：第一章的 Boss 不是终点，而是通往真结局的第一道门。",
      objective: "击败章节 Boss，稳定轮回锚点",
      rewardText: "残碑共鸣：Boss 入场气血削弱",
      rewardSoul: 7,
      bossWeaken: 0.12,
      swordDamage: 3
    }
  }
};

const CHAPTER_BOSS_CONFIG = CHAPTER_ONE_CONFIG.boss || {};
const CHAPTER_BOSS_PHASES = CHAPTER_BOSS_CONFIG.phases || [
  { threshold: 0.68, key: "summon", title: "Boss 转阶段", text: "赤焰召出护卫，妖潮压近" },
  { threshold: 0.36, key: "enrage", title: "Boss 狂燃", text: "丹火失控，地面出现赤裂预警" }
];
const CHAPTER_ONE_PACING = CHAPTER_ONE_CONFIG.pacing || {};

function pacingSection(section) {
  return CHAPTER_ONE_PACING[section] || {};
}

function pacingValue(section, key, fallback) {
  const table = pacingSection(section);
  return table[key] ?? fallback;
}

function runtimeLimit(key, fallback) {
  return pacingValue("runtimeLimits", key, tuningValue(key, fallback));
}

function chapterPressureConfig() {
  return CHAPTER_ONE_CONFIG.pressure || {};
}

function compactTime(seconds) {
  return formatTime(Math.max(0, seconds));
}

function chapterWaveLabel() {
  const t = state.time;
  if (state.chapter?.bossCleared) return "通关";
  if (t >= CHAPTER_ONE_TIMELINE.bossSpawn) return "第4波 Boss";
  if (t >= CHAPTER_ONE_TIMELINE.bossWarning) return "第3波 Boss预警";
  if (t >= CHAPTER_ONE_TIMELINE.eliteWave) return "第2波 精英妖潮";
  return "第1波 游妖试探";
}

function chapterNextBeatText() {
  const t = state.time;
  if (t < CHAPTER_ONE_TIMELINE.eliteWave) return `精英 ${compactTime(CHAPTER_ONE_TIMELINE.eliteWave - t)}`;
  if (t < CHAPTER_ONE_TIMELINE.bossWarning) return `预警 ${compactTime(CHAPTER_ONE_TIMELINE.bossWarning - t)}`;
  if (t < CHAPTER_ONE_TIMELINE.bossSpawn) return `Boss ${compactTime(CHAPTER_ONE_TIMELINE.bossSpawn - t)}`;
  if (!state.chapter?.bossCleared) return `限时 ${compactTime(CHAPTER_ONE_TIMELINE.limit - t)}`;
  return "轮回锚定";
}

function chapterHudText() {
  return `${chapterWaveLabel()} · ${chapterNextBeatText()} · ${state.chapter.objective}`;
}

function chapterStoryData(chapterStory) {
  const byLineage = CHAPTER_ONE_STORY[chapterStory];
  if (!byLineage) return null;
  return byLineage[state?.map?.id] || byLineage.sword_tomb || Object.values(byLineage)[0];
}

function chapterAlert(title, text, tone = "neutral", life = 2.8) {
  if (!state?.chapter) return;
  state.chapter.alert = { title, text, tone, life, maxLife: life };
}

function activeChapterBoss() {
  if (!state?.chapter?.bossSpawned || state.chapter.bossCleared) return null;
  return state.enemies.find(enemy => enemy.boss) || null;
}

function chapterSpawnMultiplier() {
  if (!state?.chapter) return 1;
  const t = state.time;
  const pressure = chapterPressureConfig().spawnMultiplier || {};
  if (t >= CHAPTER_ONE_TIMELINE.bossSpawn) return pressure.boss ?? 1.36;
  if (t >= CHAPTER_ONE_TIMELINE.bossWarning) return pressure.bossWarning ?? 1.24;
  if (t >= CHAPTER_ONE_TIMELINE.eliteWave) return pressure.eliteWave ?? 1.08;
  if (t >= CHAPTER_ONE_TIMELINE.firstStory) return pressure.afterFirstStory ?? 0.94;
  return pressure.opening ?? 0.82;
}

function chapterExtraSpawnChance() {
  if (!state?.chapter) return state.time > 45 ? 0.35 : 0;
  const t = state.time;
  const pressure = chapterPressureConfig().extraSpawnChance || {};
  if (t >= CHAPTER_ONE_TIMELINE.bossSpawn) return pressure.boss ?? 0.32;
  if (t >= CHAPTER_ONE_TIMELINE.bossWarning) return pressure.bossWarning ?? 0.24;
  if (t >= CHAPTER_ONE_TIMELINE.eliteWave) return pressure.eliteWave ?? 0.14;
  return 0;
}

function chapterRandomEliteChance() {
  if (!state?.chapter) return Math.min(0.08 + state.time / 900, 0.22);
  const t = state.time;
  const pressure = chapterPressureConfig().randomEliteChance || {};
  if (t < CHAPTER_ONE_TIMELINE.eliteWave) return 0;
  if (t < CHAPTER_ONE_TIMELINE.bossWarning) return pressure.betweenEliteAndWarning ?? 0.025;
  if (t < CHAPTER_ONE_TIMELINE.bossSpawn) return pressure.betweenWarningAndBoss ?? 0.045;
  return pressure.boss ?? 0.065;
}

function renderBuildLedger() {
  if (!ui.buildLedger || !state) return;
  const weaponRows = weaponBuildRows();
  if (!state.build.length) {
    ui.buildLedger.innerHTML = `
      <div class="build-empty">
        <b>尚未领悟机缘</b>
        <span>升级或触发剧情点位后，本局功法路线会记录在这里。</span>
      </div>
    `;
    return;
  }
  const groups = buildTagCounts();
  const routeHtml = [...groups.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => `<span class="build-route"><b>${tag}</b><i>${count} 层</i></span>`)
    .join("");
  const weaponHtml = weaponRows.map(row => `
    <span class="build-skill">
      <i>${iconMarkup(row.icon, "build-skill-icon")}</i>
      <b>${row.name}</b>
      <em>Lv.${row.level}</em>
      <small>${row.details}</small>
    </span>
  `).join("");
  ui.buildLedger.innerHTML = `
    <div class="build-routes">${routeHtml}</div>
    <div class="build-evolution">
      <strong>${dominantBuildEntry()[0]}线</strong>
      <span>${buildEvolutionHint()}</span>
    </div>
    <div class="build-skill-grid">${weaponHtml}</div>
  `;
}

function screen() {
  const rect = canvas.getBoundingClientRect();
  return { w: rect.width, h: rect.height };
}

function mapProjection(map = state?.map) {
  if (map?.projection === "topdown") return { skew: 0, yScale: 1, yOffset: 0 };
  return { skew: 0.22, yScale: 0.68, yOffset: 26 };
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
      nextXp: pacingValue("xp", "base", CONFIG.tuning.xpBase),
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
    passive: { pickupHeal: 0 },
    mechanics: { swordMark: 0, talismanSplit: 0, pickupBurst: 0, guard: 0 },
    build: [],
    resources: { soul: 0, fire: 0, spent: 0 },
    storySeen: {},
    pendingStory: null,
    storyCooldown: 0.35,
    chapter: freshChapterState(),
    enemies: [],
    projectiles: [],
    drops: [],
    pulses: [],
    clouds: [],
    effects: [],
    damageTexts: [],
    map: generateMap(mapTemplate, mapSeed, bounds),
    spawnTimer: 1.2,
    spawnDelay: pacingValue("spawn", "baseDelay", CONFIG.tuning.spawnDelay),
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

function freshChapterState() {
  return {
    id: "chapter_one",
    name: "第一章：荒境旧誓",
    objective: "寻到第一处轮回残痕",
    stage: "opening",
    firstStorySpawned: false,
    eliteWaveSpawned: false,
    secondStorySpawned: false,
    bossWarned: false,
    bossSpawned: false,
    bossCleared: false,
    timedOut: false,
    timeLimit: CHAPTER_ONE_TIMELINE.limit,
    bossId: "",
    bossName: "",
    bossWeaken: 0,
    bossPhase: "入场压迫",
    bossPhaseSeen: {},
    alert: { title: "第1波", text: "游妖试探", life: 2.4, maxLife: 2.4, tone: "neutral" },
    memories: []
  };
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
    let count = 0;
    if (typeof rule.chunkChance === "number") {
      count = rng() < rule.chunkChance ? 1 : 0;
    } else {
      count = Math.max(0, Math.round(randomInt(rng, rule.count[0], rule.count[1]) * 0.35));
    }
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
  const cooldowns = { shoot: 55, hit: 42, pickup: 34, level: 200, flame: 180, hurt: 180, death: 800, boom: 90, kill: 55, warning: 420, boss: 680 };
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
  if (name === "warning") {
    tone(180, 0.16, "triangle", 0.038, 0.72);
    setTimeout(() => tone(140, 0.18, "triangle", 0.034, 0.64), 120);
  }
  if (name === "boss") {
    tone(82, 0.42, "sawtooth", 0.055, 0.38);
    setTimeout(() => tone(164, 0.22, "triangle", 0.032, 0.7), 180);
    noiseBurst(0.2, 0.035, 150);
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
  }, runtimeLimit("maxEffects", 96));
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, tuningValue("maxPixelRatio", 1.5));
  canvas.width = Math.round(rect.width * scale);
  canvas.height = Math.round(rect.height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  syncRuntimeUi(true);
}

function scheduleResize() {
  if (resizeQueued) return;
  resizeQueued = true;
  requestAnimationFrame(() => {
    resizeQueued = false;
    resize();
  });
}

function toView(point) {
  const s = screen();
  const cx = s.w / 2;
  const projection = mapProjection();
  const cy = s.h / 2 + projection.yOffset;
  const camera = state?.camera || { x: 0, y: 0 };
  const dx = point.x - camera.x;
  const dy = point.y - camera.y;
  return {
    x: cx + dx + dy * projection.skew,
    y: cy + dy * projection.yScale
  };
}

function toWorld(viewX, viewY) {
  const s = screen();
  const cx = s.w / 2;
  const projection = mapProjection();
  const cy = s.h / 2 + projection.yOffset;
  const camera = state?.camera || { x: 0, y: 0 };
  const dy = (viewY - cy) / projection.yScale;
  const dx = viewX - cx - dy * projection.skew;
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
  }, runtimeLimit("maxDamageTexts", 54));
}

function renderLineageSelect() {
  ui.lineageList.innerHTML = "";
  const options = playableLineages();
  ui.lineageList.dataset.count = String(options.length);
  if (!options.includes(selectedLineage)) {
    selectedLineage = options[0] || CONFIG.lineages[0];
  }
  if (ui.startBtn) ui.startBtn.textContent = `以${selectedLineage.name}开始`;
  let selectedButton = null;
  for (const lineage of options) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `lineage${lineage.id === selectedLineage.id ? " is-selected" : ""}`;
    button.dataset.lineage = lineage.id;
    if (lineage.id === selectedLineage.id) selectedButton = button;
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
      if (ui.startBtn) ui.startBtn.textContent = `以${selectedLineage.name}开始`;
      renderLineageSelect();
    });
    ui.lineageList.appendChild(button);
  }
  if (selectedButton) {
    ui.lineageList.scrollLeft = selectedButton.offsetLeft - (ui.lineageList.clientWidth - selectedButton.clientWidth) / 2;
  }
  requestAnimationFrame(() => {
    selectedButton?.scrollIntoView?.({ behavior: "auto", block: "nearest", inline: "center" });
  });
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
  if (selectedLineage?.hidden) {
    selectedLineage = playableLineages()[0] || CONFIG.lineages[0];
  }
  ensureAudio();
  startMusic();
  state = freshState();
  state.running = true;
  state.paused = false;
  ui.lineageText.textContent = `${state.lineage.name} · ${state.map.name} · ${state.map.variant.name}`;
  if (ui.mobileLineageText) ui.mobileLineageText.textContent = `${state.lineage.name} · ${state.map.variant.name}`;
  ui.start.classList.add("hidden");
  ui.gameOver.classList.add("hidden");
  ui.choices.classList.add("hidden");
  ui.pauseOverlay.classList.add("hidden");
  ui.buildOverlay?.classList.add("hidden");
  ui.chapterAlert?.classList.add("hidden");
  ui.bossFrame?.classList.add("hidden");
  ui.pauseBtn.textContent = "暂";
  syncBuildQuickUi();
  lastTime = performance.now();
  playSound("level", 3);
}

function endGame(reason = "death") {
  if (!state.running) return;
  state.running = false;
  state.paused = true;
  ui.pauseOverlay.classList.add("hidden");
  ui.buildOverlay?.classList.add("hidden");
  ui.chapterAlert?.classList.add("hidden");
  ui.bossFrame?.classList.add("hidden");
  playSound(reason === "chapter_clear" ? "level" : "death", 3);
  const memoryCount = state.chapter?.memories?.length || 0;
  const clearText = reason === "chapter_clear"
    ? "已击破第一章 Boss，轮回锚点暂时稳定。"
    : reason === "chapter_timeout"
      ? "章节限时已尽，荒境轮回失稳。残留记忆仍会回到下一世。"
      : "此世未能突破荒境，残留记忆仍会回到轮回中。";
  ui.resultText.textContent = `${state.lineage.name}在${state.map.name}坚持了 ${formatTime(state.time)}，斩妖 ${state.kills}。${clearText} 记忆 ${memoryCount} 段。`;
  if (ui.resultBuildSummary) ui.resultBuildSummary.innerHTML = resultBuildHtml();
  if (ui.metaPointText) ui.metaPointText.textContent = Math.max(1, Math.floor(state.kills / 12) + Math.floor(state.time / 45));
  ui.gameOver.classList.remove("hidden");
  syncBuildQuickUi();
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
  if (state.enemies.length >= runtimeLimit("maxEnemies", 90)) return;
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

  const pool = state.map.enemyPool || ["wraith", "elite"];
  const normalPool = pool.filter(id => !CONFIG.enemies[id]?.elite);
  const elitePool = pool.filter(id => CONFIG.enemies[id]?.elite);
  const elite = elitePool.length > 0 && Math.random() < chapterRandomEliteChance();
  const activePool = elite ? elitePool : normalPool;
  const enemyId = activePool[Math.floor(Math.random() * activePool.length)] || "wraith";
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
    elite: Boolean(table.elite),
    type: enemyId,
    facing: spawnPoint.x < state.player.x ? "right" : "left",
    animTime: Math.random() * 10,
    slowTime: 0,
    marks: 0,
    lastHit: "",
    hitFlash: 0
  }, runtimeLimit("maxEnemies", 90));
}

function spawnEnemyAt(enemyId, x, y, overrides = {}) {
  const table = CONFIG.enemies[enemyId] || CONFIG.enemies.wraith;
  const hp = (overrides.hp ?? table.hp) + state.time * (overrides.hpRamp ?? table.hpRamp ?? 0);
  const enemy = {
    x,
    y,
    r: overrides.radius ?? table.radius,
    hp,
    maxHp: hp,
    speed: (overrides.speed ?? table.speed) + state.time * (overrides.speedRamp ?? table.speedRamp ?? 0),
    damage: overrides.damage ?? table.damage,
    xp: overrides.xp ?? table.xp,
    elite: overrides.elite ?? Boolean(table.elite),
    type: enemyId,
    facing: x < state.player.x ? "right" : "left",
    animTime: Math.random() * 10,
    slowTime: 0,
    marks: 0,
    lastHit: "",
    hitFlash: 0,
    ...overrides
  };
  pushCapped(state.enemies, enemy, runtimeLimit("maxEnemies", 90));
  return enemy;
}

function chapterEventPoint(type, distance, angle, chapterStory) {
  const event = {
    type,
    x: state.player.x + Math.cos(angle) * distance,
    y: state.player.y + Math.sin(angle) * distance,
    r: type === "brokenSword" ? 50 : 48,
    phase: Math.random() * TAU,
    spin: 1,
    event: true,
    chapterStory,
    triggerRadius: type === "brokenSword" ? 152 : 144
  };
  state.map.events.push(event);
  return event;
}

function chapterNotice(text, kind = "resource", title = chapterWaveLabel(), tone = "neutral", life = 2.8) {
  state.chapter.objective = text;
  chapterAlert(title, text, tone, life);
  addDamageText(state.player.x, state.player.y - 54, text, kind);
}

function spawnChapterEliteWave() {
  const eliteConfig = CHAPTER_ONE_CONFIG.eliteWave || {};
  const mapElite = eliteConfig.byMap?.[state.map.id] || eliteConfig.byMap?.sword_tomb || {};
  const angles = eliteConfig.angles || [-0.52, 0.52];
  const eliteType = mapElite.enemy || (state.map.id === "qingqiu" ? "elite" : "cinnabar_guard");
  const memorySlowdown = state.chapter?.memories?.includes("first_memory") ? 0.88 : 1;
  for (const angle of angles) {
    spawnEnemyAt(eliteType, state.player.x + Math.cos(angle) * (eliteConfig.distanceX ?? 520), state.player.y + Math.sin(angle) * (eliteConfig.distanceY ?? 360), {
      elite: true,
      hp: mapElite.hp ?? (state.map.id === "qingqiu" ? 110 : 132),
      damage: mapElite.damage ?? (state.map.id === "qingqiu" ? 20 : 23),
      speed: (mapElite.speed ?? (state.map.id === "qingqiu" ? 58 : 64)) * (state.chapter?.memories?.includes("first_memory") ? (eliteConfig.firstMemorySpeedScale ?? memorySlowdown) : 1),
      xp: mapElite.xp ?? 16,
      chapterElite: true
    });
  }
  addEffect("killBloom", state.player.x, state.player.y - 80, {
    radius: 180,
    life: 0.7,
    color: "#e16935",
    secondary: "#fff2c8",
    count: 14
  });
  addShake(7);
  playSound("boom", 3);
}

function spawnChapterBoss() {
  const mapBoss = CHAPTER_BOSS_CONFIG.byMap?.[state.map.id] || CHAPTER_BOSS_CONFIG.byMap?.sword_tomb || {};
  const angle = CHAPTER_BOSS_CONFIG.spawnAngle ?? -0.25;
  const bossType = mapBoss.enemy || "cinnabar_guard";
  const weaken = Math.max(0, Math.min(CHAPTER_BOSS_CONFIG.maxStoryWeaken ?? 0.35, state.chapter?.bossWeaken || 0));
  const bossHp = Math.round(((CHAPTER_BOSS_CONFIG.hpBase ?? 430) + state.player.level * (CHAPTER_BOSS_CONFIG.hpPerLevel ?? 34)) * (1 - weaken));
  const timers = CHAPTER_BOSS_CONFIG.timers || {};
  const boss = spawnEnemyAt(bossType, state.player.x + Math.cos(angle) * (CHAPTER_BOSS_CONFIG.spawnDistanceX ?? 620), state.player.y + Math.sin(angle) * (CHAPTER_BOSS_CONFIG.spawnDistanceY ?? 380), {
    boss: true,
    elite: true,
    radius: CHAPTER_BOSS_CONFIG.radius ?? 28,
    hp: bossHp,
    hpRamp: 0,
    speed: CHAPTER_BOSS_CONFIG.speed ?? 54,
    speedRamp: 0,
    damage: CHAPTER_BOSS_CONFIG.damage ?? 30,
    xp: CHAPTER_BOSS_CONFIG.xp ?? 36,
    chapterBossName: mapBoss.name || (state.map.id === "qingqiu" ? "赤焰魇将" : "赤焰战魇"),
    bossPhase: "entry",
    bossPhaseIndex: 0,
    spriteW: 7.2,
    spriteH: 8.6,
    spriteAnchorY: 0.94,
    bossCastTimer: timers.cast ?? 1.8,
    bossSummonTimer: timers.summon ?? 4.8,
    bossBurstTimer: timers.burst ?? 7.2
  });
  state.chapter.bossId = `${boss.type}:${Math.round(boss.x)}:${Math.round(boss.y)}:${Date.now()}`;
  state.chapter.bossName = boss.chapterBossName;
  boss.chapterBossId = state.chapter.bossId;
  addEffect("bossEntry", boss.x, boss.y, {
    radius: 170,
    life: 1.25,
    color: "#e16935",
    secondary: "#fff2c8",
    count: 16
  });
  addShake(10);
  chapterAlert("第4波", `${boss.chapterBossName} 入场${weaken ? " · 残碑削弱" : ""}`, "boss", 4.8);
  playSound("boss", 3);
}

function bossPhaseText(enemy) {
  if (!enemy?.boss) return "";
  if (enemy.bossPhase === "enrage") return "三阶段 狂燃";
  if (enemy.bossPhase === "summon") return "二阶段 召卫";
  return "一阶段 入场";
}

function spawnBossMinions(enemy, count = 2) {
  const pool = CHAPTER_BOSS_CONFIG.summons?.[state.map.id] || CHAPTER_BOSS_CONFIG.summons?.sword_tomb || (state.map.id === "qingqiu" ? ["foxshade", "wraith"] : ["blade_thrall", "stone_imp"]);
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * TAU + Math.random() * 0.6;
    const type = pool[i % pool.length];
    spawnEnemyAt(type, enemy.x + Math.cos(angle) * 120, enemy.y + Math.sin(angle) * 84, {
      hp: CONFIG.enemies[type].hp + 18 + state.player.level * 3,
      damage: CONFIG.enemies[type].damage + 2,
      speed: CONFIG.enemies[type].speed * 0.94,
      xp: CONFIG.enemies[type].xp + 2,
      chapterSummon: true
    });
  }
}

function damagePlayerAt(x, y, radius, damage) {
  if (!state?.running) return false;
  if (dist({ x, y }, state.player) >= radius + state.player.r || state.player.invuln > 0) return false;
  state.player.hp -= damage;
  state.player.invuln = 0.5;
  addDamageText(state.player.x, state.player.y, damage, "hurt");
  addShake(6);
  playSound("hurt");
  if (state.player.hp <= 0) endGame();
  return true;
}

function bossGroundRupture(enemy, phase = "summon") {
  const rupture = CHAPTER_BOSS_CONFIG.groundRupture?.[phase] || CHAPTER_BOSS_CONFIG.groundRupture?.summon || {};
  const angle = Math.atan2(state.player.y - enemy.y, state.player.x - enemy.x);
  const x = state.player.x + Math.cos(angle + (Math.random() - 0.5) * 0.9) * 34;
  const y = state.player.y + Math.sin(angle + (Math.random() - 0.5) * 0.9) * 24;
  enemy.bossCastFlash = 0.5;
  addEffect("bossRuptureWarning", x, y, {
    radius: rupture.warningRadius ?? (phase === "enrage" ? 118 : 92),
    life: 0.5,
    color: "#e16935",
    secondary: "#fff2c8",
    count: rupture.count ?? (phase === "enrage" ? 10 : 7)
  });
  setTimeout(() => {
    if (!state?.running || state.paused || enemy.hp <= 0) return;
    const radius = rupture.radius ?? (phase === "enrage" ? 94 : 72);
    pushCapped(state.pulses, { x, y, radius, life: 0.32, maxLife: 0.32, kind: "hurt" }, runtimeLimit("maxPulses", 36));
    addEffect("bossRuptureBurst", x, y, {
      radius,
      life: 0.42,
      color: "#e16935",
      secondary: "#fff2c8",
      count: 9
    });
    damagePlayerAt(x, y, radius, rupture.damage ?? (phase === "enrage" ? 18 : 12));
  }, 460);
}

function bossShockwave(enemy) {
  const shockwave = CHAPTER_BOSS_CONFIG.shockwave?.[enemy.bossPhase] || CHAPTER_BOSS_CONFIG.shockwave?.summon || {};
  const radius = shockwave.radius ?? (enemy.bossPhase === "enrage" ? 126 : 96);
  pushCapped(state.pulses, { x: enemy.x, y: enemy.y, radius, life: 0.38, maxLife: 0.38, kind: "hurt" }, runtimeLimit("maxPulses", 36));
  enemy.bossBurstFlash = 0.56;
  addEffect("bossShockwave", enemy.x, enemy.y, {
    radius,
    life: 0.5,
    color: "#e16935",
    secondary: "#fff2c8",
    count: shockwave.count ?? (enemy.bossPhase === "enrage" ? 14 : 10)
  });
  damagePlayerAt(enemy.x, enemy.y, radius, shockwave.damage ?? (enemy.bossPhase === "enrage" ? 28 : 18));
  addShake(enemy.bossPhase === "enrage" ? 9 : 6);
  playSound("boom", 3);
}

function bossPhaseConfig(key) {
  return CHAPTER_BOSS_PHASES.find(phase => phase.key === key) || {};
}

function applyEnemyDamage(enemy, damage, kind) {
  enemy.hp -= damage;
  if (enemy.boss && enemy.bossGateTimer > 0) {
    const floor = enemy.maxHp * (enemy.bossGateThreshold ?? 0);
    if (floor > 0 && enemy.hp < floor) {
      enemy.hp = floor;
      if ((enemy.bossGateNoticeTimer || 0) <= 0) {
        addDamageText(enemy.x, enemy.y - 36, "护体", "boom");
        enemy.bossGateNoticeTimer = 0.48;
      }
    }
  }
  enemy.lastHit = kind;
  enemy.hitFlash = 0.16;
}

function updateChapterBoss(enemy, dt) {
  if (!enemy.boss || !state.chapter || state.chapter.bossCleared) return 1;
  enemy.bossGateTimer = Math.max(0, (enemy.bossGateTimer || 0) - dt);
  enemy.bossGateNoticeTimer = Math.max(0, (enemy.bossGateNoticeTimer || 0) - dt);
  enemy.bossCastFlash = Math.max(0, (enemy.bossCastFlash || 0) - dt);
  enemy.bossBurstFlash = Math.max(0, (enemy.bossBurstFlash || 0) - dt);
  if (enemy.bossGateTimer <= 0) enemy.bossGateThreshold = 0;

  const hpRatio = enemy.hp / enemy.maxHp;
  for (const phase of CHAPTER_BOSS_PHASES) {
    if (hpRatio <= phase.threshold && !state.chapter.bossPhaseSeen[phase.key]) {
      state.chapter.bossPhaseSeen[phase.key] = true;
      enemy.bossPhase = phase.key;
      enemy.bossGateTimer = phase.gateDuration ?? CHAPTER_BOSS_CONFIG.phaseGateDuration ?? 0;
      enemy.bossGateThreshold = phase.threshold;
      enemy.hp = Math.max(enemy.hp, enemy.maxHp * phase.threshold);
      state.chapter.bossPhase = phase.key === "enrage" ? "三阶段 狂燃" : "二阶段 召卫";
      chapterNotice(phase.text, "boom", phase.title, phase.key === "enrage" ? "boss" : "warning", 3.8);
      addEffect("bossPhaseFlare", enemy.x, enemy.y, {
        radius: phase.key === "enrage" ? 150 : 126,
        life: phase.key === "enrage" ? 1.05 : 0.82,
        color: "#e16935",
        secondary: "#fff2c8",
        count: 14
      });
      spawnBossMinions(enemy, phase.key === "enrage" ? 3 : 2);
      addShake(phase.key === "enrage" ? 10 : 7);
      playSound(phase.key === "enrage" ? "boss" : "warning", 3);
      break;
    }
  }

  enemy.bossCastTimer = (enemy.bossCastTimer || 1.8) - dt;
  enemy.bossSummonTimer = (enemy.bossSummonTimer || 4.8) - dt;
  enemy.bossBurstTimer = (enemy.bossBurstTimer || 7.2) - dt;

  if (enemy.bossCastTimer <= 0) {
    const phaseConfig = bossPhaseConfig(enemy.bossPhase);
    enemy.bossCastTimer = phaseConfig.castCooldown ?? (enemy.bossPhase === "enrage" ? 1.55 : enemy.bossPhase === "summon" ? 2.05 : 2.8);
    bossGroundRupture(enemy, enemy.bossPhase);
  }
  if (enemy.bossSummonTimer <= 0) {
    const phaseConfig = bossPhaseConfig(enemy.bossPhase);
    enemy.bossSummonTimer = phaseConfig.summonCooldown ?? (enemy.bossPhase === "enrage" ? 5.0 : 6.8);
    spawnBossMinions(enemy, enemy.bossPhase === "enrage" ? 2 : 1);
    addDamageText(enemy.x, enemy.y - 38, "召卫", "boom");
  }
  if (enemy.bossBurstTimer <= 0) {
    const phaseConfig = bossPhaseConfig(enemy.bossPhase);
    enemy.bossBurstTimer = phaseConfig.burstCooldown ?? (enemy.bossPhase === "enrage" ? 5.8 : 8.5);
    bossShockwave(enemy);
  }

  return bossPhaseConfig(enemy.bossPhase).speedScale ?? (enemy.bossPhase === "enrage" ? 1.18 : enemy.bossPhase === "summon" ? 1.06 : 0.96);
}

function updateChapterDirector() {
  if (!state?.running || state.paused || !state.chapter || state.chapter.bossCleared) return;
  const chapter = state.chapter;
  if (state.time >= CHAPTER_ONE_TIMELINE.limit && !chapter.bossCleared) {
    chapter.timedOut = true;
    chapter.stage = "timeout";
    chapter.objective = "轮回失稳";
    endGame("chapter_timeout");
    return;
  }
  if (!chapter.firstStorySpawned && state.time >= CHAPTER_ONE_TIMELINE.firstStory) {
    chapter.firstStorySpawned = true;
    chapter.stage = "first_story";
    const type = state.map.id === "qingqiu" ? "oldVowStele" : "brokenSword";
    chapterEventPoint(type, 360, -0.35, "first_memory");
    chapterNotice("靠近残痕，记下第一段旧誓", "resource", "剧情点位", "story", 3.5);
    playSound("level", 2);
  }
  if (!chapter.eliteWaveSpawned && state.time >= CHAPTER_ONE_TIMELINE.eliteWave) {
    chapter.eliteWaveSpawned = true;
    chapter.stage = "elite_wave";
    chapterNotice("击破精英，夺取丹火", "boom", "第2波 精英妖潮", "elite", 4);
    spawnChapterEliteWave();
  }
  if (!chapter.secondStorySpawned && state.time >= CHAPTER_ONE_TIMELINE.secondStory) {
    chapter.secondStorySpawned = true;
    chapter.stage = "second_story";
    chapterEventPoint("memoryStele", 420, 0.7, "second_memory");
    chapterNotice("寻找第二处轮回残碑", "resource", "剧情点位", "story", 3.5);
    playSound("level", 2);
  }
  if (!chapter.bossWarned && state.time >= CHAPTER_ONE_TIMELINE.bossWarning) {
    chapter.bossWarned = true;
    chapter.stage = "boss_warning";
    chapterNotice(`Boss 将在 ${compactTime(CHAPTER_ONE_TIMELINE.bossSpawn - state.time)} 后现身`, "boom", "第3波 Boss 预警", "warning", 4.2);
    addEffect("levelBurst", state.player.x, state.player.y, {
      radius: 210,
      life: 1.0,
      color: "#e16935",
      secondary: "#fff2c8",
      count: 12
    });
    addShake(7);
    playSound("warning", 3);
  }
  if (!chapter.bossSpawned && state.time >= CHAPTER_ONE_TIMELINE.bossSpawn) {
    chapter.bossSpawned = true;
    chapter.stage = "boss";
    chapterNotice("击败章节 Boss，稳定轮回锚点", "boom", "第4波 Boss", "boss", 4.5);
    spawnChapterBoss();
  }
}

function completeChapter() {
  if (!state?.running || state.chapter?.bossCleared) return;
  state.chapter.bossCleared = true;
  state.chapter.stage = "cleared";
  state.chapter.objective = "第一章已通关";
  chapterAlert("Boss 已破", "轮回锚点暂时稳定", "clear", 4);
  state.resources.fire += 2;
  state.resources.soul += 18;
  endGame("chapter_clear");
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
    }, runtimeLimit("maxProjectiles", 120));
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
    }, runtimeLimit("maxProjectiles", 120));
  }
  playSound("shoot");
}

function castFlame() {
  const w = state.weapons.flame;
  if (w.level <= 0) return;
  pushCapped(state.pulses, { x: state.player.x, y: state.player.y, radius: w.radius, life: 0.45, maxLife: 0.45, kind: "flame" }, runtimeLimit("maxPulses", 36));
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
      applyEnemyDamage(enemy, w.damage, "flame");
      addDamageText(enemy.x, enemy.y, w.damage, "flame");
    }
  }
  addShake(5);
  playSound("flame");
}

function castPhantom() {
  const w = state.weapons.phantom;
  if (w.level <= 0) return;
  pushCapped(state.pulses, { x: state.player.x, y: state.player.y, radius: w.radius, life: 2.2, maxLife: 2.2, kind: "phantom" }, runtimeLimit("maxPulses", 36));
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
  pushCapped(state.pulses, { x, y, radius, life: 0.32, maxLife: 0.32, kind }, runtimeLimit("maxPulses", 36));
  for (const enemy of state.enemies) {
    if (dist({ x, y }, enemy) <= radius + enemy.r) {
      applyEnemyDamage(enemy, damage, kind);
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
    }, runtimeLimit("maxProjectiles", 120));
  }
}

function gainXp(amount) {
  state.player.xp += amount;
  state.resources.soul += amount;
  if (state.passive.pickupHeal > 0) {
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + amount * state.passive.pickupHeal);
  }
  if (state.mechanics.pickupBurst) {
    explodeAt(state.player.x, state.player.y, 58 + state.mechanics.pickupBurst * 8, 8 + state.mechanics.pickupBurst * 3, "pickupBurst");
  }
  addDamageText(state.player.x, state.player.y - 20, amount, "resource");
  playSound("pickup");
  while (state.player.xp >= state.player.nextXp) {
    state.player.xp -= state.player.nextXp;
    state.player.level += 1;
    state.player.nextXp = Math.floor(
      state.player.nextXp * pacingValue("xp", "growth", CONFIG.tuning.xpGrowth)
      + pacingValue("xp", "add", CONFIG.tuning.xpAdd)
    );
    const levelUpPacing = pacingSection("levelUp");
    state.weapons.sword.damage += levelUpPacing.swordDamage ?? 2;
    state.weapons.sword.range += levelUpPacing.swordRange ?? 8;
    state.weapons.sword.delay = Math.max(
      levelUpPacing.swordDelayMin ?? 0.34,
      state.weapons.sword.delay * (levelUpPacing.swordDelayMul ?? 0.97)
    );
    const swordCountEvery = levelUpPacing.swordCountEvery ?? 3;
    if (swordCountEvery > 0 && state.player.level % swordCountEvery === 0) state.weapons.sword.count += 1;
    addDamageText(state.player.x, state.player.y - 46, levelUpPacing.feedbackText || "剑气增强", "resource");
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
  syncBuildQuickUi();
  lastTime = performance.now();
}

function openBuildPanel() {
  if (!state?.running || !ui.buildOverlay) return;
  renderBuildLedger();
  state.paused = true;
  ui.pauseOverlay.classList.add("hidden");
  ui.buildOverlay.classList.remove("hidden");
  ui.pauseBtn.textContent = "续";
  syncBuildQuickUi();
}

function closeBuildPanel() {
  if (!state?.running || !ui.buildOverlay) return;
  ui.buildOverlay.classList.add("hidden");
  state.paused = false;
  ui.pauseBtn.textContent = "暂";
  syncBuildQuickUi();
  lastTime = performance.now();
}

function openChoices() {
  state.paused = true;
  syncBuildQuickUi();
  ui.choiceList.innerHTML = "";
  playSound("level", 3);
  const pool = CONFIG.upgrades.filter(upgrade => upgrade.group === "common" || upgrade.group === state.lineage.id);
  const options = pool.sort(() => Math.random() - 0.5).slice(0, 3);
  for (const option of options) {
    const button = document.createElement("button");
    button.className = "choice";
    button.type = "button";
    const color = option.group === "sword" ? "#72cfe9" : option.group === "witch" ? "#9ad9b9" : "#d8a64d";
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
      chapterAlert("功法入局", selectedChoiceFeedback(option), "clear", 2.6);
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
  if (event.chapterStory) {
    return chapterStoryData(event.chapterStory);
  }
  const table = {
    stele: {
      title: "残碑低语",
      speaker: "轮回残灵",
      portrait: "reincarnation_spirit",
      text: "碑上刻着半句旧誓：若不死药重开，青丘、轩辕两脉皆会被拖回同一场轮回。"
    },
    shrine: {
      title: "荒祠香火",
      speaker: "轮回残灵",
      portrait: "reincarnation_spirit",
      text: "破败小祠仍有微光，像是在供奉某位被抹去姓名的古神。你记下一缕香火，灵台短暂清明。"
    },
    rift: {
      title: "赤裂回声",
      speaker: "轩辕遗剑",
      portrait: "xuanyuan_swordsman",
      text: "裂隙里传来前世兵戈声。有人在梦里喊你的名字，也有人提醒你：不要相信昆仑送来的丹方。"
    },
    spiritWell: {
      title: "灵井残影",
      speaker: "轮回残灵",
      portrait: "reincarnation_spirit",
      text: "井中浮出陌生倒影，似乎是另一世的你。倒影伸手点向远方，那里应当藏着章节 Boss 的线索。"
    },
    foxfire: {
      title: "狐火旧约",
      speaker: "青丘旧誓",
      portrait: "qingqiu_witch",
      text: "狐火绕身三匝，青丘旧约浮现一角：幻雾并非逃避，而是遮住天庭视线的古老术法。"
    },
    foxfireVow: {
      title: "狐火旧约",
      speaker: "青丘旧誓",
      portrait: "qingqiu_witch",
      text: "狐火绕身三匝，青丘旧约浮现一角：幻雾并非逃避，而是遮住天庭视线的古老术法。"
    },
    oldVowStele: {
      title: "旧誓残碑",
      speaker: "青丘旧誓",
      portrait: "qingqiu_witch",
      text: "残碑边缘亮起青金细线。你读见青丘旧誓：每一次轮回都不是重来，而是在补全通往真结局的路。"
    },
    brokenSword: {
      title: "断剑残誓",
      speaker: "轩辕遗剑",
      portrait: "xuanyuan_swordsman",
      text: "断剑插在荒土里，剑脊仍有旧战余温。你听见前世在剑冢里留下的誓言：若轮回不止，便以剑痕记路。"
    },
    memoryStele: {
      title: "轮回残碑",
      speaker: "轮回残灵",
      portrait: "reincarnation_spirit",
      text: "碑文只亮起一半，像有意漏掉结局。它提醒你：每一世走过的地方，都会把真结局往前推近一点。"
    }
  };
  return table[event.type] || {
    title: "大荒遗痕",
    speaker: "轮回残灵",
    portrait: "reincarnation_spirit",
    text: "你触碰到一段散落在大荒里的记忆。它尚未完整，却足以证明这片荒原并非单纯的试炼场。"
  };
}

function openStoryEvent(event) {
  const key = storyKey(event);
  if (state.storySeen[key]) return;
  state.storySeen[key] = true;
  if (event.chapterStory && !state.chapter.memories.includes(event.chapterStory)) {
    state.chapter.memories.push(event.chapterStory);
    const data = chapterStoryData(event.chapterStory);
    state.chapter.objective = data?.objective || (event.chapterStory === "first_memory" ? "撑过第一轮精英妖潮" : "等待 Boss 现身");
    if (data?.bossWeaken) state.chapter.bossWeaken = Math.max(state.chapter.bossWeaken || 0, data.bossWeaken);
    if (data?.pickupBonus) state.player.pickupBonus += data.pickupBonus;
    if (data?.swordDamage) state.weapons.sword.damage += data.swordDamage;
    if (data?.phantomRadius) state.weapons.phantom.radius += data.phantomRadius;
    if (data?.healRatio) state.player.hp = Math.min(state.player.maxHp, state.player.hp + Math.ceil(state.player.maxHp * data.healRatio));
    if (data?.rewardSoul) state.resources.soul += data.rewardSoul;
  }
  state.pendingStory = { key, event };
  const story = storyForEvent(event);
  ui.storyTitle.textContent = story.title;
  ui.storyText.textContent = story.text;
  ui.storySpeaker.textContent = story.speaker;
  ui.storyPortrait.src = `assets/runtime/webp/ui/portraits/${story.portrait}.webp`;
  ui.storyChoiceBtn.textContent = "记入轮回";
  state.paused = true;
  ui.storyOverlay.classList.remove("hidden");
  syncBuildQuickUi();
  addShake(3);
  playSound("level", 3);
}

function closeStoryEvent() {
  if (!state?.pendingStory) return;
  const data = chapterStoryData(state.pendingStory.event?.chapterStory);
  const reward = data?.rewardSoul ? 0 : 3;
  state.resources.soul += reward;
  const event = state.pendingStory.event;
  ui.storyOverlay.classList.add("hidden");
  state.pendingStory = null;
  state.paused = false;
  state.storyCooldown = 2.2;
  syncBuildQuickUi();
  addDamageText(event.x, event.y - 18, data?.rewardText || reward, "resource");
  if (data?.rewardText) chapterAlert("轮回记忆", data.rewardText, "story", 3.6);
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
  if (!state?.running || state.paused || !ui.storyOverlay.classList.contains("hidden") || !ui.choices.classList.contains("hidden") || !ui.buildOverlay?.classList.contains("hidden")) return;
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
  if (state.chapter?.alert) state.chapter.alert.life = Math.max(0, state.chapter.alert.life - dt);
  const spawnPacing = pacingSection("spawn");
  const minSpawnDelay = spawnPacing.minDelay ?? CONFIG.tuning.spawnDelayMin;
  const baseSpawnDelay = Math.max(
    minSpawnDelay,
    (spawnPacing.baseDelay ?? CONFIG.tuning.spawnDelay) - state.time * (spawnPacing.ramp ?? CONFIG.tuning.spawnRamp)
  );
  state.spawnDelay = Math.max(minSpawnDelay, baseSpawnDelay / chapterSpawnMultiplier());
  state.spawnTimer -= dt;
  while (state.spawnTimer <= 0) {
    spawnEnemy();
    if (Math.random() < chapterExtraSpawnChance()) spawnEnemy();
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
  updateChapterDirector();
  checkStoryEvents();

  for (const cloud of state.clouds) {
    cloud.life -= dt;
    cloud.tick -= dt;
    if (cloud.tick <= 0) {
      cloud.tick = 0.36;
      for (const enemy of state.enemies) {
        if (dist(cloud, enemy) < cloud.radius + enemy.r) {
          applyEnemyDamage(enemy, cloud.damage, "cloud");
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
    const bossSpeed = updateChapterBoss(enemy, dt);
    enemy.x += Math.cos(angle) * enemy.speed * slow * bossSpeed * dt;
    enemy.y += Math.sin(angle) * enemy.speed * slow * bossSpeed * dt;
    enemy.facing = Math.cos(angle) < 0 ? "left" : "right";
    enemy.animTime += dt * (enemy.slowTime > 0 ? 0.55 : 1);
    enemy.slowTime = Math.max(0, enemy.slowTime - dt);
    enemy.hitFlash = Math.max(0, (enemy.hitFlash || 0) - dt);
    if (dist(state.player, enemy) < state.player.r + enemy.r && state.player.invuln <= 0) {
      const guarded = state.mechanics.guard > 0;
      const damage = Math.max(1, Math.round(enemy.damage * (guarded ? 0.78 : 1)));
      state.player.hp -= damage;
      state.player.invuln = guarded ? 0.72 : 0.48;
      pushCapped(state.pulses, { x: state.player.x, y: state.player.y, radius: 54, life: 0.28, maxLife: 0.28, kind: "hurt" }, runtimeLimit("maxPulses", 36));
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
        applyEnemyDamage(enemy, projectile.damage, projectile.type);
        if ((projectile.pierce || 0) > 0) projectile.pierce -= 1;
        else projectile.life = 0;
        pushCapped(state.pulses, { x: enemy.x, y: enemy.y, radius: 22, life: 0.18, maxLife: 0.18, kind: "hit" }, runtimeLimit("maxPulses", 36));
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
      const chapterBossKilled = Boolean(enemy.boss && state.chapter?.bossSpawned && !state.chapter?.bossCleared);
      state.kills += 1;
      pushCapped(state.pulses, { x: enemy.x, y: enemy.y, radius: enemy.elite ? 68 : 42, life: 0.24, maxLife: 0.24, kind: enemy.elite ? "boom" : "kill" }, runtimeLimit("maxPulses", 36));
      addEffect(chapterBossKilled ? "bossDeath" : "killBloom", enemy.x, enemy.y, {
        radius: chapterBossKilled ? 168 : enemy.elite ? 92 : 62,
        life: chapterBossKilled ? 1.05 : enemy.elite ? 0.62 : 0.42,
        color: enemy.elite ? "#e16935" : "#54b88a",
        secondary: "#fff2c8",
        count: chapterBossKilled ? 18 : enemy.elite ? 12 : 8
      });
      addDamageText(enemy.x, enemy.y - 8, chapterBossKilled ? "破魇" : enemy.elite ? 88 : 36, chapterBossKilled ? "boom" : enemy.elite ? "boom" : "pickupBurst");
      addShake(chapterBossKilled ? 13 : enemy.elite ? 8 : 3);
      playSound(chapterBossKilled ? "boss" : enemy.elite ? "boom" : "kill");
      pushCapped(state.drops, {
        x: enemy.x,
        y: enemy.y,
        r: enemy.elite ? 8 : 6,
        xp: enemy.xp,
        soul: enemy.xp,
        fire: enemy.elite ? 1 : 0
      }, runtimeLimit("maxDrops", 80));
      state.enemies.splice(i, 1);
      if (chapterBossKilled) {
        completeChapter();
        return;
      }
    }
  }

  for (let i = state.drops.length - 1; i >= 0; i -= 1) {
    const drop = state.drops[i];
    drop.magnet = Math.max(0, (drop.magnet || 0) - dt);
    const range = pacingValue("xp", "pickupRange", CONFIG.tuning.pickupRange) + state.player.pickupBonus;
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

  if (!state?.map) return;
  const visible = visibleMapFeatures();
  drawSceneDecals(visible.chunks || []);
  for (const feature of [...state.map.features, ...visible.features]) drawMapFeature(feature);
  drawMuralFrame(s, map);
}

function drawMapBaseImage(s, map) {
  if (map.tileAtlas && drawTiledMapBase(s, map)) return true;
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
  const tilePrefix = {
    qingqiu_seamless: "qingqiu",
    sword_tomb_seamless: "sword_tomb",
    xuanyuan_ground: "xuanyuan_ground"
  }[map.tileAtlas];
  if (!tilePrefix) return false;
  const tileIndexes = map.tileAtlas === "xuanyuan_ground" ? [1, 2, 3, 4] : [1, 2, 3, 4, 5];
  const tileKeys = tileIndexes
    .map(index => `${tilePrefix}_base_final_0${index}`)
    .filter(key => assetReady("mapTiles", key));
  if (!tileKeys.length) return false;
  const tileSize = map.tileSize || 512;
  const originOffset = map.tileOrigin === "center" ? tileSize / 2 : 0;
  const camera = state?.camera || { x: 0, y: 0 };
  const cx = s.w / 2;
  const projection = mapProjection(map);
  const cy = s.h / 2 + projection.yOffset;
  const viewPad = tileSize * 2;
  const minWorldY = camera.y + (-viewPad - cy) / projection.yScale;
  const maxWorldY = camera.y + (s.h + viewPad - cy) / projection.yScale;
  const minWorldX = camera.x + (-viewPad - cx) - (maxWorldY - camera.y) * projection.skew;
  const maxWorldX = camera.x + (s.w + viewPad - cx) - (minWorldY - camera.y) * projection.skew;
  const startTx = Math.floor((minWorldX + originOffset) / tileSize) - 1;
  const endTx = Math.ceil((maxWorldX + originOffset) / tileSize) + 1;
  const startTy = Math.floor((minWorldY + originOffset) / tileSize) - 1;
  const endTy = Math.ceil((maxWorldY + originOffset) / tileSize) + 1;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.translate(cx - camera.x - camera.y * projection.skew, cy - camera.y * projection.yScale);
  ctx.transform(1, 0, projection.skew, projection.yScale, 0, 0);
  for (let ty = startTy; ty <= endTy; ty += 1) {
    for (let tx = startTx; tx <= endTx; tx += 1) {
      const img = assets.mapTiles[tileKeys[hashSeed(map.seed, tx, ty) % tileKeys.length]];
      const bleed = map.tileAtlas === "xuanyuan_ground" ? 3 : 1;
      ctx.drawImage(img, tx * tileSize - originOffset - bleed * 0.5, ty * tileSize - originOffset - bleed * 0.5, tileSize + bleed, tileSize + bleed);
    }
  }
  ctx.restore();
  return true;
}

function mod(value, size) {
  return ((value % size) + size) % size;
}

function drawSceneDecals(chunks) {
  if (!state?.map) return;
  ctx.save();
  for (const item of chunks) {
    for (const decal of item.chunk.decals || []) {
      const p = toView(decal);
      const isFormalAtlasDecal = Boolean(state.map.tileAtlas);
      const isQingqiuDecal = state.map.scenePack === "qingqiu" && (
        decal.type === "oldVowTrace" ||
        decal.type === "inkTealVein" ||
        decal.type === "goldMuralLine"
      );
      const isPaintedGround = decal.type === "groundMist" || decal.type === "oldVowTrace" || isFormalAtlasDecal;
      const isImageDecal = Boolean(decal.asset && assetReady("scene", decal.asset));
      const atlasScale = isQingqiuDecal ? 0.72 : isFormalAtlasDecal ? 0.86 : 1;
      const w = decal.r * (isPaintedGround ? 4.8 : decal.type === "sceneMist" || decal.type === "sceneTransition" ? 3.4 : 3.0) * atlasScale;
      const h = decal.r * (isPaintedGround ? 2.15 : decal.type === "sceneMist" || decal.type === "sceneTransition" ? 1.35 : 1.25) * atlasScale;
      if (p.x < -w || p.x > screen().w + w || p.y < -h || p.y > screen().h + h) continue;
      if (isImageDecal) {
        ctx.save();
        if (isFormalAtlasDecal) {
          ctx.globalCompositeOperation = decal.type === "goldMuralLine" ? "source-over" : "multiply";
          ctx.filter = "saturate(0.82) contrast(0.92)";
        }
        const ok = drawAsset("scene", decal.asset, p.x, p.y, w, h, {
          alpha: isFormalAtlasDecal ? decal.alpha * (decal.type === "goldMuralLine" ? 0.62 : 0.74) : decal.alpha,
          rotate: decal.rotate,
          anchorY: 0.5
        });
        ctx.restore();
        if (ok) continue;
      }
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
  if (map.tileAtlas) {
    ctx.restore();
    return;
  }
  const edge = map.id === "qingqiu" ? "rgba(18, 14, 17, 0.34)" : "rgba(64, 31, 18, 0.5)";
  const gradTop = ctx.createLinearGradient(0, 0, 0, s.h);
  gradTop.addColorStop(0, edge);
  gradTop.addColorStop(map.tileAtlas ? 0.09 : 0.16, "rgba(0, 0, 0, 0)");
  gradTop.addColorStop(map.tileAtlas ? 0.91 : 0.84, "rgba(0, 0, 0, 0)");
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

function drawStoryMarkerUnder(feature, status = "idle") {
  const ready = status === "ready";
  const done = status === "done";
  const pulse = 0.5 + 0.5 * Math.sin(state.time * 3.4 + feature.phase);
  const assetKey = done ? "storyUnderDone" : ready ? "storyUnderReady" : "storyUnderIdle";
  const assetRadius = storyTriggerRadius(feature) * (ready ? 0.68 + pulse * 0.04 : done ? 0.52 + pulse * 0.012 : 0.58 + pulse * 0.02);
  ctx.save();
  ctx.globalCompositeOperation = ready ? "lighter" : "source-over";
  ctx.globalAlpha *= ready ? 0.82 + pulse * 0.16 : done ? 0.46 + pulse * 0.08 : 0.62 + pulse * 0.12;
  if (drawAsset("sceneEvents", assetKey, 0, feature.r * 0.24, assetRadius * 1.9, assetRadius * 0.88, { anchorY: 0.54 })) {
    ctx.restore();
    return true;
  }
  ctx.restore();

  const radius = storyTriggerRadius(feature) * (ready ? 0.62 + pulse * 0.055 : done ? 0.38 + pulse * 0.016 : 0.46 + pulse * 0.028);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = ready ? 0.34 + pulse * 0.22 : done ? 0.08 + pulse * 0.04 : 0.18 + pulse * 0.1;
  const img = assets.vfx.pickup_orb_burst || assets.vfx.phantom_mist_ring;
  if (img) {
    ctx.drawImage(img, -radius * 0.78, feature.r * 0.18 - radius * 0.32, radius * 1.56, radius * 0.64);
  }
  ctx.strokeStyle = ready ? "rgba(236, 198, 98, 0.92)" : done ? "rgba(122, 160, 128, 0.42)" : "rgba(90, 190, 148, 0.62)";
  ctx.lineWidth = ready ? 3.2 : done ? 1.4 : 1.9;
  ctx.beginPath();
  ctx.ellipse(0, feature.r * 0.18, radius * 0.72, radius * 0.22, -0.08, 0, TAU);
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = ready ? 0.38 : done ? 0.1 : 0.24;
  ctx.fillStyle = ready ? "rgba(220, 165, 68, 0.36)" : done ? "rgba(82, 116, 97, 0.18)" : "rgba(82, 180, 137, 0.22)";
  ctx.beginPath();
  ctx.ellipse(0, feature.r * 0.18, radius * 0.5, radius * 0.13, -0.08, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawStoryMarkerOver(feature, status = "idle") {
  const ready = status === "ready";
  const done = status === "done";
  const pulse = 0.5 + 0.5 * Math.sin(state.time * 4.2 + feature.phase);
  const y = -feature.r * (feature.type === "foxfireVow" ? 1.62 : 1.48);
  const badgeKey = done ? "storyBadgeDone" : ready ? "storyBadgeReady" : "storyBadgeIdle";
  const badgeW = feature.r * (ready ? 1.78 + pulse * 0.1 : done ? 1.2 + pulse * 0.02 : 1.42 + pulse * 0.04);
  const badgeH = badgeW * 1.2;
  ctx.save();
  ctx.globalAlpha *= done ? 0.68 : ready ? 1 : 0.9;
  const badgeOk = drawAsset("sceneEvents", badgeKey, 0, y, badgeW, badgeH, { anchorY: 0.52 });
  if (badgeOk && ready) {
    const promptW = feature.r * 4.2;
    const promptH = promptW * 0.253;
    ctx.globalAlpha *= 0.82 + pulse * 0.14;
    drawAsset("sceneEvents", "storyPromptReady", 0, y + badgeH * 0.72, promptW, promptH, { anchorY: 0.5 });
  }
  ctx.restore();
  if (badgeOk) return true;

  const size = feature.r * (ready ? 1.28 + pulse * 0.12 : done ? 0.88 + pulse * 0.03 : 1.02 + pulse * 0.05);
  ctx.save();
  ctx.translate(0, y);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = done ? 0.62 : ready ? 1 : 0.92;
  ctx.fillStyle = ready ? "rgba(37, 28, 18, 0.94)" : done ? "rgba(22, 25, 20, 0.68)" : "rgba(28, 24, 18, 0.86)";
  ctx.strokeStyle = ready ? "rgba(236, 198, 98, 0.98)" : done ? "rgba(122, 160, 128, 0.58)" : "rgba(214, 165, 77, 0.82)";
  ctx.lineWidth = Math.max(1.5, feature.r * 0.07);
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.48, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = ready ? "rgba(82, 180, 137, 0.84)" : done ? "rgba(82, 180, 137, 0.28)" : "rgba(82, 180, 137, 0.44)";
  ctx.lineWidth = Math.max(1, feature.r * 0.035);
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.62, -Math.PI * 0.18, Math.PI * 1.18);
  ctx.stroke();
  ctx.fillStyle = ready ? "rgba(255, 235, 166, 0.98)" : done ? "rgba(177, 205, 158, 0.8)" : "rgba(226, 190, 103, 0.86)";
  ctx.font = `800 ${Math.max(15, size * 0.56)}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(done ? "记" : "缘", 0, -1);
  ctx.strokeStyle = "rgba(236, 198, 98, 0.64)";
  ctx.lineWidth = Math.max(1, feature.r * 0.035);
  ctx.beginPath();
  ctx.moveTo(0, size * 0.48);
  ctx.lineTo(0, size * 0.82);
  ctx.stroke();
  if (ready) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.34 + pulse * 0.28;
    ctx.strokeStyle = "rgba(236, 198, 98, 0.82)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, size * (0.72 + pulse * 0.18), 0, TAU);
    ctx.stroke();
    ctx.fillStyle = "rgba(82, 180, 137, 0.2)";
    ctx.beginPath();
    ctx.arc(0, 0, size * (0.58 + pulse * 0.1), 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = "rgba(247, 226, 160, 0.95)";
    ctx.font = `800 ${Math.max(11, feature.r * 0.34)}px "KaiTi", serif`;
    ctx.textAlign = "center";
    ctx.fillText("靠近记入轮回", 0, size * 1.25);
  }
  ctx.restore();
  return true;
}

function storyTriggerRadius(event) {
  return Math.max(event.triggerRadius || 0, 132, event.r * 3.35 + 48);
}

function drawMapFeature(feature) {
  const p = toView(feature);
  ctx.save();
  ctx.translate(p.x, p.y);
  const seenEvent = feature.event && state.storySeen[storyKey(feature)];
  const unseenEvent = feature.event && !seenEvent;
  const eventReady = unseenEvent && dist(feature, state.player) < storyTriggerRadius(feature);
  const eventStatus = seenEvent ? "done" : eventReady ? "ready" : "idle";
  const usesFormalSceneEventAtlas = feature.event && state.map?.scenePack === "sword_tomb";
  if (feature.event && !usesFormalSceneEventAtlas) drawStoryMarkerUnder(feature, eventStatus);
  if (feature.event && drawSceneEventFeature(feature)) {
    if (!usesFormalSceneEventAtlas) drawStoryMarkerOver(feature, eventStatus);
    ctx.restore();
    return;
  }
  if (drawScenePackPropFeature(feature)) {
    ctx.restore();
    return;
  }
  if (drawQingqiuPropFeature(feature)) {
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
    if (feature.event) drawStoryMarkerOver(feature, eventStatus);
    ctx.restore();
    return;
  }
  if (feature.event) drawStoryMarkerOver(feature, eventStatus);
  ctx.restore();
}

function drawScenePackPropFeature(feature) {
  const pack = state.map?.scenePack;
  const specs = {
    sword_tomb: {
      xuanyuanBuriedSwordGrass: { key: "xuanyuan_buried_sword_grass_v033e", variants: 1, w: 3.08, h: 1.5, y: 0.12, alpha: 0.9, anchorY: 0.56 },
      xuanyuanBrokenArrayStone: { key: "xuanyuan_broken_array_stone_v033e", variants: 1, w: 2.85, h: 1.5, y: 0.1, alpha: 0.84, anchorY: 0.56 },
      xuanyuanLowOathBase: { key: "xuanyuan_low_oath_base_v033e", variants: 1, w: 2.34, h: 1.22, y: 0.08, alpha: 0.8, anchorY: 0.54 },
      xuanyuanClothTrace: { key: "xuanyuan_cloth_trace_v033e", variants: 1, w: 2.78, h: 1.18, y: 0.06, alpha: 0.76, anchorY: 0.54 },
      xuanyuanSwordScatter: { key: "xuanyuan_sword_scatter_v033e", variants: 1, w: 2.34, h: 0.98, y: 0.06, alpha: 0.78, anchorY: 0.54 },
      xuanyuanBronzeFragment: { key: "xuanyuan_bronze_fragment_v033e", variants: 1, w: 2.08, h: 0.94, y: 0.05, alpha: 0.76, anchorY: 0.54 },
      xuanyuanBuriedSwordGrassF: { key: "xuanyuan_buried_sword_grass_v033f", variants: 1, w: 2.62, h: 1.72, y: 0.18, alpha: 0.9, anchorY: 0.68 },
      xuanyuanSwordCluster: { key: "xuanyuan_sword_cluster_v033f", variants: 1, w: 2.52, h: 1.66, y: 0.16, alpha: 0.84, anchorY: 0.68 },
      xuanyuanCrackedStoneDisk: { key: "xuanyuan_cracked_stone_disk_v033f", variants: 1, w: 2.95, h: 1.74, y: 0.1, alpha: 0.84, anchorY: 0.58 },
      xuanyuanBronzeMuralShard: { key: "xuanyuan_bronze_mural_shard_v033f", variants: 1, w: 2.65, h: 1.6, y: 0.08, alpha: 0.8, anchorY: 0.56 },
      xuanyuanCinnabarOathCloth: { key: "xuanyuan_cinnabar_oath_cloth_v033f", variants: 1, w: 3.14, h: 1.4, y: 0.06, alpha: 0.8, anchorY: 0.54 },
      xuanyuanCollapsedRitualBase: { key: "xuanyuan_collapsed_ritual_base_v033f", variants: 1, w: 2.6, h: 1.34, y: 0.08, alpha: 0.78, anchorY: 0.54 },
      xuanyuanInscriptionSlab: { key: "xuanyuan_inscription_slab_v033f", variants: 1, w: 2.4, h: 1.76, y: 0.14, alpha: 0.78, anchorY: 0.66 },
      xuanyuanLowArrayRing: { key: "xuanyuan_low_array_ring_v033f", variants: 1, w: 2.86, h: 1.38, y: 0.06, alpha: 0.76, anchorY: 0.54 },
      xuanyuanDryGrassClump: { key: "xuanyuan_dry_grass_clump_v033f", variants: 1, w: 2.48, h: 1.56, y: 0.14, alpha: 0.84, anchorY: 0.62 },
      xuanyuanBrokenScabbard: { key: "xuanyuan_broken_scabbard_v033f", variants: 1, w: 2.58, h: 1.26, y: 0.07, alpha: 0.78, anchorY: 0.54 },
      xuanyuanCloudMuralShard: { key: "xuanyuan_cloud_mural_shard_v033f", variants: 1, w: 2.84, h: 1.4, y: 0.06, alpha: 0.78, anchorY: 0.54 },
      xuanyuanBattlefieldRubble: { key: "xuanyuan_battlefield_rubble_v033f", variants: 1, w: 2.38, h: 1.38, y: 0.08, alpha: 0.8, anchorY: 0.56 },
      xuanyuanSwordTraceLow: { key: "xuanyuan_sword_trace_low_v033j", variants: 1, w: 3.35, h: 1.45, y: 0.12, alpha: 0.72, anchorY: 0.58 },
      xuanyuanBrokenRingLow: { key: "xuanyuan_broken_ring_low_v033j", variants: 1, w: 2.95, h: 1.48, y: 0.1, alpha: 0.7, anchorY: 0.56 },
      xuanyuanCinnabarScrapeLow: { key: "xuanyuan_cinnabar_scrape_low_v033j", variants: 1, w: 3.25, h: 1.28, y: 0.08, alpha: 0.62, anchorY: 0.54 },
      xuanyuanDryGrassLow: { key: "xuanyuan_dry_grass_low_v033j", variants: 1, w: 2.45, h: 1.36, y: 0.12, alpha: 0.66, anchorY: 0.58 }
    }
  }[pack];
  const spec = specs?.[feature.type];
  if (!spec) return false;
  const frame = spec.frames
    ? Math.floor((state.time + feature.phase) * spec.fps) % spec.frames
    : Math.floor(feature.phase * 1000) % spec.variants;
  return drawAsset("sceneProps", `${spec.key}_${frame}`, 0, feature.r * spec.y, feature.r * spec.w, feature.r * spec.h, {
    alpha: spec.alpha,
    anchorY: spec.anchorY,
    rotate: feature.rotate || 0
  });
}

function drawQingqiuPropFeature(feature) {
  if (state.map?.scenePack !== "qingqiu") return false;
  const specs = {
    qingqiuFoxfireSmall: { prefix: "foxfire_small", frames: 4, fps: 5.4, w: 2.1, h: 2.9, y: 0.44, alpha: 0.92, anchorY: 0.88 },
    qingqiuFoxfireMedium: { prefix: "foxfire_medium", frames: 4, fps: 4.8, w: 2.35, h: 3.1, y: 0.46, alpha: 0.94, anchorY: 0.88 },
    qingqiuFoxfireCluster: { prefix: "foxfire_cluster", frames: 4, fps: 4.2, w: 3.0, h: 3.2, y: 0.48, alpha: 0.9, anchorY: 0.88 },
    qingqiuGrass: { prefix: "grass_low", variants: 5, w: 2.35, h: 1.25, y: 0.28, alpha: 0.76, anchorY: 0.8 },
    foxMaskShard: { prefix: "fox_mask_shard", variants: 3, w: 2.5, h: 1.45, y: 0.26, alpha: 0.8, anchorY: 0.72 },
    groundRibbon: { prefix: "ground_ribbon", variants: 4, w: 3.2, h: 1.05, y: 0.18, alpha: 0.66, anchorY: 0.62 }
  };
  const spec = specs[feature.type];
  if (!spec) return false;
  const frame = spec.frames
    ? Math.floor((state.time + feature.phase) * spec.fps) % spec.frames
    : Math.floor(feature.phase * 1000) % spec.variants;
  return drawAsset("qingqiuProps", `${spec.prefix}_${frame}`, 0, feature.r * spec.y, feature.r * spec.w, feature.r * spec.h, {
    alpha: spec.alpha,
    anchorY: spec.anchorY,
    rotate: feature.rotate || 0
  });
}

function drawSceneEventFeature(feature) {
  if (state.map?.scenePack === "sword_tomb") {
    const seen = state.storySeen[storyKey(feature)];
    const ready = !seen && dist(feature, state.player) < storyTriggerRadius(feature);
    const eventSpec = {
      brokenSword: {
        category: "sceneEvents",
        key: ready ? "xuanyuanStoneDiskReady" : seen ? "xuanyuanStoneDiskDone" : "xuanyuanStoneDiskIdle",
        w: ready ? 2.8 : 2.35,
        h: ready ? 1.98 : 1.66,
        y: 0.24,
        anchorY: 0.58
      },
      memoryStele: {
        category: "sceneEvents",
        key: ready ? "xuanyuanStoneDiskReady" : seen ? "xuanyuanStoneDiskDone" : "xuanyuanStoneDiskIdle",
        w: ready ? 2.8 : 2.35,
        h: ready ? 1.98 : 1.66,
        y: 0.24,
        anchorY: 0.58
      }
    }[feature.type];
    if (eventSpec && assetReady(eventSpec.category, eventSpec.key)) {
      const pulse = 0.5 + 0.5 * Math.sin(state.time * 4.1 + feature.phase);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = ready ? 0.2 + pulse * 0.12 : seen ? 0.045 + pulse * 0.025 : 0.11 + pulse * 0.055;
      drawFormalUiSprite(
        ready ? "storyMarkerReadyHalo" : seen ? "storyMarkerDoneHalo" : "storyMarkerIdleHalo",
        0,
        feature.r * 0.34,
        feature.r * (ready ? 3.2 : 2.62),
        feature.r * (ready ? 1.86 : 1.46),
        { anchorY: 0.58 }
      );
      ctx.restore();
      const eventDrawn = drawAsset(eventSpec.category, eventSpec.key, 0, feature.r * eventSpec.y, feature.r * eventSpec.w, feature.r * eventSpec.h, {
        alpha: seen ? 0.58 : ready ? 1 : 0.94,
        anchorY: eventSpec.anchorY
      });
      if (ready) {
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.78 + pulse * 0.16;
        ctx.fillStyle = "rgba(255, 232, 156, 0.92)";
        ctx.font = `800 ${Math.max(11, feature.r * 0.32)}px "KaiTi", "STKaiti", serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0, 0, 0, 0.48)";
        ctx.shadowBlur = 4;
        ctx.fillText("靠近记入轮回", 0, -feature.r * 0.98);
        ctx.restore();
      }
      return eventDrawn;
    }
  }

  if (state.map?.scenePack === "qingqiu") {
    const qingqiuEvent = {
      foxfireVow: { idle: "foxfireVowIdle", ready: "foxfireVowReady", done: "foxfireVowDone", w: 4.15, h: 4.9, y: 0.42 },
      oldVowStele: { idle: "oldVowSteleIdle", ready: "oldVowSteleReady", done: "oldVowSteleDone", w: 3.25, h: 4.35, y: 0.34 }
    }[feature.type];
    if (qingqiuEvent) {
      const seen = state.storySeen[storyKey(feature)];
      const ready = !seen && dist(feature, state.player) < storyTriggerRadius(feature);
      const eventAsset = seen ? qingqiuEvent.done : ready ? qingqiuEvent.ready : qingqiuEvent.idle;
      if (ready) {
        const pulse = 0.5 + 0.5 * Math.sin(state.time * 4.1 + feature.phase);
        const img = assets.vfx.level_lotus_burst || assets.vfx.pickup_orb_burst;
        if (img) {
          const r = feature.r * (2.8 + pulse * 0.24);
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = 0.18 + pulse * 0.1;
          ctx.drawImage(img, -r * 0.62, feature.r * 0.08 - r * 0.28, r * 1.24, r * 0.56);
          ctx.restore();
        }
      }
      const ok = drawAsset("sceneEvents", eventAsset, 0, feature.r * qingqiuEvent.y, feature.r * qingqiuEvent.w, feature.r * qingqiuEvent.h, {
        alpha: seen ? 0.58 : ready ? 1 : 0.92,
        anchorY: 0.86
      });
      if (!ok) return false;
      return true;
    }
  }
  const eventAsset = {
    brokenSword: "brokenSword",
    memoryStele: "memoryStele",
    foxfire: state.map?.scenePack === "qingqiu" ? "foxfire" : ""
  }[feature.type];
  if (!eventAsset) return false;
  const w = feature.r * 5.3;
  const h = feature.r * 5.3;
  const ok = drawAsset("sceneEvents", eventAsset, 0, feature.r * 0.38, w, h, {
    alpha: state.storySeen[storyKey(feature)] ? 0.52 : 0.98,
    anchorY: 0.86
  });
  if (!ok) return false;
  return true;
}

function drawShadow(entity, scale = 1, options = {}) {
  const { y = 0.72, alpha = 0.34, squash = 1 } = options;
  const p = toView(entity);
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + entity.r * y, entity.r * 1.38 * scale, entity.r * 0.34 * scale * squash, 0, 0, TAU);
  ctx.fill();
}

function drawPlayer(player) {
  const p = toView(player);
  drawShadow(player, 1.28, { y: 0.82, alpha: 0.38, squash: 0.9 });
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
}

function drawEnemyBossTag(enemy) {
  if (!enemy.boss) return;
  const label = enemy.chapterBossName || state.chapter?.bossName || "章节 Boss";
  const y = -enemy.r * 3.55;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 15px KaiTi, STKaiti, Microsoft YaHei, serif";
  const w = Math.max(128, ctx.measureText(label).width + 56);
  drawFormalUiSprite("bossNamePlaque", 0, y + 5, w, 32, { anchorY: 0.5, alpha: 0.95 });
  ctx.fillStyle = "#ffe9a9";
  ctx.shadowColor = "rgba(230, 109, 58, 0.52)";
  ctx.shadowBlur = 8;
  ctx.fillText(label, 0, y);
  ctx.font = "800 10px Microsoft YaHei, sans-serif";
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255, 232, 176, 0.78)";
  ctx.fillText("章节 Boss", 0, y + 18);
  ctx.restore();
}

function drawEnemyHealthBar(enemy) {
  const isBoss = Boolean(enemy.boss);
  const barW = enemy.r * (isBoss ? 3.15 : 2.25);
  const barH = isBoss ? 8 : 6;
  const y = enemy.r + 7;
  const fillKey = isBoss ? "bossHpFillSmall" : enemy.elite ? "eliteHpFill" : "enemyHpFill";
  if (!drawFormalUiSprite("enemyHpTrack", 0, y, barW, barH, { anchorY: 0.5, alpha: isBoss ? 0.9 : 0.78 })) {
    return false;
  }
  drawFormalUiSprite(fillKey, -barW * (1 - Math.max(0, enemy.hp / enemy.maxHp)) / 2, y, barW, barH, {
    anchorY: 0.5,
    clipRatio: Math.max(0, enemy.hp / enemy.maxHp),
    alpha: isBoss ? 0.95 : 0.88
  });
  return true;
}

function drawEnemy(enemy) {
  const p = toView(enemy);
  const s = screen();
  if (p.x < -120 || p.x > s.w + 120 || p.y < -140 || p.y > s.h + 140) return;
  const isBoss = Boolean(enemy.boss);
  drawShadow(enemy, isBoss ? 1.78 : enemy.elite ? 1.3 : 1.12, {
    y: isBoss ? 0.96 : enemy.elite ? 0.78 : 0.74,
    alpha: isBoss ? 0.42 : enemy.elite ? 0.36 : 0.3,
    squash: isBoss ? 0.82 : 0.92
  });
  if (isBoss) {
    const phasePulse = enemy.bossPhase === "enrage" ? 0.52 : enemy.bossPhase === "summon" ? 0.36 : 0.24;
    const flash = Math.max(enemy.bossCastFlash || 0, enemy.bossBurstFlash || 0);
    const auraAlpha = Math.min(0.62, phasePulse + flash * 0.82);
    drawVfxAsset(flash > 0.34 ? "boss_phase_flare" : "boss_entry", p.x, p.y + enemy.r * 0.55, enemy.r * (2.6 + flash * 1.6), {
      rotate: Math.sin(state.time * 1.8) * 0.08,
      alpha: auraAlpha,
      w: flash > 0.34 ? 0.92 : 1.44,
      h: flash > 0.34 ? 1.24 : 0.72,
      anchorY: 0.62
    });
  }
  const enemyKey = enemy.type || (enemy.elite ? "elite" : "wraith");
  const fallbackEnemyKey = enemy.elite ? "elite" : "wraith";
  const pressureMode = state.enemies.length > 42 && !enemy.elite && dist(enemy, state.player) > 460;
  const sway = Math.sin((performance.now() * 0.005) + enemy.x * 0.02) * 0.04;
  const spriteW = enemy.r * (isBoss ? (enemy.spriteW ?? 7.2) : enemy.elite ? 5.0 : 4.7);
  const spriteH = enemy.r * (isBoss ? (enemy.spriteH ?? 8.6) : enemy.elite ? 5.35 : 5.05);
  const spriteAnchorY = isBoss ? (enemy.spriteAnchorY ?? 0.94) : 0.9;
  const spriteFps = isBoss ? 5 : enemy.elite ? 6 : 7;
  if (!pressureMode && (
    drawAnimatedAsset("enemies", enemyKey, enemy.facing || "right", 3, enemy.animTime, p.x, p.y + (isBoss ? 18 : 12), spriteW, spriteH, {
      alpha: enemy.slowTime > 0 ? 0.78 : 1,
      anchorY: spriteAnchorY,
      fps: spriteFps
    }) ||
    drawAnimatedAsset("enemies", fallbackEnemyKey, enemy.facing || "right", 3, enemy.animTime, p.x, p.y + (isBoss ? 18 : 12), spriteW, spriteH, {
    alpha: enemy.slowTime > 0 ? 0.78 : 1,
    anchorY: spriteAnchorY,
    fps: spriteFps
    })
  )) {
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
    drawEnemyBossTag(enemy);
    drawEnemyHealthBar(enemy);
    ctx.restore();
    return;
  }
  if (
    drawAsset("enemies", `${enemyKey}_${enemy.facing || "right"}_1`, p.x, p.y + 10, enemy.r * (enemy.elite ? 4.35 : 4.0), enemy.r * (enemy.elite ? 4.85 : 4.45), {
      rotate: sway,
      alpha: enemy.slowTime > 0 ? 0.78 : 1,
      anchorY: 0.86
    }) ||
    drawAsset("enemies", `${fallbackEnemyKey}_${enemy.facing || "right"}_1`, p.x, p.y + 10, enemy.r * (enemy.elite ? 4.35 : 4.0), enemy.r * (enemy.elite ? 4.85 : 4.45), {
    rotate: sway,
    alpha: enemy.slowTime > 0 ? 0.78 : 1,
    anchorY: 0.86
    })
  ) {
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
    drawEnemyBossTag(enemy);
    drawEnemyHealthBar(enemy);
    ctx.restore();
    return;
  }
}

function drawProjectile(projectile) {
  const p = toView(projectile);
  ctx.save();
  ctx.translate(p.x, p.y);
  if (projectile.type === "sword") {
    const angle = Math.atan2(projectile.vy * 0.68, projectile.vx + projectile.vy * 0.22);
    ctx.restore();
    if (drawVfxAsset("sword_projectile", p.x, p.y, 17, { rotate: angle, alpha: 0.78, w: 1.72, h: 0.62, anchorY: 0.5 })) return;
    if (drawAsset("skills", "sword", p.x, p.y, 44, 18, { rotate: angle, anchorY: 0.5 })) return;
    return;
  } else {
    const angle = Math.atan2(projectile.vy * 0.68, projectile.vx + projectile.vy * 0.22);
    ctx.restore();
    if (drawVfxAsset("talisman_projectile", p.x, p.y, 20, { rotate: angle, alpha: 0.82, w: 1.58, h: 1.02, anchorY: 0.5 })) return;
    if (drawAsset("skills", "talisman", p.x, p.y, 28, 38, { rotate: angle + Math.sin(state.time * 8) * 0.35, anchorY: 0.5 })) return;
    return;
  }
}

function drawDrop(drop) {
  const p = toView(drop);
  const pulse = 1 + Math.sin(state.time * 8 + drop.x * 0.02) * 0.08;
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
  const fade = Math.max(0, 1 - t);
  if (pulse.kind === "phantom") {
    if (drawVfxAsset("phantom_mist_ring", p.x, p.y, pulse.radius * (0.34 + t * 0.28), {
      alpha: fade * 0.38,
      w: 1.72,
      h: 0.72,
      anchorY: 0.5
    })) return;
  }
  if (pulse.kind === "pickupBurst") {
    if (drawVfxAsset("pickup_orb_burst", p.x, p.y, pulse.radius * (0.32 + t * 0.3), {
      alpha: fade * 0.55,
      w: 1.18,
      h: 0.92,
      anchorY: 0.5
    })) return;
  }
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.strokeStyle = pulse.kind === "hurt" ? "#ba3b2f" : "#e7ba56";
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.lineWidth = 3;
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
  const atlas = {
    swordTrail: ["sword_slash", 1.02, 0.56, 0.62],
    swordCast: ["sword_slash", 1.12, 0.62, 0.62],
    swordImpact: ["hit_spark", 0.82, 0.66, 0.58],
    talismanTrail: ["talisman_projectile", 1.28, 0.88, 0.76],
    talismanCast: ["talisman_impact", 1.5, 1.26, 0.82],
    talismanImpact: ["talisman_impact", 1.56, 1.3, 0.82],
    flameRing: ["fire_explosion", 2.18, 1.82],
    phantomMist: ["phantom_mist_ring", 1.7, 0.82, 0.72],
    levelBurst: ["level_lotus_burst", 2.32, 1.64],
    dashTrail: ["dash_wind_trail", 1.55, 0.7, 0.72],
    hitSpark: ["hit_spark", 0.82, 0.7, 0.54],
    killBloom: ["kill_bloom", 1.55, 1.28, 0.76],
    pickupBurst: ["pickup_orb_burst", 1.3, 1.06, 0.74],
    bossEntry: ["boss_entry", 2.35, 1.22, 0.88],
    bossRuptureWarning: ["boss_rupture_warning", 1.78, 1.02, 0.76],
    bossRuptureBurst: ["boss_rupture_burst", 1.92, 1.08, 0.9],
    bossShockwave: ["boss_shockwave", 2.24, 1.18, 0.82],
    bossPhaseFlare: ["boss_phase_flare", 1.34, 1.72, 0.82],
    bossDeath: ["boss_death", 2.35, 1.35, 0.92]
  }[effect.type];
  if (atlas) {
    const angle = effect.angle || 0;
    if (drawVfxAsset(atlas[0], p.x, p.y, effect.radius * (0.72 + t * 0.35), {
      rotate: angle,
      alpha: Math.min(1, fade * (atlas[3] || 1)),
      w: atlas[1],
      h: atlas[2],
      anchorY: 0.5
    })) return;
  }
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

function syncRuntimeUi(force = false) {
  if (!state) return;
  const now = performance.now();
  if (!force && now - lastUiSync < UI_SYNC_INTERVAL) return;
  lastUiSync = now;

  const hpRatio = Math.max(0, state.player.hp / state.player.maxHp);
  const hpValue = `${Math.max(0, Math.ceil(state.player.hp))}/${state.player.maxHp}`;
  const xpNeed = Math.max(0, state.player.nextXp - state.player.xp);
  const xpValue = `${state.player.xp}/${state.player.nextXp}  差${xpNeed}`;
  const xpRatio = state.player.xp / state.player.nextXp;
  const levelValue = CONFIG.realms[Math.min(CONFIG.realms.length - 1, state.player.level - 1)];
  const timeValue = formatTime(state.time);
  const killValue = String(state.kills);

  setText(ui.hpText, hpValue);
  setWidth(ui.hpBar, hpRatio);
  setText(ui.xpText, xpValue);
  setWidth(ui.xpBar, xpRatio);
  setText(ui.levelText, levelValue);
  setText(ui.timeText, timeValue);
  setText(ui.killText, killValue);
  setText(ui.mobileHpText, hpValue);
  setWidth(ui.mobileHpBar, hpRatio);
  setText(ui.mobileXpText, `差${xpNeed}`);
  setWidth(ui.mobileXpBar, xpRatio);
  setText(ui.mobileLevelText, levelValue);
  setText(ui.mobileTimeText, timeValue);
  setText(ui.mobileKillText, killValue);
  setText(ui.soulText, state.resources.soul);
  setText(ui.fireText, state.resources.fire);
  setText(ui.dockLevelText, state.player.level);
  setText(ui.buildText, buildSummary());
  setText(ui.buildQuickText, buildQuickSummary());
  syncBuildQuickUi();
  syncChapterReadabilityUi();

  if (ui.dashBtn) {
    const ready = state.player.dashCooldown <= 0;
    ui.dashBtn.classList.toggle("is-ready", ready);
    setText(ui.dashBtn, ready ? "冲刺" : state.player.dashCooldown.toFixed(1));
  }
}

function syncChapterReadabilityUi() {
  const alert = state.chapter?.alert;
  const overlayOpen = !ui.choices?.classList.contains("hidden")
    || !ui.storyOverlay?.classList.contains("hidden")
    || !ui.start?.classList.contains("hidden")
    || !ui.gameOver?.classList.contains("hidden");
  const showAlert = Boolean(alert && alert.life > 0 && !overlayOpen);
  if (ui.chapterAlert) {
    ui.chapterAlert.classList.toggle("hidden", !showAlert);
    if (showAlert) {
      ui.chapterAlert.dataset.tone = alert.tone || "neutral";
      ui.chapterAlert.style.setProperty("--alert-life", Math.max(0, Math.min(1, alert.life / alert.maxLife)).toFixed(3));
      setText(ui.chapterAlertTitle, alert.title);
      setText(ui.chapterAlertText, alert.text);
    }
  }

  const boss = activeChapterBoss();
  if (ui.bossFrame) {
    ui.bossFrame.classList.toggle("hidden", !boss);
    if (boss) {
      setText(ui.bossNameText, boss.chapterBossName || state.chapter.bossName || "章节 Boss");
      setText(ui.bossPhaseText, `${bossPhaseText(boss)} · 限时 ${compactTime(CHAPTER_ONE_TIMELINE.limit - state.time)}`);
      setWidth(ui.bossHpBar, boss.hp / boss.maxHp);
    }
  }
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
  for (const pulse of state.pulses) drawPulse(pulse);
  for (const drop of state.drops) drawDrop(drop);
  for (const projectile of state.projectiles) drawProjectile(projectile);
  const visibleForWorldLayer = visibleMapFeatures();
  const sceneEvents = [...state.map.events, ...visibleForWorldLayer.events]
    .map(event => ({ ...event, __sceneEvent: true }));
  const enemies = state.enemies.map(enemy => ({ ...enemy, __enemy: true }));
  const worldItems = [...sceneEvents, ...enemies, { ...state.player, __player: true }]
    .sort((a, b) => a.y - b.y);
  let playerDrawn = false;
  for (const item of worldItems) {
    if (item.__sceneEvent) {
      drawMapFeature(item);
    } else if (item.__player) {
      drawPlayer(state.player);
      playerDrawn = true;
    } else if (item.__enemy) {
      drawEnemy(item);
    }
  }
  if (!playerDrawn) drawPlayer(state.player);
  for (const text of state.damageTexts) drawDamageText(text);
  ctx.restore();

  syncRuntimeUi();
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
    if (touchStickKnob) touchStickKnob.style.transform = `translate(${nx * clamped}px, ${ny * clamped}px)`;
  }
}

function hideTouchStick() {
  touchMove.active = false;
  touchMove.id = null;
  touchMove.dx = 0;
  touchMove.dy = 0;
  if (ui.touchStick) {
    ui.touchStick.classList.remove("is-active");
    if (touchStickKnob) touchStickKnob.style.transform = "";
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
window.addEventListener("resize", scheduleResize, { passive: true });
window.visualViewport?.addEventListener("resize", scheduleResize, { passive: true });
canvas.addEventListener("pointerdown", event => {
  if (!state?.running || state.paused || event.pointerType === "mouse") return;
  event.preventDefault();
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
  event.preventDefault();
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
ui.buildQuickBtn?.addEventListener("click", () => {
  if (!state?.running || !ui.choices.classList.contains("hidden") || !ui.storyOverlay.classList.contains("hidden") || !ui.gameOver.classList.contains("hidden")) return;
  openBuildPanel();
});
ui.pauseBtn.addEventListener("click", () => {
  if (!state?.running || !ui.choices.classList.contains("hidden") || !ui.storyOverlay.classList.contains("hidden") || !ui.buildOverlay?.classList.contains("hidden")) return;
  state.paused = !state.paused;
  ui.pauseOverlay.classList.toggle("hidden", !state.paused);
  ui.pauseBtn.textContent = state.paused ? "续" : "暂";
  syncBuildQuickUi();
  lastTime = performance.now();
});
ui.pauseOverlay.addEventListener("click", event => {
  const action = event.target?.dataset?.action;
  if (action === "build") {
    openBuildPanel();
    return;
  }
  if (action !== "resume") return;
  state.paused = false;
  ui.pauseOverlay.classList.add("hidden");
  ui.pauseBtn.textContent = "暂";
  syncBuildQuickUi();
  lastTime = performance.now();
});
ui.buildOverlay?.addEventListener("click", event => {
  if (event.target?.dataset?.action !== "close-build") return;
  closeBuildPanel();
});
ui.restartBtn.addEventListener("click", () => {
  ui.gameOver.classList.add("hidden");
  ui.pauseOverlay.classList.add("hidden");
  ui.buildOverlay?.classList.add("hidden");
  ui.start.classList.remove("hidden");
  syncBuildQuickUi();
  renderLineageSelect();
});

resize();
loadAssets();
renderLineageSelect();
state = freshState();
requestAnimationFrame(loop);
