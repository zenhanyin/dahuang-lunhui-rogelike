from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
BASE_SHEET = Path(r"C:\Users\Administrator\.codex\generated_images\019f83f5-c11c-75e0-8d28-c87682ead39a\call_E5ZXJASRZHfvqA1wmPLw1xD8.png")
DECAL_SHEET = Path(r"C:\Users\Administrator\.codex\generated_images\019f83f5-c11c-75e0-8d28-c87682ead39a\call_lp41epXXVb0txkHO0OoKgQ1w.png")
PROP_SHEET = Path(r"C:\Users\Administrator\.codex\generated_images\019f83f5-c11c-75e0-8d28-c87682ead39a\call_qG1KicVz07dghZq4lc3cFHzF.png")

TARGET_OUT = ROOT / "assets" / "maps" / "v033" / "xuanyuan_ground"
OUT = ROOT / "tmp" / "v033e_xuanyuan_ground"
SOURCE_OUT = ROOT / "assets" / "art_direction" / "v033" / "xuanyuan_ground_rework"


def ensure_dirs() -> None:
    for folder in [
        OUT / "base_tiles",
        OUT / "decals",
        OUT / "props",
        OUT / "events",
    ]:
        folder.mkdir(parents=True, exist_ok=True)


def save_webp(img: Image.Image, path: Path, quality: int = 82) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(suffix=".webp", dir=str(path.parent))
    os.close(fd)
    tmp_path = Path(tmp_name)
    try:
        img.save(tmp_path, "WEBP", quality=quality, method=4)
        os.replace(tmp_path, path)
    finally:
        if tmp_path.exists():
            tmp_path.unlink()


def square_crop(img: Image.Image, box: tuple[int, int, int, int], size: int = 1024) -> Image.Image:
    crop = img.crop(box).convert("RGB")
    return crop.resize((size, size), Image.Resampling.LANCZOS)


def soften_tile_edges(img: Image.Image, edge: int = 72) -> Image.Image:
    """Keep this lightweight; source sheet already carries the style direction."""
    return img.convert("RGB")


def export_base_tiles() -> list[str]:
    src = Image.open(BASE_SHEET).convert("RGB")
    w, h = src.size
    cw, ch = w // 2, h // 2
    files: list[str] = []
    for idx, (x, y) in enumerate([(0, 0), (cw, 0), (0, ch), (cw, ch)], start=1):
        tile = square_crop(src, (x, y, x + cw, y + ch))
        tile = soften_tile_edges(tile)
        path = OUT / "base_tiles" / f"tile_xuanyuan_ground_base_v033e_{idx:02d}.webp"
        save_webp(tile, path, 84)
        files.append(f"base_tiles/{path.name}")
    return files


def chroma_to_alpha(img: Image.Image, tolerance: int = 72) -> Image.Image:
    rgba = img.convert("RGBA")
    r, g, b, _a = rgba.split()
    key_mask = ImageChops.lighter(
        g.point(lambda p: 255 if p > 135 else 0),
        ImageChops.subtract(g, ImageChops.lighter(r, b), scale=1.0, offset=0).point(lambda p: 255 if p > 38 else 0),
    )
    alpha = key_mask.point(lambda p: 0 if p > 0 else 255).filter(ImageFilter.GaussianBlur(0.35))
    # Simple despill: cap green by the red/blue max on all non-transparent pixels.
    max_rb = ImageChops.lighter(r, b)
    new_g = ImageChops.darker(g, max_rb.point(lambda p: min(255, p + 18)))
    rgba = Image.merge("RGBA", (r, new_g, b, alpha))
    return rgba


def trim_alpha(img: Image.Image, pad: int = 18) -> Image.Image:
    alpha = img.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return img
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(img.width, x1 + pad)
    y1 = min(img.height, y1 + pad)
    return img.crop((x0, y0, x1, y1))


def resize_max(img: Image.Image, max_side: int) -> Image.Image:
    w, h = img.size
    scale = min(1.0, max_side / max(w, h))
    if scale >= 1:
        return img
    return img.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.Resampling.LANCZOS)


def crop_grid(src: Image.Image, cols: int, rows: int, cell: int, index: int) -> Image.Image:
    col = index % cols
    row = index // cols
    w, h = src.size
    cw, ch = w // cols, h // rows
    x0 = col * cw + int(cw * 0.08)
    y0 = row * ch + int(ch * 0.08)
    x1 = (col + 1) * cw - int(cw * 0.08)
    y1 = (row + 1) * ch - int(ch * 0.08)
    return src.crop((x0, y0, x1, y1)).resize((cell, cell), Image.Resampling.LANCZOS)


