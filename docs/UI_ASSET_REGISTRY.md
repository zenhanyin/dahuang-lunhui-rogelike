# UI Asset Registry

Project: 《大荒轮回录：荒境》

Phase: UI Governance Phase 1

Scope: fact registry only. This document does not change runtime behavior, CSS, layout, image assets, or game logic.

Status definitions:

- `CURRENT`: referenced by the current runtime UI and belongs to the current formal UI asset set.
- `LEGACY`: retained historical asset or metadata, not the current runtime source.
- `PLACEHOLDER`: runtime-visible asset or style that is temporary/prototype by design.
- `DEPRECATED`: confirmed obsolete and safe to remove in a later approved cleanup pass.
- `TBD`: cannot be reliably judged from current metadata or runtime references.

## Runtime UI Asset Registry

| Component | Asset / Metadata | Runtime Reference | Status | Notes |
| --- | --- | --- | --- | --- |
| Global UI atlas | `assets/runtime/webp/ui/formal_v034b1/ui_runtime_atlas.webp` | `styles.css`, `styles-ui.css` | CURRENT | Current shared runtime atlas for resource chips, pause seal, level badge, dash seal, title plaque, build quick, chapter alert, boss bar, enemy HP fills, selected badge, mobile start confirm, card glow, story marker halos. |
| Global UI atlas metadata | `assets/runtime/webp/ui/formal_v034b1/ui_runtime_atlas.json` | metadata source | CURRENT | Contains sprite rects, HUD safe areas, and partial `textSafe`. Reuse this; do not duplicate as another active source. |
| PC HUD panel | `assets/runtime/webp/ui/formal_v034b1/hud_panel_pc.webp` | `styles-ui.css` | CURRENT | Current PC HUD image. Size and safe areas are documented in `ui_runtime_atlas.json`. |
| HP track | `assets/runtime/webp/ui/hp_bar.webp` | `styles-ui.css`, `asset-manifest.v0.3.json` | CURRENT | Runtime formal track image; version query still references `0.3.2e`. |
| XP track | `assets/runtime/webp/ui/xp_bar.webp` | `styles-ui.css`, `asset-manifest.v0.3.json` | CURRENT | Runtime formal track image; version query still references `0.3.2e`. |
| Resource soul/fire | `resource_soul_wide`, `resource_fire_wide` sprites in `ui_runtime_atlas.webp` | `styles-ui.css` | CURRENT | Current runtime uses atlas sprites, not standalone `resource_soul.webp` / `resource_fire.webp`. |
| Pause seal | `pause_seal` sprite in `ui_runtime_atlas.webp` | `styles-ui.css` | CURRENT | Current runtime sprite. CSS positions live label. |
| Level badge | `level_badge` sprite in `ui_runtime_atlas.webp` | `styles-ui.css` | CURRENT | Current runtime sprite. CSS positions live label. |
| Dash seal | `dash_seal` sprite in `ui_runtime_atlas.webp` | `styles-ui.css` | CURRENT | Current runtime sprite. CSS positions live label. |
| Chapter alert | `chapter_alert` sprite in `ui_runtime_atlas.webp` | `styles-ui.css` | CURRENT | Current wave/status panel. Has `textSafe.chapter_alert` in runtime metadata. |
| Boss name/bar | `boss_name_plaque`, `boss_bar_track`, `boss_bar_fill` sprites in `ui_runtime_atlas.webp` | `styles-ui.css` | CURRENT | Current Boss UI sprites. Text safe area for boss name is not separately recorded. |
| Enemy HP bars | `enemy_hp_track`, `enemy_hp_fill`, `elite_hp_fill`, `boss_hp_fill_small` sprites in `ui_runtime_atlas.webp` | `styles-ui.css` | CURRENT | Runtime health bar sprites for enemies/elites/Boss small bars. |
| Build quick entry | `build_quick` sprite in `ui_runtime_atlas.webp` | `styles-ui.css` | CURRENT | Current in-game build entry. Has `textSafe.build_quick`. |
| Title plaque | `assets/runtime/webp/ui/title_plaque.webp` | `styles-ui.css` | CURRENT | Used by start and choice titles. Runtime query references old `0.3.2a` version. |
| Start lineage card | `assets/runtime/webp/ui/lineage_card.webp` | `styles-ui.css` | CURRENT | Current formal lineage card image. Safe area is partly defined in `ui_bounds.v034b.json`, not in current runtime atlas. |
| Selected badge | `selected_badge` sprite in `ui_runtime_atlas.webp` | `styles-ui.css` | CURRENT | Current selected state badge for lineage card. |
| Start confirm button | `assets/runtime/webp/ui/button_continue.webp` | `styles-ui.css` | CURRENT | Current start/continue button background. |
| Mobile start confirm | `start_confirm_mobile` sprite in `ui_runtime_atlas.webp` | `styles-ui.css` | CURRENT | Current mobile confirm affordance sprite. |
| Upgrade choice card | `assets/runtime/webp/ui/choice_card_frame.webp` | `styles-ui.css` | CURRENT | Current formal choice card image. Safe area is partly defined in `ui-atlas-safe-area-spec.md` and `ui_bounds.v034b.json`. |
| Choice / minor button | `assets/runtime/webp/ui/button_minor.webp` | `styles-ui.css` | CURRENT | Current minor/action button image. Also used by result/build rows in some runtime paths. |
| Story panel | `assets/runtime/webp/ui/story/story_panel_art.webp` | `styles-ui.css` | CURRENT | Current desktop story panel art. Listed in story `manifest-art.json`. Safe areas exist in docs only, not runtime metadata. |
| Story mobile panel | `assets/runtime/webp/ui/story/story_panel_mobile_art.webp` | story manifest only | CURRENT | Current formal mobile story art asset, but runtime use requires verification. |
| Story button | `assets/runtime/webp/ui/story/story_button_art.webp` | `styles-ui.css` | CURRENT | Current story action button art. |
| Story portraits | `assets/runtime/webp/ui/portraits/xuanyuan_swordsman.webp`, `qingqiu_witch.webp`, `reincarnation_spirit.webp` | `src/game.js` story/lineage data | CURRENT | Current runtime portrait/art references. |
| Pause panel | `assets/runtime/webp/ui/pause_panel.webp` | `styles-ui.css` | CURRENT | Current pause panel image. Version query references old `0.3.2a`. |
| Result panel | `assets/runtime/webp/ui/result_panel.webp` | `styles-ui.css` | CURRENT | Current result panel image. Version query references old `0.3.2a`. |
| Build panel | `assets/runtime/webp/ui/dialogue_scroll.webp` | `styles-ui.css` | CURRENT | Current build panel image. Runtime query references `0.3.4b-build-scroll`. |
| Mobile control atlas | `assets/runtime/webp/ui/mobile_controls_atlas.webp` | `styles.css`, `styles-ui.css`, `styles-mobile.css` | CURRENT | Current mobile controls atlas. Metadata exists in `mobile_controls_atlas.json`. |
| Mobile control metadata | `assets/runtime/webp/ui/mobile_controls_atlas.json` | metadata source | CURRENT | Contains sprite rects only; no text safe areas. |
| Mobile compact HUD | `assets/runtime/webp/ui/mobile_hud_compact.webp` | `styles-mobile.css` | CURRENT | Current mobile HUD image. Safe area metadata not found. |
| Formal icon set | `assets/runtime/webp/ui/icons/formal/*.webp` | `src/game.js` icon lookup | CURRENT | Current skill/build/card icon art set. Individual safe areas not recorded. |
| Generated formal atlas v0.3.3 | `assets/generated/formal-ui-atlas/v0.3.3/*` | not referenced by current CSS paths | LEGACY | Historical generated assets and `atlas.json`. It records size/bytes only, not safe areas. |
| Formal atlas v0.3.4a6/a8 | `assets/runtime/webp/ui/formal_v034a6/*`, `formal_v034a8/*` | not current CSS entry | LEGACY | Historical atlas families. `formal_v034a8/ui_bounds.v034b.json` is useful migration reference but not current runtime source. |
| Standalone resource chips | `assets/runtime/webp/ui/resource_soul.webp`, `resource_fire.webp` | not found in current CSS runtime refs | LEGACY | Present in runtime folder but current CSS uses atlas sprites instead. |
| Old story simple panel set | `story_panel.webp`, `story_panel_mobile.webp`, `story_button.webp`, `story_divider.webp`, `story_title_plaque.webp` | manifest only / not current CSS main art refs | LEGACY | Retained story UI family. Current CSS points to `*_art.webp` for panel/button. |
| CSS-drawn visible frames | selectors still drawing borders/rings/boxes | runtime CSS | PLACEHOLDER / TBD | Some CSS may still draw visible selection/focus/diagnostic-looking states. Exact component ownership requires visual audit; do not remove in Phase 1. |
| Deprecated UI assets | none confirmed | n/a | TBD | No asset is marked `DEPRECATED` in Phase 1 because deletion safety was not established. |

