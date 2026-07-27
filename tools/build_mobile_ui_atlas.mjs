import { statSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");

const out = "assets/runtime/webp/ui/mobile_hud_compact.webp";

const svg = String.raw`
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="300" viewBox="0 0 640 300">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d8b775"/>
      <stop offset="0.58" stop-color="#bd9253"/>
      <stop offset="1" stop-color="#92663e"/>
    </linearGradient>
    <radialGradient id="glow" cx="45%" cy="20%" r="90%">
      <stop offset="0" stop-color="#fff0b8" stop-opacity=".34"/>
      <stop offset=".5" stop-color="#d9b36d" stop-opacity=".08"/>
      <stop offset="1" stop-color="#422918" stop-opacity=".26"/>
    </radialGradient>
  </defs>
  <g>
    <path d="M36 18 H604 Q622 18 622 38 V262 Q622 282 602 282 H38 Q18 282 18 260 V40 Q18 18 36 18Z" fill="url(#paper)"/>
    <path d="M36 18 H604 Q622 18 622 38 V262 Q622 282 602 282 H38 Q18 282 18 260 V40 Q18 18 36 18Z" fill="url(#glow)"/>
    <path d="M42 30 H598 Q610 30 610 42 V258 Q610 270 598 270 H42 Q30 270 30 258 V42 Q30 30 42 30Z" fill="none" stroke="#6a3e29" stroke-opacity=".42" stroke-width="2"/>
    <path d="M48 42 C122 50 178 48 238 38 M402 40 C468 54 536 50 590 40" fill="none" stroke="#236d68" stroke-opacity=".52" stroke-width="4" stroke-linecap="round"/>
    <path d="M58 248 C116 240 176 252 240 240 M400 244 C466 234 520 250 586 240" fill="none" stroke="#8d3f31" stroke-opacity=".42" stroke-width="3" stroke-linecap="round"/>
    <path d="M44 48 C70 66 80 86 80 118 M596 48 C572 68 562 88 562 120" fill="none" stroke="#236d68" stroke-opacity=".48" stroke-width="5" stroke-linecap="round"/>
    <circle cx="46" cy="46" r="8" fill="#d4a750" stroke="#244f4c" stroke-width="4"/>
    <circle cx="594" cy="46" r="8" fill="#d4a750" stroke="#244f4c" stroke-width="4"/>
    <circle cx="46" cy="254" r="8" fill="#d4a750" stroke="#244f4c" stroke-width="4"/>
    <circle cx="594" cy="254" r="8" fill="#d4a750" stroke="#244f4c" stroke-width="4"/>
    <path d="M30 150 H610" stroke="#f4d28a" stroke-opacity=".12" stroke-width="20"/>
  </g>
</svg>`;

await sharp(Buffer.from(svg))
  .resize(320, 150)
  .webp({ lossless: true, effort: 5 })
  .toFile(out);

const stat = statSync(out);
console.log(JSON.stringify({ out, bytes: stat.size }, null, 2));
