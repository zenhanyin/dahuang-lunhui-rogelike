# Web Asset Budget

《大荒轮回录：荒境》先按 HTML Canvas 单机版推进，资产策略以低内存、低解码压力、可渐进替换为原则。

## Runtime Caps

- Canvas DPR capped at `1.5` to avoid high-DPI screens doubling or tripling render memory.
- Enemies capped at `90`.
- Projectiles capped at `120`.
- Drops capped at `80`.
- Damage texts capped at `48`.
- Pulses capped at `36`.
- Persistent cloud effects capped at `18`.

These caps live in `src/config.js` under `tuning`.

## Sprite Direction

Use raster sprites for final art, not hand-written SVG placeholders.

Recommended format:

- Gameplay sprites: WebP first, PNG fallback only when alpha quality is poor.
- Atlas size: prefer `1024x1024`; only use `2048x2048` for boss or chapter atlas.
- Player walk cycle: `2 directions x 4 frames`, 96-128 px frame height.
- Small enemy walk cycle: `2 directions x 3 frames`, 72-96 px frame height.
- Boss: idle 4 frames, attack tell 2 frames, hit 1 frame, death 4 frames.
- Props: single frame unless animated.
- Map effects: 2-4 frame loops, kept in a separate atlas.

## Loading Plan

- V0.2: load only current prototype atlas.
- V0.3: load selected player lineage plus shared enemy atlas.
- Chapter maps should load their own terrain/event atlas on entry.
- Future menu previews can use still thumbnails, not full animation atlases.

## Visual Constraints

- Keep silhouettes readable at `64-96 px` in battle.
- Avoid oversized smoke ribbons on walk frames; use canvas particles for aura and trails.
- Use decoration inside large clothing shapes, but keep frame boundaries compact.
- Treat weapons, talismans, demon cores, and damage numbers as small effect atlases.