## Constraint Metadata

### HUD

| Field | Metadata |
| --- | --- |
| Component | HUD |
| Current Asset | `assets/runtime/webp/ui/formal_v034b1/hud_panel_pc.webp`; HP/XP tracks; `ui_runtime_atlas.webp` fill sprites |
| Existing Metadata | `assets/runtime/webp/ui/formal_v034b1/ui_runtime_atlas.json` |
| Current Container | `#hud`; mobile variant `#mobileHud` |
| Anchor | PC top-left. Mobile top compact HUD. |
| Safe Area | CURRENT metadata: `brand [150,66,410,42]`, `bars [150,116,360,58]`, `stats [150,182,360,26]` on `560x244` HUD image. Mobile safe area: TBD. |
| Dynamic Fields | title, lineage/map subtitle, HP current/max, XP current/max/delta, realm, timer, kills, optional build/status text. |
| Text Constraint | PC HUD exact max copy length is TBD. Current risk: subtitle and lower row can overflow the painted area under long lineage/map/variant strings. |
| Responsive Behavior | Desktop uses PC HUD image. Mobile uses `mobile_hud_compact.webp`; not a formal complete mobile-safe metadata source yet. |
| CSS Overrides | `styles-ui.css` positions `#hud .brand`, `.bars`, `.stats`; `styles-mobile.css` redefines mobile HUD. |
| Known Problems | User screenshots repeatedly show HUD text crowding/overlap. Current metadata exists but runtime text density may exceed safe area. |
| Recommended Action | Later phase: verify runtime CSS against `ui_runtime_atlas.json` and create/approve mobile HUD safe area. No change in Phase 1. |

