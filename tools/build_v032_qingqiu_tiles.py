from pathlib import Path
import json
import math
import random

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "concepts" / "v032-map-atlas" / "qingqiu-3x3-stitch-preview.png"
OUT = ROOT / "assets" / "maps" / "v032_atlas" / "qingqiu"
TILE_SIZE = 512
EDGE_BLEND = 82


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def save_webp(img: Image.Image, path: Path, quality=84) -> None:
    ensure_dir(path.parent)
    img.save(path, "WEBP", quality=quality, method=6)


def wrapped_crop(src: Image.Image, left: int, top: int, size: int) -> Image.Image:
    src = src.convert("RGBA")
    out = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    for y in range(size):
        for x in range(size):
            out.putpixel((x, y), src.getpixel(((left + x) % src.width, (top + y) % src.height)))
    return out


def horizontal_edge_mask(width: int, height: int, flip=False) -> Image.Image:
    mask = Image.new("L", (width, height), 0)
    px = mask.load()
    for y in range(height):
        for x in range(width):
            t = x / max(1, width - 1)
            if not flip:
                value = int(255 * (1 - t))
            else:
                value = int(255 * t)
            px[x, y] = value
    return mask.filter(ImageFilter.GaussianBlur(4))


def vertical_edge_mask(width: int, height: int, flip=False) -> Image.Image:
    mask = Image.new("L", (width, height), 0)
    px = mask.load()
    for y in range(height):
        t = y / max(1, height - 1)
        value = int(255 * (1 - t)) if not flip else int(255 * t)
        for x in range(width):
            px[x, y] = value
    return mask.filter(ImageFilter.GaussianBlur(4))


def make_tileable(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    w, h = img.size

    # Blend opposite sides into the border strips so repeated tiles share compatible edges.
    left = img.crop((0, 0, EDGE_BLEND, h))
    right = img.crop((w - EDGE_BLEND, 0, w, h)).transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    avg_lr = Image.blend(left, right, 0.5).filter(ImageFilter.GaussianBlur(1.4))
    img.paste(avg_lr, (0, 0), horizontal_edge_mask(EDGE_BLEND, h))
    img.paste(avg_lr.transpose(Image.Transpose.FLIP_LEFT_RIGHT), (w - EDGE_BLEND, 0), horizontal_edge_mask(EDGE_BLEND, h, flip=True))

    top = img.crop((0, 0, w, EDGE_BLEND))
    bottom = img.crop((0, h - EDGE_BLEND, w, h)).transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    avg_tb = Image.blend(top, bottom, 0.5).filter(ImageFilter.GaussianBlur(1.4))
    img.paste(avg_tb, (0, 0), vertical_edge_mask(w, EDGE_BLEND))
    img.paste(avg_tb.transpose(Image.Transpose.FLIP_TOP_BOTTOM), (0, h - EDGE_BLEND), vertical_edge_mask(w, EDGE_BLEND, flip=True))

    # Offset preview seam to center and soften it lightly without destroying painted detail.
    shifted = ImageChops.offset(img, w // 2, h // 2)
    seam = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(seam)
    draw.rectangle((w // 2 - 18, 0, w // 2 + 18, h), fill=128)
    draw.rectangle((0, h // 2 - 18, w, h // 2 + 18), fill=128)
    seam = seam.filter(ImageFilter.GaussianBlur(18))
    softened = shifted.filter(ImageFilter.GaussianBlur(1.1))
    shifted = Image.composite(softened, shifted, seam)
    img = ImageChops.offset(shifted, -w // 2, -h // 2)

    # Exact one-pixel edge copy prevents hairline seams in canvas drawImage.
    px = img.load()
    for y in range(h):
        lr = tuple(round((px[0, y][i] + px[w - 1, y][i]) / 2) for i in range(4))
        px[0, y] = lr
        px[w - 1, y] = lr
    for x in range(w):
        tb = tuple(round((px[x, 0][i] + px[x, h - 1][i]) / 2) for i in range(4))
        px[x, 0] = tb
        px[x, h - 1] = tb

    return img


def grade_tile(img: Image.Image, rng: random.Random, variant: int) -> Image.Image:
    # Keep average brightness close between tiles to avoid checkerboard seams.
    img = ImageEnhance.Color(img).enhance(0.9 + rng.random() * 0.08)
    img = ImageEnhance.Contrast(img).enhance(0.9 + rng.random() * 0.06)
    overlay = Image.new("RGBA", img.size, (42, 36, 54, 18 if variant % 2 else 10))
    img = Image.alpha_composite(img.convert("RGBA"), overlay)

    # Add very subtle periodic fresco grain.
    grain = Image.new("RGBA", img.size, (0, 0, 0, 0))
    gp = grain.load()
    for y in range(img.height):
        for x in range(img.width):
            if (x * 13 + y * 7 + variant * 19) % 37 == 0:
                v = rng.randint(8, 22)
                gp[x, y] = (235, 205, 145, v)
            elif (x * 5 + y * 11 + variant * 23) % 43 == 0:
                v = rng.randint(5, 14)
                gp[x, y] = (18, 14, 18, v)
    return Image.alpha_composite(img, grain)


def build_preview(tile_paths: list[Path]) -> Image.Image:
    out = Image.new("RGBA", (TILE_SIZE * 3, TILE_SIZE * 3), (0, 0, 0, 255))
    order = [0, 1, 2, 3, 0, 4, 5, 2, 1]
    for row in range(3):
        for col in range(3):
            img = Image.open(tile_paths[order[row * 3 + col]]).convert("RGBA")
            out.paste(img, (col * TILE_SIZE, row * TILE_SIZE))
    return out


def main() -> None:
    if not SRC.exists():
        raise FileNotFoundError(f"Missing source concept image: {SRC}")
    ensure_dir(OUT)

    src = Image.open(SRC).convert("RGBA")
    src = src.resize((1536, 1536), Image.Resampling.LANCZOS)

    rng = random.Random(32032)
    crops = [
        (0, 0),
        (512, 0),
        (1024, 0),
        (0, 512),
        (512, 512),
        (1024, 512),
    ]
    tile_paths = []
    for idx, (left, top) in enumerate(crops, start=1):
        tile = wrapped_crop(src, left, top, TILE_SIZE)
        tile = make_tileable(tile)
        tile = grade_tile(tile, rng, idx)
        name = f"tile_qingqiu_ground_{idx:02d}.webp"
        path = OUT / name
        save_webp(tile, path, 84)
        tile_paths.append(path)

    preview = build_preview(tile_paths)
    preview_path = OUT / "preview_qingqiu_3x3_from_tiles.png"
    preview.save(preview_path)

    manifest = {
        "version": "0.3.2a-qingqiu-tile-atlas",
        "tileSize": TILE_SIZE,
        "edgeBlend": EDGE_BLEND,
        "style": "Dunhuang mineral fresco, Qingqiu gray-purple and ink-teal terrain",
        "tiles": [f"assets/maps/v032_atlas/qingqiu/{p.name}" for p in tile_paths],
        "preview": "assets/maps/v032_atlas/qingqiu/preview_qingqiu_3x3_from_tiles.png",
        "rules": [
            "base terrain only",
            "no large fog pool, monument, character, enemy, grass cluster, or bone pile in base tile",
            "no tile-local vignette or center spotlight",
            "noise selects tiles and decals, it does not draw main ground"
        ]
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
