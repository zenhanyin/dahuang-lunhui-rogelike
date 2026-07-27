import { statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");

const out = "assets/runtime/webp/ui/mobile_controls_atlas.webp";
const manifestOut = "assets/runtime/webp/ui/mobile_controls_atlas.json";

const svg = String.raw`
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="384" viewBox="0 0 1024 384">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d8b775"/>
      <stop offset=".58" stop-color="#b78048"/>
      <stop offset="1" stop-color="#6c402a"/>
    </linearGradient>
    <linearGradient id="dark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3b2d22"/>
      <stop offset="1" stop-color="#17110d"/>
    </linearGradient>
    <radialGradient id="soul" cx=".38" cy=".32" r=".72">
      <stop offset="0" stop-color="#b9ffe6"/>
      <stop offset=".45" stop-color="#42c399"/>
      <stop offset="1" stop-color="#123b32"/>
    </radialGradient>
    <radialGradient id="fire" cx=".38" cy=".32" r=".72">
      <stop offset="0" stop-color="#ffe09f"/>
      <stop offset=".5" stop-color="#d95834"/>
      <stop offset="1" stop-color="#602014"/>
    </radialGradient>
    <radialGradient id="jade" cx=".42" cy=".34" r=".7">
      <stop offset="0" stop-color="#e5fff2"/>
      <stop offset=".48" stop-color="#44b58d"/>
      <stop offset="1" stop-color="#153a31"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" seed="43"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="table" tableValues="0 .13"/></feComponentTransfer>
    </filter>
    <filter id="shadow" x="-25%" y="-30%" width="150%" height="170%">
      <feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#000" flood-opacity=".44"/>
    </filter>
  </defs>

  <g id="resourceSoul" transform="translate(0 0)" filter="url(#shadow)">
    <path d="M16 8 H148 L158 18 V58 L148 68 H16 L6 58 V18 Z" fill="url(#paper)"/>
    <path d="M20 14 H144 L152 22 V54 L144 62 H20 L12 54 V22 Z" fill="url(#dark)" opacity=".68"/>
    <path d="M22 18 C60 10 88 16 140 14 M26 58 C58 52 92 58 136 54" fill="none" stroke="#25816e" stroke-opacity=".55" stroke-width="3"/>
    <circle cx="42" cy="36" r="17" fill="url(#soul)" filter="url(#shadow)"/>
    <circle cx="42" cy="36" r="24" fill="none" stroke="#55d4ad" stroke-opacity=".34" stroke-width="2"/>
    <circle cx="15" cy="17" r="5" fill="#c99b4d" stroke="#2e6258" stroke-width="3"/>
    <circle cx="149" cy="17" r="5" fill="#c99b4d" stroke="#2e6258" stroke-width="3"/>
    <circle cx="15" cy="59" r="5" fill="#c99b4d" stroke="#2e6258" stroke-width="3"/>
    <circle cx="149" cy="59" r="5" fill="#c99b4d" stroke="#2e6258" stroke-width="3"/>
  </g>

  <g id="resourceFire" transform="translate(176 0)" filter="url(#shadow)">
    <path d="M16 8 H148 L158 18 V58 L148 68 H16 L6 58 V18 Z" fill="url(#paper)"/>
    <path d="M20 14 H144 L152 22 V54 L144 62 H20 L12 54 V22 Z" fill="url(#dark)" opacity=".68"/>
    <path d="M22 18 C60 10 88 16 140 14 M26 58 C58 52 92 58 136 54" fill="none" stroke="#8c3c31" stroke-opacity=".62" stroke-width="3"/>
    <circle cx="42" cy="36" r="17" fill="url(#fire)" filter="url(#shadow)"/>
    <circle cx="42" cy="36" r="24" fill="none" stroke="#dd6640" stroke-opacity=".36" stroke-width="2"/>
    <circle cx="15" cy="17" r="5" fill="#c99b4d" stroke="#6b3428" stroke-width="3"/>
    <circle cx="149" cy="17" r="5" fill="#c99b4d" stroke="#6b3428" stroke-width="3"/>
    <circle cx="15" cy="59" r="5" fill="#c99b4d" stroke="#6b3428" stroke-width="3"/>
    <circle cx="149" cy="59" r="5" fill="#c99b4d" stroke="#6b3428" stroke-width="3"/>
  </g>

  <g id="pause" transform="translate(368 0)" filter="url(#shadow)">
    <circle cx="42" cy="42" r="38" fill="#2a2118" stroke="#c99b4d" stroke-width="4"/>
    <circle cx="42" cy="42" r="30" fill="none" stroke="#236d68" stroke-opacity=".65" stroke-width="2"/>
    <path d="M33 23 V61 M51 23 V61" stroke="#f0d59a" stroke-width="8" stroke-linecap="round"/>
    <path d="M42 4 C50 15 66 17 80 20 M42 80 C30 68 16 66 4 62" fill="none" stroke="#8d3f31" stroke-opacity=".55" stroke-width="3"/>
  </g>

  <g id="level" transform="translate(472 0)" filter="url(#shadow)">
    <path d="M14 4 H70 L82 16 V70 L70 82 H14 L2 70 V16 Z" fill="url(#paper)"/>
    <path d="M18 12 H66 L74 20 V66 L66 74 H18 L10 66 V20 Z" fill="url(#dark)" opacity=".5"/>
    <path d="M18 18 C34 12 48 16 68 14 M18 68 C34 62 50 68 66 64" fill="none" stroke="#236d68" stroke-opacity=".46" stroke-width="3"/>
    <circle cx="14" cy="16" r="5" fill="#c99b4d" stroke="#2e6258" stroke-width="3"/>
    <circle cx="70" cy="16" r="5" fill="#c99b4d" stroke="#2e6258" stroke-width="3"/>
    <circle cx="14" cy="70" r="5" fill="#c99b4d" stroke="#2e6258" stroke-width="3"/>
    <circle cx="70" cy="70" r="5" fill="#c99b4d" stroke="#2e6258" stroke-width="3"/>
  </g>

  <g id="dash" transform="translate(584 0)" filter="url(#shadow)">
    <circle cx="56" cy="56" r="50" fill="#1a1713" stroke="#d2aa5c" stroke-width="4"/>
    <circle cx="56" cy="56" r="42" fill="none" stroke="#43b88e" stroke-width="4" stroke-opacity=".72"/>
    <path d="M33 62 C52 36 67 32 83 27 C74 44 64 57 43 75" fill="none" stroke="#d6f1d4" stroke-width="8" stroke-linecap="round"/>
    <path d="M25 72 C42 72 56 68 71 58" fill="none" stroke="#43b88e" stroke-width="6" stroke-linecap="round"/>
    <path d="M66 92 C82 84 94 74 104 58" fill="none" stroke="#b74431" stroke-opacity=".72" stroke-width="5" stroke-linecap="round"/>
  </g>

  <g id="stickBase" transform="translate(0 112)" filter="url(#shadow)">
    <circle cx="82" cy="82" r="74" fill="#1b1711" fill-opacity=".36" stroke="#d3aa60" stroke-width="3" stroke-opacity=".42"/>
    <circle cx="82" cy="82" r="48" fill="none" stroke="#f3d99b" stroke-opacity=".2" stroke-width="2"/>
    <path d="M82 12 L82 38 M82 126 L82 152 M12 82 L38 82 M126 82 L152 82" stroke="#d3aa60" stroke-opacity=".34" stroke-width="7" stroke-linecap="round"/>
    <path d="M82 47 C104 65 104 99 82 117 C60 99 60 65 82 47Z" fill="none" stroke="#236d68" stroke-opacity=".42" stroke-width="5"/>
  </g>

  <g id="stickKnob" transform="translate(192 144)" filter="url(#shadow)">
    <circle cx="46" cy="46" r="38" fill="url(#paper)" stroke="#d2aa5c" stroke-width="3"/>
    <circle cx="46" cy="46" r="26" fill="url(#dark)" opacity=".62"/>
    <path d="M46 23 C59 34 60 57 46 69 C32 57 33 34 46 23Z" fill="none" stroke="#f0d59a" stroke-opacity=".45" stroke-width="5"/>
  </g>
</svg>`;

await sharp(Buffer.from(svg))
  .webp({ quality: 88, effort: 5 })
  .toFile(out);

const manifest = {
  version: "0.3.2c-mobile-hud-atlas",
  image: "mobile_controls_atlas.webp",
  size: [1024, 384],
  sprites: {
    resourceSoul: [0, 0, 164, 76],
    resourceFire: [176, 0, 164, 76],
    pause: [368, 0, 84, 84],
    level: [472, 0, 84, 84],
    dash: [584, 0, 112, 112],
    stickBase: [0, 112, 164, 164],
    stickKnob: [192, 144, 92, 92]
  }
};
writeFileSync(manifestOut, JSON.stringify(manifest, null, 2) + "\n");

console.log(JSON.stringify({ out, manifest: manifestOut, bytes: statSync(out).size }, null, 2));