### Resource

| Field | Metadata |
| --- | --- |
| Component | ResourceChip |
| Current Asset | `resource_soul_wide`, `resource_fire_wide` sprites in `assets/runtime/webp/ui/formal_v034b1/ui_runtime_atlas.webp`; mobile equivalents in `mobile_controls_atlas.webp` |
| Existing Metadata | `ui_runtime_atlas.json` sprite rects and `textSafe.resource_number [76,12,82,34]`; `mobile_controls_atlas.json` sprite rects only |
| Current Container | `#topCounters .counter.soul`, `#topCounters .counter.fire` |
| Anchor | Top-right HUD cluster |
| Safe Area | Desktop numeric safe area exists. Mobile numeric safe area: TBD. |
| Dynamic Fields | soul count, fire count |
| Text Constraint | Desktop supports a recorded numeric box, but max display policy for values above 999 is TBD. |
| Responsive Behavior | Desktop atlas and mobile atlas differ. Current CSS has both `formal_v034b1` and `mobile_controls_atlas` references. |
| CSS Overrides | Runtime CSS positions and scales counters; text is live DOM. |
| Known Problems | User screenshots show 3-digit numbers approaching/overrunning visual frame in some states. |
| Recommended Action | Later phase: lock max digits or abbreviation rule and verify desktop/mobile numeric safe boxes. |

