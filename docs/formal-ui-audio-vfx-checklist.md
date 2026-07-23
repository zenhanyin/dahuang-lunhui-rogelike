# V0.3 Formal UI / VFX / Audio Checklist

## Visual Language

- Style target: Dunhuang fresco, Nine-Colored Deer palette, mineral pigment texture, parchment, cinnabar seal, jade, bronze, lotus and cloud motifs.
- Avoid: black-gold xianxia card UI, plain prototype boxes, text-only circular icons, neon sci-fi, glossy mobile RPG frames.

## UI Layer

- Top-left HUD: `轮回命簿`; HP, cultivation XP, realm, timer, kills.
- Top-right resources: `灵髓` for card purchase, `丹火` for reroll/revive/rare event hooks, bronze mirror pause/settings/codex.
- Bottom HUD: current build strip; level plaque, skill medallions, level beads, trigger glow, dash medallion.
- Upgrade UI: three Dunhuang scripture cards; cost must be real and disabled when unaffordable.
- Start UI: lineage shrine cards; each card needs portrait, role, initial skill, base stats.
- Pause UI: continue now; codex, settings, exit reserved.
- Result UI: run stats, build summary, meta points, unlock hooks.
- Mobile portrait: joystick appears only on touch, bottom scroll stays compact, dash remains right-thumb active button.

## Icons

- Current placeholders: SVG icons under `assets/ui/icons`.
- Formal target: WebP/SVG hybrid icon set in Dunhuang medallion style.
- Required next icons: soul, fire, pause mirror, reroll, lock, boss warning, chest/event, heal lotus, shield/guard, sword, talisman, flame, mist step, dash wind.

## UI Motion

- Resource pickup: orb flies or flashes toward top-right plaque; number pops.
- Card purchase: selected card flashes, cost deducts, corresponding bottom skill medallion pulses.
- Skill trigger: matching bottom medallion glows on cast.
- Level up: bottom level plaque and XP bar burst, then card drawer opens.
- Dash: cooldown ring, ready glow, press burst.
- Pause/result: scroll-panel open animation, no hard modern modal snap.

## Skill VFX

- Sword: flying sword trail, sword impact, later sword array evolution.
- Talisman: paper talisman cast, homing trail, hit burst, later split/chain.
- Flame: cinnabar fire ring, ground scorch/cloud, later explosive burn.
- Mist step: purple-green mural mist field, slow aura, dash synergy.
- Heal/guard: lotus pulse, jade shield ring, pickup heal sparkle.

## Audio

- Music target: low guqin/drone, bells, frame drum, airy flute; restrained loop under action.
- Pickup: jade chime, soft soul pull.
- Card purchase: parchment snap + bell + resource tick.
- Sword: crisp metallic swish, light impact.
- Talisman: paper flick + seal thump.
- Flame: low whoosh, cinnabar burst.
- Dash: wind ribbon sweep.
- Hurt/death: muted drum and breath, not horror-heavy.
- Boss warning: bronze gong + low drone.

## Vampire-like MVP Entrances

- Reroll cards with `丹火`.
- Lock card choices from map events.
- Elite and boss warning banner.
- 5-minute victory/death settlement.
- Build codex showing current skill levels and evolutions.
- Meta progression:轮回点, unlock character, unlock card, unlock map event.
