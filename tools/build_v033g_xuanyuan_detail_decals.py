from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT.parent / "v033g_build" / "xuanyuan_ground"
OUT = BUILD / "decals"
PREVIEW = BUILD / "preview_xuanyuan_detail_decals_v033g.webp"
STYLE = ROOT / "assets" / "art_direction" / "v033" / "xuanyuan_ground_rework"

SOURCES = {
    "confirmed": STYLE / "xuanyuan_confirmed_style_keyframe.png",
    "pattern": STYLE / "xuanyuan_user_ref_random_pattern.png",
    "tile": ROOT / "assets" / "maps" / "v033" / "xuanyuan_ground" / "base_tiles" / "tile_xuanyuan_ground_base_v033e_01.webp",
}

DECALS = [
    ("detail_cracks_a", "pattern", (78, 76, 436, 296), 0.30, 0.58),
    ("detail_cracks_b", "pattern", (612, 632, 1004, 862), 0.26, 0.52),
    ("detail_cloud_fresco_a", "confirmed", (70, 68, 520, 310), 0.26, 0.58),
    ("detail_cloud_fresco_b", "confirmed", (972, 34, 1452, 288), 0.24, 0.56),
    ("detail_sword_engraving_a", "confirmed", (108, 612, 604, 832), 0.24, 0.54),
    ("detail_sword_engraving_b", "pattern", (72, 946, 466, 1168), 0.24, 0.54),
    ("detail_bronze_oxidation_a", "pattern", (444, 318, 820, 578), 0.23, 0.50),
    ("detail_cinnabar_scrape_a", "pattern", (728, 90, 1118, 300), 0.24, 0.52),
]


def irregular_mask(size: tuple[int, int], seed: int, opacity: float) -> Image.Image:
    rng = random.Random(seed)
    w, h = size
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    points = []
    cx, cy = w / 2, h / 2
    for i in range(40):
        a = i / 40 * math.tau
        rx = w * rng.uniform(0.38, 0.52)
        ry = h * rng.uniform(0.32, 0.48)
        points.append((cx + math.cos(a) * rx, cy + math.sin(a) * ry))
    draw.polygon(points, fill=int(255 * opacity))
    for _ in range(42):
        x = rng.randint(0, w)
        y = rng.randint(0, h)
        rw = rng.randint(max(8, w // 28), max(16, w // 9))
        rh = rng.randint(max(6, h // 30), max(14, h // 8))
        draw.ellipse((x - rw, y - rh, x + rw, y + rh), fill=rng.randint(14, int(255 * opacity * 0.7)))
    mask = mask.filter(ImageFilter.GaussianBlur(max(5, min(w, h) // 28)))
    noise = Image.effect_noise(size, 48).convert("L")
    noise = ImageEnhance.Contrast(noise).enhance(1.35)
    return ImageChops.multiply(mask, noise)


def build_decal(name: str, src_name: str, box: tuple[int, int, int, int], contrast: float, opacity: float, idx: int) -> Path:
    src = Image.open(SOURCES[src_name]).convert("RGB")
    crop = src.crop(box)
    crop = ImageEnhance.Color(crop).enhance(0.72)
    crop = ImageEnhance.Contrast(crop).enhance(0.92 + contrast)
    crop = ImageEnhance.Brightness(crop).enhance(0.86)
    crop = crop.filter(ImageFilter.UnsharpMask(radius=1.2, percent=76, threshold=5))
    alpha = irregular_mask(crop.size, 9301 + idx * 37, opacity)
    out = crop.convert("RGBA")
    out.putalpha(alpha)
    path = OUT / f"decal_xuanyuan_{name}_v033g_01.webp"
    out.save(path, "WEBP", quality=86, method=6)
    return path


def make_preview(paths: list[Path]) -> None:
    tile = Image.open(SOURCES["tile"]).convert("RGBA").resize((960, 540))
    canvas = tile.copy()
    positions = [(80, 60), (350, 48), (650, 70), (160, 245), (480, 230), (720, 275), (80, 400), (520, 410)]
    for path, pos in zip(paths, positions):
        im = Image.open(path).convert("RGBA")
        scale = min(280 / im.width, 150 / im.height)
        im = im.resize((int(im.width * scale), int(im.height * scale)), Image.Resampling.LANCZOS)
        canvas.alpha_composite(im, pos)
    canvas.save(PREVIEW, "WEBP", quality=88, method=6)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    paths = [build_decal(*item, idx=i) for i, item in enumerate(DECALS)]
    make_preview(paths)
    for path in paths:
        print(path)
    print(PREVIEW)


if __name__ == "__main__":
    main()
