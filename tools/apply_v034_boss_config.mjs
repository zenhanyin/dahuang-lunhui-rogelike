import fs from "node:fs";

const file = "src/config.js";
let source = fs.readFileSync(file, "utf8");

source = source.replaceAll('enemy: "cinnabar_guard", name:', 'enemy: "chapter_red_flame", name:');
source = source.replace(
  "      radius: 28,\n      speed: 50,",
  "      radius: 32,\n      speed: 50,"
);
source = source.replace(
  "    cinnabar_guard: { hp: 92, hpRamp: 0.72, speed: 66, speedRamp: 0.08, damage: 24, radius: 20, xp: 11, elite: true }\n  }",
  "    cinnabar_guard: { hp: 92, hpRamp: 0.72, speed: 66, speedRamp: 0.08, damage: 24, radius: 20, xp: 11, elite: true },\n    chapter_red_flame: { hp: 760, hpRamp: 0, speed: 50, speedRamp: 0, damage: 28, radius: 32, xp: 36, elite: true, bossOnly: true }\n  }"
);

fs.writeFileSync(file, source, "utf8");
