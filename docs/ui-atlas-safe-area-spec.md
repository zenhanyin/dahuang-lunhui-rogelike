# UI Atlas Text Safe Area Spec

Project: 《大荒轮回录：荒境》

Purpose: formal UI assets must carry a clear text safe area before they are cut into WebP atlas pieces. CSS may place text inside that safe area, but must not guess the visual center from the DOM outer box.

## Core Rule

- Every formal UI image needs three boxes recorded in the manifest or CSS comment:
  - `outerBox`: full transparent image bounds.
  - `paintedBox`: visible painted frame bounds.
  - `textSafeBox`: area where live HTML text may appear.
- Layout aligns to `textSafeBox` and `visualAxis`, not to the image's `outerBox`.
- If the ornament is asymmetric, define `visualAxisX` manually. Do not assume `50%`.
- Buttons, badges, title plaques, icons, and text should share the same `visualAxisX` inside one component.
- Decorative overhangs, lotus bases, scroll rods, top crowns, tassels, and broken parchment edges are not text space.

## Upgrade Card

Current asset family: upgrade scripture card.

Recommended source size: `268 x 344` desktop, same aspect for scaled variants.

Safe areas:

- `outerBox`: `0,0,268,344`
- `paintedBox`: approximately `16,10,236,326`
- `visualAxisX`: `calc(50% - 4px)` for current art, because the painted inner frame reads slightly left of the DOM center.
- icon medallion center: `x = visualAxisX`, `y = 86`
- tag safe box: `x 70-194`, `y 124-142`
- title safe box: `x 48-214`, `y 154-194`
- body safe box: `x 54-210`, `y 204-282`
- action button center: `x = visualAxisX`, `y = 304`

Text limits:

- Tag: 4 Chinese chars preferred, 6 chars max.
- Title: 4 Chinese chars preferred, 6 chars max; 2 lines max.
- Body: 14 Chinese chars per line, 3 lines max.
- Cost/action text: 6 Chinese chars max, numeric suffix allowed.

Do not:

- Stretch the card frame to fit text.
- Use `display:flex` on long body text if it prevents stable Chinese wrapping.
- Move only the icon or only the title. Move the whole content column by the same axis offset.

## Start Lineage Card

Current asset family: character lineage card.

Recommended source size: `276 x 500` desktop.

Safe areas:

- `outerBox`: `0,0,276,500`
- portrait safe box: `x 48-228`, `y 82-188`
- role subtitle safe box: `x 48-228`, `y 226-246`
- name safe box: `x 42-234`, `y 250-282`
- initial skill safe box: `x 48-228`, `y 286-316`
- stats safe box: `x 60-216`, `y 424-456`
- selected badge safe point: `x = visualAxisX`, `y = 76`

Text limits:

- Role subtitle: 4 Chinese chars preferred.
- Name: 4 Chinese chars preferred, 6 chars max.
- Skill: 3-4 Chinese chars.
- Stats: two short pills only.

Selection state:

- Selection glow should be behind the painted card or baked as a separate formal state image.
- Avoid hard rectangular CSS outlines. The card has an arched silhouette, so rectangular focus frames look like prototype UI.
- `已选` should become a formal badge atlas piece later. Current CSS badge is temporary.

## Story Dialogue Panel

Current asset family: story scroll panel.

Recommended source size: `1858 x 693`.

Safe areas:

- title plaque safe box: `x 390-890`, `y 62-118`
- portrait safe box: `x 116-420`, `y 124-360`
- speaker name safe box: `x 130-390`, `y 345-405`
- body text safe box: `x 500-1650`, `y 230-470`
- button safe box: `x 210-540`, `y 500-595`

Text limits:

- Title: 4 Chinese chars preferred, 6 chars max. Example: `轮回残碑`, `断剑残誓`.
- Speaker: 4 Chinese chars preferred.
- Body: 24-28 Chinese chars per line, 4 lines max on desktop.
- Button: 4 Chinese chars preferred.

Title placement:

- The title text must sit inside the dark-green plaque core, not on the ornate border.
- Use vertical padding. Do not align the text to the full title decoration box.

## Resource Counter / Pause / Level / Dash Atlas

Current asset family: shared HUD control sprite atlas.

Rules:

- Sprite atlases keep their native `background-size`; do not switch to `100% 100%` per sprite.
- A counter frame may be scaled uniformly only if every sprite in that atlas is exported for that scale.
- Numeric safe box must support 3 digits without changing frame width.
- Preferred desktop counter: `96 x 46`, numeric box `38 px` wide, right-aligned tabular digits.
- If values may exceed 999, abbreviate in logic (`1.2k`) or swap to a wider formal atlas piece.

## Mobile Portrait Rules

- Do not reuse desktop three-card layout by shrinking it.
- Upgrade cards in portrait should be one-card focus with horizontal swipe or stacked carousel.
- Start lineage cards in portrait should use a centered card carousel, not three full cards squeezed into view.
- Touch controls must not overlap card action buttons.
- Safe-area insets must be respected for top resources and bottom dash.

## Atlas Manifest Fields

Each formal UI atlas entry should eventually include:

```json
{
  "id": "ui_upgrade_card_dunhuang_v1",
  "path": "assets/runtime/webp/ui/cards/upgrade_card.webp",
  "outerBox": [0, 0, 268, 344],
  "paintedBox": [16, 10, 236, 326],
  "textSafeBox": [54, 204, 156, 78],
  "visualAxis": [130, 0],
  "mobileVariant": "ui_upgrade_card_mobile_v1",
  "notes": "Axis is 4px left of DOM center because frame ornament is asymmetric."
}
```

## QA Checklist

- Capture desktop and portrait screenshots for start cards, upgrade cards, story panel, pause/result, and HUD.
- Overlay debug rectangles only in QA screenshots, never in the shipped UI.
- Check 3-digit resource values, longest card title, longest body text, and a 6-character story title.
- Compare against the latest accepted keyframe before merging.
- If a fix requires more than 2 CSS overrides for the same component, update the atlas safe area or export a corrected UI piece instead.

## V0.3.4a-9 Anchor And Safe-Area Lock

- Text must align to the atlas `visualAxis`, not the DOM box center when the ornament is asymmetric.
- Card title, body, tag, cost, icon and action button must share one explicit axis variable.
- Do not define text zones as `left + right` if the art has a shifted visual center. Use fixed safe width plus centered transform.
- Portrait cards may reuse temporary desktop art only for validation, but need a separate mobile atlas before formal release.
- Resource numbers use right-aligned tabular digits inside a fixed numeric safe box. Three digits must fit without changing frame scale.
- Selection, pause, dash, resource, level and choice affordances must use formal atlas pieces. CSS may position text, but must not draw visible frames, rings or placeholder panels.
- Build, pause and result panels must not stretch `button_minor` as row frames. If a row needs a visible frame, export a row-specific atlas piece.
