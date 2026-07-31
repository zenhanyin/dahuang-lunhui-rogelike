from pathlib import Path
import json
import math
import random

from PIL import Image, ImageChops, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "assets" / "art_direction" / "v033" / "xuanyuan_ground_rework"
BASE_SRC = SRC_DIR / "xuanyuan_user_ref_clean_base.png"
PATTERN_SRC = SRC_DIR / "xuanyuan_user_ref_random_pattern.png"
OUT = ROOT / "assets" / "maps" / "v033" / "xuanyuan_ground"
TILE = 1024


DECAL_SPECS = [
    ("decal_xuanyuan_sword_array_scratches.webp", (0.00, 0.00, 0.34, 0.24), 0.24, 0.88),
    ("decal_xuanyuan_bronze_cloud_stain.webp", (0.34, 0.00, 0.66, 0.24), 0.19, 0.84),
    ("decal_xuanyuan_blood_oath_mark.webp", (0.66, 0.00, 1.00, 0.24), 0.22, 0.86),
    ("decal_xuanyuan_round_array_trace.webp", (0.00, 0.24, 0.34, 0.49), 0.19, 0.84),
    ("decal_xuanyuan_oxidized_crack.webp", (0.34, 0.24, 0.66, 0.49), 0.18, 0.88),
    ("decal_xuanyuan_gold_crack_burst.webp", (0.66, 0.24, 1.00, 0.49), 0.2, 0.86),
    ("decal_xuanyuan_blue_cloud_residue.webp", (0.00, 0.49, 0.34, 0.73), 0.19, 0.82),
    ("decal_xuanyuan_red_sword_drag.webp", (0.34, 0.49, 0.66, 0.73), 0.22, 0.86),
    ("decal_xuanyuan_buried_swords_trace.webp", (0.00, 0.73, 0.34, 1.00), 0.22, 0.84),
    ("decal_xuanyuan_dry_crack_trace.webp", (0.34, 0.73, 0.66, 1.00), 0.18, 0.88),
    ("decal_xuanyuan_wheel_array_trace.webp", (0.66, 0.73, 1.00, 1.00), 0.19, 0.84),
    ("decal_xuanyuan_old_cloud_line.webp", (0.66, 0.49, 1.00, 0.73), 0.18, 0.82),
]


def fit_square(img):
    side = min(img.width, img.height)
    left = (img.width - side) // 2
    top = (img.height - side) // 2
    return img.crop((left, top, left + side, top + side))


def finish_base(img, variant=0):
    img = fit_square(img).resize((TILE, TILE), Image.Resampling.LANCZOS).convert("RGB")
    # Keep the first reference as the main ground feeling, but pull it a bit closer
    # to the in-game Qingqiu readability: cleaner midtones, less noisy black grime.
    img = ImageEnhance.Color(img).enhance(0.84)
    img = ImageEnhance.Contrast(img).enhance(0.9)
    img = ImageEnhance.Brightness(img).enhance(1.0)
    smooth = img.filter(ImageFilter.GaussianBlur(1.15))
    img = Image.blend(img, smooth, 0.34)
    broad_tone = img.filter(ImageFilter.GaussianBlur(7.0))
    img = Image.blend(img, broad_tone, 0.1)
    wash = Image.new("RGB", img.size, (118, 101, 75))
    img = Image.blend(img, wash, 0.04)
    img = symmetrize_for_repeat(img)
    img = normalize_edge_tone(img, margin=250, strength=0.48)
    if variant:
        rng = random.Random(f"xuanyuan-base-{variant}")
        r, g, b = img.split()
        r = ImageEnhance.Brightness(r).enhance(1 + rng.uniform(-0.018, 0.018))
        g = ImageEnhance.Brightness(g).enhance(1 + rng.uniform(-0.014, 0.014))
        b = ImageEnhance.Brightness(b).enhance(1 + rng.uniform(-0.018, 0.018))
        img = Image.merge("RGB", (r, g, b))
        img = ImageEnhance.Brightness(img).enhance(1 + rng.uniform(-0.025, 0.018))
    img = harmonize_tile_edges(img, margin=190, strength=0.78)
    return img.filter(ImageFilter.UnsharpMask(radius=0.8, percent=18, threshold=10))