### Lineage Card

| Field | Metadata |
| --- | --- |
| Component | Lineage Card / Start Character Card |
| Current Asset | `assets/runtime/webp/ui/lineage_card.webp`; selected badge sprite; `button_continue.webp`; `start_confirm_mobile` sprite |
| Existing Metadata | `docs/ui-atlas-safe-area-spec.md`; `assets/runtime/webp/ui/formal_v034a8/ui_bounds.v034b.json` |
| Current Container | `#lineageList .lineage`; start overlay `#start` |
| Anchor | Start overlay center. Mobile uses card carousel/horizontal layout. |
| Safe Area | Migration reference: `outer [0,0,307,581]`, `visual [8,8,299,569]`, `visualAxisX 157.5`, `portrait [68,123,172,142]`, `copy [69,278,178,116]`, `stats [74,481,160,34]`, `selectedBadge [108,93,92,38]`. Marked TBD for current runtime because this metadata is not in the active `formal_v034b1` atlas. |
| Dynamic Fields | seal, selected badge, character portrait/sprite, role, name, starting skill, stat chips, start button label. |
| Text Constraint | From spec: role 4 chars preferred, name 4 preferred/6 max, skill 3-4 chars, stats two short pills. Exact runtime enforcement: TBD. |
| Responsive Behavior | Desktop two-card currently after 神农 removal; mobile requires separate one-card focus/carousel behavior and visible confirm. |
| CSS Overrides | `styles-ui.css` uses lineage CSS variables for portrait/copy/stats/badge placement. |
| Known Problems | User screenshots show portrait/card visual axis drift, selected badge/label not fully integrated, and stat chip alignment issues. |
| Recommended Action | Later phase: migrate lineage metadata into a single active manifest source and align runtime to it. |

### Choice Card

| Field | Metadata |
| --- | --- |
| Component | Choice Card / Upgrade Card |
| Current Asset | `assets/runtime/webp/ui/choice_card_frame.webp`; formal skill icons; `button_minor.webp`; `card_select_glow` sprite |
| Existing Metadata | `docs/ui-atlas-safe-area-spec.md`; `assets/runtime/webp/ui/formal_v034a8/ui_bounds.v034b.json` |
| Current Container | `#choiceList .choice`; choice overlay `#choices` |
| Anchor | Center overlay on PC. Mobile should be one-card focus/carousel, but current runtime needs verification. |
| Safe Area | Migration reference: `outer [0,0,358,542]`, `visual [4,8,354,527]`, `visualAxisX 181`, `icon [143,91,72,72]`, `tag [103,203,152,28]`, `title [86,237,186,64]`, `body [86,310,186,112]`, `button [121,452,116,48]`. Marked TBD for current runtime because this metadata is not in the active `formal_v034b1` atlas. |
| Dynamic Fields | icon, tag, title, body text, action/cost label, selected/focus state. |
| Text Constraint | From spec: tag 4 preferred/6 max, title 4 preferred/6 max/2 lines, body 14 chars per line/3 lines, action 6 chars max. Runtime enforcement: TBD. |
| Responsive Behavior | Desktop three-card overlay. Mobile formal layout still needs dedicated metadata and screenshot validation. |
| CSS Overrides | `styles-ui.css` uses choice CSS variables for icon/tag/title/body/button placement. |
| Known Problems | User screenshots show icon, title, body and button frequently miss the perceived card axis; text contrast is sometimes weak. |
| Recommended Action | Later phase: promote one active choice metadata source and run text stress tests. |

### Story UI

