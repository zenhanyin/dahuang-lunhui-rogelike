from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ART_DIR = ROOT / "assets/art_direction/v033/xuanyuan_ground_rework"
MAP_DIR = ROOT / "assets/maps/v033/xuanyuan_ground"

SOURCES = {
    "decals": Path(r"C:/Users/Administrator/.codex/generated_images/019f83f5-c11c-75e0-8d28-c87682ead39a/call_Jg7ViK2e8CZ5KlAxx0tFMe4x.png"),
    "props": Path(r"C:/Users/Administrator/.codex/generated_images/019f83f5-c11c-75e0-8d28-c87682ead39a/call_DeOlqvXMauw18ePiihKfh1DG.png"),
    "events": Path(r"C:/Users/Administrator/.codex/generated_images/019f83f5-c11c-75e0-8d28-c87682ead39a/call_dYz6locE7G1BM1ahHFQf1uzq.png"),
}

DECAL_NAMES = [
    "decal_xuanyuan_sword_array_scratches",
    "decal_xuanyuan_old_cloud_line",
    "decal_xuanyuan_round_array_trace",
    "decal_xuanyuan_buried_swords_trace",
    "decal_xuanyuan_bronze_cloud_stain",
    "decal_xuanyuan_dry_crack_trace",
    "decal_xuanyuan_blue_cloud_residue",
    "decal_xuanyuan_gold_crack_burst",
    "decal_xuanyuan_blood_oath_mark",
    "decal_xuanyuan_red_sword_drag",
    "decal_xuanyuan_wheel_array_trace",
    "decal_xuanyuan_oxidized_crack",
]

PROP_NAMES = [
    "prop_xuanyuan_broken_sword_0",
    "prop_xuanyuan_oath_tablet_0",
    "prop_xuanyuan_sword_grass_0",
    "prop_xuanyuan_array_fragment_0",
    "prop_xuanyuan_cinnabar_cloth_0",
    "prop_xuanyuan_stone_cairn_0",
    "prop_xuanyuan_broken_array_ring_0",
    "prop_xuanyuan_sword_mound_0",
]

EVENT_NAMES = [
    "event_xuanyuan_oath_disk_idle",
    "event_xuanyuan_oath_disk_ready",
    "event_xuanyuan_oath_disk_done",
    "event_xuanyuan_oath_aura_idle",
    "event_xuanyuan_oath_aura_ready",
    "event_xuanyuan_oath_aura_done",
]


@dataclass(frozen=True)
class SheetSpec:
    cols: int
    rows: int
    names: list[str]
    out_dir: Path
    alpha_scale: float
    trim_padding: int


def remove_green_key(img: Image.Image, alpha_scale: float) -> Image.Image:
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if g > 150 and r < 130 and b < 130 and g > r * 1.28 and g > b * 1.28:
                pixels[x, y] = (r, g, b, 0)
            else:
                pixels[x, y] = (r, g, b, round(a * alpha_scale))
    return rgba


def trim_alpha(img: Image.Image, padding: int) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        return img
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - padding)
    y0 = max(0, y0 - padding)
    x1 = min(img.width, x1 + padding)
    y1 = min(img.height, y1 + padding)
    return img.crop((x0, y0, x1, y1))


def slice_sheet(source: Path, spec: SheetSpec) -> list[Path]:
    image = Image.open(source).convert("RGB")
    cell_w = image.width // spec.cols
    cell_h = image.height // spec.rows
    spec.out_dir.mkdir(parents=True, exist_ok=True)
    outputs: list[Path] = []
    for index, name in enumerate(spec.names):
        col = index % spec.cols
        row = index // spec.cols
        cell = image.crop((col * cell_w, row * cell_h, (col + 1) * cell_w, (row + 1) * cell_h))
        asset = trim_alpha(remove_green_key(cell, spec.alpha_scale), spec.trim_padding)
        out = spec.out_dir / f"{name}.webp"
        asset.save(out, "WEBP", quality=84, method=6)
        outputs.append(out)
    return outputs


def make_preview(paths: list[Path], out: Path, cols: int, cell: tuple[int, int]) -> None:
    rows = (len(paths) + cols - 1) // cols
    preview = Image.new("RGBA", (cols * cell[0], rows * cell[1]), (0, 0, 0, 0))
    for i, path in enumerate(paths):
        img = Image.open(path).convert("RGBA")
        img.thumbnail((cell[0] - 24, cell[1] - 24), Image.Resampling.LANCZOS)
        x = (i % cols) * cell[0] + (cell[0] - img.width) // 2
        y = (i // cols) * cell[1] + (cell[1] - img.height) // 2
        preview.alpha_composite(img, (x, y))
    out.parent.mkdir(parents=True, exist_ok=True)
    preview.save(out, "WEBP", quality=84, method=6)


def archive_sources() -> None:
    ART_DIR.mkdir(parents=True, exist_ok=True)
    for key, source in SOURCES.items():
        target = ART_DIR / f"xuanyuan_{key}_sheet_v033c.png"
        Image.open(source).save(target)


def main() -> None:
    archive_sources()
    decal_paths = slice_sheet(
        SOURCES["decals"],
        SheetSpec(4, 3, DECAL_NAMES, MAP_DIR / "decals", alpha_scale=0.56, trim_padding=18),
    )
    prop_paths = slice_sheet(
        SOURCES["props"],
        SheetSpec(4, 2, PROP_NAMES, MAP_DIR / "props_static", alpha_scale=0.92, trim_padding=10),
    )
    event_paths = slice_sheet(
        SOURCES["events"],
        SheetSpec(3, 2, EVENT_NAMES, MAP_DIR / "events", alpha_scale=0.96, trim_padding=8),
    )
    make_preview(decal_paths, MAP_DIR / "preview_xuanyuan_decals_v033c.webp", 4, (280, 220))
    make_preview(prop_paths, MAP_DIR / "preview_xuanyuan_props_v033c.webp", 4, (330, 260))
    make_preview(event_paths, MAP_DIR / "preview_xuanyuan_events_v033c.webp", 3, (330, 280))
    for path in [*decal_paths, *prop_paths, *event_paths]:
        print(path.relative_to(ROOT).as_posix())


if __name__ == "__main__":
    main()
