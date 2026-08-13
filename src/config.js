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
  chapterOne: {
    pacing: {
      spawn: {
        baseDelay: 0.9,
        minDelay: 0.28,
        ramp: 0.0068
      },
      xp: {
        base: 8,
        growth: 1.2,
        add: 6,
        pickupRange: 46
      },
      levelUp: {
        swordDamage: 2,
        swordRange: 8,
        swordDelayMul: 0.97,
        swordDelayMin: 0.34,
        swordCountEvery: 3,
        feedbackText: "剑气增强"
      },
      runtimeLimits: {
        maxEnemies: 68,
        maxProjectiles: 86,
        maxDrops: 58,
        maxPulses: 24,
        maxDamageTexts: 42,
        maxEffects: 58
      }
    },
    timeline: {
      limit: 210,
      firstStory: 14,
      eliteWave: 42,
      secondStory: 70,
      bossWarning: 105,
      bossSpawn: 120
    },
    pressure: {
      spawnMultiplier: {
        opening: 0.78,
        afterFirstStory: 0.9,
        eliteWave: 1.05,
        bossWarning: 1.18,
        boss: 1.28
      },
      extraSpawnChance: {
        defaultAfter45: 0.3,
        eliteWave: 0.11,
        bossWarning: 0.2,
        boss: 0.27
      },
      randomEliteChance: {
        betweenEliteAndWarning: 0.018,
        betweenWarningAndBoss: 0.034,
        boss: 0.052
      }
    },
    eliteWave: {
      angles: [-0.52, 0.52],
      distanceX: 520,
      distanceY: 360,
      firstMemorySpeedScale: 0.88,
      byMap: {
        qingqiu: { enemy: "elite", hp: 104, damage: 19, speed: 56, xp: 16 },
        sword_tomb: { enemy: "cinnabar_guard", hp: 124, damage: 22, speed: 62, xp: 16 }
      }
    },
    boss: {
      byMap: {
        qingqiu: { enemy: "chapter_red_flame", name: "赤焰魇将" },
        sword_tomb: { enemy: "chapter_red_flame", name: "赤焰战魇" }
      },
      spawnAngle: -0.25,
      spawnDistanceX: 620,
      spawnDistanceY: 380,
      hpBase: 760,
      hpPerLevel: 52,
      damage: 28,
      radius: 32,
      speed: 50,
      xp: 36,
      maxStoryWeaken: 0.35,
      phaseGateDuration: 2.4,
      timers: {
        cast: 1.8,
        summon: 4.8,
        burst: 7.2
      },
      phases: [
        { threshold: 0.68, key: "summon", title: "Boss 转阶段", text: "赤焰召出护卫，妖潮压近", speedScale: 1.06, castCooldown: 2.05, summonCooldown: 6.8, burstCooldown: 8.5 },
        { threshold: 0.36, key: "enrage", title: "Boss 狂燃", text: "丹火失控，地面出现赤裂预警", speedScale: 1.18, castCooldown: 1.55, summonCooldown: 5.0, burstCooldown: 5.8 }
      ],
      groundRupture: {
        summon: { radius: 72, warningRadius: 92, damage: 12, count: 7 },
        enrage: { radius: 94, warningRadius: 118, damage: 18, count: 10 }
      },
      shockwave: {
        summon: { radius: 96, damage: 18, count: 10 },
        enrage: { radius: 126, damage: 28, count: 14 }
      },
      summons: {
        qingqiu: ["foxshade", "wraith"],
        sword_tomb: ["blade_thrall", "stone_imp"]
      }
    },
    stories: {
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
    }
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
      enemyPool: ["blade_thrall", "stone_imp", "wraith", "elite", "cinnabar_guard"],
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
          { type: "xuanyuanSwordTraceLow", count: [0, 1], radius: [30, 48], chunkChance: 0.46 },
          { type: "xuanyuanBrokenRingLow", count: [0, 1], radius: [30, 46], chunkChance: 0.42 },
          { type: "xuanyuanCinnabarScrapeLow", count: [0, 1], radius: [28, 44], chunkChance: 0.4 },
          { type: "xuanyuanDryGrassLow", count: [0, 1], radius: [24, 38], chunkChance: 0.44 },
          { type: "xuanyuanSwordScatter", count: [0, 1], radius: [24, 36], chunkChance: 0.22 }
        ],
        events: [
          { type: "brokenSword", count: [1, 2], radius: [42, 56], chunkChance: 0.16 },
          { type: "memoryStele", count: [1, 1], radius: [40, 52], chunkChance: 0.14 }
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
      enemyPool: ["wraith", "blade_thrall", "elite"],
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
      enemyPool: ["wraith", "blade_thrall", "elite"],
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
      enemyPool: ["foxshade", "wraith", "stone_imp", "elite"],
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
    { id: "blood-jade", group: "common", name: "血玉护命", text: "每次拾取妖丹额外回复少量气血。", icon: "core", effects: [["passive.pickupHeal", "add", 0.16], ["player.maxHp", "add", 8]] },
    { id: "tortoise-breath", group: "common", name: "玄龟息", text: "气血上限大幅提升，受伤后短暂无敌更久。", icon: "earth", effects: [["player.maxHp", "add", 34], ["mechanics.guard", "add", 1], ["player.hp", "heal", 34]] },
    { id: "houyi", group: "common", name: "后羿残弦", text: "飞行功法射程增加，灵剑冷却缩短。", icon: "arrow", effects: [["weapons.sword.delay", "mulMin", 0.84, 0.32], ["weapons.sword.range", "add", 38], ["weapons.talisman.range", "add", 40]] },
    { id: "demon-core", group: "common", name: "妖丹震响", text: "拾取妖丹时释放一圈小冲击。", icon: "core", effects: [["mechanics.pickupBurst", "add", 1]] },
    { id: "sword-count", group: "sword", name: "轩辕剑意", text: "灵剑数量 +1，剑气伤害提升。", icon: "sword", effects: [["weapons.sword.count", "add", 1], ["weapons.sword.damage", "add", 6], ["weapons.sword.level", "add", 1]] },
    { id: "sword-mark", group: "sword", name: "不周剑痕", text: "灵剑命中留下剑痕，三层后爆裂。", icon: "mark", effects: [["mechanics.swordMark", "set", 1], ["weapons.sword.damage", "add", 3]] },
    { id: "talisman-count", group: "witch", name: "太一符画", text: "追魂符数量 +1，伤害提升。", icon: "rune", effects: [["weapons.talisman.level", "add", 1], ["weapons.talisman.count", "add", 1], ["weapons.talisman.damage", "add", 8]] },
    { id: "fox-fog", group: "witch", name: "青丘幻身", text: "幻雾范围扩大，冷却缩短，妖邪在雾中更慢。", icon: "mist", effects: [["weapons.phantom.level", "add", 1], ["weapons.phantom.radius", "add", 24], ["weapons.phantom.delay", "addMin", -0.8, 3.8], ["weapons.phantom.slow", "addMin", -0.06, 0.34]] },
    { id: "split-talisman", group: "witch", name: "狐火分符", text: "符画命中被幻雾影响的妖邪时会分裂。", icon: "split", effects: [["mechanics.talismanSplit", "set", 1], ["weapons.talisman.damage", "add", 4]] }
  ],
  enemies: {
    wraith: { hp: 24, hpRamp: 0.34, speed: 76, speedRamp: 0.1, damage: 10, radius: 12, xp: 4 },
    blade_thrall: { hp: 30, hpRamp: 0.38, speed: 82, speedRamp: 0.11, damage: 11, radius: 13, xp: 5 },
    foxshade: { hp: 22, hpRamp: 0.32, speed: 96, speedRamp: 0.12, damage: 9, radius: 12, xp: 4 },
    stone_imp: { hp: 42, hpRamp: 0.46, speed: 56, speedRamp: 0.07, damage: 13, radius: 14, xp: 6 },
    elite: { hp: 62, hpRamp: 0.58, speed: 58, speedRamp: 0.08, damage: 20, radius: 18, xp: 8, elite: true },
    cinnabar_guard: { hp: 92, hpRamp: 0.72, speed: 66, speedRamp: 0.08, damage: 24, radius: 20, xp: 11, elite: true },
    chapter_red_flame: { hp: 760, hpRamp: 0, speed: 50, speedRamp: 0, damage: 28, radius: 32, xp: 36, elite: true, bossOnly: true }
  }
};