| Field | Metadata |
| --- | --- |
| Component | Story UI / Dialogue Panel |
| Current Asset | `assets/runtime/webp/ui/story/story_panel_art.webp`; `story_button_art.webp`; portrait WebP files |
| Existing Metadata | `assets/runtime/webp/ui/story/manifest-art.json`; `docs/ui-atlas-safe-area-spec.md` |
| Current Container | `#storyOverlay .story-panel` |
| Anchor | Center overlay; HUD should be dimmed beneath story UI. |
| Safe Area | Spec defines desktop story source as `1858x693`. The actual `story_panel_art.webp` image header is also `1858x693`, but current `manifest-art.json` records `1577x733`. Runtime-safe title/portrait/body/button areas are therefore TBD until the manifest is reconciled to the actual current asset. |
| Dynamic Fields | story title, portrait, speaker, body text, button label. |
| Text Constraint | Spec says title 4 preferred/6 max, speaker 4 preferred, body 24-28 chars/line up to 4 lines desktop, button 4 preferred. Runtime enforcement: TBD. |
| Responsive Behavior | Desktop story art is current. Mobile story art exists, but runtime safe-area metadata is missing. |
| CSS Overrides | `styles-ui.css` positions title, portrait, speaker, text and button with percentages. |
| Known Problems | User screenshots show title/speaker/button sometimes visually outside intended plaque or too close to decoration. |
| Recommended Action | Later phase: resolve actual story panel art dimensions and establish current title/body/button safe boxes. |

## TBD List

- `Lineage Card` safe areas are not in the active `formal_v034b1/ui_runtime_atlas.json`; current authoritative source is TBD.
- `Choice Card` safe areas are not in the active `formal_v034b1/ui_runtime_atlas.json`; current authoritative source is TBD.
- `Story UI` safe areas conflict because actual `story_panel_art.webp` is `1858x693`, while current art manifest says `1577x733`.
- Mobile HUD `mobile_hud_compact.webp` has no recorded safe areas.
- Mobile resource number safe areas are absent from `mobile_controls_atlas.json`.
- Boss name plaque text safe area is not recorded.
- Enemy/elite/Boss small HP bars have sprite rects but no semantic placement metadata.
- Formal skill icon safe areas and visual centers are not recorded.
- Max text policy for runtime lineage/map names, card titles, story titles, resource counts above 999, and build labels is not fully encoded in metadata.
- CSS-drawn visible placeholders are present or suspected, but exact component ownership needs a separate visual/CSS audit before changing anything.

## Metadata Conflicts / Drift

1. `assets/runtime/webp/ui/formal_v034b1/ui_runtime_atlas.json` is the current runtime atlas metadata, while `assets/runtime/webp/ui/formal_v034a8/ui_bounds.v034b.json` contains newer-looking lineage/choice coordinate guidance for assets that are still loaded from the parent `ui` folder. These are not the same active metadata source.
2. `docs/ui-atlas-safe-area-spec.md` lists older recommended sizes for `Upgrade Card` (`268x344`) and `Start Lineage Card` (`276x500`), while `ui_bounds.v034b.json` explicitly says current card assets are `358x542` and `307x581`.
3. `docs/ui-atlas-safe-area-spec.md` lists `Story Dialogue Panel` recommended source size `1858x693`, and the active `story_panel_art.webp` image header also reports `1858x693`; however `assets/runtime/webp/ui/story/manifest-art.json` lists it as `1577x733`.
4. Runtime cache/version query strings are mixed: `0.3.4b1`, `0.3.4b`, `0.3.4a8`, `0.3.3j2`, `0.3.2e`, `0.3.2a`, `0.3.2c`, and `0.3.2-story` all appear in current UI CSS references. This is version drift, not necessarily asset status.
5. `assets/generated/formal-ui-atlas/v0.3.3/atlas.json` records historical generated assets and dimensions, but current CSS uses `assets/runtime/webp/ui/...`; using both as authoritative would create conflict.
6. `mobile_controls_atlas.json` has sprite rects but no text safe boxes, while desktop `ui_runtime_atlas.json` has partial `textSafe`.

## Phase 1 Notes

- No asset is marked `DEPRECATED` because deletion safety requires a separate approved cleanup pass.
- No visual layout, CSS, image, or runtime logic was changed by this registry.
- This registry should be updated whenever runtime UI asset references change.
