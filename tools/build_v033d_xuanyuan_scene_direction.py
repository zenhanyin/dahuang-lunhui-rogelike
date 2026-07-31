from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
KEYFRAME_DIR = ROOT / "assets/art_direction/v033/xuanyuan_ground_rework/keyframes"
OUT_ROOT = ROOT / "assets/maps/v033/xuanyuan_ground"
DECAL_OUT = OUT_ROOT / "decals"
PROP_OUT = OUT_ROOT / "props"
EVENT_OUT = OUT_ROOT / "events"
PREVIEW = OUT_ROOT / "preview_xuanyuan_ground_scene_assets_v033d.webp"

DECAL_SOURCE = KEYFRAME_DIR / "xuanyuan_low_relief_decal_keyframe_v033d.png"
PROP_SOURCE = KEYFRAME_DIR / "xuanyuan_low_remnant_props_keyframe_v033d.png"
EVENT_SOURCE = KEYFRAME_DIR / "xuanyuan_event_stone_disk_keyframe_v033d.png"
BASE_TILE = OUT_ROOT / "base_tiles/tile_xuanyuan_ground_base_01.webp"


def soft_mask(size: tuple[int, int], feather: int, strength: int = 230, ellipse: bool = False) -> Image.Image:
    w, h = size
    mask = Image.new("L", size, 0)
    px = mask.load()
    for y in range(h):
        for x in range(w):
            if ellipse:
                nx = abs((x + 0.5) / w * 2 - 1)
                ny = abs((y + 0.5) / h * 2 - 1)
                d = max(0.0, 1.0 - (nx * nx + ny * ny) ** 0.5)
                value = int(strength * min(1.0, d * 2.6))
            else:
                d = min(x, y, w - 1 - x, h - 1 - y)
                value = int(strength * min(1.0, d / max(1, feather)))
            px[x, y] = value
    return mask.filter(ImageFilter.GaussianBlur(max(1, feather // 3)))


def crop_asset(
    source: Image.Image,
    box: tuple[int, int, int, int],
    output: Path,
    size: tuple[int, int],
    *,
    feather: int = 48,
    alpha: int = 220,
    ellipse: bool = False,
    saturation: float = 0.92,
    contrast: float = 0.98,
    brightness: float = 1.0,
) -> None:
    img = source.crop(box).convert("RGBA")
    img = ImageEnhance.Color(img).enhance(saturation)
    img = ImageEnhance.Contrast(img).enhance(contrast)
    img = ImageEnhance.Brightness(img).enhance(brightness)
    img = img.resize(size, Image.Resampling.LANCZOS)
    img.putalpha(soft_mask(size, feather, alpha, ellipse))
    output.parent.mkdir(parents=True, exist_ok=True)
    img.save(output, "WEBP", quality=84, method=6)


def build_decals() -> list[dict[str, object]]:
    source = Image.open(DECAL_SOURCE).convert("RGB")
    specs = [
        ("decal_xuanyuan_sword_trace_01.webp", (0, 470, 430, 740), (420, 210), "xuanyuanSwordTrace"),
        ("decal_xuanyuan_sword_trace_02.webp", (840, 20, 1260, 300), (400, 220), "xuanyuanSwordTrace"),
        ("decal_xuanyuan_cloud_line_01.webp", (1100, 310, 1510, 610), (430, 220), "xuanyuanCloudLine"),
        ("decal_xuanyuan_array_disk_01.webp", (270, 170, 620, 460), (360, 250), "xuanyuanArrayDisk"),
        ("decal_xuanyuan_cinnabar_trace_01.webp", (1280, 600, 1640, 800), (360, 190), "xuanyuanCinnabarTrace"),
        ("decal_xuanyuan_bronze_oxidation_01.webp", (560, 520, 940, 760), (400, 210), "xuanyuanBronzeOxidation"),
    ]
    manifest = []
    for name, box, size, decal_type in specs:
        crop_asset(source, box, DECAL_OUT / name, size, feather=72, alpha=142, saturation=0.86, contrast=0.9, brightness=0.95)
        manifest.append({"id": Path(name).stem, "type": decal_type, "file": f"decals/{name}"})
    return manifest


def build_props() -> list[dict[str, object]]:
    source = Image.open(PROP_SOURCE).convert("RGB")
    specs = [
        ("prop_xuanyuan_buried_sword_grass_0.webp", (850, 80, 1160, 320), (290, 210), "xuanyuanBuriedSwordGrass"),
        ("prop_xuanyuan_broken_array_stone_0.webp", (1010, 380, 1320, 610), (300, 220), "xuanyuanBrokenArrayStone"),
        ("prop_xuanyuan_low_oath_base_0.webp", (330, 385, 620, 610), (280, 210), "xuanyuanLowOathBase"),
        ("prop_xuanyuan_cloth_trace_0.webp", (640, 610, 920, 780), (270, 150), "xuanyuanClothTrace"),
        ("prop_xuanyuan_sword_scatter_0.webp", (1320, 320, 1600, 520), (285, 170), "xuanyuanSwordScatter"),
        ("prop_xuanyuan_bronze_fragment_0.webp", (1010, 620, 1280, 820), (270, 180), "xuanyuanBronzeFragment"),
    ]
    manifest = []
    for name, box, size, prop_type in specs:
        crop_asset(source, box, PROP_OUT / name, size, feather=58, alpha=214, saturation=0.9, contrast=0.96, brightness=0.98)
        manifest.append({"id": Path(name).stem, "type": prop_type, "file": f"props/{name}"})
    return manifest


def build_events() -> list[dict[str, object]]:
    source = Image.open(EVENT_SOURCE).convert("RGB")
    specs = [
        ("event_xuanyuan_stone_disk_idle.webp", (185, 120, 430, 315), (220, 170), "idle", 188),
        ("event_xuanyuan_stone_disk_ready.webp", (640, 345, 1030, 610), (280, 190), "ready", 220),
        ("event_xuanyuan_stone_disk_done.webp", (1140, 610, 1450, 830), (235, 170), "done", 178),
    ]
    manifest = []
    for name, box, size, state, alpha in specs:
        crop_asset(source, box, EVENT_OUT / name, size, feather=46, alpha=alpha, ellipse=True, saturation=0.9, contrast=0.94)
        manifest.append({"id": Path(name).stem, "state": state, "file": f"events/{name}"})
    return manifest


def make_preview() -> None:
    base = Image.open(BASE_TILE).convert("RGBA").resize((1280, 720), Image.Resampling.LANCZOS)
    overlays = [
        (DECAL_OUT / "decal_xuanyuan_sword_trace_01.webp", (50, 430), 0.78),
        (DECAL_OUT / "decal_xuanyuan_cloud_line_01.webp", (820, 100), 0.7),
        (DECAL_OUT / "decal_xuanyuan_array_disk_01.webp", (450, 330), 0.72),
        (PROP_OUT / "prop_xuanyuan_buried_sword_grass_0.webp", (810, 300), 0.9),
        (PROP_OUT / "prop_xuanyuan_low_oath_base_0.webp", (150, 220), 0.86),
        (PROP_OUT / "prop_xuanyuan_cloth_trace_0.webp", (520, 520), 0.78),
        (EVENT_OUT / "event_xuanyuan_stone_disk_idle.webp", (220, 445), 0.9),
        (EVENT_OUT / "event_xuanyuan_stone_disk_ready.webp", (855, 450), 0.96),
    ]
    for path, pos, opacity in overlays:
        img = Image.open(path).convert("RGBA")
        alpha = img.getchannel("A").point(lambda v: int(v * opacity))
        img.putalpha(alpha)
        base.alpha_composite(img, pos)
    base.convert("RGB").save(PREVIEW, "WEBP", quality=84, method=6)


def write_manifest(decals: list[dict[str, object]], props: list[dict[str, object]], events: list[dict[str, object]]) -> None:
    manifest_path = OUT_ROOT / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    manifest.update(
        {
            "version": "0.3.3d-xuanyuan-scene-direction-split",
            "asset_mode": "directional_runtime_first_pass",
            "style_anchor": "assets/art_direction/v033/xuanyuan_ground_rework/keyframes",
            "decals": decals,
            "props": props,
            "events": events,
            "notes": [
                "Derived from approved v033d keyframes; no rejected green-screen assets are referenced.",
                "Story event disk is intentionally smaller than the keyframe marker and should be drawn as a low ground point.",
                "Decal and prop exports use feathered alpha because the current source keyframes are scene images, not raw transparent sheets."
            ],
        }
    )
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    decals = build_decals()
    props = build_props()
    events = build_events()
    make_preview()
    write_manifest(decals, props, events)
    for item in decals + props + events:
        print(item["file"])
    print(PREVIEW.relative_to(ROOT).as_posix())


if __name__ == "__main__":
    main()
