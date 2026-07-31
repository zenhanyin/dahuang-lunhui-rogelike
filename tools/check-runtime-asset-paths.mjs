import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve("D:/Acodex3/dahuang-lunhui-lu");
const gameCode = readFileSync(resolve(root, "src/game.js"), "utf8");

const paths = [...new Set([...gameCode.matchAll(/`(assets\/[^`$]+)`/g)].map(match => match[1]))];
const missing = paths.filter(path => path.includes("${") ? false : !existsSync(resolve(root, path)));
console.log(JSON.stringify({
  total: paths.length,
  missing,
  xuanyuan: paths.filter(path => path.includes("xuanyuan_ground")),
}, null, 2));
if (missing.length) process.exit(1);
