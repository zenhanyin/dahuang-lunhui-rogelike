from pathlib import Path
import json
import math
import random

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
BASE_TILE = ROOT / "assets" / "maps" / "v032_atlas" / "qingqiu_seamless" / "tile_qingqiu_base_seamless_01.webp"
OUT = ROOT / "assets" / "maps" / "v032_atlas" / "qingqiu" / "decals"


SPECS = [
    ("decal_qingqiu_ground_mist_01.webp", 768, 384, 1201),
    ("decal_qingqiu_ground_mist_02.webp", 640, 320, 1202),
    ("decal_qingqiu_ground_mist_03.webp", 512, 256, 1203),
    ("decal_qingqiu_old_vow_trace_01.webp", 768, 384, 1204),
]


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def save_webp(img: Image.Image, path: Path, quality=84) -> None:
    ensure_dir(path.parent)
    img.save(path, "WEBP", quality=quality, method=6)


def soft_blob_mask(w: int, h: int, rng: random.Random, density=10) -> Image.Image:
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask, "L")
    for _ in range(density):
        cx = rng.randint(-w // 8, w + w // 8)
        cy = rng.randint(-h // 8, h + h // 8)
        rw = rng.randint(w // 5, w // 2)
        rh = rng.randint(h // 8, h // 3)
        alpha = rng.randint(28, 68)
        draw.ellipse((cx - rw, cy - rh, cx + rw, cy + rh), fill=alpha)
    return mask.filter(ImageFilter.GaussianBlur(rng.randint(18, 34)))


def add_fresco_grain(img: Image.Image, rng: random.Random) -> Image.Image:
    grain = Image.new("RGBA", img.size, (0, 0, 0, 0))
    gp = grain.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            v = (x * 17 + y * 11 + rng.randint(0, 3)) % 53
            if v == 0:
                gp[x, y] = (230, 195, 128, rng.randint(3, 12))
            elif v == 1:
                gp[x, y] = (28, 20, 34, rng.randint(4, 13))
    return Image.alpha_composite(img, grain)


def make_decal(name: str, w: int, h: int, seed: int) -> Image.Image:
    rng = random.Random(seed)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    mask = soft_blob_mask(w, h, rng, density=12 if "old_vow" not in name else 8)

    color_layer = Image.new("RGBA", (w, h), (92, 63, 112, 0))
    cp = color_layer.load()
    mp = mask.load()
    for y in range(h):
        for x in range(w):
            wave = math.sin((x * 0.012) + (y * 0.018) + seed) * 0.5 + 0.5
            teal = int(18 + wave * 28)
            purple = int(70 + wave * 28)
            alpha = int(mp[x, y] * (0.82 if "old_vow" not in name else 0.64))
            cp[x, y] = (purple, 54 + teal // 3, 102 + teal, alpha)
    img = Image.alpha_composite(img, color_layer)

    draw = ImageDraw.Draw(img, "RGBA")
    line_count = 5 if "old_vow" in name else 3
    for i in range(line_count):
        y = rng.randint(h // 5, h - h // 5)
        x0 = rng.randint(-w // 4, w // 4)
        length = rng.randint(w // 2, w + w // 4)
        pts = []
        for j in range(8):
            x = x0 + length * j / 7
            yy = y + math.sin(j * 1.4 + i + seed * 0.01) * rng.randint(8, 24)
            pts.append((x, yy))
        draw.line(pts, fill=(203, 164, 92, rng.randint(24, 48)), width=rng.choice([1, 2]))
        if rng.random() < 0.7:
            pts2 = [(x, yy + rng.randint(8, 18)) for x, yy in pts[1:-1]]
            draw.line(pts2, fill=(126, 62, 70, rng.randint(18, 34)), width=1)

    # Edge alpha falloff makes the decal sit in the ground rather than as a sticker.
    edge = Image.new("L", (w, h), 255)
    ep = edge.load()
    fade = max(36, min(w, h) // 7)
    for y in range(h):
        for x in range(w):
            d = min(x, y, w - 1 - x, h - 1 - y)
            if d < fade:
                ep[x, y] = int(255 * (d / fade))
    edge = edge.filter(ImageFilter.GaussianBlur(10))
    alpha = img.getchannel("A")
    alpha = Image.composite(alpha, Image.new("L", (w, h), 0), edge)
    img.putalpha(alpha)

    return add_fresco_grain(img.filter(ImageFilter.GaussianBlur(0.35)), rng)


def make_preview(paths: list[Path]) -> Image.Image:
    base = Image.open(BASE_TILE).convert("RGBA").resize((1024, 1024), Image.Resampling.LANCZOS)
    preview = Image.new("RGBA", base.size, (0, 0, 0, 255))
    preview.alpha_composite(base)
    positions = [
        (70, 95, 0.9),
        (430, 160, 0.74),
        (115, 540, 0.68),
        (520, 585, 0.84),
    ]
    for path, (x, y, scale) in zip(paths, positions):
        decal = Image.open(path).convert("RGBA")
        decal = decal.resize((int(decal.width * scale), int(decal.height * scale)), Image.Resampling.LANCZOS)
        preview.alpha_composite(decal, (x, y))
    return preview


def main() -> None:
    ensure_dir(OUT)
    written = []
    for spec in SPECS:
        name, w, h, seed = spec
        decal = make_decal(name, w, h, seed)
        path = OUT / name
        save_webp(decal, path, 84)
        written.append(path)

    preview = make_preview(written)
    preview.save(OUT / "preview_ground_mist_decals_on_base.png")

    manifest = {
        "version": "0.3.2a-qingqiu-ground-mist-decals",
        "layer": "ground-decal",
        "dynamic": False,
        "runtimeBehavior": "moves with map, no collision, no interaction; optional very subtle alpha breathing only",
        "assets": [f"assets/maps/v032_atlas/qingqiu/decals/{p.name}" for p in written],
        "preview": "assets/maps/v032_atlas/qingqiu/decals/preview_ground_mist_decals_on_base.png"
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