def export_decal_assets() -> list[dict[str, str]]:
    src = Image.open(DECAL_SHEET).convert("RGB")
    specs = [
        ("decal_xuanyuan_sword_trace_v033e_01", "xuanyuanSwordTrace", 0),
        ("decal_xuanyuan_sword_trace_v033e_02", "xuanyuanSwordTrace", 2),
        ("decal_xuanyuan_cloud_line_v033e_01", "xuanyuanCloudLine", 4),
        ("decal_xuanyuan_array_disk_v033e_01", "xuanyuanArrayDisk", 5),
        ("decal_xuanyuan_cinnabar_trace_v033e_01", "xuanyuanCinnabarTrace", 7),
        ("decal_xuanyuan_bronze_oxidation_v033e_01", "xuanyuanBronzeOxidation", 6),
    ]
    out: list[dict[str, str]] = []
    for name, typ, index in specs:
        cell = crop_grid(src, 4, 4, 384, index)
        asset = resize_max(trim_alpha(chroma_to_alpha(cell, 58), 12), 360)
        path = OUT / "decals" / f"{name}.webp"
        save_webp(asset, path, 82)
        out.append({"id": name, "type": typ, "file": f"decals/{path.name}"})
    return out


def export_prop_assets() -> tuple[list[dict[str, str]], list[dict[str, str]]]:
    src = Image.open(PROP_SHEET).convert("RGB")
    prop_specs = [
        ("prop_xuanyuan_buried_sword_grass_v033e_0", "xuanyuanBuriedSwordGrass", 0, 300),
        ("prop_xuanyuan_broken_array_stone_v033e_0", "xuanyuanBrokenArrayStone", 2, 290),
        ("prop_xuanyuan_low_oath_base_v033e_0", "xuanyuanLowOathBase", 4, 250),
        ("prop_xuanyuan_cloth_trace_v033e_0", "xuanyuanClothTrace", 3, 290),
        ("prop_xuanyuan_sword_scatter_v033e_0", "xuanyuanSwordScatter", 5, 250),
        ("prop_xuanyuan_bronze_fragment_v033e_0", "xuanyuanBronzeFragment", 11, 220),
    ]
    event_specs = [
        ("event_xuanyuan_stone_disk_v033e_idle", "idle", 6, 170),
        ("event_xuanyuan_stone_disk_v033e_ready", "ready", 7, 210),
        ("event_xuanyuan_stone_disk_v033e_done", "done", 8, 170),
    ]
    props: list[dict[str, str]] = []
    events: list[dict[str, str]] = []
    for name, typ, index, max_side in prop_specs:
        cell = crop_grid(src, 4, 3, 384, index)
        asset = resize_max(trim_alpha(chroma_to_alpha(cell, 62), 10), max_side)
        path = OUT / "props" / f"{name}.webp"
        save_webp(asset, path, 84)
        props.append({"id": name, "type": typ, "file": f"props/{path.name}"})
    for name, state, index, max_side in event_specs:
        cell = crop_grid(src, 4, 3, 384, index)
        asset = resize_max(trim_alpha(chroma_to_alpha(cell, 62), 14), max_side)
        path = OUT / "events" / f"{name}.webp"
        save_webp(asset, path, 84)
        events.append({"id": name, "state": state, "file": f"events/{path.name}"})
    return props, events


def update_manifest(base_tiles: list[str], decals: list[dict[str, str]], props: list[dict[str, str]], events: list[dict[str, str]]) -> None:
    source_manifest = TARGET_OUT / "manifest.json"
    path = OUT / "manifest.json"
    manifest = json.loads(source_manifest.read_text(encoding="utf-8"))
    manifest["version"] = "0.3.3e-xuanyuan-formal-tile-atlas"
    manifest["baseTiles"] = base_tiles
    manifest["decals"] = decals
    manifest["props"] = props
    manifest["events"] = events
    manifest["asset_mode"] = "formal_runtime_tiles_and_transparent_sprites"
    manifest["preview"] = "preview_xuanyuan_ground_v033e_3x3.webp"
    manifest["notes"] = [
        "Generated from the confirmed Xuanyuan Dunhuang keyframe direction.",
        "Runtime now uses four base tiles to reduce infinite-map repetition.",
        "Decal/prop/event assets are chroma-key processed into alpha WebP sheets; no CSS placeholder resources are intentionally used.",
        "Event stone disk is intentionally small; ready state should rely on subtle near-ground aura and proximity prompt."
    ]
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


def build_preview() -> None:
    tiles = [Image.open(OUT / "base_tiles" / f"tile_xuanyuan_ground_base_v033e_{i:02d}.webp").convert("RGB") for i in range(1, 5)]
    size = 512
    preview = Image.new("RGB", (size * 3, size * 3))
    order = [0, 1, 2, 3, 1, 0, 3, 2, 0]
    for idx, tile_index in enumerate(order):
        tile = tiles[tile_index].resize((size, size), Image.Resampling.LANCZOS)
        preview.paste(tile, ((idx % 3) * size, (idx // 3) * size))
    save_webp(preview, OUT / "preview_xuanyuan_ground_v033e_3x3.webp", 84)


def main() -> None:
    ensure_dirs()
    base_tiles = export_base_tiles()
    decals = export_decal_assets()
    props, events = export_prop_assets()
    update_manifest(base_tiles, decals, props, events)
    build_preview()


if __name__ == "__main__":
    main()