def symmetrize_for_repeat(img):
    """Make the low-frequency ground repeatable; decals provide the asymmetry."""
    img = img.convert("RGB")
    h = ImageOps.mirror(img)
    v = ImageOps.flip(img)
    hv = ImageOps.flip(h)
    sym = Image.blend(img, h, 0.5)
    sym = Image.blend(sym, v, 0.33)
    sym = Image.blend(sym, hv, 0.25)
    detail = Image.blend(img, img.filter(ImageFilter.GaussianBlur(3.0)), 0.36)
    return Image.blend(sym, detail, 0.28)


def normalize_edge_tone(img, margin=220, strength=0.55):
    img = img.convert("RGB")
    w, h = img.size
    center = img.crop((w // 3, h // 3, w * 2 // 3, h * 2 // 3)).resize((1, 1), Image.Resampling.BOX)
    target = center.getpixel((0, 0))
    px = img.load()
    margin = min(margin, w // 3, h // 3)
    for y in range(h):
        dy = min(y, h - 1 - y)
        for x in range(w):
            dx = min(x, w - 1 - x)
            d = min(dx, dy)
            if d >= margin:
                continue
            t = (margin - d) / margin
            weight = (t ** 1.7) * strength
            cur = px[x, y]
            px[x, y] = tuple(round(cur[i] * (1 - weight) + target[i] * weight) for i in range(3))
    return img.filter(ImageFilter.GaussianBlur(0.35))


def harmonize_tile_edges(img, margin=180, strength=0.72):
    """Pull opposite borders toward the same tone so the 1024 tile can repeat."""
    img = img.convert("RGB")
    px = img.load()
    w, h = img.size
    margin = min(margin, w // 3, h // 3)

    for x in range(margin):
        t = (margin - x) / margin
        weight = (t * t) * strength
        lx = x
        rx = w - 1 - x
        for y in range(h):
            left = px[lx, y]
            right = px[rx, y]
            avg = tuple((left[i] + right[i]) // 2 for i in range(3))
            px[lx, y] = tuple(round(left[i] * (1 - weight) + avg[i] * weight) for i in range(3))
            px[rx, y] = tuple(round(right[i] * (1 - weight) + avg[i] * weight) for i in range(3))

    for y in range(margin):
        t = (margin - y) / margin
        weight = (t * t) * strength
        ty = y
        by = h - 1 - y
        for x in range(w):
            top = px[x, ty]
            bottom = px[x, by]
            avg = tuple((top[i] + bottom[i]) // 2 for i in range(3))
            px[x, ty] = tuple(round(top[i] * (1 - weight) + avg[i] * weight) for i in range(3))
            px[x, by] = tuple(round(bottom[i] * (1 - weight) + avg[i] * weight) for i in range(3))

    return img


def feathered_alpha(w, h, strength):
    mask = Image.new("L", (w, h), 0)
    px = mask.load()
    cx = (w - 1) / 2
    cy = (h - 1) / 2
    for y in range(h):
        for x in range(w):
            nx = abs((x - cx) / max(1, cx))
            ny = abs((y - cy) / max(1, cy))
            edge = max(nx, ny)
            radial = math.sqrt(nx * nx + ny * ny) / 1.414
            v = max(0, 1 - max(edge, radial * 0.86))
            px[x, y] = int(255 * (v ** 0.55) * strength)
    return mask.filter(ImageFilter.GaussianBlur(max(10, min(w, h) // 18)))


def crop_frac(img, box):
    x0, y0, x1, y1 = box
    return img.crop((
        round(img.width * x0),
        round(img.height * y0),
        round(img.width * x1),
        round(img.height * y1),
    ))


def make_decal(pattern, box, alpha_strength, color_scale):
    patch = crop_frac(pattern, box).convert("RGBA")
    max_side = 300
    scale = min(1, max_side / max(patch.width, patch.height))
    patch = patch.resize((round(patch.width * scale), round(patch.height * scale)), Image.Resampling.LANCZOS)
    rgb = patch.convert("RGB")
    rgb = ImageEnhance.Color(rgb).enhance(0.68 * color_scale)
    rgb = ImageEnhance.Contrast(rgb).enhance(0.82)
    rgb = ImageEnhance.Brightness(rgb).enhance(1.03)
    alpha = extract_line_alpha(rgb, alpha_strength)
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    return out


def extract_line_alpha(rgb, alpha_strength):
    gray = rgb.convert("L")
    low = gray.filter(ImageFilter.GaussianBlur(18))
    diff = ImageChops.difference(gray, low)
    diff = ImageOps.autocontrast(diff)
    detail = diff.point(lambda v: 0 if v < 18 else min(255, round((v - 18) * 2.8)))
    feather = feathered_alpha(rgb.width, rgb.height, 1.0)
    alpha = ImageChops.multiply(detail, feather)
    alpha = alpha.filter(ImageFilter.GaussianBlur(1.1))
    return alpha.point(lambda v: min(255, round(v * alpha_strength * 2.8)))


def build_preview(base, decal_files):
    preview = Image.new("RGBA", (TILE * 2, TILE * 2))
    for y in range(2):
        for x in range(2):
            preview.alpha_composite(base.convert("RGBA"), (x * TILE, y * TILE))
    rng = random.Random("xuanyuan-preview-decal")
    decals = [Image.open(path).convert("RGBA") for path in decal_files]
    for i in range(12):
        decal = decals[i % len(decals)]
        scale = rng.uniform(0.7, 1.22)
        decal = decal.resize((round(decal.width * scale), round(decal.height * scale)), Image.Resampling.LANCZOS)
        if rng.random() < 0.5:
            decal = ImageOps.mirror(decal)
        x = rng.randrange(0, preview.width - decal.width)
        y = rng.randrange(0, preview.height - decal.height)
        preview.alpha_composite(decal, (x, y))
    preview.convert("RGB").save(OUT / "preview_xuanyuan_ground_ref_rework_2x2.webp", "WEBP", quality=82, method=6)


def build():
    if not BASE_SRC.exists() or not PATTERN_SRC.exists():
        raise FileNotFoundError("Missing copied user reference images for Xuanyuan ground rework.")
    (OUT / "base_tiles").mkdir(parents=True, exist_ok=True)
    (OUT / "decals").mkdir(parents=True, exist_ok=True)
    base_src = Image.open(BASE_SRC)
    pattern_src = Image.open(PATTERN_SRC)

    base_files = []
    for idx in range(1, 6):
        tile = finish_base(base_src, idx - 1)
        name = f"tile_xuanyuan_ground_base_{idx:02d}.webp"
        tile.save(OUT / "base_tiles" / name, "WEBP", quality=84, method=6)
        base_files.append(f"base_tiles/{name}")

    decal_files = []
    for name, box, alpha, color_scale in DECAL_SPECS:
        decal = make_decal(pattern_src, box, alpha, color_scale)
        path = OUT / "decals" / name
        decal.save(path, "WEBP", quality=84, method=6)
        decal_files.append(path)

    base = Image.open(OUT / base_files[0]).convert("RGB")
    build_preview(base, decal_files)

    manifest = {
        "id": "xuanyuan_ground",
        "version": "0.3.3b-6-seamless-line-decal-pass",
        "tileSize": TILE,
        "source": {
            "base": str(BASE_SRC.relative_to(ROOT)).replace("\\", "/"),
            "randomPattern": str(PATTERN_SRC.relative_to(ROOT)).replace("\\", "/")
        },
        "style": "Dunhuang mineral fresco, Xuanyuan top-down ground, clean base with low-frequency random sword/cloud decals",
        "runtimeReady": True,
        "rules": [
            "reference clean base is the ground layer",
            "random pattern sheet is decal-only, never full-screen base",
            "base tile uses 1024 size to reduce visible repetition",
            "decal alpha is pre-feathered, sparse and low-frequency",
            "base texture density is reduced so characters and UI keep priority",
            "no CSS placeholder marks inside terrain assets"
        ],
        "baseTiles": base_files,
        "decals": [f"decals/{path.name}" for path in decal_files],
        "preview": "preview_xuanyuan_ground_ref_rework_2x2.webp"
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"out": str(OUT), "tileSize": TILE, "baseTiles": base_files, "decals": len(decal_files)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    build()
