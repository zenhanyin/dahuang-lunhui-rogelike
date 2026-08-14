# UI Visual Findings

Phase: UI Governance Phase 2
Generated: 2026-08-14
Commit at snapshot time: `84514f546a3ef569fa38d0d435837c4930cd037a`
UI asset set: `0.3.4b1-ui-pass2`

This document records facts exposed by the Phase 2 tooling. It does not prescribe or apply visual fixes.

## Snapshot Coverage

- Output root: `ui-snapshots/`
- Static index: `ui-snapshots/index.html`
- Manifest: `ui-snapshots/manifest.json`
- Viewports: `1920x1080`, `1600x900`, `1366x768`, DPR 1
- Components: HUD, Resource, Lineage Card, Choice Card, Story UI, Boss
- States: Normal, Debug, Stress, Stress Debug
- Generated snapshots: 72
- Blocked snapshots: 0

## Metadata Validator Findings

- PASS: HUD metadata and asset dimensions match.
- PASS: Resource Soul metadata and runtime atlas dimensions match.
- PASS: Resource Fire metadata and runtime atlas dimensions match.
- TBD: Lineage Card has no current authoritative metadata in `formal_v034b1`; legacy `formal_v034a8` bounds exist only as migration reference.
- TBD: Choice Card has no current authoritative metadata in `formal_v034b1`; legacy `formal_v034a8` bounds exist only as migration reference.
- FAIL: Story UI manifest size `[1577,733]` conflicts with actual `story_panel_art.webp` size `[1858,693]`.

## Current Evidence Notes

- Debug Overlay is available via `?uiDebug=1`.
- Snapshot pages are static PNG evidence only and do not rerender the game UI.
- No Safe Area/Text Area coordinates were guessed for TBD components.
- Existing visual issues observed in snapshots should be handled in a later UI-fix phase, not in Phase 2.
