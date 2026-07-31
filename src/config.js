window.DAHUANG_CONFIG = {
  realms: ["炼气一层", "炼气二层", "炼气三层", "筑基初成", "金丹凝魄", "元婴照海", "化神问天", "返虚入荒"],
  tuning: {
    spawnDelay: 0.86,
    spawnDelayMin: 0.26,
    spawnRamp: 0.0075,
    xpBase: 8,
    xpGrowth: 1.2,
    xpAdd: 6,
    pickupRange: 46,
    safeRadius: 180,
    minFeatureDistance: 72,
    minEventDistance: 150,
    maxPixelRatio: 1.5,
    maxEnemies: 68,
    maxProjectiles: 86,
    maxDrops: 58,
    maxPulses: 24,
    maxClouds: 12,
    maxDamageTexts: 42,
    maxEffects: 58
  },
  maps: [
    {
      id: "sword_tomb",
      name: "剑冢荒境",
      subtitle: "断剑、残旗与旧战痕",
      scenePack: "sword_tomb",
      tileAtlas: "xuanyuan_ground",
      tileSize: 1024,
      tileOrigin: "center",
      projection: "topdown",
      palette: ["#454034", "#3b3f42", "#211f20"],
      paperTint: "#b79a69",
      gridColor: "rgba(196, 158, 83, 0.08)",
      accentColor: "rgba(196, 158, 83, 0.18)",
      enemyPool: ["wraith", "elite"],
      variants: [
        { id: "broken-vow", name: "旧战残碑", featureBias: {}, eventBias: { brokenSword: 1 } },
        { id: "blade-dust", name: "剑尘荒径", featureBias: {}, eventBias: { memoryStele: 1 } },
        { id: "bronze-ruin", name: "青铜残阵", featureBias: {}, eventBias: { brokenSword: 1, memoryStele: 1 } }
      ],
      generation: {
        decals: [
          { type: "xuanyuanSwordTrace", asset: "decal_xuanyuan_sword_trace_v033e_01", count: [0, 1], radius: [46, 72] },
          { type: "xuanyuanSwordTrace", asset: "decal_xuanyuan_sword_trace_v033e_02", count: [0, 1], radius: [42, 68] },
          { type: "xuanyuanCloudLine", asset: "decal_xuanyuan_cloud_line_v033e_01", count: [0, 1], radius: [40, 64] },
          { type: "xuanyuanArrayDisk", asset: "decal_xuanyuan_array_disk_v033e_01", count: [0, 1], radius: [38, 58] },
          { type: "xuanyuanCinnabarTrace", asset: "decal_xuanyuan_cinnabar_trace_v033e_01", count: [0, 1], radius: [34, 54] },
          { type: "xuanyuanBronzeOxidation", asset: "decal_xuanyuan_bronze_oxidation_v033e_01", count: [0, 1], radius: [36, 56] },
          { type: "xuanyuanDetailCracks", asset: "decal_xuanyuan_detail_cracks_a_v033g_01", count: [1, 2], radius: [30, 52] },
          { type: "xuanyuanDetailCracks", asset: "decal_xuanyuan_detail_cracks_b_v033g_01", count: [0, 1], radius: [28, 48] },
          { type: "xuanyuanDetailCloudFresco", asset: "decal_xuanyuan_detail_cloud_fresco_a_v033g_01", count: [0, 1], radius: [34, 56] },
          { type: "xuanyuanDetailCloudFresco", asset: "decal_xuanyuan_detail_cloud_fresco_b_v033g_01", count: [0, 1], radius: [32, 54] },
          { type: "xuanyuanDetailSwordEngraving", asset: "decal_xuanyuan_detail_sword_engraving_a_v033g_01", count: [0, 1], radius: [34, 58] },
          { type: "xuanyuanDetailSwordEngraving", asset: "decal_xuanyuan_detail_sword_engraving_b_v033g_01", count: [0, 1], radius: [32, 54] },
          { type: "xuanyuanDetailBronzeOxidation", asset: "decal_xuanyuan_detail_bronze_oxidation_a_v033g_01", count: [0, 1], radius: [30, 50] },
          { type: "xuanyuanDetailCinnabarScrape", asset: "decal_xuanyuan_detail_cinnabar_scrape_a_v033g_01", count: [0, 1], radius: [26, 44] }
        ],
        features: [
          { type: "xuanyuanCrackedStoneDisk", count: [0, 1], radius: [34, 50], chunkChance: 0.4 },
          { type: "xuanyuanBronzeMuralShard", count: [0, 1], radius: [32, 48], chunkChance: 0.36 },
          { type: "xuanyuanCinnabarOathCloth", count: [0, 1], radius: [32, 46], chunkChance: 0.34 },
          { type: "xuanyuanCollapsedRitualBase", count: [0, 1], radius: [30, 44], chunkChance: 0.3 },
          { type: "xuanyuanLowArrayRing", count: [0, 1], radius: [30, 44], chunkChance: 0.34 },
          { type: "xuanyuanDryGrassClump", count: [0, 1], radius: [26, 40], chunkChance: 0.38 },
          { type: "xuanyuanCloudMuralShard", count: [0, 1], radius: [28, 44], chunkChance: 0.32 },
          { type: "xuanyuanBattlefieldRubble", count: [0, 1], radius: [28, 42], chunkChance: 0.3 },
          { type: "xuanyuanBuriedSwordGrassF", count: [0, 1], radius: [28, 42], chunkChance: 0.22 },
          { type: "xuanyuanSwordCluster", count: [0, 1], radius: [26, 38], chunkChance: 0.12 },
          { type: "xuanyuanInscriptionSlab", count: [0, 1], radius: [26, 38], chunkChance: 0.14 },
          { type: "xuanyuanBrokenScabbard", count: [0, 1], radius: [26, 38], chunkChance: 0.2 }
        ],
        events: [
          { type: "brokenSword", count: [1, 2], radius: [42, 56], chunkChance: 0.16 },
          { type: "memoryStele", count: [1, 1], radius: [40, 52], chunkChance: 0.14 }
        ]
      }
    },
    {
      id: "herb_marsh",
      name: "百草荒泽",
      subtitle: "丹火、灵井与赤土裂纹",
      scenePack: "herb_marsh",
      tileAtlas: "herb_marsh_seamless",
      tileSize: 512,
      palette: ["#3f4631", "#45543b", "#1d221c"],
      paperTint: "#b49866",
      gridColor: "rgba(91, 163, 128, 0.08)",
      accentColor: "rgba(91, 163, 128, 0.18)",
      enemyPool: ["wraith", "elite"],
      variants: [
        { id: "cauldron-ash", name: "丹火余烬", featureBias: { herbDanEmber: 2, herbMarshPool: 1 }, eventBias: { herbCauldron: 1 } },
        { id: "spirit-herbs", name: "百草灵泽", featureBias: { herbCluster: 4, herbMarshPool: 1 }, eventBias: { spiritWell: 1 } }
      ],
      generation: {
        decals: [
          { type: "herbGoldRoot", asset: "decal_herb_marsh_gold_root_01", count: [2, 4], radius: [50, 90] },
          { type: "herbWetVein", asset: "decal_herb_marsh_wet_vein_01", count: [2, 4], radius: [54, 98] },
          { type: "herbDanAsh", asset: "decal_herb_marsh_dan_ash_01", count: [1, 3], radius: [46, 82] }
        ],
        features: [
          { type: "herbCluster", count: [4, 9], radius: [12, 22] },
          { type: "herbDanEmber", count: [1, 3], radius: [12, 20] },
          { type: "herbMarshPool", count: [1, 3], radius: [24, 42] },
          { type: "grass", count: [2, 4], radius: [12, 20] }
        ],
        events: [
          { type: "herbCauldron", count: [1, 2], radius: [34, 46] },
          { type: "spiritWell", count: [1, 2], radius: [28, 40] }
        ]
      }
    },
    {
      id: "wilderness",
      name: "荒境深处",
      subtitle: "残碑、裂隙与轮回痕",
      scenePack: "wilderness",
      palette: ["#464233", "#3f453c", "#1f1f1d"],
      paperTint: "#ad8d61",
      gridColor: "rgba(102, 145, 126, 0.08)",
      accentColor: "rgba(102, 145, 126, 0.18)",
      enemyPool: ["wraith", "elite"],
      variants: [
        { id: "memory-waste", name: "轮回残墟", featureBias: { stele: 2, rift: 1 }, eventBias: { memoryStele: 2 } },
        { id: "rift-waste", name: "裂隙荒境", featureBias: { rift: 3, bone: 1 }, eventBias: { rift: 1 } }
      ],
      generation: {
        decals: [
          { type: "sceneTransition", asset: "wilderness_transition_1", count: [1, 2], radius: [110, 180] },
          { type: "sceneTransition", asset: "wilderness_transition_2", count: [0, 2], radius: [90, 150] }
        ],
        features: [
          { type: "stele", count: [2, 4], radius: [14, 24] },
          { type: "grass", count: [4, 8], radius: [12, 22] },
          { type: "bone", count: [1, 4], radius: [14, 24] },
          { type: "rift", count: [1, 3], radius: [28, 52] }
        ],
        events: [
          { type: "memoryStele", count: [1, 3], radius: [28, 42] },
          { type: "rift", count: [0, 1], radius: [34, 54] }
        ]
      }
    },
    {
      id: "wilds",
      name: "荒原试炼",
      subtitle: "野火残痕与流沙古阵",
      palette: ["#7a5730", "#56623d", "#201a16"],
      paperTint: "#c9a86b",
      gridColor: "rgba(88, 55, 30, 0.16)",
      accentColor: "rgba(55, 139, 107, 0.2)",
      enemyPool: ["wraith", "elite"],
      variants: [
        { id: "spirit-veins", name: "灵脉荒原", featureBias: { spirit: 2, grass: 2 }, eventBias: { spiritWell: 1 } },
        { id: "rift-wilds", name: "裂隙荒原", featureBias: { rift: 2, stone: 1, bone: 1 }, eventBias: { rift: 1 } },
        { id: "stone-array", name: "古石荒阵", featureBias: { stone: 6, stele: 1 }, eventBias: { shrine: 1 } }
      ],
      generation: {
        features: [
          { type: "spirit", count: [3, 6], radius: [34, 68] },
          { type: "stone", count: [8, 14], radius: [8, 22] },
          { type: "grass", count: [6, 11], radius: [12, 22] },
          { type: "bone", count: [1, 4], radius: [14, 24] },
          { type: "rift", count: [1, 3], radius: [28, 52] }
        ],
        events: [
          { type: "spiritWell", count: [1, 2], radius: [28, 40] },
          { type: "shrine", count: [1, 2], radius: [24, 34] },
          { type: "rift", count: [0, 1], radius: [34, 54] }
        ]
      }
    },
    {
      id: "qingqiu",
      name: "青丘残梦",
      subtitle: "青丘残梦、幻雾浓重",
      scenePack: "qingqiu",
      tileAtlas: "qingqiu_seamless",
      tileSize: 512,
      palette: ["#2f3c35", "#4a4058", "#17171d"],
      paperTint: "#b08a73",
      gridColor: "rgba(82, 52, 93, 0.13)",
      accentColor: "rgba(183, 110, 177, 0.18)",
      enemyPool: ["wraith", "elite"],
      variants: [
        { id: "mist-trace-heavy", name: "雾痕浓重", featureBias: { qingqiuGrass: 2, groundRibbon: 1 }, eventBias: { oldVowStele: 1 } },
        { id: "foxfire-heavy", name: "狐火旺盛", featureBias: { qingqiuFoxfireSmall: 3, qingqiuFoxfireMedium: 2, qingqiuFoxfireCluster: 1 }, eventBias: { foxfireVow: 2 } },
        { id: "old-vow", name: "旧誓残碑", featureBias: { foxMaskShard: 2, groundRibbon: 2 }, eventBias: { oldVowStele: 2 } }
      ],
      generation: {
        decals: [
          { type: "oldVowTrace", asset: "decal_qingqiu_old_vow_trace_ai_02", count: [1, 2], radius: [46, 82] },
          { type: "oldVowTrace", asset: "decal_qingqiu_old_vow_trace_ai_03", count: [0, 2], radius: [42, 76] },
          { type: "inkTealVein", asset: "decal_qingqiu_ink_teal_vein_ai_01", count: [0, 1], radius: [42, 76] },
          { type: "inkTealVein", asset: "decal_qingqiu_ink_teal_vein_ai_02", count: [0, 2], radius: [40, 72] },
          { type: "goldMuralLine", asset: "decal_qingqiu_gold_mural_lines_ai_01", count: [0, 1], radius: [38, 68] },
          { type: "goldMuralLine", asset: "decal_qingqiu_gold_mural_lines_ai_02", count: [0, 2], radius: [36, 64] }
        ],
        features: [
          { type: "qingqiuFoxfireSmall", count: [1, 3], radius: [9, 14] },
          { type: "qingqiuFoxfireMedium", count: [0, 2], radius: [13, 20] },
          { type: "qingqiuFoxfireCluster", count: [0, 1], radius: [16, 24] },
          { type: "qingqiuGrass", count: [3, 6], radius: [12, 20] },
          { type: "foxMaskShard", count: [0, 2], radius: [14, 22] },
          { type: "groundRibbon", count: [1, 3], radius: [18, 32] }
        ],
        events: [
          { type: "foxfireVow", count: [0, 1], radius: [24, 34], chunkChance: 0.08 },
          { type: "oldVowStele", count: [0, 1], radius: [28, 38], chunkChance: 0.12 }
        ]
      }
    }
  ],
  lineages: [
    {
      id: "sword",
      mapId: "sword_tomb",
      name: "轩辕遗剑",
      role: "飞剑直伤",
      memory: "前世曾守不周山，梦中总有一柄断剑回响。",
      color: "#f0c86a",
      base: { hp: 118, speed: 255 },
      weapons: { sword: { count: 2, damage: 20, delay: 0.48 } },
      passive: {}
    },
    {
      id: "witch",
      mapId: "qingqiu",
      name: "青丘巫女",
      role: "幻身控场",
      memory: "狐族旧誓尚未焚尽，幻雾会替你挡下一线生机。",
      color: "#d98bd8",
      base: { hp: 104, speed: 270 },
      weapons: { sword: { count: 1, damage: 14, delay: 0.58 }, talisman: { level: 1, count: 1, delay: 2.15 }, phantom: { level: 1, delay: 5.6 } },
      passive: {}
    },
    {
      id: "alchemist",
      mapId: "herb_marsh",
      name: "神农丹徒",
      role: "丹火续战",
      memory: "百草鼎里留着一缕未灭丹火，也藏着不死药污染的线索。",
      color: "#54b88a",
      base: { hp: 132, speed: 230 },
      weapons: { sword: { damage: 13, delay: 0.62 }, flame: { level: 1, damage: 48, radius: 132, delay: 4.8 } },
      passive: { alchemyHeal: 0.28 }
    }
  ],
  weapons: {
    sword: { level: 1, cooldown: 0, delay: 0.56, damage: 17, range: 300, count: 1, ui: { name: "剑气诀", icon: "sword", color: "#7ad5ee" } },
    talisman: { level: 0, cooldown: 1.2, delay: 2.35, damage: 28, range: 460, count: 0, ui: { name: "玄冰咒", icon: "talisman", color: "#78bff2" } },
    flame: { level: 0, cooldown: 3.2, delay: 5.2, damage: 42, radius: 128, ui: { name: "离火术", icon: "flame", color: "#e16935" } },
    phantom: { level: 0, cooldown: 2.2, delay: 6.0, radius: 160, slow: 0.54, ui: { name: "幻雾步", icon: "phantom", color: "#75c8a4" } }
  },
  upgrades: [
    { id: "wind-step", group: "common", name: "青风诀", text: "御风而行，移速 +15%，气血上限小幅提升。", icon: "wind", effects: [["player.speed", "add", 28], ["player.maxHp", "add", 18], ["player.hp", "heal", 26]] },
    { id: "soil", group: "common", name: "女娲息壤", text: "立即回复大量气血，妖丹拾取范围扩大。", icon: "earth", effects: [["player.hp", "heal", 70], ["player.pickupBonus", "add", 16]] },
    { id: "life-dew", group: "common", name: "甘露回生", text: "立即回复 45 点气血，并提高气血上限。", icon: "lotus", effects: [["player.hp", "heal", 45], ["player.maxHp", "add", 14]] },
    { id: "blood-jade", group: "common", name: "血玉护命", text: "每次拾取妖丹额外回复少量气血。", icon: "core", effects: [["passive.alchemyHeal", "add", 0.16], ["player.maxHp", "add", 8]] },
    { id: "tortoise-breath", group: "common", name: "玄龟息", text: "气血上限大幅提升，受伤后短暂无敌更久。", icon: "earth", effects: [["player.maxHp", "add", 34], ["mechanics.guard", "add", 1], ["player.hp", "heal", 34]] },
    { id: "houyi", group: "common", name: "后羿残弦", text: "飞行功法射程增加，灵剑冷却缩短。", icon: "arrow", effects: [["weapons.sword.delay", "mulMin", 0.84, 0.32], ["weapons.sword.range", "add", 38], ["weapons.talisman.range", "add", 40]] },
    { id: "demon-core", group: "common", name: "妖丹震响", text: "拾取妖丹时释放一圈小冲击。", icon: "core", effects: [["mechanics.pickupBurst", "add", 1]] },
    { id: "sword-count", group: "sword", name: "轩辕剑意", text: "灵剑数量 +1，剑气伤害提升。", icon: "sword", effects: [["weapons.sword.count", "add", 1], ["weapons.sword.damage", "add", 6], ["weapons.sword.level", "add", 1]] },
    { id: "sword-mark", group: "sword", name: "不周剑痕", text: "灵剑命中留下剑痕，三层后爆裂。", icon: "mark", effects: [["mechanics.swordMark", "set", 1], ["weapons.sword.damage", "add", 3]] },
    { id: "talisman-count", group: "witch", name: "太一符画", text: "追魂符数量 +1，伤害提升。", icon: "rune", effects: [["weapons.talisman.level", "add", 1], ["weapons.talisman.count", "add", 1], ["weapons.talisman.damage", "add", 8]] },
    { id: "fox-fog", group: "witch", name: "青丘幻身", text: "幻雾范围扩大，冷却缩短，妖邪在雾中更慢。", icon: "mist", effects: [["weapons.phantom.level", "add", 1], ["weapons.phantom.radius", "add", 24], ["weapons.phantom.delay", "addMin", -0.8, 3.8], ["weapons.phantom.slow", "addMin", -0.06, 0.34]] },
    { id: "split-talisman", group: "witch", name: "狐火分符", text: "符画命中被幻雾影响的妖邪时会分裂。", icon: "split", effects: [["mechanics.talismanSplit", "set", 1], ["weapons.talisman.damage", "add", 4]] },
    { id: "flame-ring", group: "alchemist", name: "祝融火环", text: "丹火范围和伤害提升，冷却缩短。", icon: "flame", effects: [["weapons.flame.level", "add", 1], ["weapons.flame.damage", "add", 16], ["weapons.flame.radius", "add", 18], ["weapons.flame.delay", "addMin", -0.7, 3.2]] },
    { id: "herb-heal", group: "alchemist", name: "百草回阳", text: "拾取妖丹时额外回复气血。", icon: "lotus", effects: [["passive.alchemyHeal", "add", 0.18], ["player.maxHp", "add", 10]] },
    { id: "medicine-cloud", group: "alchemist", name: "丹云余烬", text: "丹火击杀妖邪会留下持续灼烧的药云。", icon: "cloud", effects: [["mechanics.flameCloud", "set", 1], ["weapons.flame.damage", "add", 8]] }
  ],
  enemies: {
    wraith: { hp: 24, hpRamp: 0.34, speed: 76, speedRamp: 0.1, damage: 10, radius: 12, xp: 4 },
    elite: { hp: 62, hpRamp: 0.58, speed: 58, speedRamp: 0.08, damage: 20, radius: 18, xp: 8 }
  }
};
